var AnsiParser = require('node-ansiparser');
var TChar = require('../dist/ansiterminal.js').TChar;
var TRow = require('../dist/ansiterminal.js').TRow;
var AnsiTerminal = require('../dist/ansiterminal.js').AnsiTerminal;
var TScreen = require('../dist/ansiterminal.js').TScreen;
var chai = require('chai');

var terminal = new AnsiTerminal(10, 15, 5);
var parser = new AnsiParser(terminal);

describe('serialisation', function() {
    var s = 'abcdefghij'.split('').join('\n');
    s += '\r\n';
    s += 'abcdefghij'.split('').join('\n');
    parser.parse(s);

    it('TChar serialize', function () {
        chai.expect(new TChar('#', 1, 2, 3).serialize()).eql(['#', 1, 2, 3]);
    });
    it('TChar deserialize', function () {
        chai.expect(TChar.deserialize(['#', 1, 2, 3]).equals(new TChar('#', 1, 2, 3))).eql(true);
    });
    it('TChar serialize - deserialize', function () {
        var tchar = new TChar('#', 1, 2, 3);
        chai.expect(TChar.deserialize(tchar.serialize())).eql(tchar);
    });

    it('TRow serialize', function () {
        var expect = [
            ['', 0, 0, 1], ['', 0, 0, 1], ['', 0, 0, 1], ['', 0, 0, 1], ['', 0, 0, 1],
            ['f', 0, 0, 1], ['', 0, 0, 1], ['', 0, 0, 1], ['', 0, 0, 1], ['', 0, 0, 1]
        ];
        chai.expect(terminal.screen.buffer[0].serialize()).eql(expect);
    });
    it('TRow deserialize', function () {
        var serialized = [
            ['', 0, 0, 1], ['', 0, 0, 1], ['', 0, 0, 1], ['', 0, 0, 1], ['', 0, 0, 1],
            ['f', 0, 0, 1], ['', 0, 0, 1], ['', 0, 0, 1], ['', 0, 0, 1], ['', 0, 0, 1]
        ];
        var row = TRow.deserialize(serialized);
        for (var i=0; i<row.cells.length; ++i)
            chai.expect(row.cells[i].equals(terminal.screen.buffer[0].cells[i])).eql(true);
    });
    it('TRow serialize - deserialize', function () {
        for (var j=0; j<10; ++j) {
            var row = TRow.deserialize(terminal.screen.buffer[j].serialize());
            for (var i = 0; i < row.cells.length; ++i)
                chai.expect(row.cells[i].equals(terminal.screen.buffer[j].cells[i])).eql(true);
        }
    });

    it('TScreen serialize - deserialize', function () {
        var i, j, row;
        var sb = TScreen.deserialize(terminal.screen.serialize());
        for (j=0; j<terminal.screen.buffer.length; ++j) {
            row = terminal.screen.buffer[j];
            for (i=0; i < row.cells.length; ++i)
                chai.expect(row.cells[i].equals(sb.buffer[j].cells[i])).eql(true);
        }
        for (j=0; j<terminal.screen.scrollbuffer.length; ++j) {
            row = terminal.screen.scrollbuffer[j];
            for (i=0; i < row.cells.length; ++i)
                chai.expect(row.cells[i].equals(sb.scrollbuffer[j].cells[i])).eql(true);
        }
        chai.expect(terminal.screen.serialize()).eql(sb.serialize());
    });
});