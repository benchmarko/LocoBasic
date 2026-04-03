
# LocoBasic

LocoBasic is a lightweight adaptation of **Locomotive BASIC** designed mainly for calculations and simple animations.
Programs are compiled to JavaScript and can run in a **web browser** or **Node.js**.

Main features:

- Simple BASIC dialect inspired by Locomotive BASIC
- Runs in browser or Node.js
- Compiles BASIC to JavaScript
- Designed for numerical calculations with JavaScript performance
- Can also create and animate [Scalable Vector Graphics (SVG)](https://developer.mozilla.org/en-US/docs/Web/SVG)
- `GOTO` is intentionally not supported

## Quick Example

```basic
PRINT "Hello World"
```

Try it here: [LocoBasic](https://benchmarko.github.io/LocoBasic/)

- Select an example from the dropdown menu or input your own BASIC code.
   The code is automatically compiled to JavaScript and executed unless you disable the *Auto compile* or *Auto execute* options.

- When you change the UI (e.g., select an example or show/hide text editors), the URL is updated to reflect the new state.
  This allows you to reload the page to start the app with the modified state.

## Running

Example (Node.js):

```sh
node dist/locobasic.js input='PRINT "Hello"'
```

Other examples:

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

---

## Keyword reference

LocoBasic is a lightweight adaptation of [Locomotive BASIC](https://www.cpcwiki.eu/index.php/Locomotive_BASIC), not all keywords are available.

Not-supported commands, functions and features known from Locomotive BASIC (usually) produce a warning.

Keywords must be written in either all uppercase (preferred) or all lowercase characters.

### Commands

#### AFTER

- `AFTER timeout [, timer] GOSUB line` Calls subroutine *line* after *timeout*\*20 ms (1/50 seconds).
- An optional *timer* can be 0..3. (Priorities are not implemented in LocoBasic.)
- See also: [GOSUB](#gosub), [EVERY](#every), [REMAIN](#remain).

#### CLEAR INPUT

- `CLEAR INPUT` Clear the key input buffer for [INKEY$](#inkey).
- See also: [INKEY$](#inkey).

#### CLS

- `CLS` Clears the output window.
- **Note:** In LocoBasic, [PEN](#pen), [PAPER](#paper), [GRAPHICS PEN](#graphics-pen) and [TAG](#tag) are also initialized.
- See also: [MODE](#mode).

#### DATA

- `DATA ["string", number,...]` Stores literal data values (string or numerical) for [READ](#read).
  - Separated by commas ",".
  - Strings must be quoted.
  - Numbers (including hex and binary) are unquoted and can only be read numerically.
- See also: [READ](#read), [RESTORE](#restore).

#### DEF FN

- `DEF FNname[(arg1, ...)] = expression` Defines a user defiend function *FNname*.
- The defined function can be called as `FNname()` or `FN name()`.
- If there are no arguments, do not use parentheses.
- See also: [FN](#fn).

#### DEFINT

- `DEFINT a` Defines, that (numerical) array variables starting with letter "a" will be integer. - That means, when you use DIM a(num), a typed Int16Array is created instead of an untyped Array.
- **Note:** In LocoBasic, activation of the functionality is determined at compile time starting from its lexical position and not dynamically during execution. Has has only an effect for following *DIM* with one dimension, not on plain variables.
    Do not rely on that the integer will be 16 bit. The implementation may use Int32Array or something else later.

#### DEG

- `DEG` Switches to degrees mode for the functions [ATN](#atn), [COS](#cos), [SIN](#sin) and [TAN](#tan).
- **Note:** In LocoBasic, the flag is used at compile time starting from its lexical position and not dynamically during execution.
- See also: [RAD](#rad).

#### DIM

- `DIM arrayVariable(dim1 [, dim2, ...])` Declares and initializes an array.
- Arrays are zero-based.
- Upper bounds are inclusive.
- Arrays can be multi-dimensional (unlimited dimensions in LocoBasic).
- Elements will be initialized with 0 or "" depending on the variable type.
- **Note:** In LocoBasic, array variables cannot have the same name as normal variables.
  So it is not possible to have variable "a" and "a()" at the same time.
- See also: [ERASE](#erase).

#### DRAW

- `DRAW x, y [, p]`: Draw a line to position x,y with optional [GRAPHICS PEN](#graphics-pen) p.
- See also: [DRAWR](#drawr), [MOVE](#move), [PLOTR](#plot).

#### DRAWR

- `DRAWR x,y [, p]`: Draw a line relative with offset x,y with optional [GRAPHICS PEN](#graphics-pen) p.
- See also: [DRAW](#draw), [MOVER](#mover), [PLOTR](#plotr).

#### ELSE

- `IF expression THEN... ELSE` Optional alternative part of [IF](#if).
- See also: [IF](#if).

#### END

- `END` Ends execution.
  - This is currently the same as [STOP](#stop).

#### ENDIF

- `ENDIF` Ends a multi-line [IF](#if). (Only supported in LocoBasic.)

#### ERASE

- `ERASE variable, [variable,...]` Erases array variables.
  - Specify variable name without indices.

#### ERROR

- `ERROR number` Throws an error with *number*.

#### EVERY

- `EVERY timeout [, timer] GOSUB line` Calls subroutine *line* in intervals of *timeout*\*20 ms (1/50 seconds).
- An optional *timer* can be 0..3. (Priorities are not implemented in LocoBasic.)
- See also: [AFTER](#after), [GOSUB](#gosub), [REMAIN](#remain).

#### FOR

- `FOR variable = start TO end [STEP increment]` Control structure.
- *increment* can also be negative, in which case *start* must be greater than *end*.
- Ended with [NEXT](#next).

#### FRAME

- `FRAME` Pauses execution for (up to) ~50ms intervals for synchronization.
- This command will also flush text and graphical output.

Example to synchronizes execution:

```basic
t = TIME + 50: WHILE TIME < t: FAME: WEND
```

#### GOSUB

- `GOSUB line` Calls subroutine starting at *line*.
- Subroutines must end with a single [RETURN](#return) on its own line.

#### GRAPHICS PEN

- `GRAPHICS PEN number` Sets the graphics pen (0..15)

#### IF

- `IF expression THEN statements [ELSE statements]` control structure (in one line).

#### INK

- `INK pen,color` Sets the *color* (0..27) for [PEN](#pen) *pen* and [GRAPHICS PEN](#graphics-pen) *pen* (0..15).
- **Note:** In LocoBasic, only following drawings get the new color, existing drawings are not modified.
- See also: [PEN](#pen), [GRAPHICS PEN](#graphics-pen).

#### INPUT

- `INPUT [message;] variable [, variable, ...]` Prompts the user for input (string or numeric).
- The input is split at "," and the parts are assigned to multiple variables
- **Note:** Currently the variables must have the same type.
- See also: [LINE INPUT](#line-input).

#### KEY DEF

- `KEY DEF 78,1,k` Creates a user-defined input button for a key with ASCII code *k* on the UI.
- This is only available in LocoBasic and should have "no function" in Locomotive BASIC.
- Other variants of *KEY DEF* (known from Locomotive BASIC) are not supported.
- See example [testkey](https://benchmarko.github.io/LocoBasic/?example=testkey).

#### LINE INPUT

- `LINE INPUT [message;] variable` Prompts the user for a line of input (string).
- See also: [INPUT](#input).

#### MODE

- `MODE number` Sets the screen mode (0..3).
  - Sets the screen mode and clears the output with [CLS](#cls). For graphical output, it sets the stroke width.
- See also: [CLS](#cls).

#### MOVE

- `MOVE x, y [, p]`: Move the graphical cursor to position x,y with optional [GRAPHICS PEN](#graphics-pen) p.
- See also: [DRAWR](#drawr), [MOVER](#mover), [PLOT](#plot).

#### MOVER

- `MOVER x, y [, p]`: Move the graphical cursor relative with offset x,y with optional [GRAPHICS PEN](#graphics-pen) p.
- See also: [DRAWR](#drawr), [MOVE](#move), [PLOTR](#plot).

#### NEXT

- `NEXT [variable, variable...]` Closes a [FOR](#for) loop.
  Optional variables are assumed to match open `FOR` loops.
- See also: [FOR](#for).

#### ON GOSUB

- `ON index GOSUB line1 [,line2...]` Calls subroutine at position *index* (1-based) in the list.
- Check [GOSUB](#gosub) for how to define a subroutine.
- If no subroutine matches the index, do nothing.
- See also: [GOSUB](#gosub).

#### ORIGIN

- `ORIGIN x,y` Sets the origin of the coordinate system for graphical output.
- See also: [DRAW](#draw), [MOVE](#move), [PLOT](#plot).

#### PAPER

- `PAPER number` Sets the background color for the text output with [PRINT](#print).
- See also: [PEN](#pen).

#### PEN

- `PEN number` Sets the color for the text output with [PRINT](#print).
- For the terminal, [ANSI escape codes](https://en.wikipedia.org/wiki/ANSI_escape_code#Colors) for colors are used.
- See also: [PAPER](#paper).

#### PLOT

- `PLOT x, y [, p]`: Plot a point at position x,y with optional [GRAPHICS PEN](#graphics-pen) p.
- See also: [DRAW](#draw), [MOVE](#move), [PLOTR](#plotr).

#### PLOTR

- `PLOTR x, y [, p]`: Plot a point relative with offset x,y with optional [GRAPHICS PEN](#graphics-pen) p.
- See also: [DRAWR](#drawr), [MOVER](#mover), [PLOTR](#plot).

#### PRINT

- `PRINT [argument1] [; argument2; ...][;]` Outputs text and numbers.
  - The semicolor `;` suppresses newline. Arguments can be separated by `;`.
  - Numbers are padded with trailing space, and leading space for positive numbers.
  - Special operators and functions in `PRINT`:
    - The comma operator `,` moves to the next tab position defined by [ZONE](#zone)
    - The [TAB](#tab) function moves to the specified position (only increasing)
    - The [SPC](#spc) function prints the specified number of spaces.
  - In Locobasic, lines can have any length, no automatic newline is inserted.
  - When [TAG](#tag) is active, it creates [SVG text](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/text).
  - **Limitations:** Formatting with [USING](#using) only for one number as with [DEC](#dec). No additional characters in the format string.

#### RAD

- `RAD` Switches to radians mode (default) for the functions [ATN](#atn), [COS](#cos), [SIN](#sin) and [TAN](#tan).
- **Note:** In LocoBasic, the flag is used at compile time starting from its lexical position and not dynamically during execution.
- See also: [DEG](#deg).

#### READ

- `READ variable` Reads the next value from [DATA](#data) into *variable*.
- The variable must match the data type.
- See also: [DATA](#data), [RESTORE](#restore).

#### REM

- `REM` A comment until end of line, same as apostrophe "'".

#### RESTORE

- `RESTORE [line]` Resets the [DATA](#data) pointer to an optional specified *line* number or the first *DATA* line.
- See also: [DATA](#data), [READ](#read).

#### RETURN

- `RETURN` Returns from a subroutine.
- See also: [GOSUB](#gosub), [ON GOSUB](#on-gosub).

#### STEP

- `FOR... TO... STEP expression` Optional `STEP` count in `FOR` loops.
- See also: [FOR](#for).

#### STOP

- `STOP` Halts the execution.
  - In LocoBasic: Within subroutines, it functions as a [RETURN](#return).
  - Currently the same as [END](#end).

#### TAG

- `TAG` Activates text at graphics mode. Following [PRINT](#print) commands use graphics cursor position and [GRAPHICS PEN](#graphics-pen).
- **Note:** In LocoBasic, the flag is used at compile time starting from its lexical position and not dynamically during execution.
- See also: [TAGOFF](#tagoff).

#### TAGOFF

- `TAGOFF` Deactivates text at graphics mode. Following [PRINT](#print) commands use text positions with text [PEN](#pen) again.
- **Note:** In LocoBasic, the flag is used at compile time starting from its lexical position and not dynamically during execution.
- See also: [TAG](#tag).

#### THEN

- `IF expression THEN` Part of [IF](#if).
- See also: [IF](#if).

#### TO

- `FOR... TO...` Part of `FOR` loops.
- See also: [FOR](#for).

#### USING

- `PRINT... USING formatString` uses *formatString* to format print arguments.
- Allowed characters: ... (TODO).
- See also: [DEC$](#dec), [PRINT](#print).

#### WEND

- Ends a [WHILE](#while) loop.
- See also: [WHILE](#while).

#### WHILE

- `WHILE expression` Control structure: Repeats until *expression* evaluates to false.
- Ended with [WEND](#wend) loop.
- See also: [WEND](#wend).

#### WRITE

- `WRITE [argument1] [(;|,) argument2 (;|,) ...][;]` Outputs text and numbers. Text is quoted.

Example:

```basic
a$="d": WRITE "abc";a$;7 '=> "abc","d",7
```

- See also: [PRINT](#print).

#### ZONE

- `ZONE number` Sets the tab zone for the comma operator in [PRINT](#print).
- The default zone is 13.

### Operators

#### AND

- `AND`

#### MOD

- `MOD` compute modulus of two numbers.

#### NOT

- `NOT`

#### OR

- `OR`

#### XOR

- `XOR` exclusive-OR.

---

### Functions

#### ABS

- `ABS(number)` Returns the absolute value of *number*.

#### ASC

- `ASC(character)` Returns the ASCII code of *character*.
- See also: [CHR$](#chr).

#### ATN

- `ATN(number)` Returns the arctangent of the given *number*.
- The returned value is in radians or degrees, depending on the active mode [RAD](#rad) or [DEG](#deg).
- See also: [COS](#cos), [SIN](#sin), [TAN](#tan).

#### BIN$

- `BIN$(number [, padding])` Converts a number to its binary representation.
- See also: [HEX$](#hex).

#### CHR$

- `CHR$(number)` Returns the character corresponding to the ASCII code number.
- See also: [ASC](#asc).

#### CINT

- `CINT(number)` Returns the integer part of *number*.
- Same as [INT](#int).
- See also: [FIX](#fix),  [INT](#int), [ROUND](#round).

#### COS

- `COS(number)` Returns the cosine of the given *number*.
- *number* is interpreted as radians or degrees, depending on the active mode [RAD](#rad) or [DEG](#deg).
- See also: [ATN](#atn), [SIN](#sin), [TAN](#tan).

#### CREAL

- `CREAL(number)` Returns *number*.

#### DEC$

- `DEC$(number, format)` Returns the number as a string formatted according to the specified pattern.
- Only "#" and "." are supported in the format (no extra characters). Example: "##.###".
- There is no overflow warning.
- See also: [USING](#using).

#### EXP

- `EXP(number)` Returns e raised to the power of *number*.
- See also: [LOG](#log).

#### FIX

- `FIX(number)` Truncates *number*.
- See also: [CINT](#cint), [INT](#int), [ROUND](#round).

#### FN

- `FNname()` or `FN name()` Call a user defined function defined by [DEF FN](#def-fn).
- If there are no arguments, do not use parentheses.
- See also: [DEF FN](#def-fn).

#### HEX$

- `HEX$(number [, padding])` Converts a number to its hexadecimal representation.
- See also: [BIN$](#bin).

#### INKEY$

- `INKEY$` Gets the pressed character from the key buffer or an empty string if the buffer is empty.
- See also: [CLEAR INPUT](#clear-input).

#### INSTR

- `INSTR([startPos,] string1, string2)` Returns the first position of *string2* in *string1*, starting at optional *startPos*.

#### INT

- `INT(number)` Returns the integer part of *number*.
- See also: [CINT](#cint), [FIX](#fix), [ROUND](#round).

#### LEFT$

- `LEFT$(string, number)` Returns *number* characters from the left of *string*.
- See also: [RIGHT$](#right), [MID$](#mid).

#### LEN

- `LEN(string)` Returns the length of the string.
- LocoBasic has no limitation on the length.

#### LOG

- `LOG(number)` Returns natural logarithm for *number* (based on e).
- See also: [EXP](#exp), [LOG10](#log10).

#### LOG10

- `LOG10(number)` Returns logarithm for *number* based on 10.
- See also: [EXP](#exp), [LOG](#log).

#### LOWER$

- `LOWER$(string)` Returns the string in lowercase.
- See also: [UPPER$](#upper).

#### MAX

- `MAX(number [, number, ...])` Returns the maximum of the given numbers.
- See also: [MIN](#min).

#### MID$

- `MID$(string, first [, length])` Returns a substring starting at position *first* with *length*.
- `a$="abcde": MID$(a$,position,length)="w"` When assigning a string to *MID$*, it modifies the string variable at the given position.
- See also: [LEFT$](#left), [RIGHT$](#right).

#### MIN

- `MIN(number [, number, ...])` Returns the minimum of the given numbers.
- See also: [MAX](#max).

#### PI

- `PI` Returns the value of 'pi'.

#### POS

- `POS(#0)`: Returns the current x-position of text output.
- Supports only stream 0.
- See also: [VPOS](#vpos).

#### REMAIN

- `REMAIN(timer)` Clears a running *timer* started with [AFTER](#after) or [EVERY](#every).
- In LocoBasic it returns the timer ID (and not the remaining time).
- See also: [AFTER](#after), [EVERY](#every).

#### RIGHT$

- `RIGHT$(string, number)` Returns *number* characters from the right of *string*.
- See also: [LEFT$](#left), [MID$](#mid).

#### RND

- `RND[(number)]` Returns the next pseudo-random number.
- In LocoBasic, parameter *number* is ignored.
- Use `RND` directly, not `RND()`. The parentheses are not part of the function syntax.

#### ROUND

- `ROUND(number [, decimalPlaces])` Rounds a number to a specified number of decimal places.
- In LocoBasic, the rounding is not exactly the same as in Locomotive BASIC.
- See also: [CINT](#cint), [INT](#int), [FIX](#fix).

#### SGN

- `SGN(number)` Returns the signum of a number (-1, 0, or 1).

#### SIN

- `SIN(number)` Returns the sine of the given *number*.
- *number* is interpreted as radians or degrees, depending on the active mode [RAD](#rad) or [DEG](#deg).
- See also: [ATN](#atn), [COS](#cos), [TAN](#tan).

#### SPACE$

- `SPACE$(number)` Returns *number* spaces.

#### SPC

- `SPC(number)` In [PRINT](#print), outputs *number* spaces before the next argument.
- See also: [PRINT](#print).

#### SQR

- `SQR(number)` Returns the square root of *number*.

#### STR$

- `STR$(number)` Converts a number to its string representation.
- A positive number is prefixed with a space.
- See also: [VAL](#val).

#### STRING$

- `STRING$(number, character | ASCIInumber)` Returns *character* (or `CHR$(ASCIInumber)`) repeated *number* times.

#### TAB

- `TAB(number)` In [PRINT](#print), outputs the next argument at position *number*.
- See also: [PRINT](#print).

#### TAN

- `TAN(number)` Returns the tangent of the given *number*.
- *number* is interpreted as radians or degrees, depending on the active mode [RAD](#rad) or [DEG](#deg).
- See also: [ATN](#atn), [COS](#cos), [SIN](#sin).

#### TIME

- `TIME` Returns the current system time in 1/300 sec.

#### UPPER$

- `UPPER$(string)` Converts the string to uppercase.
- See also: [LOWER$](#lower),

#### VAL

- `VAL(string)` Converts a string to a number.
- Supports hexadecimal and binary formats.
- See also: [STR$](#str).

#### VPOS

- `VPOS(#0)`: Returns the current vertical position / y-position of text output.
- Supports only stream 0.
- See also: [POS](#pos).

#### XPOS

- `XPOS` Returns the x-pos of the current graphical cursor position.
- See also: [YPOS](#ypos).

#### YPOS

- `YPOS` Returns the y-pos of the current graphical cursor position.
- See also: [XPOS](#xpos).

### Resident System Extensions (RSX)

These are extensions to LocoBasic but can also be implemented on a real CPC with Z80 code.

#### |ARC

- `|ARC,x,y,rx,ry,angle,large-arc-flag,sweep-flag,x,y[,fillPen]` Draws an arc curve, creating shape [SVG Elliptical arc curve](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/d#elliptical_arc_curve).
- See also: [|CIRCLE](#circle), [|ELLIPSE](#ellipse), [|POLYGON](#polygon), [|RECT](#rect).

#### |CIRCLE

- `|CIRCLE.cx,cy,r[,fillPen]` Draws a circle, creating shape [SVG circle](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/circle).
- See also: [|ARC](#arc), [|ELLIPSE](#ellipse), [|POLYGON](#polygon), [|RECT](#rect).

#### |DATE

- `d$=SPACE$(11): |DATE,@d$` Returns a date string in the format "ww DD MM YY" (ww=day of week) from the Real Time Clock (RTC). Use the address operator `@` to denote that the result of the RSX command should be written in the variable.
- Link: [Dobbertin Smart Watch](https://www.cpcwiki.eu/index.php/Dobbertin_Smart_Watch).
- See also: [|TIME](#time).

#### |ELLIPSE

- `|ELLIPSE.cx,cy,rx,ry[,fillPen]` Draws an ellipse, creating shape [SVG ellipse](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/ellipse).
- `lat=0.0: lon=0.0: |GEOLOCATION,@lat,@lon` Gets the geolocation (if available).
- See also: [|ARC](#arc), [|CIRCLE](#circle), [|POLYGON](#polygon), [|RECT](#rect).

#### |PITCH

- `|PITCH,n` Sets the speech synthesis pitch for [|SAY](#say) (1-20; default: 10)

#### |POLYGON

- `|POLYGON,x1,y1,...,xn,yn[,fillPen]` Draws a polygon, creating shape [SVG polygon](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/polygon).
- See also: [|ARC](#arc), [|CIRCLE](#circle), [|ELLIPSE](#ellipse), [|RECT](#rect).

#### |RECT

- `|RECT,x,y,x2,y2[,fillPen]` Draws a rectangle, creating shape [SVG rect](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/rect).
- See also: [|ARC](#arc), [|CIRCLE](#circle), [|ELLIPSE](#ellipse), [|POLYGON](#polygon).

#### |SAY

- `|SAY,"Hello"` Says "Hello" using speech synthesis.
- See also: [|PITCH](#pitch).

#### |TIME

- `t$=SPACE$(8): |TIME,@t$` Returns a time string in the format "HH MM SS" from the Real Time Clock (RTC).
- Link: [Dobbertin Smart Watch](https://www.cpcwiki.eu/index.php/Dobbertin_Smart_Watch).
- See also: [|DATE](#date).

---

## Special Notes

- **Endless Loops**
  - The compiled code runs in a Web Worker or Worker Thread. The "Reset" button terminates the Web Worker and also an endless loop.
- **STOP and END**
  - These commands stop execution, but only at the top level. Within subroutines, they simply return.
  - During *FRAME*, *INKEY$* or *INPUT*, the "Stop" button gets active. It allows you to terminate the running program. It is not possible to continue a terminated program.
- **PEN and PAPER**
  - When using node.js in a terminal, ANSI colors are used.
- **GRAPHICS PEN, DRAW, DRAWR, MOVE, MOVER, PLOT, PLOTR, TAG (and PRINT), |ARC, |CIRCLE, |ELLIPSE, |POLYGON, |RECT**
  - These can be used to create [Scalable Vector Graphics](https://developer.mozilla.org/en-US/docs/Web/SVG) (SVG), which can be exported with the "Export SVG" button. Graphics are separate from text.
- **FRAME and Visual Delays**
  - Text and graphics output is buffered until it is flushed with *FRAME* (or *INKEY$*, *INPUT*) or at the end of the program.
  - To start new text or graphical output after *FRAME*, use *CLS* or *MODE*.
  - In tight loops, `FRAME` may execute too fast for visual perception (up to ~50ms per frame).
  - For consistent delays, use: `t=TIME+50: WHILE TIME<t: FRAME: WEND`

- **INKEY$ Sequential Processing**
  - Queued key presses are returned one per call, sequentially.
  - In fast loops, multiple key presses may be processed within a single frame.

- **RND - No Parentheses**
  - Use `RND` directly, not `RND()`. The parentheses are not part of the function syntax.

- **Text Rendering Without LOCATE**
  - LocoBasic has no `LOCATE` command. Use `MID$` assignment for efficient row-based rendering.
  - Example: Build a row string once per frame and redraw:

    ```basic
    row$=SPACE$(40)
    MID$(row$,player,1)="@"
    MID$(row$,enemy,1)="X"
    PRINT row$
    FRAME
    ```

---

## Language specification

You may find a full EBNF grammar for LocoBasic in [locobasic.ebnf](./docs/locobasic.ebnf).

### Program Structure

- A program consists of lines:

`line ::= [lineNumber] statement { ":" statement }`

- Line numbers are optional except for:
  - Subroutine targets referenced by [GOSUB](#gosub) (also in [AFTER](#after), [EVERY](#every)).
  - [DATA](#data) lines referenced by [RESTORE](#restore).

### Identifiers

`identifier ::= letter { letter | digit | "." }`

- Must start with a letter.
- May contain letters, digits, or dot ".".
- Underscore "_" is not allowed.
- Identifiers are case-insensitive.

### Numbers

Supported formats:

- Decimal: `123`
- Hexadecimal: `&FF`
- Binary: `&x1011`

### Strings

Strings are enclosed in quotes: `"Hello"`.

### Data Types

Two data types:

- Numeric
- String (ending with dollar `$`).
- (Not supported: Other type suffixes like `!`(real) and `%` (integer)).

Implicit conversion between strings and numbers does not occur.
Use `STR$(number)`or `VAL(string)`.

### Arrays

Declared and initialized with [DIM](#dim).

Indices can be written in parentheses () or brackets [].

- *Note* In LocoBasic, array variables with the same name as normal variables are **not supported**.

### Boolean Semantics

- Logical values: true  = -1, false = 0
- Truth evaluation: ≠ 0 → true

### Operator precedence

Predcedences from (highest → lowest):

- @ (addressOf string)
- ^
- unary + -
- \* /
- \\ (integer division)
- [MOD](#mod)
- \+ -
- = <> < <= > >=
- NOT
- [AND](#and)
- [OR](#or)
- [XOR](#xor)

Operators \* / \\ [MOD](#mod) + - [AND](#and) [OR](#or) [XOR](#xor) are left-associative, ^ is right-associative.

### Control Structures

- [IF](#if) ... [THEN](#then) ... [ELSE](#else)
- [ENDIF](#endif) (LocoBasic only)
- [FOR](#for) ... [NEXT](#next)
- [WHILE](#while) ... [WEND](#wend)

### Subroutines

- Called with [GOSUB](#gosub)

Example:

```basic
GOSUB 100
END
'
100 PRINT "HELLO"
RETURN
```

---

## Grammar notes

## Execution model

## Implementation Notes

LocoBasic compiles BASIC code to **JavaScript**.

Consequences:

- Numeric precision follows JavaScript IEEE‑754 floating point.
- Programs run inside Web Workers or Node.js worker threads.

## Differences from Locomotive BASIC

### Not implemented

- The following keywords are not implemented:

 auto border break call cat chain clear clg closein closeout cont copychr$
 cursor defreal defstr delete derr di edit ei eof erl err fill fre
 goto graphicsPaper himem inkey inp joy line list load locate mask memory merge new
 openin openout out peek poke randomize release renum resume run
 save sound speed sq swap symbol test testr troff tron unt wait width window

- *GOTO*, *ON...GOTO* are not supported.
- Nested subroutines are not supported.
- *LOCATE* is not supported.
- Text windows (*WINDOW*) are not supported.
- Streams using prefix '#' (e.g. *PRINT*, *CLS*, *INPUT*) are not supported.
  - Exception: *POS(#0)*, *VPOS(#0)* with stream 0.

---

## Command line options and URL parameters

- action=compile,run -- Possible actions: compile,run (compile and run) or compile (compile only and output script)
- autoCompile=true -- Automatic compile to JavaScript when BASIC code changes (Browser)
- autoExecute=true -- Automatic execute when JavaScript code changes (Browser)
- databaseDirs=examples -- Example base directories (comma separated)
- database=examples -- Selected database available in **databaseDirs**, e.g. examples, apps, saved
- debounceCompile=800 -- Debounce delay for **autoCompile** in ms (Browser)
- debounceExecute=400 -- Debounce delay for **autoExecute** in ms (Browser)
- debug=0 -- Debug level
- example=locobas -- Selected example in the current **database**
- exampleFilter= -- Example filter value for the search field (Browser)
- fileName= -- Specify a BASIC file (nodeJS)
- grammar=basic -- Possible options: basic or strict
- input= -- Specify a BASIC string (nodeJS)
- outputConsole=false -- Redirect output to the Browser Devtools console
- showBasic=true -- Show the BASIC editor (Browser)
- showCompiled=false -- Show the JavaScript editor (Browser)
- showOutput=true -- Show the output box (Browser)

---

## Links

- [LocoBasic](https://benchmarko.github.io/LocoBasic/)
- [LocoBasic Source Code](https://github.com/benchmarko/LocoBasic/)
- [LocoBasic HTML Readme](https://github.com/benchmarko/LocoBasic/#readme)

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

- [GodSVG Editor](https://www.godsvg.com/editor/) - Edit SVG drawings

- Another BASIC compiler: [ugBASIC](https://ugbasic.iwashere.eu/target/cpc#examples)

### **mv, 03/2026**
