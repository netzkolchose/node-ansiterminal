var AnsiParser = require('node-ansiparser');
var TChar = require('../dist/ansiterminal.js').TChar;
var TRow = require('../dist/ansiterminal.js').TRow;
var AnsiTerminal = require('../dist/ansiterminal.js').AnsiTerminal;
var chai = require('chai');

var COLS = 80;
var ROWS = 25;

var terminal = new AnsiTerminal(COLS, ROWS, 100);
var parser = new AnsiParser(terminal);

describe('TRow', function() {
    var test1 = '\x1b[31mHello\x1b[1;48;2;128;50;0mWorld!\x1b[0m#normal#';
    var test2 = '\x1b[7;31mHello\x1b[7;1;48;2;128;50;0mWorld!\x1b[0m#normal#';
    var test3 = '\x1b[3;4;5;8;38;5;45m#\x1b[0;48;5;244m#';
    var test4 = '\x1b[7m#';
    var test5 = '\x1b[1;3;4;5;7;8;31;39m#\x1b[22;23;24;25;27;28m#';
    var test6 = '\x1b[31;41;3m#\x1b[39;49m#';
    var test7 = '\x1b[38;2;1;2;3;48;2;3;2;1m#\x1b[0m#';
    it('toMergedArray test1', function () {
        var expected = [
            new TChar('Hello', 67109120, 0, 5),
            new TChar('World!', 117506432, 3276800, 6),
            new TChar('#normal#', 0, 3276800, 8)  // color values hang over
        ];
        terminal.reset();
        parser.reset();
        parser.parse(test1);
        chai.expect(terminal.screen.buffer[0].toMergedArray({rtrim:true})).eql(expected);
    });
    it('toJSON test1', function () {
        var expected = [
            {
                string: 'Hello',
                width: 5,
                attributes: {
                    bold: false, italic: false, underline: false,
                    blink: false, inverse: false, conceal: false,
                    foreground: {mode: '256', color: 1},
                    background: false
                }
            },
            {
                string: 'World!',
                width: 6,
                attributes: {
                    bold: true, italic: false, underline: false,
                    blink: false, inverse: false, conceal: false,
                    foreground: {mode: '256', color: 1},
                    background: {mode: 'RGB', color: {r: 128, g: 50, b: 0}}
                }
            },
            {
                string: '#normal#',
                width: 8,
                attributes: {
                    bold: false, italic: false, underline: false,
                    blink: false, inverse: false, conceal: false,
                    foreground: false,
                    background: false
                }
            }
        ];
        terminal.reset();
        parser.reset();
        parser.parse(test1);
        chai.expect(terminal.screen.buffer[0].toJSON({rtrim:true})).eql(expected);
    });
    it('toEscapeString test1', function () {
        terminal.reset();
        parser.reset();
        parser.parse(test1);
        var expected = 'CSI[0mCSI[38;5;1mHelloCSI[1;38;5;9;48;2;128;50;0mWorld!CSI[0m#normal#';
        chai.expect(terminal.screen.buffer[0].toEscapeString({rtrim:true}).replace(/\x1b/g, 'CSI')).eql(expected);
    });
    it('toEscapeString test4', function () {
        terminal.reset();
        parser.reset();
        parser.parse(test4);
        var expected = 'CSI[0mCSI[7m#CSI[0m';
        chai.expect(terminal.screen.buffer[0].toEscapeString({rtrim:true}).replace(/\x1b/g, 'CSI')).eql(expected);
    });
    it('toEscapeString test5', function () {
        terminal.reset();
        parser.reset();
        parser.parse(test5);
        var expected = 'CSI[0mCSI[1;3;4;5;7;8m#CSI[22;23;24;25;27;28m#CSI[0m';
        chai.expect(terminal.screen.buffer[0].toEscapeString({rtrim:true}).replace(/\x1b/g, 'CSI')).eql(expected);
    });
    it('toEscapeString test6', function () {
        terminal.reset();
        parser.reset();
        parser.parse(test6);
        var expected = 'CSI[0mCSI[3;38;5;1;48;5;1m#CSI[39;49m#CSI[0m';
        chai.expect(terminal.screen.buffer[0].toEscapeString({rtrim:true}).replace(/\x1b/g, 'CSI')).eql(expected);
    });
    it('toEscapeString test7', function () {
        terminal.reset();
        parser.reset();
        parser.parse(test7);
        var expected = 'CSI[0mCSI[38;2;1;2;3;48;2;3;2;1m#CSI[0m#';
        chai.expect(terminal.screen.buffer[0].toEscapeString({rtrim:true}).replace(/\x1b/g, 'CSI')).eql(expected);
    });
    it('toHTML test1', function () {
        terminal.reset();
        parser.reset();
        parser.parse(test1);
        var expected = '';
        expected += '<span class="fg1">Hello</span>';
        expected += '<span class="bold fg9" style="background-color:rgb(128,50,0);">World!</span>';
        expected += '#normal#';
        chai.expect(terminal.screen.buffer[0].toHTML({rtrim:true})).eql(expected);
        expected  = '<span style="color:#cd0000;">Hello</span>';
        expected += '<span style="font-weight:bold;color:#ff0000;background-color:rgb(128,50,0);">World!</span>';
        expected += '#normal#';
        chai.expect(terminal.screen.buffer[0].toHTML({rtrim:true, classes: false})).eql(expected);
    });
    it('toHTML test2', function () {
        terminal.reset();
        parser.reset();
        parser.parse(test2);
        var expected = '';
        expected += '<span class="fg-1 bg1">Hello</span>';
        expected += '<span class="bold bg1" style="color:rgb(128,50,0);">World!</span>';
        expected += '#normal#';
        chai.expect(terminal.screen.buffer[0].toHTML({rtrim:true})).eql(expected);
        expected  = '<span style="color:#000000;background-color:#cd0000;">Hello</span>';
        expected += '<span style="font-weight:bold;color:rgb(128,50,0);background-color:#cd0000;">World!</span>';
        expected += '#normal#';
        chai.expect(terminal.screen.buffer[0].toHTML({rtrim:true, classes: false})).eql(expected);
    });
    it('toHTML test3', function () {
        terminal.reset();
        parser.reset();
        parser.parse(test3);
        var expected = '';
        expected += '<span class="italic underline blink conceal fg45">#</span>';
        expected += '<span class="bg244">#</span>';
        chai.expect(terminal.screen.buffer[0].toHTML({rtrim:true})).eql(expected);
        expected  = '<span style="font-style:italic;font-decoration:underline;';
        expected += 'visibility:hidden;animation: klaus 1s steps(1, start) infinite;';
        expected += 'visibility:hidden;color:#00d7ff;">#</span>';
        expected += '<span style="background-color:#808080;">#</span>';
        chai.expect(terminal.screen.buffer[0].toHTML({rtrim:true, classes: false, blinkanimation: 'klaus'})).eql(expected);
    });
    it('toHTML test4', function () {
        terminal.reset();
        parser.reset();
        parser.parse(test4);
        var expected = '';
        expected += '<span class="fg-1 bg-1">#</span>';
        chai.expect(terminal.screen.buffer[0].toHTML()).eql(expected);
        expected  = '<span style="color:#000000;background-color:#ffffff;">#</span>';
        chai.expect(terminal.screen.buffer[0].toHTML({rtrim:true, classes: false, blinkanimation: 'klaus'})).eql(expected);
    });
});