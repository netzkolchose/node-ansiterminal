var AnsiParser = require('node-ansiparser');
var AnsiTerminal = require('../dist/ansiterminal.js').AnsiTerminal;
var chai = require('chai');

var COLS = 80;
var ROWS = 25;

var terminal = new AnsiTerminal(COLS, ROWS);
var parser = new AnsiParser(terminal);

describe('unicode - surrogates', function() {
    it('2 characters per cell', function () {
        parser.reset();
        terminal.reset();
        var high = '\uD800';
        for (var i=0xDC00; i<=0xDCFF; ++i) {
            parser.parse(high+String.fromCharCode(i));
            var tchar = terminal.screen.buffer[0].cells[0];
            chai.expect(tchar.c).eql(high+String.fromCharCode(i));
            chai.expect(tchar.c.length).eql(2);
            chai.expect(tchar.width).eql(1);
            chai.expect(terminal.screen.buffer[0].cells[1].c).eql('');
            parser.reset();
            terminal.reset();
        }
    });
    it('2 characters at last cell', function () {
        parser.reset();
        terminal.reset();
        var high = '\uD800';
        for (var i=0xDC00; i<=0xDCFF; ++i) {
            terminal.cursor.col = 79;
            parser.parse(high+String.fromCharCode(i));
            chai.expect(terminal.screen.buffer[0].cells[79].c).eql(high+String.fromCharCode(i));
            chai.expect(terminal.screen.buffer[0].cells[79].c.length).eql(2);
            chai.expect(terminal.screen.buffer[1].cells[0].c).eql('');
            parser.reset();
            terminal.reset();
        }
    });
    it('2 characters per cell over line end with autowrap', function () {
        parser.reset();
        terminal.reset();
        var high = '\uD800';
        for (var i=0xDC00; i<=0xDCFF; ++i) {
            terminal.cursor.col = 79;
            terminal.autowrap = true;
            parser.parse('a'+high+String.fromCharCode(i));
            chai.expect(terminal.screen.buffer[1].cells[0].c).eql(high+String.fromCharCode(i));
            chai.expect(terminal.screen.buffer[1].cells[0].c.length).eql(2);
            chai.expect(terminal.screen.buffer[1].cells[1].c).eql('');
            parser.reset();
            terminal.reset();
        }
    });
    it('2 characters per cell over line end without autowrap', function () {
        parser.reset();
        terminal.reset();
        var high = '\uD800';
        for (var i=0xDC00; i<=0xDCFF; ++i) {
            terminal.cursor.col = 79;
            terminal.autowrap = false;
            parser.parse('a'+high+String.fromCharCode(i));
            chai.expect(terminal.screen.buffer[0].cells[79].c).eql(high+String.fromCharCode(i));
            chai.expect(terminal.screen.buffer[0].cells[79].c.length).eql(2);
            chai.expect(terminal.screen.buffer[1].cells[0].c).eql('');
            parser.reset();
            terminal.reset();
        }
    });
    it('splitted surrogates', function () {
        parser.reset();
        terminal.reset();
        var high = '\uD800';
        for (var i=0xDC00; i<=0xDCFF; ++i) {
            parser.parse(high);
            parser.parse(String.fromCharCode(i));
            var tchar = terminal.screen.buffer[0].cells[0];
            chai.expect(tchar.c).eql(high+String.fromCharCode(i));
            chai.expect(tchar.c.length).eql(2);
            chai.expect(tchar.width).eql(1);
            chai.expect(terminal.screen.buffer[0].cells[1].c).eql('');
            parser.reset();
            terminal.reset();
        }
    });
});

describe('unicode - combining characters', function() {
    it('café', function () {
        parser.reset();
        terminal.reset();
        parser.parse('cafe\u0301');
        chai.expect(terminal.screen.buffer[0].cells[3].c).eql('e\u0301');
        chai.expect(terminal.screen.buffer[0].cells[3].c.length).eql(2);
        chai.expect(terminal.screen.buffer[0].cells[3].width).eql(1);
        parser.reset();
        terminal.reset();
    });
    it('café - end of line', function () {
        parser.reset();
        terminal.reset();
        terminal.cursor.col = 76;
        parser.parse('cafe\u0301');
        chai.expect(terminal.screen.buffer[0].cells[79].c).eql('e\u0301');
        chai.expect(terminal.screen.buffer[0].cells[79].c.length).eql(2);
        chai.expect(terminal.screen.buffer[0].cells[79].width).eql(1);
        chai.expect(terminal.screen.buffer[1].cells[0].c).eql('');
        chai.expect(terminal.screen.buffer[1].cells[0].c.length).eql(0);
        chai.expect(terminal.screen.buffer[1].cells[0].width).eql(1);
        parser.reset();
        terminal.reset();
    });
    it('multiple combined é', function () {
        parser.reset();
        terminal.reset();
        parser.parse(Array(100).join('e\u0301'));
        for (var i=0; i<80; ++i) {
            var tchar = terminal.screen.buffer[0].cells[i];
            chai.expect(tchar.c).eql('e\u0301');
            chai.expect(tchar.c.length).eql(2);
            chai.expect(tchar.width).eql(1);
        }
        tchar = terminal.screen.buffer[1].cells[0];
        chai.expect(tchar.c).eql('e\u0301');
        chai.expect(tchar.c.length).eql(2);
        chai.expect(tchar.width).eql(1);
        parser.reset();
        terminal.reset();
    });
    it('multiple surrogate with combined', function () {
        parser.reset();
        terminal.reset();
        parser.parse(Array(100).join('\uD800\uDC00\u0301'));
        for (var i=0; i<80; ++i) {
            var tchar = terminal.screen.buffer[0].cells[i];
            chai.expect(tchar.c).eql('\uD800\uDC00\u0301');
            chai.expect(tchar.c.length).eql(3);
            chai.expect(tchar.width).eql(1);
        }
        tchar = terminal.screen.buffer[1].cells[0];
        chai.expect(tchar.c).eql('\uD800\uDC00\u0301');
        chai.expect(tchar.c.length).eql(3);
        chai.expect(tchar.width).eql(1);
        parser.reset();
        terminal.reset();
    });
});

describe('unicode - fullwidth characters', function() {
    it('cursor movement even', function () {
        parser.reset();
        terminal.reset();
        chai.expect(terminal.cursor.col).eql(0);
        parser.parse('￥');
        chai.expect(terminal.cursor.col).eql(2);
    });
    it('cursor movement odd', function () {
        parser.reset();
        terminal.reset();
        terminal.cursor.col = 1;
        parser.parse('￥');
        chai.expect(terminal.cursor.col).eql(3);
    });
    it('line of ￥ even', function () {
        parser.reset();
        terminal.reset();
        parser.parse(Array(50).join('￥'));
        for (var i=0; i<80; ++i) {
            var tchar = terminal.screen.buffer[0].cells[i];
            if (i % 2) {
                chai.expect(tchar.c).eql('');
                chai.expect(tchar.c.length).eql(0);
                chai.expect(tchar.width).eql(0);
            } else {
                chai.expect(tchar.c).eql('￥');
                chai.expect(tchar.c.length).eql(1);
                chai.expect(tchar.width).eql(2);
            }
        }
        tchar = terminal.screen.buffer[1].cells[0];
        chai.expect(tchar.c).eql('￥');
        chai.expect(tchar.c.length).eql(1);
        chai.expect(tchar.width).eql(2);
        parser.reset();
        terminal.reset();
    });
    it('line of ￥ odd', function () {
        parser.reset();
        terminal.reset();
        terminal.cursor.col = 1;
        parser.parse(Array(50).join('￥'));
        for (var i=1; i<79; ++i) {
            var tchar = terminal.screen.buffer[0].cells[i];
            if (!(i % 2)) {
                chai.expect(tchar.c).eql('');
                chai.expect(tchar.c.length).eql(0);
                chai.expect(tchar.width).eql(0);
            } else {
                chai.expect(tchar.c).eql('￥');
                chai.expect(tchar.c.length).eql(1);
                chai.expect(tchar.width).eql(2);
            }
        }
        tchar = terminal.screen.buffer[1].cells[79];
        chai.expect(tchar.c).eql('');
        chai.expect(tchar.c.length).eql(0);
        chai.expect(tchar.width).eql(1);
        tchar = terminal.screen.buffer[1].cells[0];
        chai.expect(tchar.c).eql('￥');
        chai.expect(tchar.c.length).eql(1);
        chai.expect(tchar.width).eql(2);
        parser.reset();
        terminal.reset();
    });
    it('line of ￥ with combining odd', function () {
        parser.reset();
        terminal.reset();
        terminal.cursor.col = 1;
        parser.parse(Array(50).join('￥\u0301'));
        for (var i=1; i<79; ++i) {
            var tchar = terminal.screen.buffer[0].cells[i];
            if (!(i % 2)) {
                chai.expect(tchar.c).eql('');
                chai.expect(tchar.c.length).eql(0);
                chai.expect(tchar.width).eql(0);
            } else {
                chai.expect(tchar.c).eql('￥\u0301');
                chai.expect(tchar.c.length).eql(2);
                chai.expect(tchar.width).eql(2);
            }
        }
        tchar = terminal.screen.buffer[1].cells[79];
        chai.expect(tchar.c).eql('');
        chai.expect(tchar.c.length).eql(0);
        chai.expect(tchar.width).eql(1);
        tchar = terminal.screen.buffer[1].cells[0];
        chai.expect(tchar.c).eql('￥\u0301');
        chai.expect(tchar.c.length).eql(2);
        chai.expect(tchar.width).eql(2);
        parser.reset();
        terminal.reset();
    });
    it('line of ￥ with combining even', function () {
        parser.reset();
        terminal.reset();
        parser.parse(Array(50).join('￥\u0301'));
        for (var i=0; i<80; ++i) {
            var tchar = terminal.screen.buffer[0].cells[i];
            if (i % 2) {
                chai.expect(tchar.c).eql('');
                chai.expect(tchar.c.length).eql(0);
                chai.expect(tchar.width).eql(0);
            } else {
                chai.expect(tchar.c).eql('￥\u0301');
                chai.expect(tchar.c.length).eql(2);
                chai.expect(tchar.width).eql(2);
            }
        }
        tchar = terminal.screen.buffer[1].cells[0];
        chai.expect(tchar.c).eql('￥\u0301');
        chai.expect(tchar.c.length).eql(2);
        chai.expect(tchar.width).eql(2);
        parser.reset();
        terminal.reset();
    });
    it('line of surrogate fullwidth with combining odd', function () {
        parser.reset();
        terminal.reset();
        terminal.cursor.col = 1;
        parser.parse(Array(50).join('\ud843\ude6d\u0301'));
        for (var i=1; i<79; ++i) {
            var tchar = terminal.screen.buffer[0].cells[i];
            if (!(i % 2)) {
                chai.expect(tchar.c).eql('');
                chai.expect(tchar.c.length).eql(0);
                chai.expect(tchar.width).eql(0);
            } else {
                chai.expect(tchar.c).eql('\ud843\ude6d\u0301');
                chai.expect(tchar.c.length).eql(3);
                chai.expect(tchar.width).eql(2);
            }
        }
        tchar = terminal.screen.buffer[1].cells[79];
        chai.expect(tchar.c).eql('');
        chai.expect(tchar.c.length).eql(0);
        chai.expect(tchar.width).eql(1);
        tchar = terminal.screen.buffer[1].cells[0];
        chai.expect(tchar.c).eql('\ud843\ude6d\u0301');
        chai.expect(tchar.c.length).eql(3);
        chai.expect(tchar.width).eql(2);
        parser.reset();
        terminal.reset();
    });
    it('line of surrogate fullwidth with combining even', function () {
        parser.reset();
        terminal.reset();
        parser.parse(Array(50).join('\ud843\ude6d\u0301'));
        for (var i=0; i<80; ++i) {
            var tchar = terminal.screen.buffer[0].cells[i];
            if (i % 2) {
                chai.expect(tchar.c).eql('');
                chai.expect(tchar.c.length).eql(0);
                chai.expect(tchar.width).eql(0);
            } else {
                chai.expect(tchar.c).eql('\ud843\ude6d\u0301');
                chai.expect(tchar.c.length).eql(3);
                chai.expect(tchar.width).eql(2);
            }
        }
        tchar = terminal.screen.buffer[1].cells[0];
        chai.expect(tchar.c).eql('\ud843\ude6d\u0301');
        chai.expect(tchar.c.length).eql(3);
        chai.expect(tchar.width).eql(2);
        parser.reset();
        terminal.reset();
    });
});