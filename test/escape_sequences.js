var glob = require('glob');
var fs = require('fs');
var AnsiParser = require('node-ansiparser');
var AnsiTerminal = require('../dist/ansiterminal.js').AnsiTerminal;
var pty = require('pty.js');
var sleep = require('sleep');

var CONSOLE_LOG = console.log;

// expect files need terminal at 80x25
var COLS = 80;
var ROWS = 25;

// terminal emulator and parser instances
var terminal = new AnsiTerminal(COLS, ROWS);
var parser = new AnsiParser(terminal);

// primitive pty pipe is enough for the test cases
var primitive_pty = pty.native.open(COLS, ROWS);

// fake sychronous pty write - read
// pty.js opens pipe fds with O_NONBLOCK
// just wait 10ms instead of setting fds to blocking mode
function pty_write_read(t, s) {
    fs.writeSync(t.slave, s);
    sleep.usleep(10000);
    var b = Buffer(64000);
    var bytes = fs.readSync(t.master, b, 0, 64000);
    return b.toString('utf8', 0, bytes);
}

function addLineNumber(start, color) {
    var counter = start || 0;
    return function(s) {
        counter += 1;
        return '\x1b[33m' + (' ' + counter).slice(-2) + color + s;
    }
}

function formatError(in_, out_, expected) {
    var line80 = '12345678901234567890123456789012345678901234567890123456789012345678901234567890';
    var s = '';
    s += '\n\x1b[34m' + JSON.stringify(in_);
    s += '\n\x1b[33m  ' + line80 + '\n';
    s += out_.split('\n').map(addLineNumber(0, '\x1b[31m')).join('\n');
    s += '\n\x1b[33m  ' + line80 + '\n';
    s += expected.split('\n').map(addLineNumber(0, '\x1b[32m')).join('\n');
    return s;
}

describe('Escape code files', function() {
    // omit stack trace for escape sequence files
    Error.stackTraceLimit = 0;
    var files = glob.sync('test/escape_sequence_files/*.in');
    for (var i=0; i<44; ++i) {
    //for (var i=0; i<files.length; ++i) {
        (function(filename){
            it(filename.split('/').slice(-1)[0], function () {
                terminal.reset();
                parser.reset();
                var in_file = fs.readFileSync(filename, 'utf8');
                var from_pty = pty_write_read(primitive_pty, in_file);
                // uncomment this to get log from terminal
                console.log = function(){};
                parser.parse(from_pty);
                var from_emulator = terminal.toString();
                console.log = CONSOLE_LOG;
                var expected = fs.readFileSync(filename.split('.')[0] + '.text', 'utf8');
                if (from_emulator != expected) {
                    throw new Error(formatError(in_file, from_emulator, expected));
                }
            });
        })(files[i]);
    }
});

