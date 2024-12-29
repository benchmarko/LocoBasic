# LocoBasic - Light version of Locomotive BASIC

LocoBasic is a streamlined adaptation of Locomotive BASIC, designed primarily for calculations.
It is lightweight and can run either in a browser or on the command line using Node.js.
It has **NO GOTO** but supports a subroutine style with *GOSUB*.
Line numbers are optional and only needed to start a subroutine or a *DATA* line for *RESTORE*

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

4. Run some of the following command to execute:

   ```bash
   node dist/locobasic.js example=euler
   node dist/locobasic.js input='print "Hello!"'
   node dist/locobasic.js input="?3 + 5 * (2 - 8)"
   node dist/locobasic.js grammar=strict...  [strict mode: keywords must be uppercase, variables must start with a lowercase character]
   ```

## LocoBasic Language Description

keywords should be uppercase but all lowercase is also accepted (not-strict mode).

### Control Structures

- **Supported:**
  - `IF...ELSE`
  - Loops: `FOR` and `WHILE`
- These structures are directly converted to JavaScript for execution.

### Subroutines

- Use `GOSUB` and `ON GOSUB`
  - `GOTO` and `ON GOTO` are **not supported**

- **Subroutine Style:**
  - A line starting with `GOSUB <line>` marks the beginning of a subroutine
  - Subroutines must end with a single `RETURN` on its own line
  - **Important:** Subroutines cannot be nested

### Variable Types

- case does not matter (strict mode: must start with lower case)
- Usually number
- Use `$` to denote a string variable
  - Variable markers like `!` and `%` are **not supported**
- **No automatic rounding:**
  - Integer parameters are not automatically rounded
- Computations follow JavaScript precision
- Operator arity and precedence match those of Locomotive BASIC

### Special Notes

- **Endless Loops:**
  - Not trapped automatically. Restarting the browser window may be required to recover.
- **STOP and END:**
  - These halt execution only at the top level. Within subroutines, they simply return.

### Operators

- `AND`, `NOT`, `OR`, `XOR`
- `number MOD number` compute the modulus
- Comparisons: =, <>, <, <=, >, >=
- +, -, *, /, \ (integer div), (...)
- &hexValue, &xBinaryValue
- String concatenation: +

### Supported Commands and Functions

- `ABS(number)` Returns the absolute value of *number*
- `ASC(character)` Returns the ASCII number of *character*
- `ÀTN(number)` Returns the arcustangens of *number* in radians
- `BIN$(number [, padding])` Converts a number to its binary representation
- `CHR$(number)` Returns the character for the ASCII code *number*
- `CINT(number)` Returns the integer part of *number*
  - same as *INT*
- `CLS` Clears the output window
- `COS(number)` Returns the cosine of *number* given in radians
- `DATA ["string", number,...]` Defines string or numerical data to be read by *READ*
  - Separated by commas ","
  - Strings must be quoted
  - Numbers (including hex and binary) are unquoted and can only be read numerically
- `DEC$(number, format)` Returns the number as a string formatted according to the specified pattern.
  - Only "#" and "." are supported in the format. Example: "##.###"
- `DEF FNname[(arg1, ...)] = expression` Defines a function *FNname*
  - Can be used as `FNname()`
  - No space between *FN* and *name* is allowed
  - If there are no arguments, do not use parentheses
- `DIM arrayVariable(dim1 [, dim2, ...])` Initializes an array
  - Can be multi-dimensional
  - Will be initialized to 0 or "" depending on the variable type
- `END` Ends execution
  - currently the same as `STOP`
- `ERASE variable, [variable,...]` Erases array variables
  - Specify variable name without indices
- `ERROR number` Throws error with *number*
- `EXP(number)` Returns e function raised to the power of *number*
- `FIX(number)` Truncates *number*
- `FOR variable = start to end [STEP increment]` Control structure
  - *increment* can also be negative,, in which case *start* must be greater than *end*
  - **Endless Loops:** Not trapped
- `FRAME` Pauses execution for ~50ms intervals for synchronization.
- `GOSUB line` Calls subroutine starting at *line*
  - Subroutines must end with a single `RETURN` on its own line
- `HEX$(number [, padding])` Converts a number to its hexadecimal representation
- `IF expression THEN statements [ELSE statements]` control structure (in one line)
- `INPUT [message;] variable` Prompts the user for input (string or numeric)
- `INSTR(string1, string2)` Returns the first positon of *string2* in *string1*
  - **Limitations:** No support for *start position* as first argument
- `INT(number)` Returns the integer part of *number*
- `LEFT$(string, number)` Returns *number* characters from the left in *string*
- `LEN(string)` Returns rthe length of the string
  - LocoBasic has no limitaton on the length
- `LOG(number)` Returns natural logarithm for *number* (based on e)
- `LOG10(number)` Returns logarithm for *number* based on 10
- `LOWER$(string)` Returns string in lowercase
- `MAX(number [,number,...])` Returns the maximum of the given numbers
- `MID$(string, first [, length])` Returns a substring starting at positon *first* with *length*
- `MIN(number [,number,...])` Returns the minimum of the given numbers
- `MODE number` Sets screen mode
  - Currently the same as *CLS* with the mode *number* ignored
- `NEXT` Closes a *FOR* loop
- `ON index GOSUB line1 [,line2...]` Calls subroutine at position *index* in the list
  - Check `GOSUB` for how to define a subroutine
  - **Limitations:** There must be a subroutine at position *index* in the list
- `PI` Returns the value of 'pi'
- `PRINT argument1 [; argument2; ...]` Outputs text and numbers
  - Arguments must be separated by `;`
  - Numbers are padded with trailinng space, and leading space for positive numbers
  - **Limitations:** No support for `TAB()`, `SPC()`, or `USING` formatting. Use *DEC$()* to format numbers
- `READ variable` Reads the next value from a `DATA` statement into *variable*
- `REM` A comment until end of line, same as `
- `RESTORE [line]` Resets the `DATA` pointer to a specified *line* number
- `RETURN` Returns from a subroutine.
  - See *GOSUB*, *ON... GOSUB*
- `RIGHT$(string, number)` Returns *number* characters from the right in *string*
- `RND(number)` Returns the next pseudo-random number
  - Parameter *number* is ignored
- `ROUND(number [, decimalPlaces])` Rounds a number to a specified number of decimal places
  - Rounding not exactly the same as with Locomotive BASIC
- `SGN(number)` Returns the signum of a number (-1, 0 or 1)
- `SIN(number)` Returns the sine of *number* given in radians
- `SPACE$(number)` Returns *number* spaces
- `SQR(number)` Returns the square root of *number*
- `STOP` Halts the execution
  - Within subroutines, it functions as a *RETURN*
  - Similar to *END*
- `STR$(number)` Converts a number to its string representation
  - A positive number is passed with a space
- `STRING$(number, character)` Returns *character* repeated *number* times
  - requires the second parameter to be a character
- `TAN(number)` Returns the tangens of *number* given in radians
- `TIME` Returns the current system time in 1/300 sec
- `UPPER$(string)` Returns string in uppercase
- `VAL(string)` Converts a string to a number
  - supports hexadecimal and binary formats
- `WEND` Ends a *WHILE* loop
- `WHILE expression` Control structure: repeat until *expression* is false
- `number XOR number` In Expresions: exclusive-OR

### Misc

- LocoBasic is mainly used for calculations. It runs in a Browser or on the command line with node.js
- Control structures like IF...ELSE, and FOR and WHILE loops are directly converted to JaveScript
- GOTO or ON GOTO are not suppoered. Use GOSUB, ON GOSUB instead. The GOSUB line is interpreted as subroutine start.
- Subroutine style: Line from GOSUB \<line> starts a subroutine which is ended be a single RETURN in a line. Do not nest subroutines.
- Variable types: No type checking: "$" to mark a string variable is optional; "!", "%" are not supported
- No automatic rounding to integer for integer parameters
- Computations are done with JavaScript precision; arity and precedence of operators follows Locomotive BASIC
- Endless loops are not trapped, ypou may need to restart the browser window.
- PRINT: output in the output window. Args can be separated by ";" or "," which behave the same. (No TAB(), SPC(), USING)
- STOP, END: stop only on top level, not in subroutines (where they just return)
- STRING$(): second parameter must be a character
- DATA: strings must be quoted; numbers (including hex, bin) are unquoted and can only be read numerical

### TODO

- `MID$` as assign? `a$="abcde": MID$(a$,3,2)="w": ?a$`
- command line tool should output a stand alone running JS file for node
- Do we want keywords all uppercase? And variables all lowercase?
  And maybe new features with capital letter? E.g. If...Then...Else...Endif on multiple lines?
- Create syntax highlighting for BASIC for CodeMirror, maybe similar to the [amstradbasic-vscode](https://github.com/dfreniche/amstradbasic-vscode/blob/master/syntaxes/amstradbasic.tmLanguage.json) or [CPCReady](https://marketplace.visualstudio.com/items?itemName=CPCReady.basic-language-extension) extension

### Done

- numbers with exponential notation
- *dim* and other more complex commands are included on-demand in the compiled JavaScript
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

### Not implemented

after auto border break call cat chain clear cog closein closeout cont copychr
 creal cursor dec defint defreal defstr deg delete derr di draw drawr edit ei eof erl err every fill  fre
 goto graphics himem ink inkey-$ inp joy key let line list load locate mask memory merge move mover new
 on openin openout origin out paper peek pen plot plotr poke pos rad randomize  release remain renum resume run
 save sound spc speed sq swap symbol tab tag tagoff test testr troff tron unt using vpos wait width window write xpos ypos zone

### Resources

- [Ohm](https://ohmjs.org/) JavaScript parsing toolkit - [Source code](https://github.com/ohmjs/ohm) - Paper: [Modular Semantic Actions](https://ohmjs.org/pubs/dls2016/modular-semantic-actions.pdf)

- [CodeMirror](https://codemirror.net/) code editor used for the Locobasic UI -
[Source code](https://github.com/codemirror/dev/) -
[Libraries](https://cdnjs.com/libraries/codemirror)

- [CPCBasicTS](https://benchmarko.github.io/CPCBasicTS/) CPCBasicTS Unchained - Run CPC BASIC in a Browser - [Source code](https://github.com/benchmarko/CPCBasicTS/)

- [CPCBasic](https://benchmarko.github.io/CPCBasic/) CPCBasic Unchained - Run CPC BASIC in a Browser - [Source code](https://github.com/benchmarko/CPCBasic/)

- [CPCemu](http://www.cpc-emu.org/) - CPC Emulator, since version 2.0 with very accurate emulation

- [Amstrad CPC 6128 User Instructions](http://www.cpcwiki.eu/manuals/AmstradCPC6128-hypertext-en-Sinewalker.pdf), or:
  [Schneider CPC 6128 Benutzerhandbuch](https://acpc.me/ACME/MANUELS/[DEU]DEUTSCH(GERMAN)/CPC6128_SCHNEIDER[DEU]_Erste_Ausgabe_1985[OCR].pdf)

- [Locomotive BASIC](https://www.cpcwiki.eu/index.php/Locomotive_BASIC) - Description of the CPC Basic Dialect

- Another BASIC compiler: [ugBASIC](https://ugbasic.iwashere.eu/target/cpc#examples)

### **mv, 12/2024**