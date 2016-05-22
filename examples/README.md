### simple.js

Simple example script with `toString()` output and simulated `ls\n` keyboard input. Uses a real PTY (via pty.js).


### console.js

Script to test the `TRow.toEscapeString()` method. Special keys or mouse actions are not delegated to the emulator (this would require a full stack clone of screen or tmux). For log output see file .log. Stop the script with Ctrl+C.


### html.js

Script to test the `TRow.toHTML()` method. Run the script and point your browser to [localhost:8080](http://localhost:8080). With input in the controlling terminal you should see the output after a refresh of the browser page. Stop the script with Ctrl+C.


### tools.js

The script implements a simple ANSI converter with support for HTML or JSON output. The shortcut functions `ansi2html` and `ansi2json` are stateless and can be used for single non dependant terminal output conversions.

For more complicated terminal stuff with multiple depending output strings (e.g. back jumps with overwriting previous line content) use `AnsiConverter` directly to preserve the state like this:
```js
var converter = new AnsiConverter(columns, rows, scroll_history);
...
converter.parse(data_from_pty);
var data = converter.toHTML(options);
...
converter.parse(data_from_pty);
data = converter.toHTML(options);
...
```
Always call `toHTML` after a single `parse` invocation to avoid losing lines.
The returned data is an object with these attributes:

* `appendHistory`  Contains lines that can be appended permanently to your output.
* `screen`         Contains lines that are likely to be modified by later `parse` calls. Those lines can only be appended temporarily to your output and need to be cleared upon the next parse + toHTML step. `toJSON` works similar to `toHTML` but with an text attribute object instead of final HTML markup.



