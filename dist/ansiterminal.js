/**
 *  ANSITerminal - an offscreen xterm like terminal.
 *
 *  TODO:
 *  - tabs, tab stops, tab width, tab output
 *  - mouse support
 *  - sgr: conceal, rgb, intense colors
 *  - full width character support
 *  - keyboard modes
 *  - advanced tests, vttest
 */

(function() {
    'use strict';
    
    // helper for creating the buffers
    function create_array(rows, cols) {
        var res = [];
        var row = null;
        for (var i = 0; i < rows; ++i) {
            row = [];
            for (var j = 0; j < cols; ++j)
                row.push(new TChar(''));
            res.push(row);
        }
        return res;
    }

    /**
     * attributes data container:
     * [<font weight>, <color>, <background>, <cursor>, <inverted>, <italic>, <underline>, <blink>]
     */
    function create_attributes() {
        return [null, null, null, null, null, null, null, null]
    }
    
    /**
     * terminal character with attributes
     */
    function TChar(c, attributes) {
        this.c = c;
        this.attributes = attributes || null;
    }

    /** minimal support for switching charsets (only basic drawing symbols supported) */
    var CHARSET_0 = {
        '`': '◆', 'a': '▒', 'b': '␉', 'c': '␌', 'd': '␍',
        'e': '␊', 'f': '°', 'g': '±', 'h': '␤', 'i': '␋',
        'j': '┘', 'k': '┐', 'l': '┌', 'm': '└', 'n': '┼',
        'o': '⎺', 'p': '⎻', 'q': '─', 'r': '⎼', 's': '⎽',
        't': '├', 'u': '┤', 'v': '┴', 'w': '┬', 'x': '│',
        'y': '≤', 'z': '≥', '{': 'π', '|': '≠', '}': '£', '~': '°'
    };

    /** fix: box drawing bold */
    // since most monospace fonts can't handle bold on these right we have to
    // switch to to corrensponding unicode character
    var BOXSYMBOLS_BOLD = {
        '─': '━', '│': '┃', '┄': '┅', '┆': '┇', '┈': '┉', '┊': '┋',
        '┌': '┏', '┐': '┓', '└': '┗', '┘': '┛', '├': '┣', '┤': '┫',
        '┬': '┳', '┴': '┻', '┼': '╋', '╌': '╍', '╎': '╏'
    };

    var TERM_STRING = {
        CSI: '\u001b[', SS3: '\u001bO', DCS: '\u001bP', ST: '\u001b\\',
        OSC: '\u001b]', PM: '\u001b^', APC: '\u001b_'
    };


    // constructor
    function ANSITerminal(cols, rows) {
        this.rows = rows;
        this.cols = cols;
        this.send = function (s) {};               // callback for writing back to stream
        this.beep = function (tone, duration) {};  // callback for sending console beep

        this.reset();
    }

    ANSITerminal.prototype.reset = function () {
        this.normal_buffer = create_array(this.rows, this.cols);
        this.scroll_buffer = [];
        this.alternate_buffer = create_array(this.rows, this.cols);
        this.buffer = this.normal_buffer;
        this.normal_cursor = {col: 0, row: 0};
        this.alternate_cursor = {col: 0, row: 0};
        this.cursor = this.normal_cursor;
        this.charset = null;
        this.textattributes = null;
        this.colors = {fg: -1, bg: -1};
        this.charattributes = null;
        this.cursor_key_mode = false;
        this.show_cursor = true;
        this.title = '';                        // terminal title set by OSR
        this.cursor_save = null;
        this.insert_mode = false;               // IRM (default replace)
        this.blinking_cursor = false;           // CSI?12l
        this.scrolling_top = 0;                 // for DECSTBM
        this.scrolling_bottom = this.rows;      // for DECSTBM
        this.autowrap = true;                   // DECAWM
        this.newline_mode = false;              // LNM
        this.tab_width = 8;
        this.last_char = '';                    // for REP
    };

    ANSITerminal.prototype.toString = function () {
        var s = '', j;
        for (var i = 0; i < this.buffer.length; ++i) {
            var last_nonspace = 0;  // FIXME: quick and dirty fill up from left
            for (j = 0; j < this.buffer[i].length; ++j) {
                if (this.buffer[i][j].c)
                    last_nonspace = j;
            }
            for (j = 0; j < this.buffer[i].length; ++j) {
                s += (last_nonspace > j) ? (this.buffer[i][j].c || ' ') : this.buffer[i][j].c;
            }
            s += '\n';
        }
        return s;
    };

    ANSITerminal.prototype.resize = function (cols, rows) {
        var i, j,
            count_rows = (rows < this.rows) ? rows : this.rows,
            count_cols = (cols < this.cols) ? cols : this.cols,
            buffer;
        // normal buffer
        buffer = create_array(rows, cols);
        for (i = 0; i < count_rows; ++i) {
            for (j = 0; j < count_cols; ++j) {
                buffer[i][j] = this.normal_buffer[i][j];
            }
        }
        if (this.buffer == this.normal_buffer) {
            this.buffer = buffer;
        }
        this.normal_buffer = buffer;
        // alternative buffer
        buffer = create_array(rows, cols);
        for (i = 0; i < count_rows; ++i) {
            for (j = 0; j < count_cols; ++j) {
                buffer[i][j] = this.alternate_buffer[i][j];
            }
        }
        if (this.buffer == this.alternate_buffer) {
            this.buffer = buffer;
        }
        this.alternate_buffer = buffer;
        // set new dimensions and fix cursor
        this.rows = rows;
        this.cols = cols;
        if (this.cursor.row >= this.rows)
            this.cursor.row = this.rows - 1;
        if (this.cursor.col >= this.cols)
            this.cursor.col = this.cols - 1;
        // FIXME: how to deal with scrolling area? - simply reset for now
        this.scrolling_top = 0;
        this.scrolling_bottom = this.rows;
        if (this.cursor_save)
            this.decsc();
    };

    /** 
     * parser instructions
     */
    ANSITerminal.prototype.inst_p = function (s) {
        if (this.debug)
            console.log('inst_p', s);
        var c = '';
        for (var i = 0; i < s.length; ++i) {
            if (this.cursor.col >= this.cols) {
                if (this.autowrap) {
                    this.cursor.col = 0;
                    this.cursor.row += 1;
                    if (this.cursor.row >= this.scrolling_bottom) {
                        var row = [];
                        for (var j = 0; j < this.cols; ++j)
                            row.push(new TChar('', this.textattributes));
                        this.buffer.splice(this.scrolling_bottom, 0, row);
                        var scrolled_out = this.buffer.splice(this.scrolling_top, 1);
                        if (this.buffer == this.normal_buffer && !this.scrolling_top)
                            this.scroll_buffer.push(scrolled_out);
                        this.cursor.row -= 1;
                    }
                } else
                    this.cursor.col -= 1;
            }
            c = s.charAt(i);
            c = (this.charset) ? (this.charset[c] || c) : c;
            this.last_char = c;
            if (this.insert_mode) {
                this.buffer[this.cursor.row].pop();
                this.buffer[this.cursor.row].splice(this.cursor.col, 0, new TChar('', this.textattributes));
            }
            this.buffer[this.cursor.row][this.cursor.col].c = c;
            this.buffer[this.cursor.row][this.cursor.col].attributes = this.charattributes;
            // fix box drawing
            if (c >= '\u2500' && c <= '\u2547') {
                if (this.textattributes && this.textattributes[0]) {
                    this.buffer[this.cursor.row][this.cursor.col].c = BOXSYMBOLS_BOLD[c] || c;
                    this.buffer[this.cursor.row][this.cursor.col].attributes = this.charattributes.slice();
                    this.buffer[this.cursor.row][this.cursor.col].attributes[0] = null;
                }
            }
            this.cursor.col += 1;
        }
        if (this.cursor.col >= this.cols)
            this.cursor.col = this.cols - 1;
    };

    ANSITerminal.prototype.inst_o = function (s) {
        if (this.debug)
            console.log('inst_o', s);
        this.last_char = '';
        if (s.charAt(0) == '0')
            this.title = s.slice(2);
        else
            console.log('inst_o unhandled:', s);
    };

    ANSITerminal.prototype.inst_x = function (flag) {
        if (this.debug)
            console.log('inst_x', flag.charCodeAt(0), flag);
        this.last_char = '';
        switch (flag) {
            case '\n':
                this.cursor.row += 1;
                if (this.cursor.row >= this.scrolling_bottom) {
                    var row = [];
                    for (var j = 0; j < this.cols; ++j)
                        row.push(new TChar('', this.textattributes));
                    this.buffer.splice(this.scrolling_bottom, 0, row);
                    var scrolled_out = this.buffer.splice(this.scrolling_top, 1);
                    if (this.buffer == this.normal_buffer && !this.scrolling_top)
                        this.scroll_buffer.push(scrolled_out);
                    this.cursor.row -= 1;
                }
                if (this.newline_mode)
                    this.cursor.col = 0;
                if (this.cursor.col >= this.cols)
                    this.cursor.col -= 1;
                break;
            case '\r':    this.cursor.col = 0; break;
            case '\t':    this.cht([0]); break;
            case '\x07':  this.beep(); break;
            case '\x08':
                this.cursor.col -= 1;
                if (this.cursor.col < 0)
                    this.cursor.col = 0;
                break;
            case '\x0b':  this.inst_x('\n'); break;
            case '\x0c':  this.inst_x('\n'); break;
            case '\x0e':  this.charset = CHARSET_0; break;  // activate G1 FIXME (quick solution for xmas0.txt)
            case '\x0f':  this.charset = null; break;  // activate G0 FIXME
            case '\x11':  console.log('unhandled DC1 (XON)'); break;  // TODO
            case '\x12':  break;  // DC2
            case '\x13':  console.log('unhandled DC3 (XOFF)'); break; // TODO
            case '\x14':  break;  // DC4
            default:
                console.log('inst_x unhandled:', flag.charCodeAt(0));
        }
    };

    /**
     * missing (from xterm)
     *
     * CSI Ps g    Tab Clear (TBC).
     * (more to come...)
     *
     */
    ANSITerminal.prototype.inst_c = function (collected, params, flag) {
        if (this.debug)
            console.log('inst_c', collected, params, flag);
        if (flag != 'b')        // hack for getting REP working
            this.last_char = '';
        switch (collected) {
            case '':
                switch (flag) {
                    case '@':  return this.ich(params);
                    case 'E':  return this.cnl(params);
                    case 'F':  return this.cpl(params);
                    case 'G':  return this.cha(params);
                    case 'D':  return this.cub(params);
                    case 'B':  return this.cud(params);
                    case 'C':  return this.cuf(params);
                    case 'A':  return this.cuu(params);
                    case 'I':  return this.cht(params);
                    case 'Z':  return this.cbt(params);
                    case 'f':
                    case 'H':  return this.cup(params);
                    case 'P':  return this.dch(params);
                    case 'J':  return this.ed(params);
                    case 'K':  return this.el(params);
                    case 'L':  return this.il(params);
                    case 'M':  return this.dl(params);
                    case 'S':  return this.su(params);
                    case 'T':  return this.sd(params);
                    case 'X':  return this.ech(params);
                    case 'a':  return this.hpr(params);
                    case 'b':  return this.rep(params);
                    case 'e':  return this.vpr(params);
                    case 'd':  return this.vpa(params);
                    case 'c':  return this.send(TERM_STRING['CSI'] + '?64;1;2;6;9;15;18;21;22c');  // DA1
                    case 'h':  return this.high(collected, params);
                    case 'l':  return this.low(collected, params);
                    case 'm':  return this.sgr(params);
                    case 'n':  return this.dsr(collected, params);
                    case 'r':  return this.decstbm(params);
                    case '`':  return this.hpa(params);
                    default :
                        console.log('inst_c unhandled:', collected, params, flag);
                }
                break;
            case '?':
                switch (flag) {
                    case 'J':  return this.ed(params);  // DECSED as normal ED
                    case 'K':  return this.el(params);  // DECSEL as normal EL
                    case 'h':  return this.high(collected, params);
                    case 'l':  return this.low(collected, params);
                    case 'n':  return this.dsr(collected, params);
                    default :
                        console.log('inst_c unhandled:', collected, params, flag);
                }
                break;
            case '>':
                switch (flag) {
                    case 'c':  return this.send(TERM_STRING['CSI'] + '>41;1;0c');  // DA2
                    default :
                        console.log('inst_c unhandled:', collected, params, flag);
                }
                break;
            case '!':
                switch (flag) {
                    case 'p':  return this.decstr();
                    default :
                        console.log('inst_c unhandled:', collected, params, flag);
                }
                break;
            default :
                console.log('inst_c unhandled:', collected, params, flag);
        }
    };

    ANSITerminal.prototype.inst_e = function (collected, flag) {
        if (this.debug)
            console.log('inst_e', collected, flag);
        this.last_char = '';
        switch (flag) {
            // complete ESC codes from xterm:
            //    ESC H   Tab Set ( HTS is 0x88).  // TODO
            //    ESC N   Single Shift Select of G2 Character Set ( SS2 is 0x8e). This affects next character only.
            //    ESC O   Single Shift Select of G3 Character Set ( SS3 is 0x8f). This affects next character only.
            //    ESC P   Device Control String ( DCS is 0x90).
            //    ESC V   Start of Guarded Area ( SPA is 0x96).
            //    ESC W   End of Guarded Area ( EPA is 0x97).
            //    ESC X   Start of String ( SOS is 0x98).
            //    ESC Z   Return Terminal ID (DECID is 0x9a). Obsolete form of CSI c (DA).
            //        case 'F':  // (SP) 7-bit controls (S7C1T) - not supported
            //        case 'G':  // (SP) 8-bit controls (S8C1T) - not supported
            //        case 'L':  // (SP) Set ANSI conformance level 1 (dpANS X3.134.1) - not supported
            //        case 'M':  // (SP) Set ANSI conformance level 2 (dpANS X3.134.1) - not supported
            //        case 'N':  // (SP) Set ANSI conformance level 3 (dpANS X3.134.1) - not supported
            //        case '3':  // (#) DEC double-height line, top half (DECDHL) - not supported
            //        case '4':  // (#) DEC double-height line, bottom half (DECDHL) - not supported
            //        case '5':  // (#) DEC single-width line (DECSWL) - not supported
            //        case '6':  // (#) DEC double-width line (DECDWL) - not supported
            //        case '8':  // (#) DEC Screen Alignment Test (DECALN) - not supported
            //        case '@':  // (%) Select default character set. That is ISO 8859-1 (ISO 2022) - not supported
            //        case 'G':  // (%) Select UTF-8 character set (ISO 2022) - not supported
            // (() Designate G0 Character Set (ISO 2022, VT100)
            // more flags: A B < %5 > 4 C 5 R f Q 9 K Y ` E 6 %6 Z H 7 =
            // more collected: ) G1, * G2, + G3, - G1, . G2, / G3
            case '0':
                if (collected == '(' || collected == ')') this.charset = CHARSET_0;
                break;
            case 'B':
                this.charset = null;  // always reset charset
                break;
//        case '6':  // Back Index (DECBI), VT420 and up - not supported
            case '7':  return this.decsc();  // Save Cursor (DECSC)
            case '8':  return this.decrc();  // Restore Cursor (DECRC)
//        case '9':  // Forward Index (DECFI), VT420 and up - not supported
//        case '=':  // Application Keypad (DECKPAM)  // TODO
//        case '>':  // Normal Keypad (DECKPNM)  // TODO
//        case 'F':  // Cursor to lower left corner of screen  // TODO
            case 'c':  return this.reset();  // Full Reset (RIS) http://vt100.net/docs/vt220-rm/chapter4.html
//        case 'l':  // Memory Lock (per HP terminals). Locks memory above the cursor. - not supported
//        case 'm':  // Memory Unlock (per HP terminals). - not supported
//        case 'n':  // Invoke the G2 Character Set as GL (LS2). - not supported
//        case 'o':  // Invoke the G3 Character Set as GL (LS3). - not supported
//        case '|':  // Invoke the G3 Character Set as GR (LS3R). - not supported
//        case '}':  // Invoke the G2 Character Set as GR (LS2R). - not supported
//        case '~':  // Invoke the G1 Character Set as GR (LS1R). - not supported
            case 'E':  return this.nel();
            case 'D':  return this.ind();
            case 'M':  return this.reverse_index();  //    ESC M   Reverse Index ( RI is 0x8d).
            default :
                console.log('inst_e unhandled:', collected, flag);
        }
    };

    ANSITerminal.prototype.inst_H = function (collected, params, flag) {
        console.log('inst_H unhandled:', collected, params, flag);
        this.last_char = '';
    };

    ANSITerminal.prototype.inst_P = function (data) {
        console.log('inst_P unhandled:', data);
        this.last_char = '';
    };

    ANSITerminal.prototype.inst_U = function () {
        console.log('inst_U unhandled');
        this.last_char = '';
    };

    /**
     * functionality implementation
     * * 
     * cheatsheets:
     *  - overview http://www.vt100.net/docs/vt510-rm/chapter4
     *  - http://paulbourke.net/dataformats/ascii/
     *  - mouse support: http://manpages.ubuntu.com/manpages/intrepid/man4/console_codes.4.html
     *  - sequences: http://docs2.attachmate.com/verastream/vhi/7.6sp1/en/index.jsp?topic=%2Fcom.attachmate.vhi.help%2Fhtml%2Freference%2Fcontrol_functions_sortbysequ.xhtml
     */

    /**
     * unhandled sequences: (mc - mouse support)
     * "inst_c unhandled:" "?" Array [ 1001 ] "s"   SET_VT200_HIGHLIGHT_MOUSE
     * "inst_c unhandled:" "?" Array [ 1002 ] "h"   SET_BTN_EVENT_MOUSE
     * "inst_c unhandled:" "?" Array [ 1006 ] "h"   SET_SGR_EXT_MODE_MOUSE
     * "inst_c unhandled:" "?" Array [ 2004 ] "h"   bracketed paste mode https://cirw.in/blog/bracketed-paste
     *
     * unhandled from test debug log:
     * "inst_x unhandled:" 24           CAN        http://en.wikipedia.org/wiki/C0_and_C1_control_codes
     * "inst_x unhandled:" 26           SUB         http://en.wikipedia.org/wiki/C0_and_C1_control_codes
     * "inst_c unhandled:" "" Array [ 2, 3 ] "j"    FIXME WTF???? (nowhere to find)
     * "inst_c unhandled:" "" Array [ 0 ] "k"       FIXME WTF???? (nowhere to find)
     *
     */

    // scroll down - http://vt100.net/docs/vt510-rm/SD
    ANSITerminal.prototype.sd = function (params) {
        var lines = (params[0]) ? params[0] : 1;
        do {
            var row = [];
            for (var j = 0; j < this.cols; ++j)
                row.push(new TChar('', this.textattributes));
            this.buffer.splice(this.scrolling_top, 0, row);
            this.buffer.splice(this.scrolling_bottom, 1);
        } while (--lines);
    };

    // scroll up - http://vt100.net/docs/vt510-rm/SU
    ANSITerminal.prototype.su = function (params) {
        var lines = (params[0]) ? params[0] : 1;
        do {
            var row = [];
            for (var j = 0; j < this.cols; ++j)
                row.push(new TChar('', this.textattributes));
            this.buffer.splice(this.scrolling_bottom, 0, row);
            this.buffer.splice(this.scrolling_top, 1);
        } while (--lines);
    };

    // repeat - Repeat the preceding graphic character P s times (REP).  FIXME: hacky solution with this.last_char
    ANSITerminal.prototype.rep = function (params) {
        var s = '',
            c = this.last_char,
            n = (params[0]) ? params[0] : 1;
        if (c) {
            do {
                s += c;
            } while (--n);
            // for max col we need to set col to width to take
            // advantage of the autowrapping in inst_p
            if (this.cursor.col == this.cols - 1)
                this.cursor.col = this.cols;
            this.inst_p(s);
            this.last_char = '';
        }
    };

    // next line - http://vt100.net/docs/vt510-rm/NEL
    ANSITerminal.prototype.nel = function () {
        this.cursor.row += 1;
        if (this.cursor.row >= this.scrolling_bottom) {
            var row = [];
            for (var j = 0; j < this.cols; ++j)
                row.push(new TChar('', this.textattributes));
            this.buffer.splice(this.scrolling_bottom, 0, row);
            var scrolled_out = this.buffer.splice(this.scrolling_top, 1);
            if (this.buffer == this.normal_buffer && !this.scrolling_top)
                this.scroll_buffer.push(scrolled_out);
            this.cursor.row -= 1;
        }
        this.cursor.col = 0;
    };

    // index - http://vt100.net/docs/vt510-rm/IND
    ANSITerminal.prototype.ind = function () {
        this.cursor.row += 1;
        if (this.cursor.row >= this.scrolling_bottom) {
            var row = [];
            for (var j = 0; j < this.cols; ++j)
                row.push(new TChar('', this.textattributes));
            this.buffer.splice(this.scrolling_bottom, 0, row);
            var scrolled_out = this.buffer.splice(this.scrolling_top, 1);
            if (this.buffer == this.normal_buffer && !this.scrolling_top)
                this.scroll_buffer.push(scrolled_out);
            this.cursor.row -= 1;
        }
    };

    // vertical position relative - http://vt100.net/docs/vt510-rm/VPR
    ANSITerminal.prototype.vpr = function (params) {
        this.cursor.row += ((params[0]) ? params[0] : 1);
        if (this.cursor.row >= this.rows)
            this.cursor.row = this.rows - 1;
    };

    // horizontal position relative - http://vt100.net/docs/vt510-rm/HPR
    ANSITerminal.prototype.hpr = function (params) {
        this.cursor.col += ((params[0]) ? params[0] : 1);
        if (this.cursor.col >= this.cols)
            this.cursor.col = this.cols - 1;
    };

    // horizontal position absolute - http://vt100.net/docs/vt510-rm/HPA
    ANSITerminal.prototype.hpa = function (params) {
        this.cursor.col = ((params[0]) ? params[0] : 1) - 1;
        if (this.cursor.col >= this.cols)
            this.cursor.col = this.cols - 1;
    };

    // cursor backward tabulation - http://vt100.net/docs/vt510-rm/CBT
    ANSITerminal.prototype.cbt = function (params) {
        // FIXME: bug in cursor positioning? - need this fix here:
//    if (this.cursor.col >= this.cols && this.autowrap) {
//        this.cursor.col = 0;
//        this.cursor.row += 1;
//        if (this.cursor.row >= this.scrolling_bottom) {
//            var row = [];
//            for (var j = 0; j < this.cols; ++j)
//                row.push(new TChar('', this.textattributes));
//            this.buffer.splice(this.scrolling_bottom, 0, row);
//            var scrolled_out = this.buffer.splice(this.scrolling_top, 1);
//            if (this.buffer == this.normal_buffer && !this.scrolling_top)
//                this.scroll_buffer.push(scrolled_out);
//            this.cursor.row -= 1;
//        }
//    }
        this.cursor.col = (Math.floor((this.cursor.col - 1) / this.tab_width) + 1 -
        ((params[0]) ? params[0] : 1)) * this.tab_width;
        if (this.cursor.col < 0)
            this.cursor.col = 0;
    };

    // cursor horizontal forward tabulation - http://vt100.net/docs/vt510-rm/CHT
    ANSITerminal.prototype.cht = function (params) {
        this.cursor.col = (Math.floor(this.cursor.col / this.tab_width) +
        ((params[0]) ? params[0] : 1)) * this.tab_width;
        if (this.cursor.col >= this.cols)
            this.cursor.col = this.cols - 1;
    };

    // cursor previous line - http://vt100.net/docs/vt510-rm/CPL
    ANSITerminal.prototype.cpl = function (params) {
        this.cursor.row -= (params[0]) ? params[0] : 1;
        if (this.cursor.row < 0)
            this.cursor.row = 0;
        this.cursor.col = 0;
    };

    // cursor next line - http://vt100.net/docs/vt510-rm/CNL
    ANSITerminal.prototype.cnl = function (params) {
        this.cursor.row += (params[0]) ? params[0] : 1;
        if (this.cursor.row >= this.rows)
            this.cursor.row = this.rows - 1;
        this.cursor.col = 0;
    };

    // delete line - http://vt100.net/docs/vt510-rm/DL
    ANSITerminal.prototype.dl = function (params) {
        var lines = params[0] || 1;
        do {
            this.buffer.splice(this.cursor.row, 1);
            var row = [];
            for (var j = 0; j < this.cols; ++j)
                row.push(new TChar('', this.textattributes));
            this.buffer.splice(this.scrolling_bottom - 1, 0, row);
        } while (--lines);
        this.cursor.col = 0; // see http://vt100.net/docs/vt220-rm/chapter4.html
    };

    // insert character - http://vt100.net/docs/vt510-rm/ICH
    ANSITerminal.prototype.ich = function (params) {
        var chars = params[0] || 1;
        do {
            // FIXME ugly code - do splicing only once
            this.buffer[this.cursor.row].splice(this.cursor.col, 0, new TChar('', this.textattributes));
            this.buffer[this.cursor.row].pop();
        } while (--chars)
    };

    // Vertical Line Position Absolute - http://vt100.net/docs/vt510-rm/VPA
    ANSITerminal.prototype.vpa = function (params) {
        this.cursor.row = ((params[0]) ? params[0] : 1) - 1;
        if (this.cursor.row >= this.rows)
            this.cursor.row = this.rows - 1;
    };

    // erase character - http://vt100.net/docs/vt510-rm/ECH
    ANSITerminal.prototype.ech = function (params) {
        var erase = ((params[0]) ? params[0] : 1) + this.cursor.col;
        erase = (this.cols < erase) ? this.cols : erase;
        for (var i = this.cursor.col; i < erase; ++i) {
            this.buffer[this.cursor.row][i] = new TChar('', this.textattributes);
        }
    };

    // Insert Line - http://vt100.net/docs/vt510-rm/IL
    ANSITerminal.prototype.il = function (params) {
        var lines = (params[0]) ? params[0] : 1;
        do {  // FIXME ugly code - less splice possible?
            var row = [];
            for (var j = 0; j < this.cols; ++j)
                row.push(new TChar('', this.textattributes));
            this.buffer.splice(this.cursor.row, 0, row);
            this.buffer.splice(this.scrolling_bottom, 1);
        } while (--lines);
        this.cursor.col = 0; // see http://vt100.net/docs/vt220-rm/chapter4.html
    };

    // Set Top and Bottom Margins - http://vt100.net/docs/vt510-rm/DECSTBM
    ANSITerminal.prototype.decstbm = function (params) {
        var top = params[0] - 1 || 0;
        var bottom = params[1] || this.rows;
        top = (top < 0) ? 0 : ((top >= this.rows) ? (this.rows - 1) : top);
        bottom = (bottom > this.rows) ? (this.rows) : bottom;
        if (bottom > top) {
            this.scrolling_top = top;
            this.scrolling_bottom = bottom;
        }
        // always set cursor to top (seems xterm always does this - bug?)
        this.cursor.row = 0;
    };

    // soft terminal reset - http://vt100.net/docs/vt510-rm/DECSTR
    ANSITerminal.prototype.decstr = function () {
        // DECTCEM      Text cursor enable          --> Cursor enabled.
        this.show_cursor = true;
        // IRM          Insert/replace              --> Replace mode.
        this.insert_mode = false;
        // DECOM        Origin                      --> Absolute (cursor origin at upper-left of screen.) TODO do we need this?
        this.cup();  // at least move cursor home
        // DECAWM       Autowrap                    --> No autowrap. TODO
        // DECNRCM      National replacement character set  --> Multinational set. - unsupported
        // KAM          Keyboard action             --> Unlocked. TODO
        // DECNKM       Numeric keypad              --> Numeric characters. TODO
        // DECCKM       Cursor keys                 --> Normal (arrow keys).
        this.cursor_key_mode = false;
        // DECSTBM      Set top and bottom margins  --> Top margin = 1; bottom margin = page length.
        this.decstbm([]);
        // G0, G1, G2, G3, GL, GR                   --> Default settings. - unsupported
        this.charset = null;  // reset at least to unicode
        // SGR          Select graphic rendition    --> Normal rendition.
        this.sgr([0]);
        // DECSCA       Select character attribute  --> Normal (erasable by DECSEL and DECSED). TODO do we need this?
        // DECSC        Save cursor state           --> Home position.
        this.decsc();
        // DECAUPSS     Assign user preference supplemental set     --> Set selected in Set-Up. - unsupported
        // DECSASD      Select active status display    --> Main display. TODO do we need this?
        // DECKPM       Keyboard position mode      --> Character codes. TODO do we need this?
        // DECRLM       Cursor direction            --> Reset (Left-to-right), regardless of NVR setting. TODO
        // DECPCTERM    PC Term mode                --> Always reset. TODO do we need this?
        // TODO: do we need to reset LNM?
    };

    ANSITerminal.prototype.reverse_index = function () {
        this.cursor.row -= 1;
        if (this.cursor.row < this.scrolling_top) {
            this.cursor.row = this.scrolling_top;
            var row = [];
            for (var j = 0; j < this.cols; ++j)
                row.push(new TChar('', this.textattributes));
            this.buffer.splice(this.scrolling_top, 0, row);
            this.buffer.splice(this.scrolling_bottom, 1);
        }
    };

    // save curor - http://vt100.net/docs/vt510-rm/DECSC
    ANSITerminal.prototype.decsc = function () {
        var save = {};
        save['cursor'] = {row: this.cursor.row, col: this.cursor.col};
        save['textattributes'] = (this.textattributes) ? this.textattributes.slice() : null;
        save['charattributes'] = (this.charattributes) ? this.charattributes.slice() : null;
        this.cursor_save = save;
        // FIXME: this.colors
    };

    // restore cursor - http://vt100.net/docs/vt510-rm/DECRC
    ANSITerminal.prototype.decrc = function () {
        // FIXME: this.colors
        if (this.cursor_save) {
            // load data back
            this.cursor.col = this.cursor_save['cursor'].col;
            this.cursor.row = this.cursor_save['cursor'].row;
            this.textattributes = this.cursor_save['textattributes'];
            this.charattributes = this.cursor_save['charattributes'];
        } else {
            // see http://vt100.net/docs/vt510-rm/DECRC
            this.cup();
            this.ed([2]);
            this.textattributes = null;
            this.charattributes = null;
        }
    };

    ANSITerminal.prototype.high = function (collected, params) {
        for (var i = 0; i < params.length; ++i) {
            switch (params[i]) {
                case    1:  this.cursor_key_mode = true; break;     // DECCKM
                case    4:
                    if (!collected)                                 // IRM
                        this.insert_mode = true;
                    else
                        console.log('unhandled high', collected, params[i]);  // DECSCLM??
                    break;
                case    7:
                    if (collected == '?')
                        this.autowrap = true;                       // DECAWM (should be default?)
                    else
                        console.log('unhandled high', collected, params[i]);
                    break;
                case   12:
                    if (collected == '?')
                        this.blinking_cursor = true;
                    else
                        console.log('unhandled high', collected, params[i]);
                    break;
                case   20:
                    if (!collected)
                        this.newline_mode = true;                   // LNM
                    else
                        console.log('unhandled high', collected, params[i]);
                    break;
                case   25:  this.show_cursor = true; break;         // DECTCEM (default)
                case   43:  // printer stuff not supported
                case   44:
                case   45:
                case   46:
                case   47:
                    break; // end printer stuff
                case 1049:                                          // alt buffer
                    this.buffer = this.alternate_buffer;
                    this.cursor = this.alternate_cursor;
                    break;
                default:
                    console.log('unhandled high', collected, params[i]);
            }
        }
    };

    ANSITerminal.prototype.low = function (collected, params) {
        for (var i = 0; i < params.length; ++i) {
            switch (params[i]) {
                case    1:  this.cursor_key_mode = false; break;     // DECCKM (default)
                case    4:
                    if (!collected)                                  // IRM (default)
                        this.insert_mode = false;
                    else
                        console.log('unhandled low', collected, params[i]);
                    break;
                case    7:
                    if (collected == '?')
                        this.autowrap = false;                       // DECAWM (default)
                    else
                        console.log('unhandled high', collected, params[i]);
                    break;
                case   12:
                    if (collected == '?')
                        this.blinking_cursor = false;
                    else
                        console.log('unhandled high', collected, params[i]);
                    break;
                case   20:
                    if (!collected)
                        this.newline_mode = false;                   // LNM (default)
                    else
                        console.log('unhandled high', collected, params[i]);
                    break;
                case   25:  this.show_cursor = false; break;         // DECTCEM
                case   43:  // printer stuff not supported
                case   44:
                case   45:
                case   46:
                case   47:
                    break; // end printer stuff
                case 1049:
                    this.buffer = this.normal_buffer;
                    this.cursor = this.normal_cursor;
                    break;
                default:
                    console.log('unhandled low', collected, params[i]);
            }
        }
    };

    // device status reports - http://vt100.net/docs/vt510-rm/DSR
    // cursor position report - http://vt100.net/docs/vt510-rm/CPR
    ANSITerminal.prototype.dsr = function (collected, params) {
        switch (params[0]) {
            case  5:  // DSR - just send 'OK'
                this.send(TERM_STRING['CSI'] + '0n');
                break;
            case  6:  // cursor position report
                this.send(TERM_STRING['CSI'] + collected + (this.cursor.row + 1) + ';' + (this.cursor.col + 1) + 'R');
                break;
            case 75:  // DSR-DIR data integrity report - just send 'ready, no errors'
                this.send(TERM_STRING['CSI'] + '?70n');
                break;
            default:
                console.log('unhandled DSR', collected, params);
        }
    };

    // cursor horizontal absolute - http://vt100.net/docs/vt510-rm/CHA
    ANSITerminal.prototype.cha = function (params) {
        this.cursor.col = ((params) ? (params[0] || 1) : 1) - 1;
        if (this.cursor.col >= this.cols)
            this.cursor.col = this.cols - 1;
    };

    // cursor backward - http://vt100.net/docs/vt510-rm/CUB
    ANSITerminal.prototype.cub = function (params) {
        this.cursor.col -= (params) ? (params[0] || 1) : 1;
        if (this.cursor.col < 0)
            this.cursor.col = 0;
    };

    // cursor down - http://vt100.net/docs/vt510-rm/CUD
    ANSITerminal.prototype.cud = function (params) {
        this.cursor.row += (params) ? (params[0] || 1) : 1;
        if (this.cursor.row >= this.rows)
            this.cursor.row = this.rows - 1;
    };

    // cursor forward - http://vt100.net/docs/vt510-rm/CUF
    ANSITerminal.prototype.cuf = function (params) {
        this.cursor.col += (params) ? (params[0] || 1) : 1;
        if (this.cursor.col >= this.cols)
            this.cursor.col = this.cols - 1;
    };

    // cursor up - http://vt100.net/docs/vt510-rm/CUU
    ANSITerminal.prototype.cuu = function (params) {
        this.cursor.row -= (params) ? (params[0] || 1) : 1;
        if (this.cursor.row < 0)
            this.cursor.row = 0;
    };

    // cursor position - http://vt100.net/docs/vt510-rm/CUP
    ANSITerminal.prototype.cup = function (params) {
        this.cursor.row = ((params) ? (params[0] || 1) : 1) - 1;
        if (this.cursor.row >= this.rows)
            this.cursor.row = this.rows - 1;
        this.cursor.col = ((params) ? (params[1] || 1) : 1) - 1;
        if (this.cursor.col >= this.cols)
            this.cursor.col = this.cols - 1;
    };

    // delete character - http://vt100.net/docs/vt510-rm/DCH
    ANSITerminal.prototype.dch = function (params) {
        var removed = this.buffer[this.cursor.row].splice(this.cursor.col,
            (params) ? (params[0] || 1) : 1);
        for (var i = 0; i < removed.length; ++i)
            this.buffer[this.cursor.row].push(new TChar('', this.textattributes));
    };

    // erase in display - http://vt100.net/docs/vt510-rm/ED
    ANSITerminal.prototype.ed = function (params) {
        var i, j, row;
        switch ((params) ? params[0] : 0) {
            case 0:
                // from cursor to end of display
                // remove to line end
                this.el([0]);
                // clear lower lines
                for (i = this.cursor.row + 1; i < this.rows; ++i) {
                    row = [];
                    for (j = 0; j < this.cols; ++j)
                        row.push(new TChar('', this.textattributes));
                    this.buffer[i] = row;
                }
                break;
            case 1:
                // from top of display to cursor
                // clear upper lines
                for (i = 0; i < this.cursor.row; ++i) {
                    row = [];
                    for (j = 0; j < this.cols; ++j)
                        row.push(new TChar('', this.textattributes));
                    this.buffer[i] = row;
                }
                // clear line up to cursor
                this.el([1]);
                break;
            case 2:
                // complete display
                for (i = 0; i < this.rows; ++i) {
                    row = [];
                    for (j = 0; j < this.cols; ++j)
                        row.push(new TChar('', this.textattributes));
                    this.buffer[i] = row;
                }
                break;
        }
    };

    // erase in line - http://vt100.net/docs/vt510-rm/EL
    ANSITerminal.prototype.el = function (params) {
        var i;
        switch ((params) ? params[0] : 0) {
            case 0:
                // cursor to end of line
                for (i = this.cursor.col; i < this.cols; ++i) {
                    this.buffer[this.cursor.row][i] = new TChar('', this.textattributes);
                }
                break;
            case 1:
                // beginning of line to cursor
                for (i = 0; i <= this.cursor.col; ++i) {
                    this.buffer[this.cursor.row][i] = new TChar('', this.textattributes);
                }
                break;
            case 2:
                // complete line
                for (i = 0; i < this.cols; ++i) {
                    this.buffer[this.cursor.row][i] = new TChar('', this.textattributes);
                }
                break;
        }
    };

    // select graphic rendition - http://vt100.net/docs/vt510-rm/SGR
    ANSITerminal.prototype.sgr = function (params) {
        var i;
        var ext_colors = null;
        var textattributes = (this.textattributes) ? this.textattributes.slice() : create_attributes();
        for (i = 0; i < params.length; ++i) {
            // special treatment for extended colors
            if (ext_colors) {
                ext_colors.push(params[i]);
                if (ext_colors.length > 2) {
                    if (ext_colors[1] == 5) {
                        textattributes[((ext_colors[0] == 38) ? 1 : 2)] =
                            ((ext_colors[0] == 38) ? ' fg' : ' bg') + ext_colors[2];
                        this.colors[(ext_colors[0] == 38) ? 'fg' : 'bg'] = ext_colors[2];
                        ext_colors = null;
                    } else {
                        console.log('extended colors unsupported:', ext_colors);  // TODO 2;r;g;b
                        break;
                    }
                }
                continue;
            }
            switch (params[i]) {
                case 0:
                    textattributes = create_attributes();
                    this.colors.fg = -1;
                    this.colors.bg = -1;
                    break;
                case 1:  textattributes[0] = ' bold'; break;
                case 2:  break;  // not supported (faint)
                case 3:  textattributes[5] = ' italic'; break;
                case 4:  textattributes[6] = ' underline'; break;
                case 5:  textattributes[7] = ' blink'; break;
                case 6:  textattributes[7] = ' blink'; break;  // only one blinking speed
                case 7:  textattributes[4] = ' inverted'; break;
//            case 8:  break;  // TODO: conceal on
                case 9:  break;  // not supported (crossed out)
                case 10:         // not supported (font selection)
                case 11:
                case 12:
                case 13:
                case 14:
                case 15:
                case 16:
                case 17:
                case 18:
                case 19:  break;
                case 20:  break;  // not supported (fraktur)
                case 21:  break;  // not supported (bold: off or underline: double)
                case 22:  textattributes[0] = null; break;
                case 23:  textattributes[5] = null; break;
                case 24:  textattributes[6] = null; break;
                case 25:  textattributes[7] = null; break;
                case 26:  break;  // reserved
                case 27:  textattributes[4] = null; break;
//            case 28: break;  // TODO: reveal (conceal off)
                case 29:  break;  // not supported (not crossed out)
                case 30:
                case 31:
                case 32:
                case 33:
                case 34:
                case 35:
                case 36:
                case 37:
                    textattributes[1] = ' fg' + (params[i] % 10);
                    this.colors.fg = params[i] % 10;
                    break;
                case 38:  ext_colors = [38]; break;
                case 39:                                  // default foreground color
                    textattributes[1] = null;
                    this.colors.fg = -1;
                    break;
                case 40:
                case 41:
                case 42:
                case 43:
                case 44:
                case 45:
                case 46:
                case 47:
                    textattributes[2] = ' bg' + (params[i] % 10);
                    this.colors.bg = params[i] % 10;
                    break;
                case 48:  ext_colors = [48]; break;
                case 49:                                  // default background color
                    textattributes[2] = null;
                    this.colors.bg = -1;
                    break;
                default:
                    console.log('sgr unknown:', params[i]);
            }
        }
        // apply new attributes if any value is set
        for (i = 0; i < textattributes.length; ++i)
            if (textattributes[i]) {
                this.textattributes = textattributes;
                break;
            }
        // null textattributes if none was set
        if (this.textattributes !== textattributes)
            this.textattributes = null;

        // apply char only attributes to charattributes - only reverse atm
        if (this.textattributes) {
            this.charattributes = this.textattributes.slice();
            if (this.textattributes[4]) {
                this.charattributes[1] = ' fg' + this.colors.bg;
                this.charattributes[2] = ' bg' + this.colors.fg;
            }
        } else {
            this.charattributes = null;
        }
    };

    if (typeof module !== 'undefined' && typeof module['exports'] !== 'undefined') {
        module['exports'] = ANSITerminal;
    } else {
        if (typeof define === 'function' && define['amd']) {
            define([], function() {
                return ANSITerminal;
            });
        } else {
            window['AnsiTerminal'] = ANSITerminal;
        }
    }
})();