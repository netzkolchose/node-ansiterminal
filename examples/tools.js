var AnsiParser = require('node-ansiparser');
var AnsiTerminal = require('../dist/ansiterminal.js').AnsiTerminal;


function AnsiConverter(cols, rows, history) {
    this.term = new AnsiTerminal(cols, rows, history);
    this.parser = new AnsiParser(this.term);

    // assume newline mode so single a '\n' gets translated to '\r\n'
    this.term.newline_mode = true;
}
AnsiConverter.prototype.parse = function(s) {
    this.term.screen.scrollbuffer = [];
    this.parser.parse(s);
};
AnsiConverter.prototype.toHTML = function(opts) {
    var i;
    var history = [];
    var screen = [];
    for (i=0; i<this.term.screen.scrollbuffer.length; ++i)
        history.push(this.term.screen.scrollbuffer[i].toHTML(opts));
    for (i=0; i<this.term.screen.buffer.length; ++i)
        screen.push(this.term.screen.buffer[i].toHTML(opts));
    return {appendHistory: history.join('\n'), screen: screen.join('\n')};
};
AnsiConverter.prototype.toJSON = function(opts) {
    var i;
    var history = [];
    var screen = [];
    for (i=0; i<this.term.screen.scrollbuffer.length; ++i)
        history.push(this.term.screen.scrollbuffer[i].toJSON(opts));
    for (i=0; i<this.term.screen.buffer.length; ++i)
        screen.push(this.term.screen.buffer[i].toJSON(opts));
    return {appendHistory: history, screen: screen};
};

/**
 * convenient functions
 *
 * By appending NLs the terminal gets cleared and
 * the final output is fetched from the history buffer.
 */
function ansi2html(s, opts) {
    var cols = opts.cols || 200;
    var rows = opts.rows || 10;
    var converter = new AnsiConverter(cols, rows, Infinity);
    converter.parse(s + Array(rows+1).join('\n'));
    return converter.toHTML(opts).appendHistory;
}
function ansi2json(s, opts) {
    var cols = opts.cols || 200;
    var rows = opts.rows || 10;
    var converter = new AnsiConverter(cols, rows, Infinity);
    converter.parse(s + Array(rows+1).join('\n'));
    return converter.toJSON(opts).appendHistory;
}

console.log(ansi2html('\x1b[31mHello World!\x1b[39m\n ?#> ', {classes: false}));
console.log(ansi2json('\x1b[31mHello World!\x1b[39m\n ?#> ', {rtrim: true}));