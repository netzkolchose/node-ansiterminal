An offscreen ANSI terminal for node-ansiparser.

**NOTE: This is still alpha! Many features are still missing or buggy (see TODO).**

The terminal has no further knowledge of a screen output beside the `.toString()`
method. For a real world application you should instead implement your own view based
on the `.screen` attribute. This screenbuffer contains in `.buffer` the terminal rows.
Each terminal row maintains the character cells in `.cells`. A cell is a TChar with the
printable character in `.c`, a `.width` attribute for the taken terminal
cells (for output) and the text attributes.
NOTE: The emulator will collect combining characters into one TChar.
Therefore `TChar.c` can contain multiple unicode characters. For fullwidth characters
the next terminal cells will get a width of 0.

## Important Attributes

* *screen*  - pointer to active terminal screen
* *normal_screen* - default screen (with scrolling)
* *alternate_screen* - 2nd screen, most curses applications use this one
* *cursor* - {row: 0, col: 0} cursor position (starts at 0)
* *title* - terminal title set by OSC 0;

## Important Methods
Most terminal functions are accessible with the DEC memonic in lower case (e.g. `CUP()`).
See source for parameters and details.

Additionally the terminal supports these methods:

* *reset()* - reset terminal (hard reset like power off/on on a real vt)
* *resize(cols, rows)* - resize the terminal
* *toString()* - returns a text representation of the active terminal buffer

## Important Callbacks
Overwrite these callback with your real implementation.

* *beep(tone, duration)* - callback to the beep implementation
* *send(s)* - callback to the pseudoterminal input for sending data back

## Usage
See `example.js` for a pseudoterminal based example. For a jquery browser based frontend see
[jquery.browserterminal](https://github.com/netzkolchose/jquery.browserterminal).

## TODO:

* unicode tests
* move box printing chars to frontend
* create output methods for TChar and AnsiTerminal
* bracketed paste mode
* tabs, tab stops, tab width, tab output
* tons of DCS codes
* advanced tests, vttest
* rework mouse handling
* test cases