# LocoBasic - Light version of Locomotive BASIC

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

## Examples

```basic
5 ' examples:
10 ' associativity
15 ? "7 =" 12 xor 5+6 "=" 12 xor (5+6), (12 xor 5)+6
20 ? "3 =" 7 mod 5+1 "=" (7 mod 5)+1, 7 mod (5+1)
30 ? "0 =" 10>5>4 "=" (10>5)>4, 10>(5>4)
40 ? not 1234555
50 ? 12 \ 5
100 DIM a$(10):?"<";a$(10);">"
110 DIM a2$(10,1):?"<";a2$(10,1);">"
120 a=1:b=7:c=4:de=68:f=2:g=5:hi=93:PRINT a*10+b;"*";c;"=";de;" / ";de;"+";f*10+g;"=";hi
130 a=7:?"<";str$(a);">"
````

## Misc

### TODO

- DATA lines are compiled to empty lines, remove them?
- numbers with exponential notation
- command line tool should output a stand alone running JS file for node, so include dimArray() on-demand in the compiled source?
- TIME: *300/1000 ?
- mid$ as assing? a$="abcde":mid$(a$,3,2)="w":?a$ ?
- Do we want keywords all uppercase? And variables all lowercase?
  And maybe new features with capital letter? E.g. If...Then...Else...Endif on multiple lines?

### DONE

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
- ERASE <var> or <strVar> sets var=0, strVar=" ", not really needed, just to run such programs

### Resources (unsorted)

```javaScript
return async function() {
  _o.print(Date.now()+"\n");
  return new Promise(resolve => setTimeout(() => resolve('Hello after 1 second!'), 1000));
  //return await 'stop';
}();

return (async function() { return await Promise.resolve('Hello, Async World!'); })();

async function _input(msg) {
  return new Promise(resolve => setTimeout(() => resolve(prompt(msg)), 0));
}

var name = await _input("What is your name?");
```

```javaScript
let ls = []; Object.keys(allTests).forEach((c) => { ls.push("' " + c + "\n" + Object.keys(allTests[c]).join("\n")); }); console.log(ls.join("\n"));
```

<https://github.com/ohmjs/ohm/blob/main/examples/math/index.html>

<https://nextjournal.com/pangloss/ohm-parsing-made-easy>

<https://stackoverflow.com/questions/60857610/grammar-for-expression-language>

<https://github.com/Gamadril/led-basic-vscode>

<https://ohmjs.org/editor/>

<https://ohmjs.org/docs/releases/ohm-js-16.0#default-semantic-actions>

<https://stackoverflow.com/questions/69762570/rollup-umd-output-format-doesnt-work-however-es-does>

<https://github.com/beautifier/js-beautify>

<https://jsonformatter.org/javascript-pretty-print>

<https://dev.to/cantem/how-to-write-a-debounce-function-1bdf>

//<https://light-basic-interpreter.soft112.com/>

<https://lume.ufrgs.br/bitstream/handle/10183/190184/001088757.pdf?sequence=1>

<https://cdnjs.com/libraries/codemirror>
<https://codemirror.net/5/doc/manual.html#operation>
<https://codemirror.net/5/mode/>
<https://codemirror.net/5/mode/diff/diff.js>
<https://codemirror.net/5/demo/simplemode.html>
<https://github.com/codemirror/legacy-modes/blob/main/mode/pascal.js>

<https://github.com/dfreniche/amstradbasic-vscode/blob/master/syntaxes/amstradbasic.tmLanguage.json>
<https://marketplace.visualstudio.com/items?itemName=CPCReady.basic-language-extension>
<https://retroprogramming.iwashere.eu/ugbasic:user>
<https://ugbasic.iwashere.eu/target/cpc#examples>

<https://www.unpkg.com/browse/codemirror@6.65.7/lib/>

### Not implemented

after auto border break call cat chain clear cog closein closeout cos cont copychr
 creal cursor data dec def defint defreal defstr deg delete derr di draw drawr edit ei eof erl err error every fill fn frame fre
 gosub goto graphics himem ink inkey-$ inp input instr joy key let line list load locate mask memory merge mode move mover new
 on openin openout origin out paper peek pen plot plotr poke pos rad randomize read release remain renum restore resume return round run
 save sgn sound spc speed sq swap symbol tab tag tagoff test testr troff tron unt using vpos wait width window write xpos ypos zone

--
