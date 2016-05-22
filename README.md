[![Build Status](https://travis-ci.org/netzkolchose/node-ansiterminal.svg?branch=master)](https://travis-ci.org/netzkolchose/node-ansiterminal)
[![Coverage Status](https://coveralls.io/repos/netzkolchose/node-ansiterminal/badge.svg?branch=master)](https://coveralls.io/r/netzkolchose/node-ansiterminal?branch=master)

An offscreen xterm like ANSI terminal library.

The terminal implements the interface of the node-ansiparser in ECMA5 vanilla javascript.

Quick usage example:
```js
var AnsiTerminal = require('node-ansiterminal').AnsiTerminal;
var AnsiParser = require('node-ansiparser');
var terminal = new AnsiTerminal(80, 25, 500);
var parser = new AnsiParser(terminal);
parser.parse('\x1b[31mHello World!\x1b[0m');
console.log(terminal.toString());
```

See [examples](examples) for some output examples or
[jquery.browserterminal](https://github.com/netzkolchose/jquery.browserterminal)
for a jquery based browser frontend.


## Documentation

See the [API documentation](doc/api.md).


## TODO:

* remove box printing chars special handling (goes to frontend)
* bracketed paste mode
* tabs, tab stops, tab width, tab output
* tons of DCS and DEC special codes
* advanced tests, vttest
* rework mouse handling
* more test cases
* complete doc