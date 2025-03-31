# LocoBasic - Light version of Locomotive BASIC

LocoBasic is a streamlined adaptation of Locomotive BASIC, designed primarily for calculations.
It is lightweight and can run either in a browser or on the command line using Node.js.
It has **NO GOTO** but supports a subroutine style with *GOSUB*.
Line numbers are optional and only needed to start a subroutine or a *DATA* line for *RESTORE*.

LocoBasic Links:
[LocoBasic](https://benchmarko.github.io/LocoBasic/),
[Source code](https://github.com/benchmarko/LocoBasic/),
[HTML Readme](https://github.com/benchmarko/LocoBasic/#readme)

## Getting Started

### Running in a Browser

1. Open [LocoBasic](https://benchmarko.github.io/LocoBasic/) in any modern web browser.
2. Select an example with the select box or input your own BASIC code.
   The code is automatically compiled to JavaScript and executed unless you switch off the "auto" checkbox.

### Running with Node.js

1. Install Node.js if you don’t already have it.
2. Clone this repository and navigate to its directory.
3. Run the following commands to install:

   ```bash
   npm i
   npm run build
   ```

4. Run some of the following commands to execute:

   ```bash
   node dist/locobasic.js example=euler
   node dist/locobasic.js input='PRINT "Hello!"'
   node dist/locobasic.js input="?3 + 5 * (2 - 8)"
   node dist/locobasic.js grammar=strict...  [strict mode: keywords must be uppercase, variables must start with a lowercase character]

   npx ts-node dist/locobasic.js input='PRINT "Hello!"' action='compile' > hello1.js
   node hello1.js
   ```

## LocoBasic Language Description

Keywords should be all uppercase, but all lowercase is also accepted (not-strict mode).

### Control Structures

- **Supported:**
  - `IF...ELSE`
  - Loops: `FOR` and `WHILE`
- These structures are directly converted to JavaScript for execution.

### Subroutines

- Use `GOSUB` and `ON GOSUB`
  - `GOTO` and `ON GOTO` are **not supported**

- **Subroutine Style:**
  - A line starting with `GOSUB <line>` marks the beginning of a subroutine.
  - Subroutines must end with a single `RETURN` on its own line.
  - **Important:** Subroutines cannot be nested.

### Variable Types

- Case does not matter (strict mode: must start with lower case).
- Usually number.
- Use `$` to denote a string variable.
  - Variable markers like `!` and `%` are **not supported**.
- **No automatic rounding:**
  - Integer parameters are not automatically rounded.
- Computations follow JavaScript precision.
- Operator arity and precedence match those of Locomotive BASIC.

### Special Notes

- **Endless Loops**
  - Not trapped automatically. Restarting the browser window may be required to recover.
- **STOP and END**
  - These stop execution, but only at the top level. Within subroutines, they simply return.
  - During *FRAME* or *INKEY$*, the "Stop" button gets active. It allows to terminate the running program. It is not possible to continue a terminated program.
- **PEN and PAPER**
  - When using node.js in a terminal, ANSI colors are used.
- **GRAPHICS PEN, DRAW, DRAWR, MOVE, MOVER, PLOT, PLOTR, TAG (and PRINT), |CIRCLE, |RECT**
  - These can be used to create [Scalable Vector Graphics](https://developer.mozilla.org/en-US/docs/Web/SVG) (SVG), which can be exported with the "SVG" button. Graphics is separate from text.
- **FRAME**
  - Text and graphics output is buffered until it is flushed with *FRAME* or at the end of the progam.
  - To start a new graphical output after *FRAME*, use *CLS* or *MODE*.

### Operators

- `AND`, `NOT`, `OR`, `XOR`
- `number MOD number` Compute the modulus.
- Comparisons: =, <>, <, <=, >, >=
- +, -, *, /, \ (integer div), (...)
- &hexValue, &xBinaryValue
- String concatenation: +

### Supported Commands and Functions

- `ABS(number)` Returns the absolute value of *number*.
- `ASC(character)` Returns the ASCII number of *character*.
- `ÀTN(number)` Returns the arctangent of the given *number*.
  - The returned value is in radians (when *RAD* is active) or in degrees (when *DEG* is active).
- `BIN$(number [, padding])` Converts a number to its binary representation.
- `CHR$(number)` Returns the character for the ASCII code *number*.
- `CINT(number)` Returns the integer part of *number*.
  - Same as *INT*.
- `CLS` Clears the output window.
  - **Note:** In LocoBasic, *PEN*, *PAPER*, *GRAPHICS PEN*, *TAG* are also initialized.
- `COS(number)` Returns the cosine of the given *number*.
  - *number* should be in radians (when *RAD* is active) or in degrees (when *DEG* is active).
- `DATA ["string", number,...]` Defines string or numerical data to be read by *READ*.
  - Separated by commas ",".
  - Strings must be quoted.
  - Numbers (including hex and binary) are unquoted and can only be read numerically.
- `DEC$(number, format)` Returns the number as a string formatted according to the specified pattern.
  - Only "#" and "." are supported in the format (no extra characters). Example: "##.###".
  - No overflow warning.
- `DEF FNname[(arg1, ...)] = expression` Defines a function *FNname*.
  - Can be used as `FNname()`.
  - No space between *FN* and *name* is allowed.
  - If there are no arguments, do not use parentheses.
- `DEG` Switch to degrees mode for *ATN*, *COS*, *SIN*, *TAN*.
  - **Note:** In LocoBasic, the flag is used at compile time starting from its lexical position and not dynamically during execution. Therefore, it is recommended to place it at the top of the code.
- `DIM arrayVariable(dim1 [, dim2, ...])` Initializes an array.
  - Can be multi-dimensional.
  - Elements will be initialized with 0 or "" depending on the variable type.
  - **Note:** In LocoBasic, array variables cannot have the same name as normal variables.
    So it is not possible to have variable "a" and "a[]" at the same time.
- `DRAW x,y`: Draw a line to position x,y.
- `DRAWR x,y`: Draw a line relative with offset x,y.
- `END` Ends execution.
  - Currently the same as `STOP`.
- `ERASE variable, [variable,...]` Erases array variables.
  - Specify variable name without indices.
- `ERROR number` Throws an error with *number*.
- `EXP(number)` Returns e raised to the power of *number*.
- `FIX(number)` Truncates *number*.
- `FOR variable = start to end [STEP increment]` Control structure.
  - *increment* can also be negative, in which case *start* must be greater than *end*.
  - **Endless Loops:** Not trapped.
- `FRAME` Pauses execution for ~50ms intervals for synchronization.
  - This command will also flush text and graphical output.
- `GOSUB line` Calls subroutine starting at *line*.
  - Subroutines must end with a single `RETURN` on its own line.
- `GRAPHICS PEN number` Sets the graphics pen.
- `HEX$(number [, padding])` Converts a number to its hexadecimal representation.
- `IF expression THEN statements [ELSE statements]` control structure (in one line).
- `INK pen,color` Sets the color (0..27) for PEN pen and GRAPHICS PEN pen.
  - **Note:** In LocoBasic, only following drawings get the new ink, existing drawings are not modified.
- `INKEY$`: Gets the pressed character from the key buffer or an empty string if the buffer is empty.
- `INPUT [message;] variable` Prompts the user for input (string or numeric).
- `INSTR([startPos,] string1, string2)` Returns the first position of *string2* in *string1*, starting at optional *startPos*.
- `INT(number)` Returns the integer part of *number*.
- `LEFT$(string, number)` Returns *number* characters from the left of *string*.
- `LEN(string)` Returns the length of the string.
  - LocoBasic has no limitation on the length.
- `LOG(number)` Returns natural logarithm for *number* (based on e).
- `LOG10(number)` Returns logarithm for *number* based on 10.
- `LOWER$(string)` Returns the string in lowercase.
- `MAX(number [,number,...])` Returns the maximum of the given numbers.
- `MID$(string, first [, length])` Returns a substring starting at position *first* with *length*.
- `MIN(number [,number,...])` Returns the minimum of the given numbers.
- `MODE number` Sets the screen mode (0..3).
  - Nearly the same as *CLS*. For graphical output, it sets the stroke width.
- `MOVE x,y`: Move the graphical cursor to position x,y.
- `MOVER x,y`: Move the graphical cursor relative with offset x,y.
- `NEXT` Closes a *FOR* loop.
- `ON index GOSUB line1 [,line2...]` Calls subroutine at position *index* (1-based) in the list.
  - Check `GOSUB` for how to define a subroutine.
  - If no subroutine matches the index, do nothing.
- `ORIGIN x,y` Sets the origin of the coordinate system for graphical output.
- `PAPER number` Sets the background color for the text output with *PRINT*.
- `PEN number` Sets the color for the text output with *PRINT*.
  - For the terminal, [ANSI escape codes](https://en.wikipedia.org/wiki/ANSI_escape_code#Colors) for colors are used.
- `PI` Returns the value of 'pi'.
- `PLOT x,y`: Plot a point at position x,y.
- `PLOTR x,y`: Plot a point relative with offset x,y.
- `PRINT argument1 [; argument2; ...]` Outputs text and numbers.
  - Arguments must be separated by `;`.
  - Numbers are padded with trailing space, and leading space for positive numbers.
  - **Limitations:** No support for `TAB()`, `SPC()`. Formatting with `USING` only for one number as with `DEC$()`. No additional characters in the format string.
  - When *TAG* is active, it creates [SVG text](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/text).
- `RAD` Switch to radians mode (default) for *ATN*, *COS*, *SIN*, *TAN*.
  - **Note:** In LocoBasic, the flag is used at compile time starting from its lexical position and not dynamically during execution.
- `READ variable` Reads the next value from a `DATA` statement into *variable*.
- `REM` A comment until end of line, same as "'".
- `RESTORE [line]` Resets the `DATA` pointer to a specified *line* number.
- `RETURN` Returns from a subroutine.
  - See *GOSUB*, *ON... GOSUB*.
- `RIGHT$(string, number)` Returns *number* characters from the right of *string*.
- `RND[(number)]` Returns the next pseudo-random number.
  - Parameter *number* is ignored.
- `ROUND(number [, decimalPlaces])` Rounds a number to a specified number of decimal places.
  - Rounding not exactly the same as in Locomotive BASIC.
- `SGN(number)` Returns the signum of a number (-1, 0, or 1).
- `SIN(number)` Returns the sine of the given *number*.
  - *number* should be in radians (when *RAD* is active) or in degrees (when *DEG* is active).
- `SPACE$(number)` Returns *number* spaces.
- `SQR(number)` Returns the square root of *number*.
- `STOP` Halts the execution.
  - Within subroutines, it functions as a *RETURN*.
  - Similar to *END*.
- `STR$(number)` Converts a number to its string representation.
  - A positive number is prefixed with a space.
- `STRING$(number, character | ASCIInumber)` Returns *character* (or `CHR$(ASCIInumber)`) repeated *number* times.
- `TAG` Activates text at graphics mode. PRINT uses graphics cursor position and graphics color.
- `TAGOFF` Deactivates text at graphics mode. Uses text at text positons with text pen again.
- `TAN(number)` Returns the tangent of the given *number*.
  - *number* should be in radians (when *RAD* is active) or in degrees (when *DEG* is active).
- `TIME` Returns the current system time in 1/300 sec.
- `UPPER$(string)` Converts the string to uppercase.
- `VAL(string)` Converts a string to a number.
  - Supports hexadecimal and binary formats.
- `WEND` Ends a *WHILE* loop.
- `WHILE expression` Control structure: repeats until *expression* is false.
- `number XOR number` In expressions: exclusive-OR.

### Resident System Extensions (RSX)

- `|CIRCLE x,y,radius` Draws a circle, creating shape [SVG circle](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/circle).
- `|RECT,x0,y0,x1,y1` Draws a rectangle, creating shape [SVG rect](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/rect).

### TODO

- Do we want keywords all uppercase? And variables all lowercase?
  And maybe new features with capital letter? E.g. If...Then...Else...Endif on multiple lines?

### Done

- numbers with exponential notation
- *DIM* and other more complex commands are included on-demand in the compiled JavaScript
- TIME: *300/1000
- DIM, NEXT with multiple arguments
- DATA, READ, RESTORE
- comments in IF: 107 IF zoom<3 THEN zoom=3: 'zoom=12
- No JS reserved word as variables: arguments, await, [break], case, catch, class, const, continue, debugger, default, delete, do,
 [else], enum, eval, export, extends, false, finally, [for], function, [if], implements, import, in, instanceof, interface, [let], [new], null,
  package, private, protected, public, [return], static, super, switch, this, throw, true, try, typeof, var, void, [while], with, yield
<https://www.w3schools.com/js/js_reserved.asp>
- ?hex$("3") => array hex$["3"]
- load examples.js separately (not as examples.ts in the package)
- separate UI from core (UI not needed for node), maybe two packages
- `ERASE var | strVar` sets `var=0; strVar=""`, not really needed, just to run such programs
- `MID$` as assign? `a$="abcde": MID$(a$,3,2)="w": ?a$`
- command line tool should output a stand alone running JS file for node
- Create syntax highlighting for BASIC with CodeMirror, maybe similar to the [amstradbasic-vscode](https://github.com/dfreniche/amstradbasic-vscode/blob/master/syntaxes/amstradbasic.tmLanguage.json) or [CPCReady](https://marketplace.visualstudio.com/items?itemName=CPCReady.basic-language-extension) extension

### Not implemented

after auto border break call cat chain clear clg closein closeout cont copychr$
 creal cursor defint defreal defstr delete derr di edit ei eof erl err every fill fre
 goto graphicsPaper himem inkey inp joy key let line list load locate mask memory merge new
 on openin openout out peek poke pos randomize release remain renum resume run
 save sound spc speed sq swap symbol tab test testr troff tron unt vpos wait width window write xpos ypos zone

### Resources

- [Ohm](https://ohmjs.org/) JavaScript parsing toolkit - [Source code](https://github.com/ohmjs/ohm) - Paper: [Modular Semantic Actions](https://ohmjs.org/pubs/dls2016/modular-semantic-actions.pdf)

- [CodeMirror](https://codemirror.net/5/) code editor used for the LocoBasic UI -
[Source code](https://github.com/codemirror/codemirror5) -
[cdnjs Libraries](https://cdnjs.com/libraries/codemirror)

- [CPCBasicTS](https://benchmarko.github.io/CPCBasicTS/) CPCBasicTS Unchained - Run CPC BASIC in a Browser - [Source code](https://github.com/benchmarko/CPCBasicTS/)

- [CPCBasic](https://benchmarko.github.io/CPCBasic/) CPCBasic Unchained - Run CPC BASIC in a Browser - [Source code](https://github.com/benchmarko/CPCBasic/)

- [CPCemu](http://www.cpc-emu.org/) - CPC Emulator, since version 2.0 with very accurate emulation

- [Amstrad CPC 6128 User Instructions](http://www.cpcwiki.eu/manuals/AmstradCPC6128-hypertext-en-Sinewalker.pdf), or:
  [Schneider CPC 6128 Benutzerhandbuch](https://acpc.me/ACME/MANUELS/[DEU]DEUTSCH(GERMAN)/CPC6128_SCHNEIDER[DEU]_Erste_Ausgabe_1985[OCR].pdf)

- [Locomotive BASIC](https://www.cpcwiki.eu/index.php/Locomotive_BASIC) - Description of the CPC Basic Dialect

- Another BASIC compiler: [ugBASIC](https://ugbasic.iwashere.eu/target/cpc#examples)

### **mv, 02/2025**
