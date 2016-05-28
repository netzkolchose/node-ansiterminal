
/**
 * AnsiTerminal - an offscreen xterm like terminal.
 *
 *  TODO:
 *
 *  - unicode tests
 *  - move box printing chars to frontend
 *  - create output methods for TChar and AnsiTerminal
 *  - bracketed paste mode
 *  - tabs, tab stops, tab width, tab output
 *  - tons of DCS codes
 *  - advanced tests, vttest
 *  - mouse handling goes here (via registering handler callbacks)
 *  - test cases
 */

/**
 * @module node-ansiterminal
 * @exports node-ansiterminal
 * @typicalname ansiterminal
 * @example
 * ```js
 * var ansiterminal = require('node-ansiterminal')
 * ```
 */
(function() {
    'use strict';

    /* typedefs */
    /**
     * @typedef TColors
     * @type Object
     * @property {boolean} set  - true if color is set
     * @property {boolean} RGB  - true if color is in RGB mode
     * @property {array} color  - [R, G, B] or [color value, unused, unused]
     */

    /**
     * @typedef TAttributes
     * @type Object
     * @property {boolean} bold
     * @property {boolean} italic
     * @property {boolean} underline
     * @property {boolean} blink
     * @property {boolean} inverse
     * @property {boolean} conceal
     * @property {module:node-ansiterminal~TColors} foreground
     * @property {module:node-ansiterminal~TColors} background
     */

    /**
     * @typedef TJSONColors
     * @type Object
     * @property {string} mode          - '256' or 'RGB'
     * @property {number|array} color   - [R, G, B] for 'RGB' mode
     */

    /**
     * @typedef TJSONAttributes
     * @type Object
     * @property {boolean} bold
     * @property {boolean} italic
     * @property {boolean} underline
     * @property {boolean} blink
     * @property {boolean} inverse
     * @property {boolean} conceal
     * @property {module:node-ansiterminal~TJSONColors|false} foreground
     * @property {module:node-ansiterminal~TJSONColors|false} background
     */

    /**
     * @typedef JSONTRow
     * @type Object
     * @property {string} string                - sub string
     * @property {width} width                  - print space of string
     * @property {module:node-ansiterminal~TJSONAttributes} attributes   - text attributes
     */

    /**
     * Calculate print space of a string. The returned number denotes the taken
     * halfwidth space.
     * @note    Terminals and fonts may behave differently for some codepoints since unicode
     *          knows more widths than half and full width.
     * @param {string} s - single character or string
     * @return {number} halfwidth length of the string
     * @function module:node-ansiterminal.wcswidth
     * @example
     * ```js
     * > var wcswidth = require('node-ansiterminal').wcswidth
     * undefined
     * > wcswidth('￥￥￥￥￥')
     * 10
     * ```
     */
    var wcswidth = (function() {

        /*
         * taken from:
         * - http://www.cl.cam.ac.uk/~mgk25/ucs/wcwidth.c
         * - wcwidth node module
         */

        var _WIDTH_COMBINING = [
            [0x0300, 0x036F], [0x0483, 0x0486], [0x0488, 0x0489],
            [0x0591, 0x05BD], [0x05BF, 0x05BF], [0x05C1, 0x05C2],
            [0x05C4, 0x05C5], [0x05C7, 0x05C7], [0x0600, 0x0603],
            [0x0610, 0x0615], [0x064B, 0x065E], [0x0670, 0x0670],
            [0x06D6, 0x06E4], [0x06E7, 0x06E8], [0x06EA, 0x06ED],
            [0x070F, 0x070F], [0x0711, 0x0711], [0x0730, 0x074A],
            [0x07A6, 0x07B0], [0x07EB, 0x07F3], [0x0901, 0x0902],
            [0x093C, 0x093C], [0x0941, 0x0948], [0x094D, 0x094D],
            [0x0951, 0x0954], [0x0962, 0x0963], [0x0981, 0x0981],
            [0x09BC, 0x09BC], [0x09C1, 0x09C4], [0x09CD, 0x09CD],
            [0x09E2, 0x09E3], [0x0A01, 0x0A02], [0x0A3C, 0x0A3C],
            [0x0A41, 0x0A42], [0x0A47, 0x0A48], [0x0A4B, 0x0A4D],
            [0x0A70, 0x0A71], [0x0A81, 0x0A82], [0x0ABC, 0x0ABC],
            [0x0AC1, 0x0AC5], [0x0AC7, 0x0AC8], [0x0ACD, 0x0ACD],
            [0x0AE2, 0x0AE3], [0x0B01, 0x0B01], [0x0B3C, 0x0B3C],
            [0x0B3F, 0x0B3F], [0x0B41, 0x0B43], [0x0B4D, 0x0B4D],
            [0x0B56, 0x0B56], [0x0B82, 0x0B82], [0x0BC0, 0x0BC0],
            [0x0BCD, 0x0BCD], [0x0C3E, 0x0C40], [0x0C46, 0x0C48],
            [0x0C4A, 0x0C4D], [0x0C55, 0x0C56], [0x0CBC, 0x0CBC],
            [0x0CBF, 0x0CBF], [0x0CC6, 0x0CC6], [0x0CCC, 0x0CCD],
            [0x0CE2, 0x0CE3], [0x0D41, 0x0D43], [0x0D4D, 0x0D4D],
            [0x0DCA, 0x0DCA], [0x0DD2, 0x0DD4], [0x0DD6, 0x0DD6],
            [0x0E31, 0x0E31], [0x0E34, 0x0E3A], [0x0E47, 0x0E4E],
            [0x0EB1, 0x0EB1], [0x0EB4, 0x0EB9], [0x0EBB, 0x0EBC],
            [0x0EC8, 0x0ECD], [0x0F18, 0x0F19], [0x0F35, 0x0F35],
            [0x0F37, 0x0F37], [0x0F39, 0x0F39], [0x0F71, 0x0F7E],
            [0x0F80, 0x0F84], [0x0F86, 0x0F87], [0x0F90, 0x0F97],
            [0x0F99, 0x0FBC], [0x0FC6, 0x0FC6], [0x102D, 0x1030],
            [0x1032, 0x1032], [0x1036, 0x1037], [0x1039, 0x1039],
            [0x1058, 0x1059], [0x1160, 0x11FF], [0x135F, 0x135F],
            [0x1712, 0x1714], [0x1732, 0x1734], [0x1752, 0x1753],
            [0x1772, 0x1773], [0x17B4, 0x17B5], [0x17B7, 0x17BD],
            [0x17C6, 0x17C6], [0x17C9, 0x17D3], [0x17DD, 0x17DD],
            [0x180B, 0x180D], [0x18A9, 0x18A9], [0x1920, 0x1922],
            [0x1927, 0x1928], [0x1932, 0x1932], [0x1939, 0x193B],
            [0x1A17, 0x1A18], [0x1B00, 0x1B03], [0x1B34, 0x1B34],
            [0x1B36, 0x1B3A], [0x1B3C, 0x1B3C], [0x1B42, 0x1B42],
            [0x1B6B, 0x1B73], [0x1DC0, 0x1DCA], [0x1DFE, 0x1DFF],
            [0x200B, 0x200F], [0x202A, 0x202E], [0x2060, 0x2063],
            [0x206A, 0x206F], [0x20D0, 0x20EF], [0x302A, 0x302F],
            [0x3099, 0x309A], [0xA806, 0xA806], [0xA80B, 0xA80B],
            [0xA825, 0xA826], [0xFB1E, 0xFB1E], [0xFE00, 0xFE0F],
            [0xFE20, 0xFE23], [0xFEFF, 0xFEFF], [0xFFF9, 0xFFFB],
            [0x10A01, 0x10A03], [0x10A05, 0x10A06], [0x10A0C, 0x10A0F],
            [0x10A38, 0x10A3A], [0x10A3F, 0x10A3F], [0x1D167, 0x1D169],
            [0x1D173, 0x1D182], [0x1D185, 0x1D18B], [0x1D1AA, 0x1D1AD],
            [0x1D242, 0x1D244], [0xE0001, 0xE0001], [0xE0020, 0xE007F],
            [0xE0100, 0xE01EF]
        ];

        function _width_bisearch(ucs) {
            var min = 0;
            var max = _WIDTH_COMBINING.length - 1;
            var mid;
            if (ucs < _WIDTH_COMBINING[0][0] || ucs > _WIDTH_COMBINING[max][1])
                return false;
            while (max >= min) {
                mid = Math.floor((min + max) / 2);
                if (ucs > _WIDTH_COMBINING[mid][1])
                    min = mid + 1;
                else if (ucs < _WIDTH_COMBINING[mid][0])
                    max = mid - 1;
                else
                    return true;
            }
            return false;
        }

        function _width_wcwidth(ucs, opts) {
            // test for 8-bit control characters
            if (ucs === 0)
                return opts.nul;
            if (ucs < 32 || (ucs >= 0x7f && ucs < 0xa0))
                return opts.control;
            // binary search in table of non-spacing characters
            if (_width_bisearch(ucs))
                return 0;
            // if we arrive here, ucs is not a combining or C0/C1 control character
            return 1 +
                (ucs >= 0x1100 &&
                (ucs <= 0x115f ||                       // Hangul Jamo init. consonants
                ucs == 0x2329 || ucs == 0x232a ||
                (ucs >= 0x2e80 && ucs <= 0xa4cf &&
                ucs != 0x303f) ||                     // CJK ... Yi
                (ucs >= 0xac00 && ucs <= 0xd7a3) ||    // Hangul Syllables
                (ucs >= 0xf900 && ucs <= 0xfaff) ||    // CJK Compatibility Ideographs
                (ucs >= 0xfe10 && ucs <= 0xfe19) ||    // Vertical forms
                (ucs >= 0xfe30 && ucs <= 0xfe6f) ||    // CJK Compatibility Forms
                (ucs >= 0xff00 && ucs <= 0xff60) ||    // Fullwidth Forms
                (ucs >= 0xffe0 && ucs <= 0xffe6) ||
                (ucs >= 0x20000 && ucs <= 0x2fffd) ||
                (ucs >= 0x30000 && ucs <= 0x3fffd)));
        }

        var _WIDTH_DEFAULTS = {nul: 0, control: 0};

        // wcswidth(string[, opts]) - number of taken terminal cells by a string (printed space)
        function wcswidth(str, opts) {
            opts = _WIDTH_DEFAULTS; // FIXME
            if (typeof str !== 'string')
                return _width_wcwidth(str, opts);
            var s = 0;
            for (var i = 0; i < str.length; i++) {
                // FIXME: apply patch for high unicode chars (see print_p)
                var n = _width_wcwidth(str.charCodeAt(i), opts);
                if (n < 0)
                    return -1;
                s += n;
            }
            return s
        }

        return wcswidth;
    })();

    /**
     * @classdesc A TChar is a terminal character with text attributes and width.
     * In the terminal emulator it represents a terminal cell in a TRow.
     * The actual character is saved in `c`.
     *
     * `width` is the printed space of the character according to unicode.
     * It can be 1 (halfwidth codepoints), 2 (fullwidth codepoints)
     * or 0 (as intermediate state after a fullwidth codepoint).
     * `width` always defaults to 1 and is not calculated upon initialization.
     * The correct width value is set by the emulator while processing
     * a printable character.
     *
     * For small memory footprint and quick state changes a TChar object stores
     * the text attributes in the 2 4-byte numbers `attr` and `gb`.
     *
     * Bits of `attr`:
     *
     *       1-8     background color in 256 mode / background RED in RGB mode
     *       9-16    foreground color in 256 mode / foreground RED in RGB mode
     *       17      bold
     *       18      italic
     *       19      underline
     *       20      blink
     *       21      inverse
     *       22      conceal
     *       23      cursor (not set by default)
     *       24      <unused>
     *       25      background set (for 256 and RGB mode)
     *       26      background in RGB mode (true for RGB, false for 256)
     *       27      foreground set (for 256 and RGB mode)
     *       28      foreground in RGB mode (true for RGB, false for 256)
     *       29-32   <unused>
     *
     * Bits of `gb`:
     *
     *       1-8         background BLUE in RGB mode
     *       9-16        foreground BLUE in RGB mode
     *       17-24       background GREEN in RGB mode
     *       25-32       foreground GREEN in RGB mode
     * 
     * @param {string} c        - unicode character (multiple if surrogate or combining)
     * @param {number} attr     - text attributes as integer
     * @param {number} gb       - green and blue part of RGB as integer
     * @param {number} width    - printed space of character
     * @property {string} c     - unicode character (multiple if surrogate or combining)
     * @property {number} attr  - text attributes as integer
     * @property {number} gb    - green and blue part of RGB as integer
     * @property {number} width - printed space of character
     * @constructor module:node-ansiterminal.TChar
     * @typicalname tchar
     */
    function TChar(c, attr, gb, width) {
        this.c = c;
        this.attr = attr | 0;
        this.gb = gb | 0;
        this.width = (width === undefined) ? 1 : width;
    }

    /**
     * Clone a TChar object.
     * @return {module:node-ansiterminal.TChar}
     * @method module:node-ansiterminal.TChar#clone
     */
    TChar.prototype.clone = function() {
        return new TChar(this.c, this.attr, this.gb, this.width);
    };

    /**
     * Test equality of TChar.
     * @param {module:node-ansiterminal.TChar} other
     * @return {boolean}
     * @method module:node-ansiterminal.TChar#equals
     */
    TChar.prototype.equals = function(other) {
        return ( other instanceof TChar
            && this.c==other.c
            && this.attr==other.attr
            && this.gb==other.gb
            && this.width==other.width)
    };

    /**
     * Serialize a TChar.
     * @return {Array}
     * @method module:node-ansiterminal.TChar#serialize
     */
    TChar.prototype.serialize = function() {
        return [this.c, this.attr, this.gb, this.width];
    };

    /**
     * Deserialize a serialization object to TChar.
     * @param {object} o
     * @return {module:node-ansiterminal.TChar}
     * @method module:node-ansiterminal.TChar.deserialize
     */
    TChar.deserialize = function(o) {
        return new TChar(o[0], o[1], o[2], o[3]);
    };

    /**
     * Get all text attributes in a readable manner.
     * The attributes object may contain left over color values
     * of a former RGB setting. This is due to the way xterm
     * handles those values internally. For cleaned attributes
     * see {@link module:node-ansiterminal.TChar#getJSONAttributes}
     * @return {module:node-ansiterminal~TAttributes}
     * @method module:node-ansiterminal.TChar#getAttributes
     */
    TChar.prototype.getAttributes = function() {
        var colorbits = this.attr >>> 24;
        var r = this.attr & 65535;
        var g = this.gb >>> 16;
        var b = this.gb & 65535;
        var bits = this.attr >>> 16 & 255;
        return {
            bold: !!(bits & 1),
            italic: !!(bits & 2),
            underline: !!(bits & 4),
            blink: !!(bits & 8),
            inverse: !!(bits & 16),
            conceal: !!(bits & 32),
            //cursor: !!(bits & 64),
            foreground: {
                set: !!(colorbits & 4),
                RGB: !!(colorbits & 8),
                color: [r>>>8, g>>>8, b>>>8]
            },
            background: {
                set: !!(colorbits & 1),
                RGB: !!(colorbits & 2),
                color: [r&255, g&255, b&255]
            }
        }
    };

    /**
     * Get all text attributes in a readable manner without state internals.
     * Use this in favour of {@link module:node-ansiterminal.TChar#getAttributes} if you need
     * the attributes in a clean way without remnant color values.
     *
     * Except the colors all attributes are simple boolean values.
     * The color attributes default to false and will turn into an object
     * with a `mode` and a `color` attribute if a color is set. For mode '256'
     * the color will be a single integer indicating the color in the 256 color scheme.
     * For mode 'RGB' color is an array with the RGB color values.
     *
     * NOTE: The simple 8bit colors are not directly supported by the terminal emulator.
     * They will be translated to the lower colors of the 256 color scheme.
     *
     * Example output with a foreground color set:
     * ```js
     * {
     *     bold: false,
     *     italic: false,
     *     underline: false,
     *     blink: false,
     *     inverse: false,
     *     conceal: false,
     *     foreground: {mode: '256', color: 12},
     *     background: false
     * }
     * ```
     * @return {module:node-ansiterminal~TJSONAttributes}
     * @method module:node-ansiterminal.TChar#getJSONAttributes
     */
    TChar.prototype.getJSONAttributes = function() {
        var colorbits = this.attr >>> 24;
        var r = this.attr & 65535;
        var g = this.gb >>> 16;
        var b = this.gb & 65535;
        var bits = this.attr >>> 16 & 255;
        var attr = {
            bold: !!(bits & 1),
            italic: !!(bits & 2),
            underline: !!(bits & 4),
            blink: !!(bits & 8),
            inverse: !!(bits & 16),
            conceal: !!(bits & 32),
            foreground: false,
            background: false
        };
        if (colorbits & 4) {
            attr.foreground = {};
            if (colorbits & 8) {
                attr.foreground['mode'] = 'RGB';
                attr.foreground['color'] = {r: r>>>8, g: g>>>8, b: b>>>8};
            } else {
                attr.foreground['mode'] = '256';
                attr.foreground['color'] = r>>>8;
            }
        }
        if (colorbits & 1) {
            attr.background = {};
            if (colorbits & 2) {
                attr.background['mode'] = 'RGB';
                attr.background['color'] = {r: r&255, g: g&255, b: b&255};
            } else {
                attr.background['mode'] = '256';
                attr.background['color'] = r&255;
            }
        }
        return attr;
    };

    /**
     * Set the text attributes. The parameter must be in the form of the output
     * of {@link module:node-ansiterminal.TChar#getAttributes}.
     * @param {module:node-ansiterminal~TAttributes} attributes
     * @method module:node-ansiterminal.TChar#setAttributes
     */
    TChar.prototype.setAttributes = function(attributes) {
        if (attributes === 0) {
            this.attr = 0;
            this.gb = 0;
            return
        }
        var attr = this.attr;
        ['bold', 'italic', 'underline', 'blink', 'inverse', 'conceal'].map(function(el, i) {
            if (attributes[el] !== undefined)
                attr = (attributes[el]) ? attr | (2<<(15+i)) : attr & ~(2<<(15+i));
        });
        if (attributes['foreground']) {
            var foreground = attributes['foreground'];
            if (foreground['set'] !== undefined)
                attr = (foreground['set']) ? attr | (2<<25) : attr & ~(2<<25);
            if (foreground['RGB'] !== undefined)
                attr = (foreground['RGB']) ? attr | (2<<26) : attr & ~(2<<26);
            if (foreground['color'] !== undefined) {
                attr = (attr & ~65280) | (foreground['color'][0] << 8);
                this.gb = (this.gb & ~4278190080) | (foreground['color'][1] << 24);
                this.gb = (this.gb & ~65280) | (foreground['color'][2] << 8);
            }
        }
        if (attributes['background']) {
            var background = attributes['background'];
            if (background['set'] !== undefined)
                attr = (background['set']) ? attr | (2<<23) : attr & ~(2<<23);
            if (background['RGB'] !== undefined)
                attr = (background['RGB']) ? attr | (2<<24) : attr & ~(2<<24);
            if (background['color'] !== undefined) {
                attr = (attr & ~255) | (background['color'][0]);
                this.gb = (this.gb & ~16711680) | (background['color'][1] << 16);
                this.gb = (this.gb & ~255) | background['color'][2];
            }
        }
        this.attr = attr;
    };

    /**
     * Trim right of '\x00'.
     * '\x00' is used as an intermediate placeholder for empty cells
     * by the TRow output methods.
     * @param {string} s
     * @return {string}
     */
    function trimRight(s) {
        return s.replace(/[\x00]+$/,"");
    }

    var _uniqueId = 0;
    /**
     * The constructor will create `length` cells of cloned `tchar` objects.
     *
     * @classdesc A TRow contains single terminal cells (TChar) in `cells`.
     * The global unique ID `uniqueId` will never change for an existing TRow.
     * The `version` attributes will be incremented by the terminal emulator
     * upon changes. This can be used to implement a partial refresh of a view output.
     *
     * @param {number} length       - amount of cells to create
     * @param {module:node-ansiterminal.TChar} tchar - base object to be cloned as initial
     * @property {array} cells      - array containing the single {@link TChar} objects
     * @property {number} uniqueId  - global unique id of the row object
     * @property {number} version   - incremented by emulator upon changes
     * @constructor module:node-ansiterminal.TRow
     */
    function TRow(length, tchar) {
        this.uniqueId = _uniqueId++|0;
        this.version = 1;
        this.doubled = 0;  // 0 - normal, 1 - width, 3 - height top, 4 - height bottom
        this.cells = [];
        for (var i=0; i<length; ++i) {
            //this.cells.push(tchar.clone()); // to slow?
            this.cells.push(new TChar(tchar.c, tchar.attr, tchar.gb, tchar.width));
        }
    }

    /**
     * Serialize a TRow.
     * @return {Array}
     * @method module:node-ansiterminal.TRow#serialize
     */
    TRow.prototype.serialize = function() {
        var result = {content: [], attributes: {doubled: this.doubled}};
        for (var i=0; i<this.cells.length; ++i)
            result.content.push(this.cells[i].serialize());
        return result;
    };

    /**
     * Deserialize a TRow.
     * @param o
     * @return {module:node-ansiterminal.TRow}
     * @method module:node-ansiterminal.TRow.deserialize
     */
    TRow.deserialize = function(o) {
        var row = new TRow(0, null);
        for (var i=0;i< o.content.length; ++i)
            row.cells.push(TChar.deserialize(o.content[i]));
        row.doubled = o.attributes.doubled;
        return row;
    };

    /**
     * String representation of TRow.
     * @param {object} opts
     * @return {string}
     * @method module:node-ansiterminal.TRow#toString
     */
    TRow.prototype.toString = function(opts) {
        // set options
        var options = {
            rtrim: true,
            empty_cell: ' '  // non break space
        };
        if (opts) {
            if (opts.hasOwnProperty('rtrim'))
                options.rtrim = opts.rtrim;
            if (opts.hasOwnProperty('empty_cell'))
                options.empty_cell = opts.empty_cell;
        }
        var s = '';
        for (var i=0; i<this.cells.length; ++i) {
            s += this.cells[i].c || '\x00';
        }
        if (options.rtrim)
            s = trimRight(s);
        return s.replace(/\x00/g, options.empty_cell);
    };

    /**
     * Array representation of merged TChars objects with same text attributes.
     * @param opts
     * @return {Array} array of merged TChar objects
     * @method module:node-ansiterminal.TRow#toMergedArray
     */
    TRow.prototype.toMergedArray = function(opts) {
        // set options
        var options = {
            rtrim: false,
            empty_cell: '\xa0'  // non break space
        };
        if (opts) {
            if (opts.hasOwnProperty('rtrim'))
                options.rtrim = opts.rtrim;
            if (opts.hasOwnProperty('empty_cell'))
                options.empty_cell = opts.empty_cell;
        }

        // build tchar stack
        var stack = [];
        if (!this.cells.length)
            return stack;
        var tchar = null;
        var length = this.cells.length;
        if (this.doubled)
            length = parseInt(length/2);
        var elem = this.cells[0].clone();
        elem.c = elem.c || '\x00';
        for (var i=1; i<length; ++i) {
            tchar = this.cells[i];
            if ((elem.attr !== tchar.attr)) {
                stack.push(elem);
                elem = tchar.clone();
                elem.c = elem.c || '\x00';
            } else if (tchar.width) {
                elem.c += tchar.c || '\x00';
                elem.width += tchar.width;
            }
        }
        stack.push(elem);

        // rtrim
        if (options.rtrim) {
            while (stack.length) {
                var last = stack.pop();
                var s = trimRight(last.c);
                if (s.length) {
                    last.width -= last.c.length - s.length;
                    last.c = s;
                    stack.push(last);
                    break;
                }
            }
        }

        // fill empty cells
        for (i=0; i<stack.length; ++i) {
            stack[i].c = stack[i].c.replace(/\x00/g, options.empty_cell);
        }
        return stack;
    };

    /**
     * Drilled down JSON representation of a TRow.
     * Returns objects of sub strings with distinct text attributes.
     * @note The print space width is summed up.
     * @param opts
     * @return {module:node-ansiterminal~JSONTRow}
     * @method module:node-ansiterminal.TRow#toJSON
     */
    TRow.prototype.toJSON = function(opts) {
        var json = {content: [], attributes: {doubled: this.doubled}};
        var stack = this.toMergedArray(opts);
        var tchar = null;
        for (var i=0; i<stack.length; ++i) {
            tchar = stack[i];
            json.content.push({
                string: tchar.c,
                width: tchar.width,
                attributes: tchar.getJSONAttributes()});
        }
        return json;
    };

    function _get_escape_string(attr_old, attr_new, gb_old, gb_new) {
        var bits = (attr_new >>> 16) & 255;
        var diff = ((attr_old >>> 16) & 255) ^ bits;
        var colorbits = attr_new >>> 24;
        var r = attr_new & 65535;
        var result = [];

        if (diff) {
            if (diff & 1)  result.push((bits & 1)  ? 1 : 22);  // bold
            if (diff & 2)  result.push((bits & 2)  ? 3 : 23);  // italic
            if (diff & 4)  result.push((bits & 4)  ? 4 : 24);  // underline
            if (diff & 8)  result.push((bits & 8)  ? 5 : 25);  // blink
            if (diff & 16) result.push((bits & 16) ? 7 : 27);  // inverse
            if (diff & 32) result.push((bits & 32) ? 8 : 28);  // conceal
        }

        // colors
        if ((attr_old >>> 24)^colorbits || (attr_old & 65535)^r || gb_old^gb_new) {
            if (colorbits & 4) {      // foreground
                if (colorbits & 8) {  // RGB
                    result.push(38, 2, r>>>8, gb_new>>>24, (gb_new&65535)>>>8);
                } else {
                    result.push(38, 5, (bits & 1) ? (r>>>8)|8 : r>>>8);
                }
            } else {  // unset
                if (attr_old&67108864)
                    result.push(39);
            }
            if (colorbits & 1) {      // background
                if (colorbits & 2) {  // RGB
                    result.push(48, 2, r&255, (gb_new>>>16)&255, gb_new&255);
                } else {
                    result.push(48, 5, r&255);
                }
            } else {  // unset
                if (attr_old&16777216)
                    result.push(49);
            }
        }
        return result.join(';');
    }

    /**
     * String representation of TRow with escape codes.
     * @param opts
     * @return {string}
     * @method module:node-ansiterminal.TRow#toEscapeString
     */
    TRow.prototype.toEscapeString = function(opts) {
        var s = '\x1b[0m';
        switch (this.doubled) {
            case 0:
                s += '\x1b#5';
                break;
            case 1:
                s += '\x1b#6';
                break;
            case 3:
                s += '\x1b#3';
                break;
            case 4:
                s += '\x1b#4';
        }
        var stack = this.toMergedArray(opts);
        var tchar = null;
        var old_attr = 0;
        var old_gb = 0;
        for (var i=0; i<stack.length; ++i) {
            tchar = stack[i];
            s += '\x1b[' + (
                    (tchar.attr)
                        ? _get_escape_string(old_attr, tchar.attr, old_gb, tchar.gb)
                        : '0'
                ) + 'm';
            s += tchar.c;
            old_attr = tchar.attr;
            old_gb = tchar.gb;
        }
        if (old_attr)
            s += '\x1b[0m';
        return s;
    };

    var _DEFAULT_COLORS = [
        '#000000', '#cd0000', '#00cd00', '#cdcd00',
        '#0000ee', '#cd00cd', '#00cdcd', '#e5e5e5',
        '#7f7f7f', '#ff0000', '#00ff00', '#ffff00',
        '#5c5cff', '#ff00ff', '#00ffff', '#ffffff'];

    /**
     * Default color mapper function with xterm colorset in white on black.
     * @param value
     * @return {string} hex color string
     * @function module:node-ansiterminal.get_color
     */
    function get_color(value) {
        if (value == 'foreground')  // default foreground color
            return '#ffffff';
        if (value == 'background')  // default background color
            return '#000000';
        if (value < 16) {
            return _DEFAULT_COLORS[value];
        }
        // extended colors
        if (value < 232) {
            var digits = [0, 95, 135, 175, 215, 255];
            value -= 16;
            var result = 0;
            for (var i=0; i<3; ++i) {
                result += digits[(value % 6)] << (i*8);
                value = parseInt(value/6);
            }
            result = result.toString(16);
            return '#' + Array(6-result.length+1).join('0') + result;
        }
        // grey values
        var base = 8 + (value-232) * 10;
        return '#' + (base + (base << 8) + (base << 16)).toString(16);
    }

    function _get_html_styles(attr, options) {
        var style_ = '';
        var class_ = '';
        if (options.classes) {
            if (attr.bold)      class_ += 'bold ';
            if (attr.italic)    class_ += 'italic ';
            if (attr.underline) class_ += 'underline ';
            if (attr.blink)     class_ += 'blink ';
            if (attr.conceal)   class_ += 'conceal ';
        } else {
            if (attr.bold)      style_ += 'font-weight:bold;';
            if (attr.italic)    style_ += 'font-style:italic;';
            if (attr.underline) style_ += 'font-decoration:underline;';
            if (attr.blink)     style_ += 'visibility:hidden;animation: '
                                            + options.blinkanimation
                                            + ' 1s steps(1, start) infinite;';
            if (attr.conceal)   style_ += 'visibility:hidden;';
        }
        if (attr.inverse) {
            var tmp = attr.foreground;
            attr.foreground = attr.background;
            attr.background = tmp;
        }
        if (attr.foreground) {
            if (attr.foreground.mode == 'RGB') {
                style_ += 'color:rgb(';
                style_ += attr.foreground.color.r;
                style_ += ',';
                style_ += attr.foreground.color.g;
                style_ += ',';
                style_ += attr.foreground.color.b;
                style_ += ');';
            } else {
                var fg = attr.foreground.color;
                if (attr.bold)
                    fg = fg|8;
                if (options.classes)
                    class_ += 'fg' + fg + ' ';
                else
                    style_ += 'color:' + options.colors(fg) + ';';
            }
        } else if (attr.inverse) {
            if (options.classes)
                    class_ += 'fg-1 ';
                else
                    style_ += 'color:' + options.colors('background') + ';';
        }
        if (attr.background) {
            if (attr.background.mode == 'RGB') {
                style_ += 'background-color:rgb(';
                style_ += attr.background.color.r;
                style_ += ',';
                style_ += attr.background.color.g;
                style_ += ',';
                style_ += attr.background.color.b;
                style_ += ');';
            } else {
                if (options.classes)
                    class_ += 'bg' + attr.background.color + ' ';
                else
                    style_ += 'background-color:' + options.colors(attr.background.color) + ';';
            }
        } else if (attr.inverse) {
            if (options.classes)
                class_ += 'bg-1 ';
            else
                style_ += 'background-color:' + options.colors('foreground') + ';';
        }
        if (class_)
            class_ = ' class="' + class_.trim() + '"';
        if (style_)
            style_ = ' style="' + style_.trim() + '"';
        return class_ + style_;
    }

    function _escape_html(s) {
        return s
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // TODO: browser tests
    function _apply_row_attributes(content, doubled, options) {
        if (options.classes) {
            var classnames = ['', 'dbl-width', '', 'dbl-height-top', 'dbl-height-bottom'];
            return '<span class="' + classnames[doubled] + '">' + content + '</span>';
        }
        var result = '';
        switch (doubled) {
            case 1:  // double width
                result = '<span style="';
                result += 'transform: scale(2,1);';
                result += 'display: inline-block;';
                result += 'margin-left:25%">';
                result += content;
                result += '</span>';
                break;
            case 3:  // double height top
                result = '<span style="';
                result += 'display: inline-block;';
                result += 'vertical-align:bottom;';
                result += 'margin: -0.667em 25% 0.667em;';
                result += 'overflow: hidden;';
                result += 'transform: scale(2, 2);">';
                result += '<span style="display: inline-block;transform: translateY(0.5em);">';
                result += content;
                result += '</span></span>';
                break;
            case 4:  // double height bottom
                result = '<span style="';
                result += 'display: inline-block;';
                result += 'vertical-align:top;';
                result += 'margin-left: 25%;';
                result += 'overflow: hidden;';
                result += 'transform: scale(2, 2);">';
                result += '<span style="display: inline-block;transform: translateY(-0.46em);">';
                result += content;
                result += '</span></span>';
        }
        return result;
    }

    /**
     * HTML string representation of TRow.
     *
     * The terminal string gets decorated by span elements with textattributes
     * either set via class names or inline styles.
     *
     * Options are:
     *
     *     rtrim            Trim empty cells from right.
     *                      Defaults to true.
     *     empty_cell       Fill empty_cells with given string.
     *                      Defaults to none break space character '\xa0'.
     *     blinkanimation   CSS animation class name. Since an animation in CSS
     *                      can't be declared inline, this is mandatory for
     *                      classes false.
     *     classes          Use CSS classes (true) or inline styles (false).
     *                      The class names are: 'blink', 'italic',
     *                      'underline', 'blink', 'conceal', 'fgX', 'bgX'
     *                      For foreground and background colors the 'X'
     *                      is the number of a 256 color table, e.g. 'fg134'.
     *                      Default foreground and background colors have
     *                      no class name. Therefore inverted default colors
     *                      are named as 'fg-1' and 'bg-1'.
     *                      Defaults to true.
     *     colors           Customizable callback for inline colors.
     *                      The callback has to support one parameter as
     *                      color number from 0..255 or the keywords
     *                      'foreground' or 'background' for default colors).
     *                      The default callback uses the xterm colorset.
     *     escape_html      Escape html characters in terminal string.
     *                      Default is true.
     *
     * @param opts
     * @return {string} HTML string
     * @method module:node-ansiterminal.TRow#toHTML
     */
    TRow.prototype.toHTML = function(opts) {
        // set options
        var options = {
            rtrim: true,
            empty_cell: '\xa0',
            blinkanimation: 'blink',
            classes: true,
            colors: get_color,
            escape_html: true
        };
        if (opts) {
            var parts = ['rtrim', 'empty_cell', 'blinkanimation', 'colors', 'classes'];
            for (var p=0; p<parts.length; ++p) {
                if (opts.hasOwnProperty(parts[p]))
                    options[parts[p]] = opts[parts[p]];
            }
        }

        var stack = this.toMergedArray(options);

        // build html string
        var html = '';
        var tchar = null;
        for (var i=0; i<stack.length; ++i) {
            tchar = stack[i];
            if (tchar.attr)
                html += '<span' + _get_html_styles(tchar.getJSONAttributes(), options) + '>';
            html += (options.escape_html) ? _escape_html(tchar.c) : tchar.c;
            if (tchar.attr)
                html += '</span>';
        }
        if (this.doubled)
            return _apply_row_attributes(html, this.doubled, options);
        return html;
    };

    /**
     * TScreen - represents a terminal screen with cols and rows.
     *
     * .buffer is an array of length rows and contains the row objects.
     *
     * @param cols
     * @param rows
     * @param scrollLength
     * @constructor
     */
    function TScreen(cols, rows, scrollLength) {
        this.rows = rows;
        this.cols = cols;
        this.scrollLength = scrollLength | 0;

        this.buffer = [];
        this.scrollbuffer = [];

        this.reset();
    }

    TScreen.prototype.reset = function() {
        this.buffer = [];
        this.scrollbuffer = [];
        var row;
        for (var i = 0; i < this.rows; ++i) {
            row = new TRow(this.cols, new TChar(''));
            this.buffer.push(row);
        }
    };

    TScreen.prototype.serialize = function() {
        var i;
        var serialized_buffer = [];
        var serialized_scrollbuffer = [];
        for (i=0; i<this.buffer.length; ++i)
            serialized_buffer.push(this.buffer[i].serialize());
        for (i=0; i<this.scrollbuffer.length; ++i)
            serialized_scrollbuffer.push(this.scrollbuffer[i].serialize());
        return {
            cols: this.cols,
            rows: this.rows,
            scrollLength: this.scrollLength,
            buffer: serialized_buffer,
            scrollbuffer: serialized_scrollbuffer
        }
    };
    TScreen.deserialize = function(o) {
        var i;
        var sb = new TScreen(0, 0, 0);
        sb.rows = o.rows;
        sb.cols = o.cols;
        sb.scrollLength = o.scrollLength;
        for (i=0; i<sb.rows; ++i)
            sb.buffer.push(TRow.deserialize(o.buffer[i]));
        for (i=0; i<sb.scrollLength; ++i)
            sb.scrollbuffer.push(TRow.deserialize(o.scrollbuffer[i]));
        return sb;
    };

    TScreen.prototype.appendToScrollBuffer = function(row) {
        this.scrollbuffer.push(row);
        while (this.scrollbuffer.length > this.scrollLength)
            this.scrollbuffer.shift();
    };
    TScreen.prototype.fetchFromScrollBuffer = function() {
        return this.scrollbuffer.pop();
    };
    TScreen.prototype.resize = function(cols, rows, cursor) {
        // xterm behavior - shrink:
        //      delete higher rows til cursor then lowest to scrollbuffer
        // xterm behavior - enlarge:
        //      fill lowest from scrollbuffer then append new at end

        // assume xterm handles alternate buffer the same way
        // in respect of the cursor position but w/o scrolling

        // shrink height
        if (rows < this.rows) {
            while (this.buffer.length > rows)
                if (this.buffer.length > cursor.row+1)
                    this.buffer.pop();
                else {
                    this.appendToScrollBuffer(this.buffer.shift());
                    cursor.row -= 1;
                }
        }
        // enlarge height
        if (rows > this.rows) {
            while (this.buffer.length < rows) {
                var row = this.fetchFromScrollBuffer();
                if (row) {
                    this.buffer.unshift(row);
                    cursor.row += 1;
                }
                else {
                    row = new TRow(this.cols, new TChar(''));
                    this.buffer.push(row);
                }
            }
        }
        if (cursor.row >= rows)
            cursor.row = rows - 1;

        var i;
        // shrink width
        if (cols < this.cols) {
            for (i=0; i<this.buffer.length; ++i) {
                var remove = this.cols - cols;
                do {
                    this.buffer[i].cells.pop();
                } while (--remove);
                this.buffer[i].version++;
            }
            for (i=0; i<this.scrollbuffer.length; ++i) {
                remove = this.cols - cols;
                do {
                    this.scrollbuffer[i].cells.pop();
                } while (--remove);
                this.scrollbuffer[i].version++;
            }
        }
        // enlarge width
        if (cols > this.cols) {
            for (i=0; i<this.buffer.length; ++i) {
                var append = cols - this.cols;
                do {
                    this.buffer[i].cells.push(new TChar(''));
                } while (--append);
                this.buffer[i].version++;
            }
            for (i=0; i<this.scrollbuffer.length; ++i) {
                append = cols - this.cols;
                do {
                    this.scrollbuffer[i].cells.push(new TChar(''));
                } while (--append);
                this.scrollbuffer[i].version++;
            }
        }
        if (cursor.col >= cols)
            cursor.col = cols - 1;

        this.rows = rows;
        this.cols = cols;
    };

    /** minimal support for switching charsets (only basic drawing symbols supported) */
    // see http://www.vt100.net/charsets/technical.html for technical charset
    var CHARSET_0 = {
        '`': '◆', 'a': '▒', 'b': '␉', 'c': '␌', 'd': '␍',
        'e': '␊', 'f': '°', 'g': '±', 'h': '␤', 'i': '␋',
        'j': '┘', 'k': '┐', 'l': '┌', 'm': '└', 'n': '┼',
        'o': '⎺', 'p': '⎻', 'q': '─', 'r': '⎼', 's': '⎽',
        't': '├', 'u': '┤', 'v': '┴', 'w': '┬', 'x': '│',
        'y': '≤', 'z': '≥', '{': 'π', '|': '≠', '}': '£', '~': '°'
    };

    /** fix: box drawing bold */// FIXME: should this go into frontend?
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


    /**
     * The constructor creates a new terminal object with
     * `cols` width and `rows` height. The `scrollLength` parameter
     * is the max history length (number of lines) of the normal screen buffer.
     *
     * @classdesc AnsiTerminal - an offscreen xterm like terminal.
     *
     * The terminal implements the interface of node-ansiparser.
     * Since the parser calls the methods directly this terminal has
     * no direct input method. Use the parser's `parse(s)` method
     * instead (see documentation of the parser and the example below).
     *
     * The terminal has no direct screen representation beside
     * a `toString()` method for debug purposes.
     * Use the output methods of the TRow primitive to build a view
     * of the terminal content.
     *
     * Like xterm the terminal maintains 2 different screen buffers.
     * The normal screen has a scrolling history while the alternate
     * has none. Most simple programs operate on the normal
     * screen while more advanced command line programs (e.g. curses based)
     * use the alternate screen as a canvas. The current active
     * screen is always accessible via the `screen` attribute.
     * 
     * @param {number} cols - columns of the terminal.
     * @param {number} rows - rows of the terminal.
     * @param {number} scrollLength - lines of scrollbuffer.
     * @constructor module:node-ansiterminal.AnsiTerminal
     * @example
     * ```js
     * var AnsiTerminal = require('node-ansiterminal').AnsiTerminal;
     * var AnsiParser = require('node-ansiparser');
     * var terminal = new AnsiTerminal(80, 25, 500);
     * var parser = new AnsiParser(terminal);
     * parser.parse('\x1b[31mHello World!\x1b[0m');
     * console.log(terminal.toString());
     * ```
     */
    // TODO: move cursor abstraction to TScreen
    // TODO: implement terminal wide text attribute getter and setter (see TChar)
    function AnsiTerminal(cols, rows, scrollLength) {
        this.rows = rows;
        this.cols = cols;
        this.scrollLength = scrollLength | 0;
        this.send = function (s) {};                            // callback for writing back to stream
        this.beep = function (tone, duration) {};               // callback for sending console beep
        this.changedMouseHandling = function(mode, protocol){}; // announce changes in mouse handling

        this.reset();
    }

    /**
     * Hard reset of the terminal.
     *
     * @method module:node-ansiterminal.AnsiTerminal#reset
     */
    AnsiTerminal.prototype.reset = function () {
        this.normal_screen = new TScreen(this.cols, this.rows, this.scrollLength);
        this.alternate_screen = new TScreen(this.cols, this.rows, 0);
        this.screen = this.normal_screen;
        this.normal_cursor = {col: 0, row: 0};
        this.alternate_cursor = {col: 0, row: 0};
        this.cursor = this.normal_cursor;
        this.textattributes = 0;
        this.colors = 0;
        this.charattributes = 0;
        this.reverse_video = false;
        
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
        this.mouse_mode = 0;                    // tracking modes for mouse 0=off, (9, 1000, 1001, 1002, 1003)
        this.mouse_protocol = 0;                // 0 (normal), 1005 (utf-8), 1006 (sgr), 1015 (decimal)

        this.mouseDown = {1: false, 2:false, 3:false, 4:false};

        this._rem_c = '';                       // remainder of surrogates

        // new wrapping behavior
        this.wrap = false;
        this.row_wrap = false;

        // DCS stuff
        this.dcs_handler = null;
        this.dcs_handlers = {};

        // register standard DCS handlers
        this.registerDCSHandler(DCS_DECRQSS, '$', 'q');

        // character sets
        this.G0 = null;
        this.G1 = null;
        this.charset = this.G0;
        this.active_charset = 0;
    };

    /**
     * String representation of active terminal buffer.
     * @param opts
     * @return {string}
     * @method module:node-ansiterminal.AnsiTerminal#toString
     */
    AnsiTerminal.prototype.toString = function(opts) {
        var s = '';
        for (var i=0; i<this.screen.buffer.length; ++i) {
            s += this.screen.buffer[i].toString(opts);
            s += '\n';
        }
        return s;
    };

    /**
     * Resize terminal to cols x rows.
     *  
     * @param {number} cols     - new columns value
     * @param {number} rows     - new rows value
     * @method module:node-ansiterminal.AnsiTerminal#resize
     */
    AnsiTerminal.prototype.resize = function(cols, rows) {
        // skip insane values
        if ((cols < 2) || (rows < 2))
            return false;
        
        // normal scroll buffer
        this.normal_screen.resize(cols, rows, this.normal_cursor);
        
        // alternative buffer
        this.alternate_screen.resize(cols, rows, this.alternate_cursor);
        
        // set new rows / cols to terminal
        this.rows = rows;
        this.cols = cols;
        // FIXME: how to deal with scrolling area? - simply reset for now
        this.scrolling_top = 0;
        this.scrolling_bottom = this.rows;

        // if cursor got saved before we need to overwrite the saved values
        if (this.cursor_save)
            this.DECSC();
    };

    AnsiTerminal.prototype.registerDCSHandler = function(handler, collected, flag) {
        this.dcs_handlers[flag+collected] = handler;
    };
    AnsiTerminal.prototype.unregisterDCSHandler = function(handler) {
        for (var prop in this.dcs_handlers) {
            if (this.dcs_handlers.hasOwnProperty(prop) && this.dcs_handlers[prop] == handler) {
                delete this.dcs_handlers[prop];
                break;
            }
        }
    };


    /** 
     * Implementation of the parser instructions
     */

    /**
     * inst_p - handle printable characters
     *
     * The print implementation is aware of combining and surrogate characters and respects
     * half and full width print space according to unicode.
     *
     * @param {string} s
     * @method module:node-ansiterminal.AnsiTerminal#inst_p
     */
    AnsiTerminal.prototype.inst_p = function(s) {
        if (this.debug)
            console.log('inst_p', s);
        var c = '',
            code = 0,
            low = 0,
            width = 1;

        // add leftover surrogate high
        if (this._rem_c) {
            s = this._rem_c + s;
            this._rem_c = '';
        }

        for (var i=0; i< s.length; ++i) {
            c = s.charAt(i);
            code = s.charCodeAt(i);

            // surrogate high
            if (0xD800 <= code && code <= 0xDBFF) {
                low = s.charCodeAt(i+1);
                if (low !== low) {
                    this._rem_c = c;
                    return;
                }
                code = ((code - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
                c += s.charAt(i+1);
            }
            // surrogate low - already handled
            if (0xDC00 <= code && code <= 0xDFFF)
                continue;

            width = wcswidth(code);

            if (width==2 && (width + this.cursor.col) > this.cols) {
                if (this.autowrap)
                    this.wrap = true;
                else
                    continue;
            }

            if (this.wrap && width) {
                this.cursor.col = 0;
                this.cursor.row++;
                this.wrap = false;
            }
            if (this.cursor.row >= this.scrolling_bottom) {
                this.SU();
                this.cursor.row--;
            }
            this.screen.buffer[this.cursor.row].version++;

            if (!width && this.cursor.col) { // combining characters
                if (this.wrap) {
                    this.screen.buffer[this.cursor.row].cells[this.cursor.col].c += c;
                } else {
                    if (this.screen.buffer[this.cursor.row].cells[this.cursor.col - 1].width==0) {
                        if ((this.cursor.col - 2 >= 0)
                            && this.screen.buffer[this.cursor.row].cells[this.cursor.col - 2].width==2)
                            this.screen.buffer[this.cursor.row].cells[this.cursor.col - 2].c += c;
                    } else {
                        this.screen.buffer[this.cursor.row].cells[this.cursor.col - 1].c += c;
                    }
                }
            }
            else {
                c = (this.charset) ? (this.charset[c] || c) : c;
                this.last_char = c;
                if (this.insert_mode) {
                    this.screen.buffer[this.cursor.row].cells.pop();
                    this.screen.buffer[this.cursor.row].cells.splice(
                        this.cursor.col, 0, new TChar('', this.textattributes, this.colors));
                }
                this.screen.buffer[this.cursor.row].cells[this.cursor.col].c = c;
                this.screen.buffer[this.cursor.row].cells[this.cursor.col].attr = this.charattributes;
                this.screen.buffer[this.cursor.row].cells[this.cursor.col].gb = this.colors;
                this.screen.buffer[this.cursor.row].cells[this.cursor.col].width = width;

                // fix box drawing -- this is a really ugly problem - FIXME: goes into frontend
                if (c >= '\u2500' && c <= '\u2547') {
                    if (this.textattributes && (this.textattributes & 65536)) {
                        this.screen.buffer[this.cursor.row].cells[this.cursor.col].c = BOXSYMBOLS_BOLD[c] || c;
                        // unset bold here, but set intense instead if applicable
                        var attr = this.charattributes & ~65536;
                        if (attr & 67108864 && !(attr & 134217728) && (attr >>> 8 & 255) < 8)
                            attr |= 2048;
                        this.screen.buffer[this.cursor.row].cells[this.cursor.col].attr = attr;
                    }
                }

                this.cursor.col += 1;
            }

            if (width == 2) {
                if (this.insert_mode) {
                    this.screen.buffer[this.cursor.row].cells.pop();
                    this.screen.buffer[this.cursor.row].cells.splice(
                        this.cursor.col, 0, new TChar('', this.textattributes, this.colors));
                    if (this.screen.buffer[this.cursor.row].cells[this.cols-1].width == 2) {
                        this.screen.buffer[this.cursor.row].cells.pop();
                        this.screen.buffer[this.cursor.row].cells.push(
                            new TChar('', this.textattributes, this.colors)
                        );
                    }
                }
                this.screen.buffer[this.cursor.row].cells[this.cursor.col].width = 0;
                this.screen.buffer[this.cursor.row].cells[this.cursor.col].c = '';
                this.screen.buffer[this.cursor.row].cells[this.cursor.col].attr = this.charattributes;
                this.screen.buffer[this.cursor.row].cells[this.cursor.col].gb = this.colors;
                this.cursor.col += 1;
                if (this.cursor.col >= this.cols) {
                    this.cursor.col = this.cols - 2;
                    if (this.autowrap) {
                        this.wrap = true;
                    }
                }
            }


            if (this.cursor.col >= this.cols) {
                this.cursor.col = this.cols - 1;
                if (this.autowrap) {
                    this.wrap = true;
                }
            }
        }
    };

    /**
     * inst_o - handle OSC instruction
     * @param s
     * @method module:node-ansiterminal.AnsiTerminal#inst_o
     */
    AnsiTerminal.prototype.inst_o = function(s) {
        if (this.debug)
            console.log('inst_o', s);
        this.last_char = '';
        this._rem_c = '';
        this.wrap = false;
        if (s.charAt(0) == '0')
            this.title = s.slice(2);
        else
            console.log('inst_o unhandled:', s);
    };

    /**
     * inst_x - handle single character instruction
     * @param flag
     * @method module:node-ansiterminal.AnsiTerminal#inst_x
     */
    AnsiTerminal.prototype.inst_x = function (flag) {
        if (this.debug)
            console.log('inst_x', flag.charCodeAt(0), flag);
        this.last_char = '';
        this._rem_c = '';
        this.wrap = false;
        switch (flag) {
            case '\n':
                this.cursor.row++;
                if (this.cursor.row >= this.scrolling_bottom) {
                    this.SU();
                    this.cursor.row--;
                }
                if (this.newline_mode)
                    this.cursor.col = 0;
                if (this.cursor.col >= this.cols)
                    this.cursor.col--;
                break;
            case '\r':
                this.cursor.col = 0;
                break;
            case '\t':    this.CHT([0]); break;
            case '\x07':  this.beep(); break;
            case '\x08':
                if (this.cursor.col >= this.cols)
                    this.cursor.col = this.cols - 1;
                this.cursor.col -= 1;
                if (this.cursor.col < 0)
                    this.cursor.col = 0;
                break;
            case '\x0b':  this.inst_x('\n'); break;
            case '\x0c':  this.inst_x('\n'); break;
            case '\x0e':                                // activate G1
                this.charset = this.G1;
                this.active_charset = 1;
                break;
            case '\x0f':                                // activate G0
                this.charset = this.G0;
                this.active_charset = 0;
                break;
            case '\x11':  console.log('unhandled DC1 (XON)'); break;  // TODO
            case '\x12':  break;  // DC2
            case '\x13':  console.log('unhandled DC3 (XOFF)'); break; // TODO
            case '\x14':  break;  // DC4
            default:
                console.log('inst_x unhandled:', flag.charCodeAt(0));
        }
    };

    /**
     * inst_c - handle CSI instruction
     * @param collected
     * @param params
     * @param flag
     * @method module:node-ansiterminal.AnsiTerminal#inst_c
     */
    AnsiTerminal.prototype.inst_c = function(collected, params, flag) {
        if (this.debug)
            console.log('inst_c', collected, params, flag);
        if (flag != 'b')        // hack for getting REP working
            this.last_char = '';
        if (flag !== 'S' && flag !== 'T') { // FIXME: all but SD/SU reset wrap -> bug in xterm?
            this._rem_c = '';
            this.wrap = false;
        }
        switch (collected) {
            case '':
                switch (flag) {
                    case '@':  return this.ICH(params);
                    case 'E':  return this.CNL(params);
                    case 'F':  return this.CPL(params);
                    case 'G':  return this.CHA(params);
                    case 'D':  return this.CUB(params);
                    case 'B':  return this.CUD(params);
                    case 'C':  return this.CUF(params);
                    case 'A':  return this.CUU(params);
                    case 'I':  return this.CHT(params);
                    case 'Z':  return this.CBT(params);
                    case 'f':
                    case 'H':  return this.CUP(params);
                    case 'P':  return this.DCH(params);
                    case 'J':  return this.ED(params);
                    case 'K':  return this.EL(params);
                    case 'L':  return this.IL(params);
                    case 'M':  return this.DL(params);
                    case 'S':  return this.SU(params);
                    case 'T':  return this.SD(params);
                    case 'X':  return this.ECH(params);
                    case 'a':  return this.HPR(params);
                    case 'b':  return this.REP(params);
                    case 'e':  return this.VPR(params);
                    case 'd':  return this.VPA(params);
                    case 'c':  return this.send(TERM_STRING['CSI'] + '?64;1;2;6;9;15;18;21;22c');  // DA1 TODO: DA1 function
                    case 'h':  return this.high(collected, params);
                    case 'l':  return this.low(collected, params);
                    case 'm':  return this.SGR(params);
                    case 'n':  return this.DSR(collected, params);
                    case 'r':  return this.DECSTBM(params);
                    case 's':  return this.DECSC();
                    case 'u':  return this.DECRC();
                    case '`':  return this.HPA(params);
                    default :
                        console.log('inst_c unhandled:', collected, params, flag);
                }
                break;
            case '?':
                switch (flag) {
                    case 'J':  return this.ED(params);  // DECSED as normal ED
                    case 'K':  return this.EL(params);  // DECSEL as normal EL
                    case 'h':  return this.high(collected, params);
                    case 'l':  return this.low(collected, params);
                    case 'n':  return this.DSR(collected, params);
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
                    case 'p':  return this.DECSTR();
                    default :
                        console.log('inst_c unhandled:', collected, params, flag);
                }
                break;
            default :
                console.log('inst_c unhandled:', collected, params, flag);
        }
    };

    /**
     * inst_e - handle ESC instruction
     * @param collected
     * @param flag
     * @method module:node-ansiterminal.AnsiTerminal#inst_e
     */
    AnsiTerminal.prototype.inst_e = function(collected, flag) {
        if (this.debug)
            console.log('inst_e', collected, flag);
        this.last_char = '';
        this._rem_c = '';
        this.wrap = false;
        if (!collected) {
            switch (flag) {
                //case '6':  // Back Index (DECBI), VT420 and up - not supported
                case '7':  return this.DECSC();  // Save Cursor (DECSC)
                case '8':  return this.DECRC();  // Restore Cursor (DECRC)
                //case '9':  // Forward Index (DECFI), VT420 and up - not supported
                case 'D':  return this.IND();    // Index (IND is 0x84)
                case 'E':  return this.NEL();    // Next Line (NEL is 0x85)
                //case 'H':  //    ESC H   Tab Set (HTS is 0x88)  // TODO
                case 'M':  return this.RI();     // Reverse Index (RI is 0x8d)
                //case 'N':  // Single Shift Select of G2 Character Set ( SS2 is 0x8e) - not supported
                //case 'O':  // Single Shift Select of G3 Character Set ( SS3 is 0x8f) - not supported
                //case 'P':  // Device Control String (DCS is 0x90) - covered by parser
                //case 'V':  // Start of Guarded Area (SPA is 0x96) - not supported
                //case 'W':  // End of Guarded Area (EPA is 0x97) - not supported
                //case 'X':  // Start of String (SOS is 0x98) - covered by parser (unsupported)
                //case 'Z':  // Return Terminal ID (DECID is 0x9a). Obsolete form of CSI c (DA).  - not supported
                //case '[':  // Control Sequence Introducer (CSI is 0x9b) - covered by parser
                //case '\':  // String Terminator (ST is 0x9c) - covered by parser
                //case ']':  //	Operating System Command (OSC is 0x9d) - covered by parser
                //case '^':  //	Privacy Message (PM is 0x9e) - covered by parser (unsupported)
                //case '_':  //	Application Program Command (APC is 0x9f) - covered by parser (unsupported)
                //case '=':  // Application Keypad (DECKPAM)  // TODO
                //case '>':  // Normal Keypad (DECKPNM)  // TODO
                //case 'F':  // Cursor to lower left corner of screen  // TODO
                case 'c':  return this.reset();  // Full Reset (RIS) http://vt100.net/docs/vt220-rm/chapter4.html
                //case 'l':  // Memory Lock (per HP terminals). Locks memory above the cursor. - not supported
                //case 'm':  // Memory Unlock (per HP terminals). - not supported
                //case 'n':  // Invoke the G2 Character Set as GL (LS2). - not supported
                //case 'o':  // Invoke the G3 Character Set as GL (LS3). - not supported
                //case '|':  // Invoke the G3 Character Set as GR (LS3R). - not supported
                //case '}':  // Invoke the G2 Character Set as GR (LS2R). - not supported
                //case '~':  // Invoke the G1 Character Set as GR (LS1R). - not supported
                default :  console.log('inst_e unhandled:', collected, flag);
            }
        } else if (collected == ' ') {
            switch (flag) {
                //case 'F':  // (SP) 7-bit controls (S7C1T) - not supported
                //case 'G':  // (SP) 8-bit controls (S8C1T) - not supported
                //case 'L':  // (SP) Set ANSI conformance level 1 (dpANS X3.134.1) - not supported
                //case 'M':  // (SP) Set ANSI conformance level 2 (dpANS X3.134.1) - not supported
                //case 'N':  // (SP) Set ANSI conformance level 3 (dpANS X3.134.1) - not supported
                default :  console.log('inst_e unhandled:', collected, flag);
            }
        } else if (collected == '#') {
            switch (flag) {
                case '3':  return this.DECDHL(3);  // (#) DEC double-height line, top half (DECDHL)
                case '4':  return this.DECDHL(4);  // (#) DEC double-height line, bottom half (DECDHL)
                case '5':  return this.DECSWL();  // (#) DEC single-width line (DECSWL)
                case '6':  return this.DECDWL();  // (#) DEC double-width line (DECDWL)
                case '8':  return this.DECALN();  // (#) DEC Screen Alignment Test (DECALN)
                default :  console.log('inst_e unhandled:', collected, flag);
            }
        } else if (collected == '%') {
            switch (flag) {
                //case '@':  // (%) Select default character set. That is ISO 8859-1 (ISO 2022) - not supported
                //case 'G':  // (%) Select UTF-8 character set (ISO 2022) - not supported
                default :  this.charset = null;  // always reset charset
            }
        } else if (collected == '(') {
            switch (flag) {
                case '0':
                    this.G0 = CHARSET_0;
                    break;
                default:
                    this.G0 = null;
            }
            if (this.active_charset == 0)
                this.charset = this.G0;
        } else if (collected == ')') {
            switch (flag) {
                case '0':
                    this.G1 = CHARSET_0;
                    break;
                default:
                    this.G1 = null;
            }
            if (this.active_charset == 1)
                this.charset = this.G1;
        } else {
            console.log('inst_e unhandled:', collected, flag);
        }
    };

    /**
     * inst_H - enter DCS handler state
     * @param collected
     * @param params
     * @param flag
     * @method module:node-ansiterminal.AnsiTerminal#inst_H
     */
    AnsiTerminal.prototype.inst_H = function(collected, params, flag) {
        this.last_char = '';
        this._rem_c = '';
        this.wrap = false;
        var Handler = this.dcs_handlers[flag+collected];
        this.dcs_handler = (!Handler) ? DCS_Dummy() : Handler();
        this.dcs_handler.hook(this, collected, params, flag);
    };

    /**
     * inst_P - handle DCS data
     * @param data
     * @method module:node-ansiterminal.AnsiTerminal#inst_P
     */
    AnsiTerminal.prototype.inst_P = function(data) {
        this.last_char = '';
        this._rem_c = '';
        this.wrap = false;
        this.dcs_handler.feed(data);
    };

    /**
     * inst_U - leave DCS handler state
     * @method module:node-ansiterminal.AnsiTerminal#inst_U
     */
    AnsiTerminal.prototype.inst_U = function() {
        this.last_char = '';
        this._rem_c = '';
        this.wrap = false;
        this.dcs_handler.unhook();
        this.dcs_handler = null;
    };

    /**
     * functionality implementation
     * * 
     * cheatsheets:
     *  - http://www.inwap.com/pdp10/ansicode.txt
     *  - overview http://www.vt100.net/docs/vt510-rm/chapter4
     *  - http://paulbourke.net/dataformats/ascii/
     *  - mouse support: http://manpages.ubuntu.com/manpages/intrepid/man4/console_codes.4.html
     *  - sequences: http://docs2.attachmate.com/verastream/vhi/7.6sp1/en/index.jsp?
     *      topic=%2Fcom.attachmate.vhi.help%2Fhtml%2Freference%2Fcontrol_functions_sortbysequ.xhtml
     */

    /**
     * unhandled sequences: (mc - mouse support)
     * "inst_c unhandled:" "?" Array [ 2004 ] "h"   bracketed paste mode https://cirw.in/blog/bracketed-paste
     *
     */

    AnsiTerminal.prototype.DECDHL = function(param) {
        this.screen.buffer[this.cursor.row].doubled = param;
    };
    AnsiTerminal.prototype.DECDWL = function() {
        this.screen.buffer[this.cursor.row].doubled = 1;
    };
    AnsiTerminal.prototype.DECSWL = function() {
        this.screen.buffer[this.cursor.row].doubled = 0;
    };

    /**
     * DECALN - Screen Alignment Pattern
     * @see {@link http://www.vt100.net/docs/vt510-rm/DECALN}
     * @method module:node-ansiterminal.AnsiTerminal#DECALN
     */
    AnsiTerminal.prototype.DECALN = function() {
        this.scrolling_top = 0;
        this.scrolling_bottom = this.rows;
        for (var i=0; i < this.screen.buffer.length; ++i) {
            for (var j=0; j < this.screen.buffer[i].cells.length; ++j) {
                this.screen.buffer[i].cells[j] = new TChar('E');
            }
        }
        this.CUP([0, 0]);
    };

    /**
     * SD - Scroll Down (Pan Up) - CSI Pn T
     * Also SU moves scrolled out lines to scroll buffer, SD only adds new lines at the top.
     * @see {@link http://vt100.net/docs/vt510-rm/SD}
     * @param {Array} params - one numerical parameter (defaults to 1 even if 0 is given)
     * @method module:node-ansiterminal.AnsiTerminal#SD
     */
    AnsiTerminal.prototype.SD = function (params) {
        var lines = (params) ? (params[0] || 1) : 1;
        do {
            var row = new TRow(this.cols, new TChar('', this.textattributes, this.colors));
            this.screen.buffer.splice(this.scrolling_top, 0, row);
            this.screen.buffer.splice(this.scrolling_bottom, 1);
        } while (--lines);
    };

    /**
     * SU - Scroll Up (Pan Down) - CSI Pn S
     * Scrolled out lines go into the scroll buffer.
     * @see {@link http://vt100.net/docs/vt510-rm/SU}
     * @param {Array} params - one numerical parameter (defaults to 1 even if 0 is given)
     * @method module:node-ansiterminal.AnsiTerminal#SU
     */
    AnsiTerminal.prototype.SU = function (params) {
        var lines = (params) ? (params[0] || 1) : 1;
        do {
            var row = new TRow(this.cols, new TChar('', this.textattributes, this.colors));
            this.screen.buffer.splice(this.scrolling_bottom, 0, row);
            var scrolled_out = this.screen.buffer.splice(this.scrolling_top, 1)[0];
            if (!this.scrolling_top) {
                this.screen.appendToScrollBuffer(scrolled_out);
            }
        } while (--lines);

    };

    /**
     * REP - Repeat the preceding graphic character P s times (REP) - CSI Ps b
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#REP
     */
    // FIXME: hacky solution with this.last_char - needs unicode patch
    AnsiTerminal.prototype.REP = function (params) {
        var n = (params) ? (params[0] || 1) : 1;
        if (this.last_char) {
            var wrap = this.wrap;
            if (this.cursor.col == this.cols - 1)
                this.wrap = true;
            this.inst_p(Array(n+1).join(this.last_char));
            this.wrap = wrap;
            this.last_char = '';
        }
    };

    /**
     * NEL - Next Line - ESC E
     * @see {@link http://vt100.net/docs/vt510-rm/NEL}
     * @method module:node-ansiterminal.AnsiTerminal#NEL
     */
    AnsiTerminal.prototype.NEL = function () {
        this.IND();
        this.cursor.col = 0;
    };

    /**
     * IND - Index - ESC D
     * @see {@link http://vt100.net/docs/vt510-rm/IND}
     * @method module:node-ansiterminal.AnsiTerminal#IND
     */
    AnsiTerminal.prototype.IND = function () {
        this.cursor.row++;
        if (this.cursor.row >= this.scrolling_bottom) {
            this.SU();
            this.cursor.row--;
        }
    };

    /**
     * VPR - Vertical Position Relative - CSI Pn e
     * @see {@link http://vt100.net/docs/vt510-rm/VPR}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#VPR
     */
    AnsiTerminal.prototype.VPR = function (params) {
        this.cursor.row += ((params[0]) ? params[0] : 1);
        if (this.cursor.row >= this.rows)
            this.cursor.row = this.rows - 1;
    };

    /**
     * HPR - Horizontal Position Relative - CSI Pn a
     * @see {@link http://vt100.net/docs/vt510-rm/HPR}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#HPR
     */
    AnsiTerminal.prototype.HPR = function (params) {
        this.cursor.col += ((params[0]) ? params[0] : 1);
        if (this.cursor.col >= this.cols)
            this.cursor.col = this.cols - 1;
    };

    /**
     * HPA - Horizontal Position Absolute - CSI Pn '
     * @see {@link http://vt100.net/docs/vt510-rm/HPA}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#HPA
     */
    AnsiTerminal.prototype.HPA = function (params) {
        this.cursor.col = ((params[0]) ? params[0] : 1) - 1;
        if (this.cursor.col >= this.cols)
            this.cursor.col = this.cols - 1;
    };

    /**
     * CBT - Cursor Backward Tabulation - CSI Pn Z
     * @see {@link http://vt100.net/docs/vt510-rm/CBT}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#CBT
     */
    AnsiTerminal.prototype.CBT = function (params) {
        this.cursor.col = (Math.floor((this.cursor.col - 1) / this.tab_width) + 1 -
        ((params[0]) ? params[0] : 1)) * this.tab_width;
        if (this.cursor.col < 0)
            this.cursor.col = 0;
    };

    /**
     * CHT - Cursor Horizontal Forward Tabulation - CSI Pn I
     * @see {@link http://vt100.net/docs/vt510-rm/CHT}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#CHT
     */
    AnsiTerminal.prototype.CHT = function (params) {
        this.cursor.col = (Math.floor(this.cursor.col / this.tab_width) +
        ((params[0]) ? params[0] : 1)) * this.tab_width;
        if (this.cursor.col >= this.cols)
            this.cursor.col = this.cols - 1;
    };

    /**
     * CPL - Cursor Previous Line - CSI Pn F
     * @see {@link http://vt100.net/docs/vt510-rm/CPL}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#CPL
     */
    AnsiTerminal.prototype.CPL = function (params) {
        this.cursor.row -= (params[0]) ? params[0] : 1;
        if (this.cursor.row < 0)
            this.cursor.row = 0;
        this.cursor.col = 0;
    };

    /**
     * CNL - Cursor Next Line - CSI Pn E
     * @see {@link http://vt100.net/docs/vt510-rm/CNL}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#CNL
     */
    AnsiTerminal.prototype.CNL = function (params) {
        this.cursor.row += (params[0]) ? params[0] : 1;
        if (this.cursor.row >= this.rows)
            this.cursor.row = this.rows - 1;
        this.cursor.col = 0;
    };

    /**
     * DL - Delete Line - CSI Pn M
     * @see {@link http://vt100.net/docs/vt510-rm/DL}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#DL
     */
    AnsiTerminal.prototype.DL = function (params) {
        var lines = params[0] || 1;
        do {
            this.screen.buffer.splice(this.cursor.row, 1);
            var row = new TRow(this.cols, new TChar('', this.textattributes, this.colors));
            this.screen.buffer.splice(this.scrolling_bottom - 1, 0, row);
        } while (--lines);
        this.cursor.col = 0; // see http://vt100.net/docs/vt220-rm/chapter4.html
    };

    /**
     * ICH - Insert Character - CSI Pn @
     * @see {@link http://vt100.net/docs/vt510-rm/ICH}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#ICH
     */
    AnsiTerminal.prototype.ICH = function (params) {
        var chars = params[0] || 1;
        do {
            // FIXME ugly code - do splicing only once
            this.screen.buffer[this.cursor.row].cells.splice(
                this.cursor.col, 0, new TChar('', this.textattributes, this.colors));
            this.screen.buffer[this.cursor.row].cells.pop();
        } while (--chars);
    };

    /**
     * VPA - Vertical Line Position Absolute - CSI Pn d
     * @see {@link http://vt100.net/docs/vt510-rm/VPA}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#VPA
     */
    AnsiTerminal.prototype.VPA = function (params) {
        this.cursor.row = ((params[0]) ? params[0] : 1) - 1;
        if (this.cursor.row >= this.rows)
            this.cursor.row = this.rows - 1;
    };

    /**
     * ECH - Erase Character - CSI Pn X
     * @see {@link http://vt100.net/docs/vt510-rm/ECH}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#ECH
     */
    AnsiTerminal.prototype.ECH = function (params) {
        var erase = ((params[0]) ? params[0] : 1) + this.cursor.col;
        erase = (this.cols < erase) ? this.cols : erase;
        for (var i = this.cursor.col; i < erase; ++i) {
            this.screen.buffer[this.cursor.row].cells[i] = new TChar('', this.textattributes, this.colors);
        }
        this.screen.buffer[this.cursor.row].version++;
    };

    /**
     * IL - Insert Line - CSI Pn L
     * @see {@link http://vt100.net/docs/vt510-rm/IL}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#IL
     */
    AnsiTerminal.prototype.IL = function (params) {
        var lines = (params[0]) ? params[0] : 1;
        do {  // FIXME ugly code - less splice possible?
            var row = new TRow(this.cols, new TChar('', this.textattributes, this.colors));
            this.screen.buffer.splice(this.cursor.row, 0, row);
            this.screen.buffer.splice(this.scrolling_bottom, 1);
        } while (--lines);
        this.cursor.col = 0; // see http://vt100.net/docs/vt220-rm/chapter4.html
    };

    /**
     * DECSTBM - Set Top and Bottom Margins - CSI Pt ; Pb r
     * @see {@link http://vt100.net/docs/vt510-rm/DECSTBM}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#DECSTBM
     * @note currently broken
     */
    AnsiTerminal.prototype.DECSTBM = function (params) {
        var top = params[0] - 1 || 0;
        var bottom = params[1] || this.rows;
        top = (top < 0) ? 0 : ((top >= this.rows) ? (this.rows - 1) : top);
        bottom = (bottom > this.rows) ? (this.rows) : bottom;
        if (bottom > top) {
            this.scrolling_top = top;
            this.scrolling_bottom = bottom;
        }
        this.cursor.row = 0;
        this.cursor.col = 0;
    };

    /**
     * DECSTR - Soft Terminal Reset - CSI ! p
     * @see {@link http://vt100.net/docs/vt510-rm/DECSTR}
     * @method module:node-ansiterminal.AnsiTerminal#DECSTR
     */
    AnsiTerminal.prototype.DECSTR = function () {
        // DECTCEM      Text cursor enable          --> Cursor enabled.
        this.show_cursor = true;
        // IRM          Insert/replace              --> Replace mode.
        this.insert_mode = false;
        // DECOM        Origin                      --> Absolute (cursor origin at upper-left of screen.) TODO do we need this?
        this.CUP();  // at least move cursor home
        // DECAWM       Autowrap                    --> No autowrap. TODO: really to false?
        //this.autowrap = false;
        // DECNRCM      National replacement character set  --> Multinational set. - unsupported
        // KAM          Keyboard action             --> Unlocked. TODO
        // DECNKM       Numeric keypad              --> Numeric characters. TODO
        // DECCKM       Cursor keys                 --> Normal (arrow keys).
        this.cursor_key_mode = false;
        // DECSTBM      Set top and bottom margins  --> Top margin = 1; bottom margin = page length.
        this.DECSTBM([]);
        // G0, G1, G2, G3, GL, GR                   --> Default settings. - unsupported
        this.charset = null;  // reset at least to unicode
        // SGR          Select graphic rendition    --> Normal rendition.
        this.SGR([0]);
        // DECSCA       Select character attribute  --> Normal (erasable by DECSEL and DECSED). TODO do we need this?
        // DECSC        Save cursor state           --> Home position.
        this.DECSC();
        // DECAUPSS     Assign user preference supplemental set     --> Set selected in Set-Up. - unsupported
        // DECSASD      Select active status display    --> Main display. TODO do we need this?
        // DECKPM       Keyboard position mode      --> Character codes. TODO do we need this?
        // DECRLM       Cursor direction            --> Reset (Left-to-right), regardless of NVR setting. TODO
        // DECPCTERM    PC Term mode                --> Always reset. TODO do we need this?
        // TODO: do we need to reset LNM?
    };

    /**
     * RI - Reverse Index - ESC M
     * @method module:node-ansiterminal.AnsiTerminal#RI
     */
    AnsiTerminal.prototype.RI = function () {
        this.cursor.row -= 1;
        if (this.cursor.row < this.scrolling_top) {
            this.cursor.row = this.scrolling_top;
            var row = new TRow(this.cols, new TChar('', this.textattributes, this.colors));
            this.screen.buffer.splice(this.scrolling_top, 0, row);
            this.screen.buffer.splice(this.scrolling_bottom, 1);
        }
    };

    /**
     * DECSC - Save Cursor - ESC 7
     * @see {@link http://vt100.net/docs/vt510-rm/DECSC}
     * @method module:node-ansiterminal.AnsiTerminal#DECSC
     */
    AnsiTerminal.prototype.DECSC = function () {
        var save = {};
        save['cursor'] = {row: this.cursor.row, col: this.cursor.col};
        save['textattributes'] = this.textattributes;
        save['charattributes'] = this.charattributes;
        this.cursor_save = save;
        // FIXME: this.colors
    };

    /**
     * DECRC - Restore Cursor - ESC 8
     * @see {@link http://vt100.net/docs/vt510-rm/DECRC}
     * @method module:node-ansiterminal.AnsiTerminal#DECRC
     */
    AnsiTerminal.prototype.DECRC = function () {
        // FIXME: this.colors
        if (this.cursor_save) {
            // load data back
            this.cursor.col = this.cursor_save['cursor'].col;
            this.cursor.row = this.cursor_save['cursor'].row;
            this.textattributes = this.cursor_save['textattributes'];
            this.charattributes = this.cursor_save['charattributes'];
        } else {
            // see http://vt100.net/docs/vt510-rm/DECRC
            this.CUP();
            this.ED([2]);
            this.textattributes = 0;
            this.charattributes = 0;
        }
    };

    AnsiTerminal.prototype.high = function (collected, params) {
        // TODO: separate DEC and ANSI
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
                /* mouse handling
                 *  - 5 exclusive mouse modes:
                 *      9       X10 (press only)
                 *      1000    press and release events
                 *      1001    hilite mouse tracking (??)
                 *      1002    cell motion tracking (press, move on pressed, release)
                 *      1003    all (press, move, release)
                 *  - exclusive formatting:
                 *      1005    utf-8 mouse mode
                 *      1006    sgr mouse mode
                 *      1015    urxvt mouse mode (decimal)
                 *  - special focus event: 1004 (CSI I / CSI O)
                 * */
                case 9:
                case 1000:
                case 1001:
                case 1002:
                case 1003:
                    this.mouse_mode = params[i];
                    this.changedMouseHandling(this.mouse_mode, this.mouse_protocol);
                    break;
                //case 1004: // focusIn/Out events
                case 1005:
                case 1006:
                case 1015:
                    this.mouse_protocol = params[i];
                    this.changedMouseHandling(this.mouse_mode, this.mouse_protocol);
                    break;
                case 1049:                                          // alt buffer
                    this.screen = this.alternate_screen;
                    this.cursor = this.alternate_cursor;
                    break;
                default:
                    console.log('unhandled high', collected, params[i]);
            }
        }
    };

    AnsiTerminal.prototype.low = function (collected, params) {
        // TODO: separate DEC and ANSI
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
                case 9:
                case 1000:
                case 1001:
                case 1002:
                case 1003:
                    this.mouse_mode = 0;
                    this.changedMouseHandling(this.mouse_mode, this.mouse_protocol);
                    break;
                //case 1004: // focusIn/Out events
                case 1005:
                case 1006:
                case 1015:
                    this.mouse_protocol = 0;
                    this.changedMouseHandling(this.mouse_mode, this.mouse_protocol);
                    break;
                case 1049:
                    this.screen = this.normal_screen;
                    this.cursor = this.normal_cursor;
                    break;
                default:
                    console.log('unhandled low', collected, params[i]);
            }
        }
    };

    // device status reports - http://vt100.net/docs/vt510-rm/DSR
    // cursor position report - http://vt100.net/docs/vt510-rm/CPR
    // FIXME: split and rename to DSR and CPR
    AnsiTerminal.prototype.DSR = function (collected, params) {
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

    /**
     * CHA - Cursor Horizontal Absolute - CSI Pn G
     * @see {@link http://vt100.net/docs/vt510-rm/CHA}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#CHA
     */
    AnsiTerminal.prototype.CHA = function (params) {
        this.cursor.col = ((params) ? (params[0] || 1) : 1) - 1;
        if (this.cursor.col >= this.cols)
            this.cursor.col = this.cols - 1;
    };

    /**
     * CUB - Cursor Backward - CSI Pn D
     * @see {@link http://vt100.net/docs/vt510-rm/CUB}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#CUB
     */
    AnsiTerminal.prototype.CUB = function (params) {
        this.cursor.col -= (params) ? (params[0] || 1) : 1;
        if (this.cursor.col < 0)
            this.cursor.col = 0;
    };

    /**
     * CUD - Cursor Down - CSI Pn B
     * @see {@link http://vt100.net/docs/vt510-rm/CUD}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#CUD
     */
    AnsiTerminal.prototype.CUD = function (params) {
        this.cursor.row += (params) ? (params[0] || 1) : 1;
        if (this.cursor.row >= this.rows)
            this.cursor.row = this.rows - 1;
    };

    /**
     * CUD - Cursor Forward - CSI Pn C
     * @see {@link http://vt100.net/docs/vt510-rm/CUF}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#CUF
     */
    AnsiTerminal.prototype.CUF = function (params) {
        this.cursor.col += (params) ? (params[0] || 1) : 1;
        if (this.cursor.col >= this.cols)
            this.cursor.col = this.cols - 1;
    };

    /**
     * CUD - Cursor Up - CSI Pn A
     * @see {@link http://vt100.net/docs/vt510-rm/CUU}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#CUU
     */
    AnsiTerminal.prototype.CUU = function (params) {
        this.cursor.row -= (params) ? (params[0] || 1) : 1;
        if (this.cursor.row < 0)
            this.cursor.row = 0;
    };

    /**
     * CUP - Cursor Position - CSI Pl ; Pc H
     * @see {@link http://vt100.net/docs/vt510-rm/CUP}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#CUP
     */
    AnsiTerminal.prototype.CUP = function (params) {
        this.cursor.row = ((params) ? (params[0] || 1) : 1) - 1;
        if (this.cursor.row >= this.rows)
            this.cursor.row = this.rows - 1;
        this.cursor.col = ((params) ? (params[1] || 1) : 1) - 1;
        if (this.cursor.col >= this.cols)
            this.cursor.col = this.cols - 1;
    };

    /**
     * DCH - Delete Character - CSI Pn P
     * @see {@link http://vt100.net/docs/vt510-rm/DCH}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#DCH
     */
    AnsiTerminal.prototype.DCH = function (params) {
        var removed = this.screen.buffer[this.cursor.row].cells.splice(this.cursor.col,
            (params) ? (params[0] || 1) : 1);
        for (var i = 0; i < removed.length; ++i)
            this.screen.buffer[this.cursor.row].cells.push(new TChar('', this.textattributes, this.colors));
        this.screen.buffer[this.cursor.row].version++;
    };

    /**
     * ED - Erase in Display - CSI Ps J
     * @see {@link http://vt100.net/docs/vt510-rm/ED}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#ED
     */
    AnsiTerminal.prototype.ED = function (params) {
        var i, row;
        switch ((params) ? params[0] : 0) {
            case 0:
                // from cursor to end of display
                // remove to line end
                this.EL([0]);
                // clear lower lines
                for (i = this.cursor.row + 1; i < this.rows; ++i) {
                    row = new TRow(this.cols, new TChar('', this.textattributes, this.colors));
                    this.screen.buffer[i] = row;
                }
                break;
            case 1:
                // from top of display to cursor
                // clear upper lines
                for (i = 0; i < this.cursor.row; ++i) {
                    row = new TRow(this.cols, new TChar('', this.textattributes, this.colors));
                    this.screen.buffer[i] = row;
                }
                // clear line up to cursor
                this.EL([1]);
                break;
            case 2:
                // complete display
                for (i = 0; i < this.rows; ++i) {
                    row = new TRow(this.cols, new TChar('', this.textattributes, this.colors));
                    this.screen.buffer[i] = row;
                }
                break;
        }
    };

    /**
     * EL - Erase in Line - CSI Ps K
     * @see {@link http://vt100.net/docs/vt510-rm/EL}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#EL
     */
    AnsiTerminal.prototype.EL = function (params) {
        var i;
        switch ((params) ? params[0] : 0) {
            case 0:
                // cursor to end of line
                for (i = this.cursor.col; i < this.cols; ++i) {
                    this.screen.buffer[this.cursor.row].cells[i] =
                        new TChar('', this.textattributes, this.colors);
                }
                this.screen.buffer[this.cursor.row].version++;
                break;
            case 1:
                // beginning of line to cursor
                for (i = 0; i <= this.cursor.col; ++i) {
                    this.screen.buffer[this.cursor.row].cells[i] =
                        new TChar('', this.textattributes, this.colors);
                }
                this.screen.buffer[this.cursor.row].version++;
                break;
            case 2:
                // complete line
                for (i = 0; i < this.cols; ++i) {
                    this.screen.buffer[this.cursor.row].cells[i] =
                        new TChar('', this.textattributes, this.colors);
                }
                this.screen.buffer[this.cursor.row].version++;
                break;
        }
    };

    /**
     * SGR - Select Graphic Rendition - CSI Ps ; Ps ... m
     * @see {@link http://vt100.net/docs/vt510-rm/SGR}
     * @param params
     * @method module:node-ansiterminal.AnsiTerminal#SGR
     */
    AnsiTerminal.prototype.SGR = function (params) {
        // load global attributes and colors
        var attr = this.textattributes;
        var colors = this.colors;
        
        var ext_colors = 0;
        var RGB_mode = false;
        var counter = 0;
        
        // put reverse video mode in attributes
        // used in charattributes but not in global textattributes
        // to mimick xterm behavior
        if (this.reverse_video)
            attr |= 1048576;
        
        for (var i=0; i<params.length; ++i) {
            // special treatment for extended colors
            if (ext_colors) {
                // first run in ext_colors gives color mode
                // sets counter to determine max consumed params
                if (!counter) {
                    switch (params[i]) {
                        case 2:
                            RGB_mode = true;
                            counter = 3;        // eval up to 3 params
                            // fg set SET+RGB: |(1<<26)|(1<<27)
                            // bg set SET+RGB: |(1<<24)|(1<<25)
                            attr |= (ext_colors==38) ? 201326592 : 50331648;
                            break;
                        case 5:
                            RGB_mode = false;
                            counter = 1;        // eval only 1 param
                            // fg clear RGB, set SET: &~(1<<27)|(1<<26)
                            // bg clear RGB, set SET: &~(1<<25)|(1<<24)
                            attr = (ext_colors==38)
                                ? (attr & ~134217728) | 67108864
                                : (attr & ~33554432) | 16777216;
                            break;
                        default:
                            // unkown mode identifier, breaks ext_color mode
                            console.log('sgr unknown extended color mode:', ext_colors[1]);
                            ext_colors = 0;
                    }
                    continue;
                }
                if (RGB_mode) {
                    switch (counter) {
                        case 3:
                            // red
                            attr = (ext_colors == 38)
                                ? (attr & ~65280) | (params[i] << 8)
                                : (attr & ~255) | params[i];
                            break;
                        case 2:
                            // green
                            colors = (ext_colors == 38) 
                                ? (colors & ~4278190080) | (params[i] << 24)
                                : (colors & ~16711680) | (params[i] << 16);
                            break;
                        case 1:
                            // blue
                            colors = (ext_colors == 38)
                                ? (colors & ~65280) | (params[i] << 8)
                                : (colors & ~255) | params[i];
                    }
                } else {
                    // 256 color mode
                    // uses only lower bytes of attribute
                    attr = (ext_colors == 38)
                        ? (attr & ~65280) | (params[i] << 8)
                        : (attr & ~255) | params[i];
                }
                counter -= 1;
                if (!counter)
                    ext_colors = 0;
                continue;
            }
            switch (params[i]) {
                case 0:
                    attr = 0;
                    break;
                case 1:  attr |= 65536; break;    // bold on
                case 2:  break;  // not supported (faint)
                case 3:  attr |= 131072; break;   // italic on
                case 4:  attr |= 262144; break;   // underline on
                case 5:  attr |= 524288; break;   // blink on
                case 6:  attr |= 524288; break;   // only one blinking speed
                case 7:  attr |= 1048576; break;  // inverted on
                case 8:  attr |= 2097152; break;  // conceal on
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
                case 22:  attr &= ~65536; break;      // bold off
                case 23:  attr &= ~131072; break;     // italic off
                case 24:  attr &= ~262144; break;     // underline off
                case 25:  attr &= ~524288; break;     // blink off
                case 26:  break;  // reserved
                case 27:  attr &= ~1048576; break;    // inverted off
                case 28:  attr &= ~2097152; break;    // conceal off
                case 29:  break;  // not supported (not crossed out)
                case 30:
                case 31:
                case 32:
                case 33:
                case 34:
                case 35:
                case 36:
                case 37:
                    // clear fg RGB, nullify fg, set fg SET, color
                    // -134283009 = ~(1<<27) & ~(255<<8)
                    attr = (attr & -134283009) | 67108864 | (params[i]%10 << 8);
                    break;
                case 38:  ext_colors = 38; break;
                case 39:                                    // default foreground color
                    attr &= ~67108864;            // fg set to false (1<<26)
                    break;
                case 40:
                case 41:
                case 42:
                case 43:
                case 44:
                case 45:
                case 46:
                case 47:
                    // clear bg RGB, nullify bg, set bg SET, color
                    // -33554688 = ~(1<<25) & ~255
                    attr = (attr & -33554688) | 16777216 | params[i]%10;
                    break;
                case 48:  ext_colors = 48; break;
                case 49:                                    // default background color
                    attr &= ~16777216;            // bg set to false
                    break;
                case 90:
                case 91:
                case 92:
                case 93:
                case 94:
                case 95:
                case 96:
                case 97:
                    // same as 37 but with |8 in color
                    attr = (attr & -134283009) | 67108864 | (params[i]%10|8 << 8);
                    break;
                case 100:
                case 101:
                case 102:
                case 103:
                case 104:
                case 105:
                case 106:
                case 107:
                    // same as 47 but with |8 in color
                    attr = (attr & -33554688) | 16777216 | params[i]%10|8;
                    break;
                default:
                    console.log('sgr unknown:', params[i]);
            }
        }
        
        // apply new attributes
        // charattributes differs only in reverse mode
        // for now from textattributes
        this.charattributes = attr;
        
        // set reverse video and delete it from attributes
        this.reverse_video = !!(attr & 1048576);
        attr &= ~1048576;
        
        // set new global attributes
        this.textattributes = attr;
        this.colors = colors;
    };

    /**
     * default DCS handler
     */

    /**
     * DCS dummy handler
     */
    function DCS_Dummy() {
        return new (function() {
            this.hook = function (term, collected, params, flag) {
                console.log('inst_H unhandled:', collected, params, flag);
            };
            this.feed = function (data) {
                console.log('inst_P unhandled:', data);
            };
            this.unhook = function () {
            };
        })();
    }

    // http://www.vt100.net/docs/vt510-rm/DECRQSS.html
    /**
     * DECRQSS - Request Selection or Setting - DCS $ q D..D ST
     *
     * Difference to DEC specification - P1 for valid, P0 for invalid requests
     *
     * @see {@link http://www.vt100.net/docs/vt510-rm/DECRQSS.html}
     */
    function DCS_DECRQSS() {
        return new (function () {
            this.term = null;
            this.data = '';
            this.limit = 5;
            this.hook = function(term) {
                this.term = term;
                this.data = '';
            };
            this.feed = function(data) {
                if (this.data.length<this.limit)
                    this.data += data;
            };
            this.unhook = function() {
                switch (this.data) {
                    case '"q':                          // TODO: DECSCA
                        return this.term.send('');
                    case '"p':                          // TODO: DECSCL
                        return this.term.send('\x1bP1$r64;1"p\x1b\\');
                    case 'r':                           // DECSTBM
                        var t = this.term.scrolling_top + 1;
                        var b = this.term.scrolling_bottom + 1;
                        return this.term.send('\x1bP1$r' + t + ';' + b + 'r\x1b\\');
                    case 'm':                           // SGR
                        var s = '0';
                        if (this.term.textattributes)
                            s += ';' + _get_escape_string(0, this.term.textattributes,
                                                          0, this.term.colors);
                        return this.term.send('\x1bP1$r' + s + 'm\x1b\\');
                    default:                            // unrecognized command
                        this.term.send('\x1bP0$r\x1b\\');
                }
            };
        })();
    }

    var to_export = {
        wcswidth: wcswidth,
        TChar: TChar,
        TRow: TRow,
        TScreen: TScreen,
        AnsiTerminal: AnsiTerminal
    };

    /* istanbul ignore next */
    if (typeof module !== 'undefined' && typeof module['exports'] !== 'undefined') {
        module['exports'] = to_export;
    } else {
        if (typeof define === 'function' && define['amd']) {
            define([], function() {
                return to_export;
            });
        } else {
            window['ansiterminal'] = to_export;
        }
    }
})();