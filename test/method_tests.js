var AnsiParser = require('node-ansiparser');
var AnsiTerminal = require('../dist/ansiterminal.js').AnsiTerminal;
var chai = require('chai');

var COLS = 80;
var ROWS = 25;

var terminal = new AnsiTerminal(COLS, ROWS, 100);
var parser = new AnsiParser(terminal);

describe('stub terminal tests (no real tests)', function() {
    it('not supported SGR', function () {
        terminal.reset();
        parser.reset();
        parser.parse('\x1b[2;9;10;11;12;13;14;15;16;17;18;19;20;21;26;29m');
        chai.expect(terminal.charattributes).eql(0);
    });
    it('not supported single flags', function () {
        terminal.reset();
        parser.reset();
        parser.parse('\x11\x12\x13\x14');
    });
    it('G1 charset', function () {
        terminal.reset();
        parser.reset();
        parser.parse('\x1b[1m\x0fqqq\x0eqqq');
    });
    it('OSC', function () {
        terminal.reset();
        parser.reset();
        parser.parse('\x1b]0;test\x07\x1b]87;test\x07');
    });
});
describe('resize', function() {
    var test_string = '12345678901234567890'.split('').map(function(el){return el+'abcdefghijklmnopqrs';}).join('');
    it('shrink col', function () {
        var t = new AnsiTerminal(20, 10, 20);
        var p = new AnsiParser(t);
        p.parse(test_string);
        t.resize(10, 10);
        chai.expect(t.screen.scrollbuffer.length).eql(10);
        chai.expect(t.screen.buffer.length).eql(10);
        for (var i=0; i< t.screen.buffer.length; ++i) {
            chai.expect(t.screen.buffer[i].cells.length).eql(10);
        }
    });
    it('enlarge col', function () {
        var t = new AnsiTerminal(20, 10, 20);
        var p = new AnsiParser(t);
        p.parse(test_string);
        t.resize(30, 10);
        chai.expect(t.screen.scrollbuffer.length).eql(10);
        chai.expect(t.screen.buffer.length).eql(10);
        for (var i=0; i< t.screen.buffer.length; ++i) {
            chai.expect(t.screen.buffer[i].cells.length).eql(30);
        }
    });
    it('shrink row', function () {
        var t = new AnsiTerminal(20, 10, 20);
        var p = new AnsiParser(t);
        p.parse(test_string);
        t.resize(20, 5);
        chai.expect(t.screen.scrollbuffer.length).eql(15);
        chai.expect(t.screen.buffer.length).eql(5);
        for (var i=0; i< t.screen.buffer.length; ++i) {
            chai.expect(t.screen.buffer[i].cells.length).eql(20);
        }
    });
    it('enlarge row', function () {
        var t = new AnsiTerminal(20, 10, 20);
        var p = new AnsiParser(t);
        p.parse(test_string);
        t.resize(20, 15);
        chai.expect(t.screen.scrollbuffer.length).eql(5);
        chai.expect(t.screen.buffer.length).eql(15);
        for (var i=0; i< t.screen.buffer.length; ++i) {
            chai.expect(t.screen.buffer[i].cells.length).eql(20);
        }
    });
});

describe('methods and simple escape sequences', function() {
    it('DECALN - Screen Alignment Pattern - ESC # 8', function () {
        parser.reset();
        terminal.reset();
        parser.parse('some random string');
        terminal.DECALN();
        chai.expect(terminal.toString()).eql(Array(26).join(Array(81).join('E')+'\n'));
        chai.expect(terminal.cursor.col).eql(0);
        chai.expect(terminal.cursor.row).eql(0);
        parser.reset();
        terminal.reset();
        parser.parse('some random string');
        parser.parse('\x1b#8');
        chai.expect(terminal.toString()).eql(Array(26).join(Array(81).join('E')+'\n'));
        chai.expect(terminal.cursor.col).eql(0);
        chai.expect(terminal.cursor.row).eql(0);
    });
    it('SU - Scroll Up (Pan Down) - CSI Ps S', function () {
        parser.reset();
        terminal.reset();
        parser.parse('1234567890abcdefghijklmnopqrstuvwxyz'.split('').join('\r\n'));
        chai.expect(terminal.toString()).eql('bcdefghijklmnopqrstuvwxyz'.split('').join('\n')+'\n');
        terminal.SU();  // defaults to 1 even with 0
        chai.expect(terminal.toString()).eql('cdefghijklmnopqrstuvwxyz'.split('').join('\n')+'\n\n');
        chai.expect(terminal.screen.scrollbuffer.length).eql(12);
        chai.expect(terminal.screen.scrollbuffer[11].cells[0].c).eql('b');
        terminal.SU([4]);
        chai.expect(terminal.toString()).eql('ghijklmnopqrstuvwxyz'.split('').join('\n')+'\n\n\n\n\n\n');
        chai.expect(terminal.screen.scrollbuffer.length).eql(16);
        chai.expect(terminal.screen.scrollbuffer[15].cells[0].c).eql('f');
        parser.parse('\x1b[S');
        chai.expect(terminal.toString()).eql('hijklmnopqrstuvwxyz'.split('').join('\n')+'\n\n\n\n\n\n\n');
        chai.expect(terminal.screen.scrollbuffer.length).eql(17);
        chai.expect(terminal.screen.scrollbuffer[16].cells[0].c).eql('g');
        parser.parse('\x1b[0S');
        chai.expect(terminal.toString()).eql('ijklmnopqrstuvwxyz'.split('').join('\n')+'\n\n\n\n\n\n\n\n');
        chai.expect(terminal.screen.scrollbuffer.length).eql(18);
        chai.expect(terminal.screen.scrollbuffer[17].cells[0].c).eql('h');
        parser.parse('\x1b[1S');
        chai.expect(terminal.toString()).eql('jklmnopqrstuvwxyz'.split('').join('\n')+'\n\n\n\n\n\n\n\n\n');
        chai.expect(terminal.screen.scrollbuffer.length).eql(19);
        chai.expect(terminal.screen.scrollbuffer[18].cells[0].c).eql('i');
        parser.parse('\x1b[2S');
        chai.expect(terminal.toString()).eql('lmnopqrstuvwxyz'.split('').join('\n')+'\n\n\n\n\n\n\n\n\n\n\n');
        chai.expect(terminal.screen.scrollbuffer.length).eql(21);
        chai.expect(terminal.screen.scrollbuffer[20].cells[0].c).eql('k');
    });
    it('SD - Scroll Down (Pan Up) - CSI Ps T', function () {
        parser.reset();
        terminal.reset();
        parser.parse('1234567890abcdefghijklmnopqrstuvwxyz'.split('').join('\r\n'));
        chai.expect(terminal.toString()).eql('bcdefghijklmnopqrstuvwxyz'.split('').join('\n')+'\n');
        terminal.SD();  // defaults to 1 even with 0
        chai.expect(terminal.toString()).eql('\n'+'bcdefghijklmnopqrstuvwxy'.split('').join('\n')+'\n');
        terminal.SD([0]);
        chai.expect(terminal.toString()).eql('\n\n'+'bcdefghijklmnopqrstuvwx'.split('').join('\n')+'\n');
        terminal.SD([5]);
        chai.expect(terminal.toString()).eql('\n\n\n\n\n\n\n'+'bcdefghijklmnopqrs'.split('').join('\n')+'\n');
        parser.parse('\x1b[T');
        chai.expect(terminal.toString()).eql('\n\n\n\n\n\n\n\n'+'bcdefghijklmnopqr'.split('').join('\n')+'\n');
        parser.parse('\x1b[0T');
        chai.expect(terminal.toString()).eql('\n\n\n\n\n\n\n\n\n'+'bcdefghijklmnopq'.split('').join('\n')+'\n');
        parser.parse('\x1b[2T');
        chai.expect(terminal.toString()).eql('\n\n\n\n\n\n\n\n\n\n\n'+'bcdefghijklmno'.split('').join('\n')+'\n');
    });
    it('REP - Repeat preceding graphic character - CSI Ps b', function () {
        parser.reset();
        terminal.reset();
        parser.parse('a');
        terminal.REP();
        chai.expect(terminal.toString()).eql('aa'+Array(26).join('\n'));
        parser.reset();
        terminal.reset();
        parser.parse('a');
        terminal.REP([2]);
        chai.expect(terminal.toString()).eql('aaa'+Array(26).join('\n'));
        parser.reset();
        terminal.reset();
        parser.parse('a\x1b[b');
        chai.expect(terminal.toString()).eql('aa'+Array(26).join('\n'));
        parser.reset();
        terminal.reset();
        parser.parse('a\x1b[2b');
        chai.expect(terminal.toString()).eql('aaa'+Array(26).join('\n'));
    });
    it('IND - Index - ESC D', function () {
        parser.reset();
        terminal.reset();
        terminal.cursor.col = 12;
        terminal.cursor.row = 10;
        terminal.IND();
        chai.expect(terminal.cursor.row).eql(11);
        terminal.cursor.row = 24;
        terminal.IND();
        chai.expect(terminal.cursor.row).eql(24);
        terminal.cursor.row = 10;
        parser.parse('\x1bD');
        chai.expect(terminal.cursor.row).eql(11);
        terminal.cursor.row = 24;
        parser.parse('\x1bD');
        chai.expect(terminal.cursor.row).eql(24);
        chai.expect(terminal.cursor.col).eql(12);
    });
    it('NEL - Next Line - ESC E', function () {
        parser.reset();
        terminal.reset();
        terminal.cursor.col = 12;
        terminal.cursor.row = 10;
        terminal.NEL();
        chai.expect(terminal.cursor.row).eql(11);
        chai.expect(terminal.cursor.col).eql(0);
        terminal.cursor.col = 12;
        terminal.cursor.row = 24;
        terminal.NEL();
        chai.expect(terminal.cursor.row).eql(24);
        chai.expect(terminal.cursor.col).eql(0);
        terminal.cursor.col = 12;
        terminal.cursor.row = 10;
        parser.parse('\x1bE');
        chai.expect(terminal.cursor.row).eql(11);
        chai.expect(terminal.cursor.col).eql(0);
        terminal.cursor.col = 12;
        terminal.cursor.row = 24;
        parser.parse('\x1bE');
        chai.expect(terminal.cursor.row).eql(24);
        chai.expect(terminal.cursor.col).eql(0);
    });
});