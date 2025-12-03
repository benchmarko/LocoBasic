# LocoBasic - Light version of Locomotive BASIC

LocoBasic is a streamlined adaptation of Locomotive BASIC, designed primarily for calculations.
It is lightweight and can run either in a browser or on the command line using Node.js.
It does not support *GOTO* but allows a subroutine style using *GOSUB*.
Line numbers are optional and are only required to start a subroutine or a *DATA* line for *RESTORE*.

LocoBasic Links:
[LocoBasic](https://benchmarko.github.io/LocoBasic/),
[Source code](https://github.com/benchmarko/LocoBasic/),
[HTML Readme](https://github.com/benchmarko/LocoBasic/#readme)

## Getting Started

LocoBasic can be run in a browser or as a Node.js application.

### Running in a Browser

1. Open [LocoBasic](https://benchmarko.github.io/LocoBasic/) in any modern web browser.
2. Select an example from the dropdown menu or input your own BASIC code.
   The code is automatically compiled to JavaScript and executed unless you disable the *Auto compile* or *Auto execute* options.

- When you change the UI (e.g., select an example or show/hide text editors), the URL is updated to reflect the new state.
  This allows you to reload the page to start the app with the modified state.

### Running with Node.js

1. Install Node.js if you don’t already have it.
2. Clone this repository and navigate to its directory.
3. Use the following commands to install:

   ```bash
   npm i
   npm run build
   ```

4. Examples of commands to execute:

   ```bash
   node dist/locobasic.js example=euler
   node dist/locobasic.js input='PRINT "Hello!"'
   node dist/locobasic.js input="?3 + 5 * (2 - 8)"
   node dist/locobasic.js example=binary database=rosetta databaseDirs=examples,https://benchmarko.github.io/CPCBasicApps/rosetta
   node dist/locobasic.js grammar=strict ... (strict mode: see below)
   ```

   This command compiles the input code into a standalone JavaScript file which can output text:

   ```bash
   npx ts-node dist/locobasic.js input='PRINT "Hello!"' action='compile' > hello1.js
   node hello1.js
   ```

## LocoBasic Language Description

- Keywords (control structures, commands, and functions) should be in uppercase, but lowercase is also accepted.

### Control Structures

- **Supported:**
  - `IF...THEN...ELSE`
  - Loops: `FOR`...`NEXT` and `WHILE`...`WEND`
- These structures are directly converted to JavaScript for execution.

### Subroutines

- Use `GOSUB` and `ON <i> GOSUB` to call a subroutine.
  - `GOTO` and `ON <i> GOTO` are **not supported**.

- **Subroutine Style**
  - A line starting with `GOSUB <line>` marks the beginning of a subroutine.
  - Subroutines must end with a single `RETURN` on its own line.

### Numbers

- Usually in decimal format.
- Also hexadecimal `&<hexValue>` and binary `&x<BinaryValue>`

### Variables and Types

- Variable names should start with a lowercase character (uppercase is also supported if strict mode is not enabled).
- Usually it stores a number.
  - Computations follow JavaScript precision.
  - Operator arity and precedence match those of Locomotive BASIC.
  - Integer parameters are not automatically rounded.
- Append `$` to denote a string variable.
  - Variable markers like `!` and `%` are **not supported**.
- Append `(n[, n2, ...])` for an array variable with indices.
  - Array variables with the same name as normal variables are **not supported**.
  - Do not use spaces between the variable name and parentheses.

### Special Notes

- **Endless Loops**
  - The compiled code runs in a Web Worker or Worker Thread. The "Reset" button terminates the Web Worker and also an endless loop.
- **STOP and END**
  - these commands stop execution, but only at the top level. Within subroutines, they simply return.
  - During *FRAME*, *INKEY$* or *INPUT*, the "Stop" button gets active. It allows you to terminate the running program. It is not possible to continue a terminated program.
- **PEN and PAPER**
  - When using node.js in a terminal, ANSI colors are used.
- **GRAPHICS PEN, DRAW, DRAWR, MOVE, MOVER, PLOT, PLOTR, TAG (and PRINT), |ARC, |CIRCLE, |ELLIPSE, |RECT**
  - These can be used to create [Scalable Vector Graphics](https://developer.mozilla.org/en-US/docs/Web/SVG) (SVG), which can be exported with the "SVG" button. Graphics are separate from text.
- **FRAME**
  - Text and graphics output is buffered until it is flushed with *FRAME* (or *INKEY$*, *INPUT*) or at the end of the program.
  - To start new graphical output after *FRAME*, use *CLS* or *MODE*.

### Operators and Expressions

- `AND`, `NOT`, `OR`, `XOR`
- `number MOD number` Compute the modulus.
- Comparisons: `=`, `<>`, `<`, `<=`, `>`, `>=`
- `+`, `-`, `*`, `/`, `\` (integer division),
- Use parentheses to group expressions: `(`...`)`
- String concatenation: `+`

### Supported Commands and Functions

- `ABS(number)` Returns the absolute value of *number*.
- `AFTER timeout [, timer] GOSUB line` Calls subroutine line after timeout*20 msec (timeout 1/50 sec).
  - An optional *timer* can be 0..3. (Priorities are not implemented in LocoBasic.)
- `ASC(character)` Returns the ASCII code of *character*.
- `ATN(number)` Returns the arctangent of the given *number*.
  - The returned value is in radians (*RAD*) or degrees (*DEG*), depending on the active mode.
- `BIN$(number [, padding])` Converts a number to its binary representation.
- `CHR$(number)` eturns the character corresponding to the ASCII code number.
- `CINT(number)` Returns the integer part of *number*.
  - Same as *INT*.
- `CLEAR INPUT` Clear the key input buffer for *INKEY$*
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
  - There is no overflow warning.
- `DEF FNname[(arg1, ...)] = expression` Defines a function *FNname*.
  - Can be used as `FNname()` or `FN name()`.
  - If there are no arguments, do not use parentheses.
- `DEG` Switches to degrees mode for *ATN*, *COS*, *SIN*, *TAN*.
  - **Note:** In LocoBasic, the flag is used at compile time starting from its lexical position and not dynamically during execution. Therefore, it is recommended to place it at the top of the code.
- `DIM arrayVariable(dim1 [, dim2, ...])` Initializes an array.
  - Arrays can be multi-dimensional.
  - Elements will be initialized with 0 or "" depending on the variable type.
  - **Note:** In LocoBasic, array variables cannot have the same name as normal variables.
    So it is not possible to have variable "a" and "a()" at the same time.
- `DRAW x,y`: Draw a line to position x,y.
- `DRAWR x,y`: Draw a line relative with offset x,y.
- `END` Ends execution.
  - This is currently the same as `STOP`.
- `ERASE variable, [variable,...]` Erases array variables.
  - Specify variable name without indices.
- `ERROR number` Throws an error with *number*.
- `EVERY timeout [, timer] GOSUB line` Calls subroutine line in intervals of timeout*20 msec (timeout 1/50 sec).
  - An optional *timer* can be 0..3. (Priorities are not implemented in LocoBasic.)
- `EXP(number)` Returns e raised to the power of *number*.
- `FIX(number)` Truncates *number*.
- `FOR variable = start to end [STEP increment]` Control structure.
  - *increment* can also be negative, in which case *start* must be greater than *end*.
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
- `INPUT [message;] variable [, variable, ...]` Prompts the user for input (string or numeric).
  - The input is split at "," and the parts are assigned to multiple variables
  - **Note:** Currently the variables must have the same type.
- `INSTR([startPos,] string1, string2)` Returns the first position of *string2* in *string1*, starting at optional *startPos*.
- `INT(number)` Returns the integer part of *number*.
- `LEFT$(string, number)` Returns *number* characters from the left of *string*.
- `LEN(string)` Returns the length of the string.
  - LocoBasic has no limitation on the length.
- `LINE INPUT [message;] variable` Prompts the user for a line of input (string).
- `LOG(number)` Returns natural logarithm for *number* (based on e).
- `LOG10(number)` Returns logarithm for *number* based on 10.
- `LOWER$(string)` Returns the string in lowercase.
- `MAX(number [,number,...])` Returns the maximum of the given numbers.
- `MID$(string, first [, length])` Returns a substring starting at position *first* with *length*.
- `a$="abcde": MID$(a$,position,length)="w"` When assigning a string to *MID$*, it modifies the string variable at the given position.
- `MIN(number [,number,...])` Returns the minimum of the given numbers.
- `MODE number` Sets the screen mode (0..3).
  - Nearly the same as *CLS*. For graphical output, it sets the stroke width.
- `MOVE x,y`: Move the graphical cursor to position x,y.
- `MOVER x,y`: Move the graphical cursor relative with offset x,y.
- `NEXT [variable]` Closes a *FOR* loop. The optional variable is ignored.
  - Multiple variables are **not supported**. This allows to find matching *FOR* and *NEXT* already during the syntax check.
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
- `POS(#0)`: Returns the current x-position of text output (supports only stream 0).
- `PRINT argument1 [; argument2; ...]` Outputs text and numbers.
  - Numbers are padded with trailing space, and leading space for positive numbers.
  - Arguments can be separated by `;`.
  - The comma operator `,` moves to the next tab position defined by *ZONE*, `TAB(n)` moves to position *n* (only increasing), and `SPC(n)` prints n spaces.
  - Lines can have any length, no automatic newline is inserted.
  - When *TAG* is active, it creates [SVG text](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/text).
  - **Limitations:** Formatting with `USING` only for one number as with `DEC$()`. No additional characters in the format string.
- `RAD` Switches to radians mode (default) for *ATN*, *COS*, *SIN*, *TAN*.
  - **Note:** In LocoBasic, the flag is used at compile time starting from its lexical position and not dynamically during execution.
- `READ variable` Reads the next value from a `DATA` statement into *variable*.
- `REM` A comment until end of line, same as "'".
- `REMAIN(0)` Clears a running timer started with *AFTER* or *EVERY*. Returns timer ID (on a CPC it returns remaining time)
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
- `SPC(number)` In *PRINT*, outputs *number* spaces before the next argument.
- `SQR(number)` Returns the square root of *number*.
- `STOP` Halts the execution.
  - Within subroutines, it functions as a *RETURN*.
  - Similar to *END*.
- `STR$(number)` Converts a number to its string representation.
  - A positive number is prefixed with a space.
- `STRING$(number, character | ASCIInumber)` Returns *character* (or `CHR$(ASCIInumber)`) repeated *number* times.
- `TAB(number)` In *PRINT*, outputs the next argument at position *number*.
- `TAG` Activates text at graphics mode. *PRINT* uses graphics cursor position and graphics color.
- `TAGOFF` Deactivates text at graphics mode. *PRINT* uses text at text positions with text pen again.
- `TAN(number)` Returns the tangent of the given *number*.
  - *number* should be in radians (when *RAD* is active) or in degrees (when *DEG* is active).
- `TIME` Returns the current system time in 1/300 sec.
- `UPPER$(string)` Converts the string to uppercase.
- `VAL(string)` Converts a string to a number.
  - Supports hexadecimal and binary formats.
- `VPOS(#0)`: Returns the current vertical position / y-position of text output (supports only stream 0).
- `WEND` Ends a *WHILE* loop.
- `WHILE expression` Control structure: Repeats until *expression* evaluates to false.
- `XPOS` Returns the x-pos of the current graphical cursor position.
- `YPOS` Returns the y-pos of the current graphical cursor position.
- `number XOR number` In expressions: exclusive-OR.
- `ZONE number` Sets the tab zone for the comma operator in *PRINT* (default: 13)

Notes:

- Do not use spaces between the function name and parentheses.
- Other commands, functions, or extensions known from Locomotive BASIC are not supported and will produce a syntax error.

### Resident System Extensions (RSX)

- These are extensions to LocoBasic but can also be implemented on a real CPC with Z80 code.

- `|ARC,x,y,rx,ry,angle,large-arc-flag,sweep-flag,x,y[,fillPen]` Draws an arc curve, creating shape [SVG Elliptical arc curve](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/d#elliptical_arc_curve).
- `|CIRCLE.cx,cy,r[,fillPen]` Draws a circle, creating shape [SVG circle](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/circle).
- `d$=SPACE$(11): |DATE,@d$` Returns a date string in the format "ww DD MM YY" (ww=day of week) from the Real Time Clock (RTC). Use the address operator `@` to denote that the result of the RSX command should be written in the variable.
  See also: [Dobbertin Smart Watch](https://www.cpcwiki.eu/index.php/Dobbertin_Smart_Watch)
- `|ELLIPSE.cx,cy,rx,ry[,fillPen]` Draws an ellipse, creating shape [SVG ellipse](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/ellipse).
- `lat=0.0: lon=0.0: |GEOLOCATION,@lat,@lon` Gets the geolocation (if available).
- `|PITCH,n` Sets the speech synthesis pitch (1-20; default: 10)
- `|RECT,x,y,x2,y2[,fillPen]` Draws a rectangle, creating shape [SVG rect](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/rect). See also: *|CIRCLE*.
- `|SAY,"Hello"` Says "Hello" using speech synthesis. See also: *|PITCH*.
- `t$=SPACE$(8): |TIME,@t$` Returns a time string in the format "HH MM SS" from the Real Time Clock (RTC).
  See also: [Dobbertin Smart Watch](https://www.cpcwiki.eu/index.php/Dobbertin_Smart_Watch), *|DATE*.

### Miscellaneous

- Other databases
  - Use the parameter *databaseDirs* to set the list of databases, e.g. to add the Rosetta database:
  `databaseDirs=examples,https://benchmarko.github.io/CPCBasicApps/rosetta`
- Strict mode (strict grammar)
  - Activate: Use the parameter grammar=strict.
  - Keywords and also RSX names must be all uppercase.
  - Variables must start with a lowercase character.

### Not implemented

- The following keywords are not implemented:

 auto border break call cat chain clear clg closein closeout cont copychr$
 creal cursor defint defreal defstr delete derr di edit ei eof erl err fill fre
 goto graphicsPaper himem inkey inp joy key let line list load locate mask memory merge new
 on openin openout out peek poke pos randomize release renum resume run
 save sound spc speed sq swap symbol tab test testr troff tron unt vpos wait width window write zone

- *GOTO*, *ON...GOTO* are not supported.
- Nested subroutines are not supported.
- *LOCATE* is not supported.
- Text windows (*WINDOW*) are not supported.
- Streams using prefix '#' (e.g. *PRINT*, *CLS*, *INPUT*) are not supported.
  - Exception: *POS(#0)*, *VPOS(#0)* with stream 0.
- *AFTER*, *EVERY* support only timer 0 and do not expect a timer parameter.

### History / Done

- numbers with exponential notation
- *DIM* and other more complex commands are included on-demand in the compiled JavaScript.
- *TIME* is now measured with 300 Hz.
- *DIM*, *NEXT* with multiple arguments.
- *DATA*, *READ*, *RESTORE*
- comments in *IF*, e.g. `IF zoom<3 THEN zoom=3: 'zoom=12`.
- JavaScript reserved words as variable names are prefixed with "_" in the compiled JavaScript. Reserved words: arguments, await, [break], case, catch, class, const, continue, debugger, default, delete, do,
 [else], enum, eval, export, extends, false, finally, [for], function, [if], implements, import, in, instanceof, interface, [let], [new], null,
  package, private, protected, public, [return], static, super, switch, this, throw, true, try, typeof, var, void, [while], with, yield
<https://www.w3schools.com/js/js_reserved.asp>
- `HEX$("3")` was converted to an array access: hex$["3"]
- Examples are no longer integrated into the app (examples.ts) but are loaded from a separate examples.js file.
- Code for the UI is separated from the core functionality now. Node.js just needs the core module.
- `ERASE var` initializes the variable again. Usually it is not needed.
- `MID$` as assign? `a$="abcde": MID$(a$,3,2)="w": ?a$`
- command line tool should output a stand alone running JS file for node
- Create syntax highlighting for BASIC with CodeMirror, maybe similar to the [amstradbasic-vscode](https://github.com/dfreniche/amstradbasic-vscode/blob/master/syntaxes/amstradbasic.tmLanguage.json) or [CPCReady](https://marketplace.visualstudio.com/items?itemName=CPCReady.basic-language-extension) extension

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
