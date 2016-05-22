<a name="module_node-ansiterminal"></a>

## node-ansiterminal
**Example**  
```js
var ansiterminal = require('node-ansiterminal')
```

* [node-ansiterminal](#module_node-ansiterminal)
    * _static_
        * [.TChar](#module_node-ansiterminal.TChar)
            * [new TChar(c, attr, gb, width)](#new_module_node-ansiterminal.TChar_new)
            * _instance_
                * [.clone()](#module_node-ansiterminal.TChar+clone) ⇒ <code>[TChar](#module_node-ansiterminal.TChar)</code>
                * [.equals(other)](#module_node-ansiterminal.TChar+equals) ⇒ <code>boolean</code>
                * [.serialize()](#module_node-ansiterminal.TChar+serialize) ⇒ <code>Array</code>
                * [.getAttributes()](#module_node-ansiterminal.TChar+getAttributes) ⇒ <code>[TAttributes](#module_node-ansiterminal..TAttributes)</code>
                * [.getJSONAttributes()](#module_node-ansiterminal.TChar+getJSONAttributes) ⇒ <code>[TJSONAttributes](#module_node-ansiterminal..TJSONAttributes)</code>
                * [.setAttributes(attributes)](#module_node-ansiterminal.TChar+setAttributes)
            * _static_
                * [.deserialize(o)](#module_node-ansiterminal.TChar.deserialize) ⇒ <code>[TChar](#module_node-ansiterminal.TChar)</code>
        * [.TRow](#module_node-ansiterminal.TRow)
            * [new TRow(length, tchar)](#new_module_node-ansiterminal.TRow_new)
            * _instance_
                * [.serialize()](#module_node-ansiterminal.TRow+serialize) ⇒ <code>Array</code>
                * [.toString(opts)](#module_node-ansiterminal.TRow+toString) ⇒ <code>string</code>
                * [.toMergedArray(opts)](#module_node-ansiterminal.TRow+toMergedArray) ⇒ <code>Array</code>
                * [.toJSON(opts)](#module_node-ansiterminal.TRow+toJSON) ⇒ <code>[JSONTRow](#module_node-ansiterminal..JSONTRow)</code>
                * [.toEscapeString(opts)](#module_node-ansiterminal.TRow+toEscapeString) ⇒ <code>string</code>
                * [.toHTML(opts)](#module_node-ansiterminal.TRow+toHTML) ⇒ <code>string</code>
            * _static_
                * [.deserialize(o)](#module_node-ansiterminal.TRow.deserialize) ⇒ <code>[TRow](#module_node-ansiterminal.TRow)</code>
        * [.AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)
            * [new AnsiTerminal(cols, rows, scrollLength)](#new_module_node-ansiterminal.AnsiTerminal_new)
            * [.reset](#module_node-ansiterminal.AnsiTerminal+reset)
            * [.toString](#module_node-ansiterminal.AnsiTerminal+toString) ⇒ <code>string</code>
            * [.resize](#module_node-ansiterminal.AnsiTerminal+resize)
            * [.inst_p](#module_node-ansiterminal.AnsiTerminal+inst_p)
            * [.inst_o](#module_node-ansiterminal.AnsiTerminal+inst_o)
            * [.inst_x](#module_node-ansiterminal.AnsiTerminal+inst_x)
            * [.inst_c](#module_node-ansiterminal.AnsiTerminal+inst_c)
            * [.inst_e](#module_node-ansiterminal.AnsiTerminal+inst_e)
            * [.inst_H](#module_node-ansiterminal.AnsiTerminal+inst_H)
            * [.inst_P](#module_node-ansiterminal.AnsiTerminal+inst_P)
            * [.inst_U](#module_node-ansiterminal.AnsiTerminal+inst_U)
            * [.DECALN](#module_node-ansiterminal.AnsiTerminal+DECALN)
            * [.SD](#module_node-ansiterminal.AnsiTerminal+SD)
            * [.SU](#module_node-ansiterminal.AnsiTerminal+SU)
            * [.REP](#module_node-ansiterminal.AnsiTerminal+REP)
            * [.NEL](#module_node-ansiterminal.AnsiTerminal+NEL)
            * [.NEL](#module_node-ansiterminal.AnsiTerminal+NEL)
            * [.VPR](#module_node-ansiterminal.AnsiTerminal+VPR)
            * [.HPR](#module_node-ansiterminal.AnsiTerminal+HPR)
            * [.HPA](#module_node-ansiterminal.AnsiTerminal+HPA)
            * [.CBT](#module_node-ansiterminal.AnsiTerminal+CBT)
            * [.CHT](#module_node-ansiterminal.AnsiTerminal+CHT)
            * [.CPL](#module_node-ansiterminal.AnsiTerminal+CPL)
            * [.CNL](#module_node-ansiterminal.AnsiTerminal+CNL)
            * [.DL](#module_node-ansiterminal.AnsiTerminal+DL)
            * [.ICH](#module_node-ansiterminal.AnsiTerminal+ICH)
            * [.VPA](#module_node-ansiterminal.AnsiTerminal+VPA)
            * [.ECH](#module_node-ansiterminal.AnsiTerminal+ECH)
            * [.IL](#module_node-ansiterminal.AnsiTerminal+IL)
            * [.DECSTBM](#module_node-ansiterminal.AnsiTerminal+DECSTBM)
            * [.DECSTR](#module_node-ansiterminal.AnsiTerminal+DECSTR)
            * [.RI](#module_node-ansiterminal.AnsiTerminal+RI)
            * [.DECSC](#module_node-ansiterminal.AnsiTerminal+DECSC)
            * [.DECRC](#module_node-ansiterminal.AnsiTerminal+DECRC)
            * [.CHA](#module_node-ansiterminal.AnsiTerminal+CHA)
            * [.CUB](#module_node-ansiterminal.AnsiTerminal+CUB)
            * [.CUD](#module_node-ansiterminal.AnsiTerminal+CUD)
            * [.CUF](#module_node-ansiterminal.AnsiTerminal+CUF)
            * [.CUU](#module_node-ansiterminal.AnsiTerminal+CUU)
            * [.CUP](#module_node-ansiterminal.AnsiTerminal+CUP)
            * [.DCH](#module_node-ansiterminal.AnsiTerminal+DCH)
            * [.ED](#module_node-ansiterminal.AnsiTerminal+ED)
            * [.EL](#module_node-ansiterminal.AnsiTerminal+EL)
            * [.SGR](#module_node-ansiterminal.AnsiTerminal+SGR)
        * [.wcswidth(s)](#module_node-ansiterminal.wcswidth) ⇒ <code>number</code>
        * [.get_color(value)](#module_node-ansiterminal.get_color) ⇒ <code>string</code>
    * _inner_
        * [~TColors](#module_node-ansiterminal..TColors) : <code>Object</code>
        * [~TAttributes](#module_node-ansiterminal..TAttributes) : <code>Object</code>
        * [~TJSONColors](#module_node-ansiterminal..TJSONColors) : <code>Object</code>
        * [~TJSONAttributes](#module_node-ansiterminal..TJSONAttributes) : <code>Object</code>
        * [~JSONTRow](#module_node-ansiterminal..JSONTRow) : <code>Object</code>

<a name="module_node-ansiterminal.TChar"></a>

### ansiterminal.TChar
A TChar is a terminal character with text attributes and width.
In the terminal emulator it represents a terminal cell in a TRow.
The actual character is saved in `c`.

`width` is the printed space of the character according to unicode.
It can be 1 (halfwidth codepoints), 2 (fullwidth codepoints)
or 0 (as intermediate state after a fullwidth codepoint).
`width` always defaults to 1 and is not calculated upon initialization.
The correct width value is set by the emulator while processing
a printable character.

For small memory footprint and quick state changes a TChar object stores
the text attributes in the 2 4-byte numbers `attr` and `gb`.

Bits of `attr`:

      1-8     background color in 256 mode / background RED in RGB mode
      9-16    foreground color in 256 mode / foreground RED in RGB mode
      17      bold
      18      italic
      19      underline
      20      blink
      21      inverse
      22      conceal
      23      cursor (not set by default)
      24      <unused>
      25      background set (for 256 and RGB mode)
      26      background in RGB mode (true for RGB, false for 256)
      27      foreground set (for 256 and RGB mode)
      28      foreground in RGB mode (true for RGB, false for 256)
      29-32   <unused>

Bits of `gb`:

      1-8         background BLUE in RGB mode
      9-16        foreground BLUE in RGB mode
      17-24       background GREEN in RGB mode
      25-32       foreground GREEN in RGB mode

**Kind**: static class of <code>[node-ansiterminal](#module_node-ansiterminal)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| c | <code>string</code> | unicode character (multiple if surrogate or combining) |
| attr | <code>number</code> | text attributes as integer |
| gb | <code>number</code> | green and blue part of RGB as integer |
| width | <code>number</code> | printed space of character |


* [.TChar](#module_node-ansiterminal.TChar)
    * [new TChar(c, attr, gb, width)](#new_module_node-ansiterminal.TChar_new)
    * _instance_
        * [.clone()](#module_node-ansiterminal.TChar+clone) ⇒ <code>[TChar](#module_node-ansiterminal.TChar)</code>
        * [.equals(other)](#module_node-ansiterminal.TChar+equals) ⇒ <code>boolean</code>
        * [.serialize()](#module_node-ansiterminal.TChar+serialize) ⇒ <code>Array</code>
        * [.getAttributes()](#module_node-ansiterminal.TChar+getAttributes) ⇒ <code>[TAttributes](#module_node-ansiterminal..TAttributes)</code>
        * [.getJSONAttributes()](#module_node-ansiterminal.TChar+getJSONAttributes) ⇒ <code>[TJSONAttributes](#module_node-ansiterminal..TJSONAttributes)</code>
        * [.setAttributes(attributes)](#module_node-ansiterminal.TChar+setAttributes)
    * _static_
        * [.deserialize(o)](#module_node-ansiterminal.TChar.deserialize) ⇒ <code>[TChar](#module_node-ansiterminal.TChar)</code>

<a name="new_module_node-ansiterminal.TChar_new"></a>

#### new TChar(c, attr, gb, width)

| Param | Type | Description |
| --- | --- | --- |
| c | <code>string</code> | unicode character (multiple if surrogate or combining) |
| attr | <code>number</code> | text attributes as integer |
| gb | <code>number</code> | green and blue part of RGB as integer |
| width | <code>number</code> | printed space of character |

<a name="module_node-ansiterminal.TChar+clone"></a>

#### tchar.clone() ⇒ <code>[TChar](#module_node-ansiterminal.TChar)</code>
Clone a TChar object.

**Kind**: instance method of <code>[TChar](#module_node-ansiterminal.TChar)</code>  
<a name="module_node-ansiterminal.TChar+equals"></a>

#### tchar.equals(other) ⇒ <code>boolean</code>
Test equality of TChar.

**Kind**: instance method of <code>[TChar](#module_node-ansiterminal.TChar)</code>  

| Param | Type |
| --- | --- |
| other | <code>[TChar](#module_node-ansiterminal.TChar)</code> | 

<a name="module_node-ansiterminal.TChar+serialize"></a>

#### tchar.serialize() ⇒ <code>Array</code>
Serialize a TChar.

**Kind**: instance method of <code>[TChar](#module_node-ansiterminal.TChar)</code>  
<a name="module_node-ansiterminal.TChar+getAttributes"></a>

#### tchar.getAttributes() ⇒ <code>[TAttributes](#module_node-ansiterminal..TAttributes)</code>
Get all text attributes in a readable manner.
The attributes object may contain left over color values
of a former RGB setting. This is due to the way xterm
handles those values internally. For cleaned attributes
see [getJSONAttributes](#module_node-ansiterminal.TChar+getJSONAttributes)

**Kind**: instance method of <code>[TChar](#module_node-ansiterminal.TChar)</code>  
<a name="module_node-ansiterminal.TChar+getJSONAttributes"></a>

#### tchar.getJSONAttributes() ⇒ <code>[TJSONAttributes](#module_node-ansiterminal..TJSONAttributes)</code>
Get all text attributes in a readable manner without state internals.
Use this in favour of [getAttributes](#module_node-ansiterminal.TChar+getAttributes) if you need
the attributes in a clean way without remnant color values.

Except the colors all attributes are simple boolean values.
The color attributes default to false and will turn into an object
with a `mode` and a `color` attribute if a color is set. For mode '256'
the color will be a single integer indicating the color in the 256 color scheme.
For mode 'RGB' color is an array with the RGB color values.

NOTE: The simple 8bit colors are not directly supported by the terminal emulator.
They will be translated to the lower colors of the 256 color scheme.

Example output with a foreground color set:
```js
{
    bold: false,
    italic: false,
    underline: false,
    blink: false,
    inverse: false,
    conceal: false,
    foreground: {mode: '256', color: 12},
    background: false
}
```

**Kind**: instance method of <code>[TChar](#module_node-ansiterminal.TChar)</code>  
<a name="module_node-ansiterminal.TChar+setAttributes"></a>

#### tchar.setAttributes(attributes)
Set the text attributes. The parameter must be in the form of the output
of [getAttributes](#module_node-ansiterminal.TChar+getAttributes).

**Kind**: instance method of <code>[TChar](#module_node-ansiterminal.TChar)</code>  

| Param | Type |
| --- | --- |
| attributes | <code>[TAttributes](#module_node-ansiterminal..TAttributes)</code> | 

<a name="module_node-ansiterminal.TChar.deserialize"></a>

#### tchar.deserialize(o) ⇒ <code>[TChar](#module_node-ansiterminal.TChar)</code>
Deserialize a serialization object to TChar.

**Kind**: static method of <code>[TChar](#module_node-ansiterminal.TChar)</code>  

| Param | Type |
| --- | --- |
| o | <code>object</code> | 

<a name="module_node-ansiterminal.TRow"></a>

### ansiterminal.TRow
A TRow contains single terminal cells (TChar) in `cells`.
The global unique ID `uniqueId` will never change for an existing TRow.
The `version` attributes will be incremented by the terminal emulator
upon changes. This can be used to implement a partial refresh of a view output.

**Kind**: static class of <code>[node-ansiterminal](#module_node-ansiterminal)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| cells | <code>array</code> | array containing the single [TChar](TChar) objects |
| uniqueId | <code>number</code> | global unique id of the row object |
| version | <code>number</code> | incremented by emulator upon changes |


* [.TRow](#module_node-ansiterminal.TRow)
    * [new TRow(length, tchar)](#new_module_node-ansiterminal.TRow_new)
    * _instance_
        * [.serialize()](#module_node-ansiterminal.TRow+serialize) ⇒ <code>Array</code>
        * [.toString(opts)](#module_node-ansiterminal.TRow+toString) ⇒ <code>string</code>
        * [.toMergedArray(opts)](#module_node-ansiterminal.TRow+toMergedArray) ⇒ <code>Array</code>
        * [.toJSON(opts)](#module_node-ansiterminal.TRow+toJSON) ⇒ <code>[JSONTRow](#module_node-ansiterminal..JSONTRow)</code>
        * [.toEscapeString(opts)](#module_node-ansiterminal.TRow+toEscapeString) ⇒ <code>string</code>
        * [.toHTML(opts)](#module_node-ansiterminal.TRow+toHTML) ⇒ <code>string</code>
    * _static_
        * [.deserialize(o)](#module_node-ansiterminal.TRow.deserialize) ⇒ <code>[TRow](#module_node-ansiterminal.TRow)</code>

<a name="new_module_node-ansiterminal.TRow_new"></a>

#### new TRow(length, tchar)
The constructor will create `length` cells of cloned `tchar` objects.


| Param | Type | Description |
| --- | --- | --- |
| length | <code>number</code> | amount of cells to create |
| tchar | <code>[TChar](#module_node-ansiterminal.TChar)</code> | base object to be cloned as initial |

<a name="module_node-ansiterminal.TRow+serialize"></a>

#### tRow.serialize() ⇒ <code>Array</code>
Serialize a TRow.

**Kind**: instance method of <code>[TRow](#module_node-ansiterminal.TRow)</code>  
<a name="module_node-ansiterminal.TRow+toString"></a>

#### tRow.toString(opts) ⇒ <code>string</code>
String representation of TRow.

**Kind**: instance method of <code>[TRow](#module_node-ansiterminal.TRow)</code>  

| Param | Type |
| --- | --- |
| opts | <code>object</code> | 

<a name="module_node-ansiterminal.TRow+toMergedArray"></a>

#### tRow.toMergedArray(opts) ⇒ <code>Array</code>
Array representation of merged TChars objects with same text attributes.

**Kind**: instance method of <code>[TRow](#module_node-ansiterminal.TRow)</code>  
**Returns**: <code>Array</code> - array of merged TChar objects  

| Param |
| --- |
| opts | 

<a name="module_node-ansiterminal.TRow+toJSON"></a>

#### tRow.toJSON(opts) ⇒ <code>[JSONTRow](#module_node-ansiterminal..JSONTRow)</code>
Drilled down JSON representation of a TRow.
Returns objects of sub strings with distinct text attributes.

**Kind**: instance method of <code>[TRow](#module_node-ansiterminal.TRow)</code>  
**Note**: The print space width is summed up.  

| Param |
| --- |
| opts | 

<a name="module_node-ansiterminal.TRow+toEscapeString"></a>

#### tRow.toEscapeString(opts) ⇒ <code>string</code>
String representation of TRow with escape codes.

**Kind**: instance method of <code>[TRow](#module_node-ansiterminal.TRow)</code>  

| Param |
| --- |
| opts | 

<a name="module_node-ansiterminal.TRow+toHTML"></a>

#### tRow.toHTML(opts) ⇒ <code>string</code>
HTML string representation of TRow.

The terminal string gets decorated by span elements with textattributes
either set via class names or inline styles.

Options are:

    rtrim            Trim empty cells from right.
                     Defaults to true.
    empty_cell       Fill empty_cells with given string.
                     Defaults to none break space character '\xa0'.
    blinkanimation   CSS animation class name. Since an animation in CSS
                     can't be declared inline, this is mandatory for
                     classes false.
    classes          Use CSS classes (true) or inline styles (false).
                     The class names are: 'blink', 'italic',
                     'underline', 'blink', 'conceal', 'fgX', 'bgX'
                     For foreground and background colors the 'X'
                     is the number of a 256 color table, e.g. 'fg134'.
                     Default foreground and background colors have
                     no class name. Therefore inverted default colors
                     are named as 'fg-1' and 'bg-1'.
                     Defaults to true.
    colors           Customizable callback for inline colors.
                     The callback has to support one parameter as
                     color number from 0..255 or the keywords
                     'foreground' or 'background' for default colors).
                     The default callback uses the xterm colorset.
    escape_html      Escape html characters in terminal string.
                     Default is true.

**Kind**: instance method of <code>[TRow](#module_node-ansiterminal.TRow)</code>  
**Returns**: <code>string</code> - HTML string  

| Param |
| --- |
| opts | 

<a name="module_node-ansiterminal.TRow.deserialize"></a>

#### TRow.deserialize(o) ⇒ <code>[TRow](#module_node-ansiterminal.TRow)</code>
Deserialize a TRow.

**Kind**: static method of <code>[TRow](#module_node-ansiterminal.TRow)</code>  

| Param |
| --- |
| o | 

<a name="module_node-ansiterminal.AnsiTerminal"></a>

### ansiterminal.AnsiTerminal
**Kind**: static class of <code>[node-ansiterminal](#module_node-ansiterminal)</code>  

* [.AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)
    * [new AnsiTerminal(cols, rows, scrollLength)](#new_module_node-ansiterminal.AnsiTerminal_new)
    * [.reset](#module_node-ansiterminal.AnsiTerminal+reset)
    * [.toString](#module_node-ansiterminal.AnsiTerminal+toString) ⇒ <code>string</code>
    * [.resize](#module_node-ansiterminal.AnsiTerminal+resize)
    * [.inst_p](#module_node-ansiterminal.AnsiTerminal+inst_p)
    * [.inst_o](#module_node-ansiterminal.AnsiTerminal+inst_o)
    * [.inst_x](#module_node-ansiterminal.AnsiTerminal+inst_x)
    * [.inst_c](#module_node-ansiterminal.AnsiTerminal+inst_c)
    * [.inst_e](#module_node-ansiterminal.AnsiTerminal+inst_e)
    * [.inst_H](#module_node-ansiterminal.AnsiTerminal+inst_H)
    * [.inst_P](#module_node-ansiterminal.AnsiTerminal+inst_P)
    * [.inst_U](#module_node-ansiterminal.AnsiTerminal+inst_U)
    * [.DECALN](#module_node-ansiterminal.AnsiTerminal+DECALN)
    * [.SD](#module_node-ansiterminal.AnsiTerminal+SD)
    * [.SU](#module_node-ansiterminal.AnsiTerminal+SU)
    * [.REP](#module_node-ansiterminal.AnsiTerminal+REP)
    * [.NEL](#module_node-ansiterminal.AnsiTerminal+NEL)
    * [.NEL](#module_node-ansiterminal.AnsiTerminal+NEL)
    * [.VPR](#module_node-ansiterminal.AnsiTerminal+VPR)
    * [.HPR](#module_node-ansiterminal.AnsiTerminal+HPR)
    * [.HPA](#module_node-ansiterminal.AnsiTerminal+HPA)
    * [.CBT](#module_node-ansiterminal.AnsiTerminal+CBT)
    * [.CHT](#module_node-ansiterminal.AnsiTerminal+CHT)
    * [.CPL](#module_node-ansiterminal.AnsiTerminal+CPL)
    * [.CNL](#module_node-ansiterminal.AnsiTerminal+CNL)
    * [.DL](#module_node-ansiterminal.AnsiTerminal+DL)
    * [.ICH](#module_node-ansiterminal.AnsiTerminal+ICH)
    * [.VPA](#module_node-ansiterminal.AnsiTerminal+VPA)
    * [.ECH](#module_node-ansiterminal.AnsiTerminal+ECH)
    * [.IL](#module_node-ansiterminal.AnsiTerminal+IL)
    * [.DECSTBM](#module_node-ansiterminal.AnsiTerminal+DECSTBM)
    * [.DECSTR](#module_node-ansiterminal.AnsiTerminal+DECSTR)
    * [.RI](#module_node-ansiterminal.AnsiTerminal+RI)
    * [.DECSC](#module_node-ansiterminal.AnsiTerminal+DECSC)
    * [.DECRC](#module_node-ansiterminal.AnsiTerminal+DECRC)
    * [.CHA](#module_node-ansiterminal.AnsiTerminal+CHA)
    * [.CUB](#module_node-ansiterminal.AnsiTerminal+CUB)
    * [.CUD](#module_node-ansiterminal.AnsiTerminal+CUD)
    * [.CUF](#module_node-ansiterminal.AnsiTerminal+CUF)
    * [.CUU](#module_node-ansiterminal.AnsiTerminal+CUU)
    * [.CUP](#module_node-ansiterminal.AnsiTerminal+CUP)
    * [.DCH](#module_node-ansiterminal.AnsiTerminal+DCH)
    * [.ED](#module_node-ansiterminal.AnsiTerminal+ED)
    * [.EL](#module_node-ansiterminal.AnsiTerminal+EL)
    * [.SGR](#module_node-ansiterminal.AnsiTerminal+SGR)

<a name="new_module_node-ansiterminal.AnsiTerminal_new"></a>

#### new AnsiTerminal(cols, rows, scrollLength)
AnsiTerminal - an offscreen xterm like terminal.

The terminal implements the interface of node-ansiparser.
Since the parser calls the methods directly this terminal has
no direct input method. Use the parser's `parse(s)` method
instead (see documentation of the parser and the example below).

The terminal has no direct screen representation beside
a `toString()` method for debug purposes.
Use the output methods of the TRow primitive to build a view
of the terminal content.

Like xterm the terminal maintains 2 different screen buffers.
The normal screen has a scrolling history while the alternate
has none. Most simple programs operate on the normal
screen while more advanced command line programs (e.g. curses based)
use the alternate screen as a canvas. The current active
screen is always accessible via the `screen` attribute.


| Param | Type | Description |
| --- | --- | --- |
| cols | <code>number</code> | columns of the terminal. |
| rows | <code>number</code> | rows of the terminal. |
| scrollLength | <code>number</code> | lines of scrollbuffer. |

**Example**  
```js
var AnsiTerminal = require('node-ansiterminal').AnsiTerminal;
var AnsiParser = require('node-ansiparser');
var terminal = new AnsiTerminal(80, 25, 500);
var parser = new AnsiParser(terminal);
parser.parse('\x1b[31mHello World!\x1b[0m');
console.log(terminal.toString());
```
<a name="module_node-ansiterminal.AnsiTerminal+reset"></a>

#### ansiTerminal.reset
Hard reset of the terminal.

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
<a name="module_node-ansiterminal.AnsiTerminal+toString"></a>

#### ansiTerminal.toString ⇒ <code>string</code>
String representation of active terminal buffer.

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  

| Param |
| --- |
| opts | 

<a name="module_node-ansiterminal.AnsiTerminal+resize"></a>

#### ansiTerminal.resize
Resize terminal to cols x rows.

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  

| Param | Type | Description |
| --- | --- | --- |
| cols | <code>number</code> | new columns value |
| rows | <code>number</code> | new rows value |

<a name="module_node-ansiterminal.AnsiTerminal+inst_p"></a>

#### ansiTerminal.inst_p
inst_p - handle printable characters

The print implementation is aware of combining and surrogate characters and respects
half and full width print space according to unicode.

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  

| Param | Type |
| --- | --- |
| s | <code>string</code> | 

<a name="module_node-ansiterminal.AnsiTerminal+inst_o"></a>

#### ansiTerminal.inst_o
inst_o - handle OSC instruction

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  

| Param |
| --- |
| s | 

<a name="module_node-ansiterminal.AnsiTerminal+inst_x"></a>

#### ansiTerminal.inst_x
inst_x - handle single character instruction

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  

| Param |
| --- |
| flag | 

<a name="module_node-ansiterminal.AnsiTerminal+inst_c"></a>

#### ansiTerminal.inst_c
inst_c - handle CSI instruction

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  

| Param |
| --- |
| collected | 
| params | 
| flag | 

<a name="module_node-ansiterminal.AnsiTerminal+inst_e"></a>

#### ansiTerminal.inst_e
inst_e - handle ESC instruction

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  

| Param |
| --- |
| collected | 
| flag | 

<a name="module_node-ansiterminal.AnsiTerminal+inst_H"></a>

#### ansiTerminal.inst_H
inst_H - enter DCS handler state

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**Note**: not implemented  

| Param |
| --- |
| collected | 
| params | 
| flag | 

<a name="module_node-ansiterminal.AnsiTerminal+inst_P"></a>

#### ansiTerminal.inst_P
inst_P - handle DCS data

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**Note**: not implemented  

| Param |
| --- |
| data | 

<a name="module_node-ansiterminal.AnsiTerminal+inst_U"></a>

#### ansiTerminal.inst_U
inst_U - leave DCS handler state

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**Note**: not implemented  
<a name="module_node-ansiterminal.AnsiTerminal+DECALN"></a>

#### ansiTerminal.DECALN
DECALN - Screen Alignment Pattern

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://www.vt100.net/docs/vt510-rm/DECALN](http://www.vt100.net/docs/vt510-rm/DECALN)  
<a name="module_node-ansiterminal.AnsiTerminal+SD"></a>

#### ansiTerminal.SD
SD - Scroll Down (Pan Up) - CSI Pn T
Also SU moves scrolled out lines to scroll buffer, SD only adds new lines at the top.

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/SD](http://vt100.net/docs/vt510-rm/SD)  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>Array</code> | one numerical parameter (defaults to 1 even if 0 is given) |

<a name="module_node-ansiterminal.AnsiTerminal+SU"></a>

#### ansiTerminal.SU
SU - Scroll Up (Pan Down) - CSI Pn S
Scrolled out lines go into the scroll buffer.

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/SU](http://vt100.net/docs/vt510-rm/SU)  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>Array</code> | one numerical parameter (defaults to 1 even if 0 is given) |

<a name="module_node-ansiterminal.AnsiTerminal+REP"></a>

#### ansiTerminal.REP
REP - Repeat the preceding graphic character P s times (REP) - CSI Ps b

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+NEL"></a>

#### ansiTerminal.NEL
NEL - Next Line - ESC E

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/NEL](http://vt100.net/docs/vt510-rm/NEL)  
<a name="module_node-ansiterminal.AnsiTerminal+NEL"></a>

#### ansiTerminal.NEL
IND - Index - ESC D

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/NEL](http://vt100.net/docs/vt510-rm/NEL)  
<a name="module_node-ansiterminal.AnsiTerminal+VPR"></a>

#### ansiTerminal.VPR
VPR - Vertical Position Relative - CSI Pn e

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/VPR](http://vt100.net/docs/vt510-rm/VPR)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+HPR"></a>

#### ansiTerminal.HPR
HPR - Horizontal Position Relative - CSI Pn a

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/HPR](http://vt100.net/docs/vt510-rm/HPR)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+HPA"></a>

#### ansiTerminal.HPA
HPA - Horizontal Position Absolute - CSI Pn '

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/HPA](http://vt100.net/docs/vt510-rm/HPA)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+CBT"></a>

#### ansiTerminal.CBT
CBT - Cursor Backward Tabulation - CSI Pn Z

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/CBT](http://vt100.net/docs/vt510-rm/CBT)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+CHT"></a>

#### ansiTerminal.CHT
CHT - Cursor Horizontal Forward Tabulation - CSI Pn I

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/CHT](http://vt100.net/docs/vt510-rm/CHT)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+CPL"></a>

#### ansiTerminal.CPL
CPL - Cursor Previous Line - CSI Pn F

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/CPL](http://vt100.net/docs/vt510-rm/CPL)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+CNL"></a>

#### ansiTerminal.CNL
CNL - Cursor Next Line - CSI Pn E

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/CNL](http://vt100.net/docs/vt510-rm/CNL)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+DL"></a>

#### ansiTerminal.DL
DL - Delete Line - CSI Pn M

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/DL](http://vt100.net/docs/vt510-rm/DL)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+ICH"></a>

#### ansiTerminal.ICH
ICH - Insert Character - CSI Pn @

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/ICH](http://vt100.net/docs/vt510-rm/ICH)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+VPA"></a>

#### ansiTerminal.VPA
VPA - Vertical Line Position Absolute - CSI Pn d

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/VPA](http://vt100.net/docs/vt510-rm/VPA)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+ECH"></a>

#### ansiTerminal.ECH
ECH - Erase Character - CSI Pn X

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/ECH](http://vt100.net/docs/vt510-rm/ECH)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+IL"></a>

#### ansiTerminal.IL
IL - Insert Line - CSI Pn L

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/IL](http://vt100.net/docs/vt510-rm/IL)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+DECSTBM"></a>

#### ansiTerminal.DECSTBM
DECSTBM - Set Top and Bottom Margins - CSI Pt ; Pb r

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**Note**: currently broken  
**See**: [http://vt100.net/docs/vt510-rm/DECSTBM](http://vt100.net/docs/vt510-rm/DECSTBM)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+DECSTR"></a>

#### ansiTerminal.DECSTR
DECSTR - Soft Terminal Reset - CSI ! p

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/DECSTR](http://vt100.net/docs/vt510-rm/DECSTR)  
<a name="module_node-ansiterminal.AnsiTerminal+RI"></a>

#### ansiTerminal.RI
RI - Reverse Index - ESC M

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
<a name="module_node-ansiterminal.AnsiTerminal+DECSC"></a>

#### ansiTerminal.DECSC
DECSC - Save Cursor - ESC 7

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/DECSC](http://vt100.net/docs/vt510-rm/DECSC)  
<a name="module_node-ansiterminal.AnsiTerminal+DECRC"></a>

#### ansiTerminal.DECRC
DECRC - Restore Cursor - ESC 8

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/DECRC](http://vt100.net/docs/vt510-rm/DECRC)  
<a name="module_node-ansiterminal.AnsiTerminal+CHA"></a>

#### ansiTerminal.CHA
CHA - Cursor Horizontal Absolute - CSI Pn G

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/CHA](http://vt100.net/docs/vt510-rm/CHA)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+CUB"></a>

#### ansiTerminal.CUB
CUB - Cursor Backward - CSI Pn D

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/CUB](http://vt100.net/docs/vt510-rm/CUB)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+CUD"></a>

#### ansiTerminal.CUD
CUD - Cursor Down - CSI Pn B

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/CUD](http://vt100.net/docs/vt510-rm/CUD)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+CUF"></a>

#### ansiTerminal.CUF
CUD - Cursor Forward - CSI Pn C

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/CUF](http://vt100.net/docs/vt510-rm/CUF)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+CUU"></a>

#### ansiTerminal.CUU
CUD - Cursor Up - CSI Pn A

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/CUU](http://vt100.net/docs/vt510-rm/CUU)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+CUP"></a>

#### ansiTerminal.CUP
CUP - Cursor Position - CSI Pl ; Pc H

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/CUP](http://vt100.net/docs/vt510-rm/CUP)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+DCH"></a>

#### ansiTerminal.DCH
DCH - Delete Character - CSI Pn P

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/DCH](http://vt100.net/docs/vt510-rm/DCH)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+ED"></a>

#### ansiTerminal.ED
ED - Erase in Display - CSI Ps J

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/ED](http://vt100.net/docs/vt510-rm/ED)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+EL"></a>

#### ansiTerminal.EL
EL - Erase in Line - CSI Ps K

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/EL](http://vt100.net/docs/vt510-rm/EL)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.AnsiTerminal+SGR"></a>

#### ansiTerminal.SGR
SGR - Select Graphic Rendition - CSI Ps ; Ps ... m

**Kind**: instance property of <code>[AnsiTerminal](#module_node-ansiterminal.AnsiTerminal)</code>  
**See**: [http://vt100.net/docs/vt510-rm/SGR](http://vt100.net/docs/vt510-rm/SGR)  

| Param |
| --- |
| params | 

<a name="module_node-ansiterminal.wcswidth"></a>

### ansiterminal.wcswidth(s) ⇒ <code>number</code>
Calculate print space of a string. The returned number denotes the taken
halfwidth space.

**Kind**: static method of <code>[node-ansiterminal](#module_node-ansiterminal)</code>  
**Returns**: <code>number</code> - halfwidth length of the string  
**Note**: Terminals and fonts may behave differently for some codepoints since unicode
         knows more widths than half- and fullwidth.  

| Param | Type | Description |
| --- | --- | --- |
| s | <code>string</code> | single character or string |

**Example**  
```js
> var wcswidth = require('node-ansiterminal').wcswidth
undefined
> wcswidth('￥￥￥￥￥')
10
```
<a name="module_node-ansiterminal.get_color"></a>

### ansiterminal.get_color(value) ⇒ <code>string</code>
Default color mapper function with xterm colorset in white on black.

**Kind**: static method of <code>[node-ansiterminal](#module_node-ansiterminal)</code>  
**Returns**: <code>string</code> - hex color string  

| Param |
| --- |
| value | 

<a name="module_node-ansiterminal..TColors"></a>

### ansiterminal~TColors : <code>Object</code>
**Kind**: inner typedef of <code>[node-ansiterminal](#module_node-ansiterminal)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| set | <code>boolean</code> | true if color is set |
| RGB | <code>boolean</code> | true if color is in RGB mode |
| color | <code>array</code> | [R, G, B] or [color value, unused, unused] |

<a name="module_node-ansiterminal..TAttributes"></a>

### ansiterminal~TAttributes : <code>Object</code>
**Kind**: inner typedef of <code>[node-ansiterminal](#module_node-ansiterminal)</code>  
**Properties**

| Name | Type |
| --- | --- |
| bold | <code>boolean</code> | 
| italic | <code>boolean</code> | 
| underline | <code>boolean</code> | 
| blink | <code>boolean</code> | 
| inverse | <code>boolean</code> | 
| conceal | <code>boolean</code> | 
| foreground | <code>[TColors](#module_node-ansiterminal..TColors)</code> | 
| background | <code>[TColors](#module_node-ansiterminal..TColors)</code> | 

<a name="module_node-ansiterminal..TJSONColors"></a>

### ansiterminal~TJSONColors : <code>Object</code>
**Kind**: inner typedef of <code>[node-ansiterminal](#module_node-ansiterminal)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| mode | <code>string</code> | '256' or 'RGB' |
| color | <code>number</code> &#124; <code>array</code> | [R, G, B] for 'RGB' mode |

<a name="module_node-ansiterminal..TJSONAttributes"></a>

### ansiterminal~TJSONAttributes : <code>Object</code>
**Kind**: inner typedef of <code>[node-ansiterminal](#module_node-ansiterminal)</code>  
**Properties**

| Name | Type |
| --- | --- |
| bold | <code>boolean</code> | 
| italic | <code>boolean</code> | 
| underline | <code>boolean</code> | 
| blink | <code>boolean</code> | 
| inverse | <code>boolean</code> | 
| conceal | <code>boolean</code> | 
| foreground | <code>[TJSONColors](#module_node-ansiterminal..TJSONColors)</code> &#124; <code>false</code> | 
| background | <code>[TJSONColors](#module_node-ansiterminal..TJSONColors)</code> &#124; <code>false</code> | 

<a name="module_node-ansiterminal..JSONTRow"></a>

### ansiterminal~JSONTRow : <code>Object</code>
**Kind**: inner typedef of <code>[node-ansiterminal](#module_node-ansiterminal)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| string | <code>string</code> | sub string |
| width | <code>width</code> | print space of string |
| attributes | <code>[TJSONAttributes](#module_node-ansiterminal..TJSONAttributes)</code> | text attributes |

