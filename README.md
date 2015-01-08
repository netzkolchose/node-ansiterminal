An offscreen ANSI terminal for node-ansiparser.

**NOTE: This is still alpha! Many features are still missing or buggy (see TODO).**

The terminal has no further knowledge of a screen output beside the `.toString()`
method. Instead for a real world application you should implement your own view based
on the `.buffer` attribute. The buffer is organized as a 2d array of rows x cols terminal cells.
A terminal cell itself contains an array with the character and the attributes [<character>, <array of attributes>].

## Important Attributes

* *buffer*  - pointer to active terminal buffer
* *normal_buffer* - default buffer (supports scrolling)
* *alternate_buffer* - 2nd buffer, most curses applications use this one
* *cursor* - {row: 0, col: 0} cursor position (starts at 0)
* *title* - terminal title set by OSC 0;

## Important Methods
Most terminal functions are accessible with the DEC memonic in lower case (e.g. `cup()`).
See source for parameters and details.

Additionally the terminal supports these methods:

* *reset()* - reset terminal (hard reset like power off/on on a real vt)
* *resize(cols, rows)* - resize the terminal
* *toString()* - returns a text representation of the active terminal buffer

## Important Callbacks
Overwrite these callback with your real implementation.

* *beep(tone, duration)* - callback to the beep implementation
* *send(s)* - callback to the pseudoterminal input for sending data back
* *appendScrollBuffer(line)* - callback for scrolled out lines
* *clearScrollBuffer()* - callback to clear scroll buffer

## Usage
See `example.js` for a pseudoterminal based example.

## TODO:
* tabs, tab stops, tab width, tab output
* redesign text / character attributes
* mouse support
* sgr: conceal, rgb, intense colors
* full width character support
* keyboard modes
* advanced tests, vttest