var pty = require('pty.js'); // npm install pty.js
var AnsiParser = require('node-ansiparser');  // npm install node-ansiparser
var AnsiTerminal = require('./dist/ansiterminal.js');

// terminal size
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
var parser = new AnsiParser(terminal);

// parse data from pseudoterminal and log emulator buffer to STDOUT
ptyterm.on('data', function(data) {
    parser.parse(data);
    console.log('#### terminal start ####');
    console.log(terminal.toString());
    console.log('#### terminal end ####');
});

// simulate keyboard input - ls
setTimeout(function(){ptyterm.write('l');}, 1000);
setTimeout(function(){ptyterm.write('s');}, 2000);
setTimeout(function(){ptyterm.write('\n');}, 3000);