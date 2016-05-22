var pty = require('pty.js');
var AnsiParser = require('node-ansiparser');
var AnsiTerminal = require('../dist/ansiterminal.js').AnsiTerminal;
var fs = require('fs');


var stdin = process.openStdin();
process.stdin.setRawMode(true);

const output = fs.createWriteStream('.log', {'flags': 'a'});
const myconsole = new console.Console(output, output);

var _log = console.log;
console.log = myconsole.log;

// initial terminal size
var COLS = 80;
var ROWS = 25;

// spawn a new pseudoterminal
var ptyterm = pty.spawn('bash', [], {
    name: 'xterm',
    cols: COLS,
    rows: ROWS,
    cwd: process.env.HOME,
    env: process.env
});

// create terminal emulator and parser
var terminal = new AnsiTerminal(COLS, ROWS);
//terminal.debug = true;
var parser = new AnsiParser(terminal);

function printTerminal() {
    process.stdout.write('\x1b[2;2H');
    for (var i=0; i<terminal.screen.buffer.length; ++i) {
        process.stdout.write(terminal.screen.buffer[i].toEscapeString({rtrim:false, empty_cell: ' '}));
        process.stdout.write('\x1b[B\x1b[2G');
    }
}

// parse data from pseudoterminal and write to terminal
ptyterm.on('data', function(data) {
    parser.parse(data);
    process.stdout.write('\x1b[100;93;1m\x1b[0;14H' + terminal.title + '\x1b[K');
    printTerminal();
    process.stdout.write('\x1b['+(terminal.cursor.row+2)+';'+(terminal.cursor.col+2)+'H');
});

terminal.send = function(s){
   ptyterm.write(s);
};

stdin.addListener("data", function(d) {
    if (d == '\u0003') {
        process.stdin.setRawMode(false);
        process.stdout.write('\x1b[0m\x1b[2J\x1b[0;0H');
        process.exit();
    }
    ptyterm.write(d);
});

function drawFrame() {
    process.stdout.write('\x1b[100;96;1m\x1b[2J\x1b[0;0HCONSOLETEST');
}

// resize signal handler
process.on('SIGWINCH', function() {
    var size = process.stdout.getWindowSize();
    terminal.resize(size[0]-2, size[1]-2);
    ptyterm.resize(size[0]-2, size[1]-2);
    drawFrame();
    printTerminal();
});

// initial
drawFrame();
var init_size = process.stdout.getWindowSize();
terminal.resize(init_size[0]-2, init_size[1]-2);
ptyterm.resize(init_size[0]-2, init_size[1]-2);