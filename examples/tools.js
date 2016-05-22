var AnsiParser = require('node-ansiparser');
var AnsiTerminal = require('../dist/ansiterminal.js').AnsiTerminal;


function AnsiConverter(cols, rows, history) {
    this.term = new AnsiTerminal(cols, rows, history);
    this.parser = new AnsiParser(this.term);
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

function ansi2html(s, opts) {
    var converter = new AnsiConverter(1000, 1, 50);
    converter.parse(s + '\n');
    return converter.toHTML(opts).appendHistory;
}
function ansi2json(s, opts) {
    var converter = new AnsiConverter(1000, 1, 50);
    converter.parse(s + '\n');
    return converter.toJSON(opts).appendHistory;
}

console.log(ansi2html('\x1b[31mHello World!\x1b[39m\n ?#> ', {classes: false}));
console.log(ansi2json('\x1b[31mHello World!\x1b[39m\n ?#> ', {rtrim: true}));