var glob = require('glob');
var fs = require('fs');
var AnsiParser = require('node-ansiparser');
var AnsiTerminal = require('../dist/ansiterminal.js');
var pty = require('pty.js');

var CONSOLE_LOG = console.log;

// expect files need terminal at 80x25
var COLS = 80;
var ROWS = 25;

// terminal emulator and parser instances
var terminal = new AnsiTerminal(COLS, ROWS);
var parser = new AnsiParser(terminal);

// we dont need 2nd process at slave, just master and slave
// both pipe endings are paused for write/read interaction
var naked_term = pty.Terminal.open(COLS, ROWS);
naked_term.master.pause();
naked_term.slave.pause();


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
  glob("test/escape_sequence_files/*.in", null, function (er, files) {
    //for (var i=0; i<50; ++i) {
    for (var i=0; i<files.length; ++i) {
      (function(i){
        describe(files[i-1], function() {
          it('equal output', function () {
            terminal.reset();
            var in_file = fs.readFileSync(files[i], 'utf8');
            naked_term.slave.write(in_file);
            // hack:
            // pty.read has written data one cycle later (needs main loop interaction?)
            // --> we start processing and comparing data at at i=1
            if (i) {
              // uncomment this to get log from terminal
              console.log = function(){};
              parser.parse(naked_term.master.read());
              console.log = CONSOLE_LOG;
              var expected = fs.readFileSync(files[i-1].split('.')[0] + '.text', 'utf8');
              if (terminal.toString() != expected) {
                throw new Error(
                    formatError(
                        fs.readFileSync(files[i-1], 'utf8'),
                        terminal.toString(),
                        expected
                    )
                );
              }
            }
          });
        });
      })(i);
    }
  });
});

// why is this needed?
it('', function(){});
