var pty = require('pty.js');
var AnsiParser = require('node-ansiparser');
var AnsiTerminal = require('../dist/ansiterminal.js').AnsiTerminal;
var fs = require('fs');
var http = require('http');
const PORT=8080;

// server
var data = '';
function handleRequest(request, response){
    response.end(data);
}
var server = http.createServer(handleRequest);
server.listen(PORT, function(){
    _log("Server listening on: http://localhost:%s", PORT);
    _log('<input stuff at this console>');
});


var stdin = process.openStdin();
process.stdin.setRawMode(true);

const output = fs.createWriteStream('.log', {'flags': 'a'});
const myconsole = new console.Console(output, output);

var _log = console.log;
console.log = myconsole.log;

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
terminal.debug = true;
var parser = new AnsiParser(terminal);

// parse data from pseudoterminal and write to html
ptyterm.on('data', function(d) {
    parser.parse(d);
    data = '<!DOCTYPE html>\n';
    data += '<html><head><meta charset="utf-8" /><title></title>';
    data += '<style>@keyframes blink { 50% {visibility: visible; } }</style>';
    data += '</head><body>';
    data += '<pre style="color:#000;background: #fff;display: inline-block;border:1px solid black">';
    for (var i=0; i<terminal.screen.buffer.length; ++i) {
        data += terminal.screen.buffer[i].toHTML({rtrim: false, empty_cell: ' ', classes: false});
        data += '\n';
    }
    data += '</pre>';
    data += '</body></html>';
});

terminal.send = function(s){
   ptyterm.write(s);
};

stdin.addListener("data", function(d) {
    if (d == '\u0003') {
        process.stdin.setRawMode(false);
        process.exit();
    }
    ptyterm.write(d);
});