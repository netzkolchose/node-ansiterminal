var glob = require("glob");
var fs = require('fs');
var AnsiParser = require('node-ansiparser');
var AnsiTerminal = require('../dist/ansiterminal.js');

var CONSOLE_LOG = console.log;

var COLS = 80;
var ROWS = 25;

var terminal = new AnsiTerminal(COLS, ROWS);
var parser = new AnsiParser(terminal);

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
    for (var i=0; i<files.length; ++i) {
      var filename = files[i];
      (function(filename){
        describe(filename, function() {
          it('equal output', function () {
            terminal.reset();
            var in_file = fs.readFileSync(filename, 'utf8');
            // uncomment this to get log from terminal
            console.log = function(){};
            parser.parse(in_file);
            console.log = CONSOLE_LOG;
            var expected = fs.readFileSync(filename.split('.')[0] + '.text', 'utf8');
            if (terminal.toString() != expected) {
              throw new Error(formatError(in_file, terminal.toString(), expected));
            }
          });
        });
      })(filename);
    }
  });
});

// why is this needed?
it('', function(){});
