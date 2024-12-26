(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('ohm-js')) :
    typeof define === 'function' && define.amd ? define(['ohm-js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ohmJs));
})(this, (function (ohmJs) { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol, Iterator */


    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    // Parser.ts
    class Parser {
        constructor(grammarString, semanticsMap) {
            this.ohmGrammar = ohmJs.grammar(grammarString);
            this.ohmSemantics = this.ohmGrammar
                .createSemantics()
                .addOperation("eval", semanticsMap);
        }
        // Function to parse and evaluate an expression
        parseAndEval(input) {
            try {
                const matchResult = this.ohmGrammar.match(input);
                if (matchResult.succeeded()) {
                    return this.ohmSemantics(matchResult).eval();
                }
                else {
                    return 'ERROR: Parsing failed: ' + matchResult.message;
                }
            }
            catch (error) {
                return 'ERROR: Parsing evaluator failed: ' + (error instanceof Error ? error.message : "unknown");
            }
        }
    }

    // arithmetics.ts
    //
    const arithmetic = {
        grammar: `
    Arithmetic {
    Program
      = Line*

    Line
      = Label? Statements Comment? (eol | end)

    Label
      = label

    Statements
      = Statement (":" Statement)*

    Statement
      = Comment
      | Cls
      | Data
      | Def
      | Dim
      | End
      | Erase
      | Error
      | For
      | Frame
      | Gosub
      | If
      | Input
      | Mode
      | Next
      | On
      | Print
      | Read
      | Rem
      | Restore
      | Return
      | Stop
      | While
      | Wend
      | ArrayAssign
      | Assign

    ArrayAssign
      = ArrayIdent "=" NumExp
      | StrArrayIdent "=" StrExp

    Abs
      = abs "(" NumExp ")"

    Asc
      = asc "(" StrExp ")"

    Atn
      = atn "(" NumExp ")"

    Assign
      = ident "=" NumExp
      | strIdent "=" StrExp

    BinS
      = binS "(" NumExp ("," NumExp)? ")"

    ChrS
      = chrS "(" NumExp ")"

    Cint
      = cint "(" NumExp ")"

    Cls
      = cls

    Comment
      = "\\'" partToEol

    Cos
      = cos "(" NumExp ")"

    DataItem
      = string | number | signedDecimal

    Data
      = data NonemptyListOf<DataItem, ",">

    DecS
      = decS "(" NumExp "," StrExp ")"

    Def
      = def fn DefAssign
    
    DefArgs
      = "(" ListOf<SimpleIdent, ","> ")"

    DefAssign
      = ident DefArgs? "=" NumExp
      | strIdent DefArgs? "=" StrExp

    Dim
      = dim NonemptyListOf<DimArrayIdent, ",">

    End
      = endLit

    Erase
      = erase NonemptyListOf<SimpleIdent, ",">

    Error
      = error NumExp

    Exp
      = exp "(" NumExp ")"

    Fix
      = fix "(" NumExp ")"

    For
      = for variable "=" NumExp to NumExp (step NumExp)?

    Frame
      = frame

    Gosub
      = gosub label

    HexS
      = hexS "(" NumExp ("," NumExp)? ")"

    Input
      = input (string (";" | ","))? AnyIdent  // or NonemptyListOf?

    Instr
      = instr "(" StrExp "," StrExp ")"

    Int
      = int "(" NumExp ")"

    LeftS
      = leftS "(" StrExp "," NumExp ")"

    Len
      = len "(" StrExp ")"

    Log
      = log "(" NumExp ")"

    Log10
      = log10 "(" NumExp ")"

    LowerS
      = lowerS "(" StrExp ")"

    Max
      = max "(" NonemptyListOf<NumExp, ","> ")"

    MidS
      = midS "(" StrExp "," NumExp ("," NumExp)? ")"

    Min
      = min "(" NonemptyListOf<NumExp, ","> ")"

    Mode
      = mode NumExp

    Pi
      = pi

    Next
      = next ListOf<variable, ",">

    On
      = on NumExp gosub NonemptyListOf<label, ",">

    PrintArg
      = &StrCmpExp NumExp -- strCmp
      | StrExp
      | NumExp

    Print
      = (print | "?") ListOf<PrintArg,";"> (";")?

    Read
      = read NonemptyListOf<AnyIdent, ",">

    Rem
      = rem partToEol

    Restore
      = restore label?

    Return
      = return

    RightS
      = rightS "(" StrExp "," NumExp ")"

    Rnd
      = rnd ("(" NumExp ")")?
    
    Round
      = round "(" NumExp ("," NumExp)? ")"

    Sgn
      = sgn "(" NumExp ")"

    Sin
      = sin "(" NumExp ")"

    SpaceS
      = spaceS "(" NumExp ")"

    Sqr
      = sqr "(" NumExp ")"

    Stop
      = stop

    StrS
      = strS "(" NumExp ")"

    StringS
      = stringS "(" NumExp "," StrExp ")"

    Tan
      = tan "(" NumExp ")"

    Time
      = time

    UpperS
      = upperS "(" StrExp ")"

    Val
      = val "(" StrExp ")"

    Wend
      = wend

    While
      = while NumExp

    If
      = if NumExp then Statements (else Statements)?

    StrExp
      = StrAddExp

    StrAddExp
      = StrAddExp "+" StrPriExp  -- plus
      | StrPriExp

    StrPriExp
      = "(" StrExp ")"  -- paren
      | BinS
      | ChrS
      | DecS
      | HexS
      | LeftS
      | LowerS
      | MidS
      | RightS
      | SpaceS
      | StrS
      | StringS
      | UpperS
      | StrFnIdent
      | StrArrayIdent
      | strIdent
      | string


    NumExp
      = XorExp

    XorExp
      = OrExp xor XorExp  -- xor
      | OrExp

    OrExp
      = AndExp or OrExp  -- or
      | AndExp

    AndExp
      = NotExp and AndExp  -- and
      | NotExp

    NotExp
      = not NotExp  -- not
      | StrCmpExp
      | CmpExp

    StrCmpExp
      = StrAddExp "=" StrAddExp  -- eq
      | StrAddExp "<>" StrAddExp  -- ne
      | StrAddExp "<" StrAddExp  -- lt
      | StrAddExp "<=" StrAddExp  -- le
      | StrAddExp ">" StrAddExp  -- gt
      | StrAddExp ">=" StrAddExp  -- ge

    CmpExp
      = CmpExp "=" AddExp  -- eq
      | CmpExp "<>" AddExp  -- ne
      | CmpExp "<" AddExp  -- lt
      | CmpExp "<=" AddExp  -- le
      | CmpExp ">" AddExp  -- gt
      | CmpExp ">=" AddExp  -- ge
      | AddExp

    AddExp
      = AddExp "+" ModExp  -- plus
      | AddExp "-" ModExp  -- minus
      | ModExp

    ModExp
      = ModExp mod DivExp -- mod
      | DivExp

    DivExp
      = DivExp "\\\\" MulExp -- div
      | MulExp

    MulExp
      = MulExp "*" ExpExp  -- times
      | MulExp "/" ExpExp  -- divide
      | ExpExp

    ExpExp
      = PriExp "^" ExpExp  -- power
      | PriExp

    PriExp
      = "(" NumExp ")"  -- paren
      | "+" PriExp   -- pos
      | "-" PriExp   -- neg
      | FnIdent
      | ArrayIdent
      | ident
      | number
      | Abs
      | Asc
      | Atn
      | Cint
      | Cos
      | Exp
      | Fix
      | Instr
      | Int
      | Len
      | Log
      | Log10
      | Max
      | Min
      | Pi
      | Rnd
      | Round
      | Sgn
      | Sin
      | Sqr
      | Tan
      | Time
      | Val

    ArrayArgs
      = NonemptyListOf<NumExp, ",">

    ArrayIdent
      = ident "(" ArrayArgs ")"

    StrArrayIdent
      = strIdent "(" ArrayArgs ")"

    DimArrayIdent
      = ident "(" ArrayArgs ")"
      | strIdent "(" ArrayArgs ")"

    SimpleIdent
      = strIdent
      | ident

    AnyIdent
      = StrArrayIdent
      | ArrayIdent
      | strIdent
      | ident

    FnIdent
      = fnIdent FnArgs?

    StrFnIdent
      = strFnIdent StrFnArgs?

    FnArgs
      = "(" ListOf<NumExp, ","> ")"

    StrFnArgs
      = "(" ListOf<StrExp, ","> ")"

    keyword
      = abs | after | and | asc | atn | auto | binS | border | break
      | call | cat | chain | chrS | cint | clear | clg | closein | closeout | cls | cont | copychrS | cos | creal | cursor
      | data | decS | def | defint | defreal | defstr | deg | delete | derr | di | dim | draw | drawr
      | edit | ei | else | endLit | ent | env | eof | erase | erl | err | error | every | exp | fill | fix | fn | for | frame | fre | gosub | goto | graphics
      | hexS | himem | if | ink | inkey | inkeyS|  inp | input | instr | int | joy | key | leftS | len | let | line | list | load | locate | log | log10 | lowerS
      | mask | max | memory | merge | midS | min | mod | mode | move | mover | new | next | not | on | openin | openout | or | origin | out
      | paper | peek | pen | pi | plot | plotr | poke | pos | print
      | rad | randomize | read | release | rem | remain | renum | restore | resume | return | rightS | rnd | round | run
      | save | sgn | sin | sound | spaceS | spc | speed | sq | sqr | step | stop | strS | stringS | swap | symbol
      | tab | tag | tagoff | tan | test | testr | then | time | to | troff | tron | unt | upperS | using
      | val | vpos | wait | wend | while | width | window | write | xor | xpos | ypos | zone

    abs
      = caseInsensitive<"abs"> ~identPart
    after
      = caseInsensitive<"after"> ~identPart
    and
      = caseInsensitive<"and"> ~identPart
    asc
      = caseInsensitive<"asc"> ~identPart
    atn
      = caseInsensitive<"atn"> ~identPart
    auto
      = caseInsensitive<"auto"> ~identPart
    binS
      = caseInsensitive<"bin$"> ~identPart
    border
      = caseInsensitive<"border"> ~identPart
    break
      = caseInsensitive<"break"> ~identPart
    call
      = caseInsensitive<"call"> ~identPart
    cat
      = caseInsensitive<"cat"> ~identPart
    chain
      = caseInsensitive<"chain"> ~identPart
    chrS
      = caseInsensitive<"chr$"> ~identPart
    cint
      = caseInsensitive<"cint"> ~identPart
    clear
      = caseInsensitive<"clear"> ~identPart
    clg
      = caseInsensitive<"clg"> ~identPart
    closein
      = caseInsensitive<"closein"> ~identPart
    closeout
      = caseInsensitive<"closeout"> ~identPart
    cls
      = caseInsensitive<"cls"> ~identPart
    cont
      = caseInsensitive<"cont"> ~identPart
    copychrS
      = caseInsensitive<"copychr$"> ~identPart
    cos
      = caseInsensitive<"cos"> ~identPart
    creal
      = caseInsensitive<"creal"> ~identPart
    cursor
      = caseInsensitive<"cursor"> ~identPart
    data
      = caseInsensitive<"data"> ~identPart
    decS
      = caseInsensitive<"dec$"> ~identPart
    def
      = caseInsensitive<"def"> ~identPart
    defint
      = caseInsensitive<"defint"> ~identPart
    defreal
      = caseInsensitive<"defreal"> ~identPart
    defstr
      = caseInsensitive<"defstr"> ~identPart
    deg
      = caseInsensitive<"deg"> ~identPart
    delete
      = caseInsensitive<"delete"> ~identPart
    derr
      = caseInsensitive<"derr"> ~identPart
    di
      = caseInsensitive<"di"> ~identPart
    dim
      = caseInsensitive<"dim"> ~identPart
    draw
      = caseInsensitive<"draw"> ~identPart
    drawr
      = caseInsensitive<"drawr"> ~identPart
    edit
      = caseInsensitive<"edit"> ~identPart
    ei
      = caseInsensitive<"ei"> ~identPart
    else
      = caseInsensitive<"else"> ~identPart
    endLit
      = caseInsensitive<"end"> ~identPart
    ent
      = caseInsensitive<"ent"> ~identPart
    env
      = caseInsensitive<"env"> ~identPart
    eof
      = caseInsensitive<"eof"> ~identPart
    erase
      = caseInsensitive<"erase"> ~identPart
    erl
      = caseInsensitive<"erl"> ~identPart
    err
      = caseInsensitive<"err"> ~identPart
    error
      = caseInsensitive<"error"> ~identPart
    every
      = caseInsensitive<"every"> ~identPart
    exp
      = caseInsensitive<"exp"> ~identPart
    fill
      = caseInsensitive<"fill"> ~identPart
    fix
      = caseInsensitive<"fix"> ~identPart
    fn
      = caseInsensitive<"fn">  //~identPart
    for
      = caseInsensitive<"for"> ~identPart
    frame
      = caseInsensitive<"frame"> ~identPart
    fre
      = caseInsensitive<"fre"> ~identPart
    gosub
      = caseInsensitive<"gosub"> ~identPart
    goto
      = caseInsensitive<"goto"> ~identPart
    graphics
      = caseInsensitive<"graphics"> ~identPart
    hexS
      = caseInsensitive<"hex$"> ~identPart
    himem
      = caseInsensitive<"himem"> ~identPart
    if
      = caseInsensitive<"if"> ~identPart
    ink
      = caseInsensitive<"ink"> ~identPart
    inkey
      = caseInsensitive<"inkey"> ~identPart
    inkeyS
      = caseInsensitive<"inkey$"> ~identPart
    inp
      = caseInsensitive<"inp"> ~identPart
    input
      = caseInsensitive<"input"> ~identPart
    instr
      = caseInsensitive<"instr"> ~identPart
    int
      = caseInsensitive<"int"> ~identPart
    joy
      = caseInsensitive<"joy"> ~identPart
    key
      = caseInsensitive<"key"> ~identPart
    leftS
      = caseInsensitive<"left$"> ~identPart
    len
      = caseInsensitive<"len"> ~identPart
    let
      = caseInsensitive<"let"> ~identPart
    line
      = caseInsensitive<"line"> ~identPart
    list
      = caseInsensitive<"list"> ~identPart
    load
      = caseInsensitive<"load"> ~identPart
    locate
      = caseInsensitive<"locate"> ~identPart
    log
      = caseInsensitive<"log"> ~identPart
    log10
      = caseInsensitive<"log10"> ~identPart
    lowerS
      = caseInsensitive<"lower$"> ~identPart
    mask
      = caseInsensitive<"mask"> ~identPart
    max
      = caseInsensitive<"max"> ~identPart
    memory
      = caseInsensitive<"memory"> ~identPart
    merge
      = caseInsensitive<"merge"> ~identPart
    midS
      = caseInsensitive<"mid$"> ~identPart
    min
      = caseInsensitive<"min"> ~identPart
    mod
      = caseInsensitive<"mod"> ~identPart
    mode
      = caseInsensitive<"mode"> ~identPart
    move
      = caseInsensitive<"move"> ~identPart
    mover
      = caseInsensitive<"mover"> ~identPart
    new
      = caseInsensitive<"new"> ~identPart
    next
      = caseInsensitive<"next"> ~identPart
    not
      = caseInsensitive<"not"> ~identPart
    on
      = caseInsensitive<"on"> ~identPart
    openin
      = caseInsensitive<"openin"> ~identPart
    openout
      = caseInsensitive<"openout"> ~identPart
    or
      = caseInsensitive<"or"> ~identPart
    origin
      = caseInsensitive<"origin"> ~identPart
    out
      = caseInsensitive<"out"> ~identPart
    paper
      = caseInsensitive<"paper"> ~identPart
    peek
      = caseInsensitive<"peek"> ~identPart
    pen
      = caseInsensitive<"pen"> ~identPart
    pi
      = caseInsensitive<"pi"> ~identPart
    plot
      = caseInsensitive<"plot"> ~identPart
    plotr
      = caseInsensitive<"plotr"> ~identPart
    poke
      = caseInsensitive<"poke"> ~identPart
    pos
      = caseInsensitive<"pos"> ~identPart
    print
      = caseInsensitive<"print"> ~identPart
    rad
      = caseInsensitive<"rad"> ~identPart
    randomize
      = caseInsensitive<"randomize"> ~identPart
    read
      = caseInsensitive<"read"> ~identPart
    release
      = caseInsensitive<"release"> ~identPart
    rem
      = caseInsensitive<"rem"> ~identPart
    remain
      = caseInsensitive<"remain"> ~identPart
    renum
      = caseInsensitive<"renum"> ~identPart
    restore
      = caseInsensitive<"restore"> ~identPart
    resume
      = caseInsensitive<"resume"> ~identPart
    return
      = caseInsensitive<"return"> ~identPart
    rightS
      = caseInsensitive<"right$"> ~identPart
    rnd
      = caseInsensitive<"rnd"> ~identPart
    round
      = caseInsensitive<"round"> ~identPart
    run
      = caseInsensitive<"run"> ~identPart
    save
      = caseInsensitive<"save"> ~identPart
    sgn
      = caseInsensitive<"sgn"> ~identPart
    sin
      = caseInsensitive<"sin"> ~identPart
    sound
      = caseInsensitive<"sound"> ~identPart
    spaceS
      = caseInsensitive<"space$"> ~identPart
    spc
      = caseInsensitive<"spc"> ~identPart
    speed
      = caseInsensitive<"speed"> ~identPart
    sq
      = caseInsensitive<"sq"> ~identPart
    sqr
      = caseInsensitive<"sqr"> ~identPart
    step
      = caseInsensitive<"step"> ~identPart
    stop
      = caseInsensitive<"stop"> ~identPart
    strS
      = caseInsensitive<"str$"> ~identPart
    stringS
      = caseInsensitive<"string$"> ~identPart
    swap
      = caseInsensitive<"swap"> ~identPart
    symbol
      = caseInsensitive<"symbol"> ~identPart
    tab
      = caseInsensitive<"tab"> ~identPart
    tag
      = caseInsensitive<"tag"> ~identPart
    tagoff
      = caseInsensitive<"tagoff"> ~identPart
    tan
      = caseInsensitive<"tan"> ~identPart
    test
      = caseInsensitive<"test"> ~identPart
    testr
      = caseInsensitive<"testr"> ~identPart
    then
      = caseInsensitive<"then"> ~identPart
    time
      = caseInsensitive<"time"> ~identPart
    to
      = caseInsensitive<"to"> ~identPart
    troff
      = caseInsensitive<"troff"> ~identPart
    tron
      = caseInsensitive<"tron"> ~identPart
    unt
      = caseInsensitive<"unt"> ~identPart
    upperS
      = caseInsensitive<"upper$"> ~identPart
    using
      = caseInsensitive<"using"> ~identPart
    val
      = caseInsensitive<"val"> ~identPart
    vpos
      = caseInsensitive<"vpos"> ~identPart
    wait
      = caseInsensitive<"wait"> ~identPart
    wend
      = caseInsensitive<"wend"> ~identPart
    while
      = caseInsensitive<"while"> ~identPart
    width
      = caseInsensitive<"width"> ~identPart
    window
      = caseInsensitive<"window"> ~identPart
    write
      = caseInsensitive<"write"> ~identPart
    xor
      = caseInsensitive<"xor"> ~identPart
    xpos
      = caseInsensitive<"xpos"> ~identPart
    ypos
      = caseInsensitive<"ypos"> ~identPart
    zone
      = caseInsensitive<"zone"> ~identPart

    ident (an identifier)
      = ~keyword identName

    fnIdent
      = fn ~keyword identName

    identName = identStart identPart*

    identStart = letter

    identPart = identStart | digit

    variable = ident

    strIdent
      = ~keyword identName "$"

    strFnIdent
      = fn ~keyword identName "$"

    binaryDigit = "0".."1"

    exponentPart = ("e" | "E") signedDecimal

    decimalValue  (decimal number)
      = digit* "." digit+ exponentPart* -- fract
      | digit+            exponentPart* -- whole

    hexValue
      = "&" hexDigit+

    binaryValue
      = caseInsensitive<"&x"> binaryDigit+

    number  (a number)
      = decimalValue
      | hexValue
      | binaryValue

    signedDecimal
      = ("+" | "-")? decimalValue

    partToEol
      = (~eol any)*

    string = "\\"" ("\\\\\\"" | (~"\\"" any))* "\\""

    label = digit+

    space := " " | "\t"

    eol (end of line)
      = "\\n"
    }
  `
    };

    // Semantics.ts
    function getCodeSnippets() {
        const _o = {};
        let _data = [];
        let _dataPtr = 0;
        let _restoreMap = {};
        const codeSnippets = {
            _setDataDummy: function _setDataDummy() {
                _data = [];
                _dataPtr = 0;
                _restoreMap = {};
                //Object.assign(_o, vm);
            },
            bin$: function bin$(num, pad = 0) {
                return num.toString(2).toUpperCase().padStart(pad, "0");
            },
            cls: function cls() {
                _o.cls();
            },
            dec$: function dec$(num, format) {
                const [, decimalPart] = format.split(".", 2);
                const decimals = decimalPart ? decimalPart.length : 0;
                const str = num.toFixed(decimals);
                const padLen = format.length - str.length;
                const pad = padLen > 0 ? " ".repeat(padLen) : "";
                return pad + str;
            },
            dim: function dim(dims, initVal = 0) {
                const createRecursiveArray = (depth) => {
                    const length = dims[depth] + 1; // +1 because of 0-based index
                    const array = Array.from({ length }, () => depth + 1 < dims.length ? createRecursiveArray(depth + 1) : initVal);
                    return array;
                };
                return createRecursiveArray(0);
            },
            frame: function frame() {
                return new Promise(resolve => setTimeout(() => resolve(), Date.now() % 50));
            },
            hex$: function hex$(num, pad) {
                return num.toString(16).toUpperCase().padStart(pad || 0, "0");
            },
            input: function input(msg, isNum) {
                return new Promise(resolve => setTimeout(() => {
                    const input = _o.prompt(msg);
                    resolve(isNum ? Number(input) : input);
                }, 0));
            },
            print: function print(...args) {
                const _printNumber = (arg) => (arg >= 0 ? ` ${arg} ` : `${arg} `);
                const output = args.map((arg) => (typeof arg === "number") ? _printNumber(arg) : arg).join("");
                _o.print(output);
            },
            read: function read() {
                return _data[_dataPtr++];
            },
            restore: function restore(label) {
                _dataPtr = _restoreMap[label];
            },
            round: function round(num, dec) {
                return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
            },
            str$: function str$(num) {
                return num >= 0 ? ` ${num}` : String(num);
            },
            time: function time() {
                return (Date.now() * 3 / 10) | 0;
            },
            val: function val(str) {
                return Number(str.replace("&x", "0b").replace("&", "0x"));
            }
        };
        return codeSnippets;
    }
    /*
    // round with higher precision: https://www.jacklmoore.com/notes/rounding-in-javascript
    round: function round(num: number, dec: number) {
        const maxDecimals = 20 - Math.floor(Math.log10(Math.abs(num))); // limit for JS
        if (dec >= 0 && dec > maxDecimals) {
            dec = maxDecimals;
        }
        return Math.sign(num) * Number(Math.round(Number(Math.abs(num) + "e" + dec)) + "e" + (dec >= 0 ? -dec : -dec));
    }
    */
    function trimIndent(code) {
        const lines = code.split("\n");
        const lastLine = lines[lines.length - 1];
        const match = lastLine.match(/^(\s+)}$/);
        if (match) {
            const indent = match[1];
            const trimmedLines = lines.map((line) => line.startsWith(indent) ? line.slice(indent.length) : line);
            return trimmedLines.join("\n");
        }
        return code;
    }
    function evalChildren(children) {
        return children.map(c => c.eval());
    }
    function getSemantics(semanticsHelper) {
        // Semantics to evaluate an arithmetic expression
        const semantics = {
            Program(lines) {
                const lineList = evalChildren(lines.children);
                const variableList = semanticsHelper.getVariables();
                const variableDeclarations = variableList.length ? "let " + variableList.map((v) => v.endsWith("$") ? `${v} = ""` : `${v} = 0`).join(", ") + ";" : "";
                // find subroutines
                const definedLabels = semanticsHelper.getDefinedLabels();
                const gosubLabels = semanticsHelper.getGosubLabels();
                const restoreMap = semanticsHelper.getRestoreMap();
                const awaitLabels = [];
                let subroutineStart;
                for (const label of definedLabels) {
                    if (gosubLabels[label.label]) {
                        subroutineStart = label;
                    }
                    if (subroutineStart && label.last >= 0) {
                        const first = subroutineStart.first;
                        const indent = lineList[first].search(/\S|$/);
                        const indentStr = " ".repeat(indent);
                        let hasAwait = false;
                        for (let i = first; i <= label.last; i += 1) {
                            if (lineList[i].includes("await ")) {
                                hasAwait = true; // quick check
                            }
                            lineList[i] = "  " + lineList[i]; // indent
                        }
                        const asyncStr = hasAwait ? "async " : "";
                        lineList[first] = `${indentStr}${asyncStr}function _${subroutineStart.label}() {${indentStr}\n` + lineList[first];
                        lineList[label.last] += `\n${indentStr}` + "}"; //TS issue when using the following? `\n${indentStr}};`
                        if (hasAwait) {
                            awaitLabels.push(subroutineStart.label);
                        }
                        subroutineStart = undefined;
                    }
                    if (restoreMap[label.label] === -1) {
                        restoreMap[label.label] = label.dataIndex;
                    }
                }
                const dataList = semanticsHelper.getDataList();
                if (dataList.length) {
                    for (const key of Object.keys(restoreMap)) {
                        let index = restoreMap[key];
                        if (index < 0) {
                            index = 0;
                            restoreMap[key] = index;
                        }
                    }
                    lineList.unshift(`const {_data, _restoreMap} = _defineData();\nlet _dataPtr = 0;`);
                    lineList.push(`function _defineData() {\n  const _data = [\n${dataList.join(",\n")}\n  ];\n  const _restoreMap = ${JSON.stringify(restoreMap)};\n  return {_data, _restoreMap};\n}`);
                }
                lineList.push("// library");
                const instrMap = semanticsHelper.getInstrMap();
                const codeSnippets = getCodeSnippets();
                let needsAsync = false;
                for (const key of Object.keys(codeSnippets)) {
                    if (instrMap[key]) {
                        const code = String(codeSnippets[key]);
                        const adaptedCode = trimIndent(code);
                        if (adaptedCode.includes("Promise") || adaptedCode.includes("await")) {
                            lineList.push("async " + adaptedCode);
                            needsAsync = true;
                        }
                        else {
                            lineList.push(adaptedCode);
                        }
                    }
                }
                if (variableDeclarations) {
                    lineList.unshift(variableDeclarations);
                }
                if (needsAsync) {
                    lineList.unshift(`return async function() {`);
                    lineList.push('}();');
                }
                lineList.unshift(`"use strict"`);
                let lineStr = lineList.filter((line) => line.trimEnd() !== "").join('\n');
                if (awaitLabels.length) {
                    for (const label of awaitLabels) {
                        const regEx = new RegExp(`_${label}\\(\\);`, "g");
                        lineStr = lineStr.replace(regEx, `await _${label}();`);
                    }
                }
                return lineStr;
            },
            Line(label, stmts, comment, _eol) {
                const labelString = label.sourceString;
                const currentLineIndex = semanticsHelper.incrementLineIndex() - 1;
                if (labelString) {
                    semanticsHelper.addDefinedLabel(labelString, currentLineIndex);
                }
                const lineStr = stmts.eval();
                if (lineStr === "return") {
                    const definedLabels = semanticsHelper.getDefinedLabels();
                    if (definedLabels.length) {
                        const lastLabelItem = definedLabels[definedLabels.length - 1];
                        lastLabelItem.last = currentLineIndex;
                    }
                }
                const commentStr = comment.sourceString ? `; //${comment.sourceString.substring(1)}` : "";
                const semi = lineStr === "" || lineStr.endsWith("{") || lineStr.endsWith("}") || lineStr.startsWith("//") || commentStr ? "" : ";";
                const indentStr = semanticsHelper.getIndentStr();
                semanticsHelper.applyNextIndent();
                return indentStr + lineStr + commentStr + semi;
            },
            Statements(stmt, _stmtSep, stmts) {
                // separate statements, use ";", if the last stmt does not end with "{"
                const statements = [stmt.eval(), ...evalChildren(stmts.children)];
                return statements.reduce((acc, current) => acc.endsWith("{") ? `${acc} ${current}` : `${acc}; ${current}`);
            },
            ArrayAssign(ident, _op, e) {
                return `${ident.eval()} = ${e.eval()}`;
            },
            Assign(ident, _op, e) {
                const variableName = ident.sourceString;
                const resolvedVariableName = semanticsHelper.getVariable(variableName);
                const value = e.eval();
                return `${resolvedVariableName} = ${value}`;
            },
            Abs(_absLit, _open, e, _close) {
                return `Math.abs(${e.eval()})`;
            },
            Asc(_ascLit, _open, e, _close) {
                return `(${e.eval()}).charCodeAt(0)`;
            },
            Atn(_atnLit, _open, e, _close) {
                return `Math.atan(${e.eval()})`;
            },
            BinS(_binLit, _open, e, _comma, n, _close) {
                var _a;
                semanticsHelper.addInstr("bin$");
                const pad = (_a = n.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
                return pad !== undefined ? `bin$(${e.eval()}, ${pad})` : `bin$(${e.eval()})`;
            },
            ChrS(_chrLit, _open, e, _close) {
                return `String.fromCharCode(${e.eval()})`;
            },
            Comment(_commentLit, remain) {
                return `//${remain.sourceString}`;
            },
            Cos(_cosLit, _open, e, _close) {
                return `Math.cos(${e.eval()})`;
            },
            Cint(_cintLit, _open, e, _close) {
                return `Math.round(${e.eval()})`;
            },
            Cls(_clsLit) {
                semanticsHelper.addInstr("cls");
                return `cls()`;
            },
            Data(_datalit, args) {
                const argList = args.asIteration().children.map(c => c.eval());
                const definedLabels = semanticsHelper.getDefinedLabels();
                if (definedLabels.length) {
                    const currentLabel = definedLabels[definedLabels.length - 1];
                    if (currentLabel.dataIndex === -1) {
                        const dataIndex = semanticsHelper.getDataIndex();
                        currentLabel.dataIndex = dataIndex;
                    }
                }
                const dataList = semanticsHelper.getDataList();
                dataList.push(argList.join(", "));
                semanticsHelper.addDataIndex(argList.length);
                return "";
            },
            DecS(_decLit, _open, num, _comma, format, _close) {
                semanticsHelper.addInstr("dec$");
                return `dec$(${num.eval()}, ${format.eval()})`;
            },
            Def(_defLit, _fnLit, assign) {
                return `${assign.eval()}`;
            },
            DefArgs(_open, arrayIdents, _close) {
                const argList = arrayIdents.asIteration().children.map(c => c.eval());
                return `(${argList.join(", ")})`;
            },
            DefAssign(ident, args, _equal, e) {
                const argStr = args.children.map(c => c.eval()).join(", ") || "()";
                const fnIdent = semanticsHelper.getVariable(`fn${ident.sourceString}`);
                return `${fnIdent} = ${argStr} => ${e.eval()}`;
            },
            Dim(_dimLit, arrayIdents) {
                const argList = arrayIdents.asIteration().children.map(c => c.eval());
                const results = [];
                for (const arg of argList) {
                    const [ident, ...indices] = arg;
                    let createArrStr;
                    if (indices.length > 1) { // multi-dimensional?
                        const initValStr = ident.endsWith("$") ? ', ""' : '';
                        createArrStr = `dim([${indices}]${initValStr})`; // indices are automatically joined with comma
                        semanticsHelper.addInstr("dim");
                    }
                    else {
                        const fillStr = ident.endsWith("$") ? `""` : "0";
                        createArrStr = `new Array(${indices[0]} + 1).fill(${fillStr})`; // +1 because of 0-based index
                    }
                    results.push(`${ident} = ${createArrStr}`);
                }
                return results.join("; ");
            },
            End(_endLit) {
                return `return "end"`;
            },
            Erase(_eraseLit, arrayIdents) {
                const argList = arrayIdents.asIteration().children.map(c => c.eval());
                const results = [];
                for (const ident of argList) {
                    const initValStr = ident.endsWith("$") ? '""' : '0';
                    results.push(`${ident} = ${initValStr}`);
                }
                return results.join("; ");
            },
            Error(_errorLit, e) {
                return `throw new Error(${e.eval()})`;
            },
            Exp(_expLit, _open, e, _close) {
                return `Math.exp(${e.eval()})`;
            },
            Fix(_fixLit, _open, e, _close) {
                return `Math.trunc(${e.eval()})`;
            },
            FnArgs(_open, args, _close) {
                const argList = args.asIteration().children.map(c => c.eval());
                return `(${argList.join(", ")})`;
            },
            StrFnArgs(_open, args, _close) {
                const argList = args.asIteration().children.map(c => c.eval());
                return `(${argList.join(", ")})`;
            },
            FnIdent(fnIdent, args) {
                var _a;
                const argStr = ((_a = args.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "()";
                return `${fnIdent.eval()}${argStr}`;
            },
            StrFnIdent(fnIdent, args) {
                var _a;
                const argStr = ((_a = args.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "()";
                return `${fnIdent.eval()}${argStr}`;
            },
            For(_forLit, variable, _eqSign, start, _dirLit, end, _stepLit, step) {
                var _a;
                const varExp = variable.eval();
                const startExp = start.eval();
                const endExp = end.eval();
                const stepExp = ((_a = step.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "1";
                const stepAsNum = Number(stepExp);
                let cmpSt = "";
                if (isNaN(stepAsNum)) {
                    cmpSt = `${stepExp} >= 0 ? ${varExp} <= ${endExp} : ${varExp} >= ${endExp}`;
                }
                else {
                    cmpSt = stepExp >= 0 ? `${varExp} <= ${endExp}` : `${varExp} >= ${endExp}`;
                }
                semanticsHelper.nextIndentAdd(2);
                const result = `for (${varExp} = ${startExp}; ${cmpSt}; ${varExp} += ${stepExp}) {`;
                return result;
            },
            Frame(_frameLit) {
                semanticsHelper.addInstr("frame");
                return `await frame()`;
            },
            Gosub(_gosubLit, e) {
                const labelStr = e.sourceString;
                semanticsHelper.addGosubLabel(labelStr);
                return `_${labelStr}()`;
            },
            HexS(_hexLit, _open, e, _comma, n, _close) {
                var _a;
                semanticsHelper.addInstr("hex$");
                const pad = (_a = n.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
                return pad !== undefined ? `hex$(${e.eval()}, ${pad})` : `hex$(${e.eval()})`;
            },
            If(_iflit, condExp, _thenLit, thenStat, elseLit, elseStat) {
                const initialIndent = semanticsHelper.getIndentStr();
                semanticsHelper.addIndent(2);
                const increasedIndent = semanticsHelper.getIndentStr();
                const cond = condExp.eval();
                const thSt = thenStat.eval();
                let result = `if (${cond}) {\n${increasedIndent}${thSt}\n${initialIndent}}`; // put in newlines to also allow line comments
                if (elseLit.sourceString) {
                    const elseSt = evalChildren(elseStat.children).join('; ');
                    result += ` else {\n${increasedIndent}${elseSt}\n${initialIndent}}`;
                }
                semanticsHelper.addIndent(-2);
                return result;
            },
            Input(_inputLit, message, _semi, e) {
                semanticsHelper.addInstr("input");
                const msgStr = message.sourceString.replace(/\s*[;,]$/, "");
                const ident = e.eval();
                const isNumStr = ident.includes("$") ? "" : ", true";
                return `${ident} = await input(${msgStr}${isNumStr})`;
            },
            Instr(_instrLit, _open, e1, _comma, e2, _close) {
                return `((${e1.eval()}).indexOf(${e2.eval()}) + 1)`;
            },
            Int(_intLit, _open, e, _close) {
                return `Math.floor(${e.eval()})`;
            },
            LeftS(_leftLit, _open, e1, _comma, e2, _close) {
                return `(${e1.eval()}).slice(0, ${e2.eval()})`;
            },
            Len(_lenLit, _open, e, _close) {
                return `(${e.eval()}).length`;
            },
            Log(_logLit, _open, e, _close) {
                return `Math.log(${e.eval()})`;
            },
            Log10(_log10Lit, _open, e, _close) {
                return `Math.log10(${e.eval()})`;
            },
            LowerS(_lowerLit, _open, e, _close) {
                return `(${e.eval()}).toLowerCase()`;
            },
            Max(_maxLit, _open, args, _close) {
                const argList = args.asIteration().children.map(c => c.eval()); // see also: ArrayArgs
                return `Math.max(${argList})`;
            },
            MidS(_midLit, _open, e1, _comma1, e2, _comma2, e3, _close) {
                var _a;
                const length = (_a = e3.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
                const lengthStr = length === undefined ? "" : `, ${length}`;
                return `(${e1.eval()}).substr(${e2.eval()} - 1${lengthStr})`;
            },
            Min(_minLit, _open, args, _close) {
                const argList = args.asIteration().children.map(c => c.eval()); // see also: ArrayArgs
                return `Math.min(${argList})`;
            },
            Mode(_clsLit, _num) {
                semanticsHelper.addInstr("cls"); // currently MODE is the same as CLS
                return `cls()`;
            },
            Next(_nextLit, variables) {
                const argList = variables.asIteration().children.map(c => c.eval());
                if (!argList.length) {
                    argList.push("_any");
                }
                semanticsHelper.addIndent(-2 * argList.length);
                return '} '.repeat(argList.length).slice(0, -1);
            },
            On(_nLit, e1, _gosubLit, args) {
                const index = e1.eval();
                const argList = args.asIteration().children.map(c => c.sourceString);
                for (let i = 0; i < argList.length; i += 1) {
                    semanticsHelper.addGosubLabel(argList[i]);
                }
                return `[${argList.map((label) => `_${label}`).join(",")}]?.[${index} - 1]()`; // 1-based index
            },
            Pi(_piLit) {
                return "Math.PI";
            },
            PrintArg_strCmp(_cmp, args) {
                const paramStr = args.children[0].eval();
                return paramStr;
            },
            Print(_printLit, args, semi) {
                semanticsHelper.addInstr("print");
                const argList = args.asIteration().children.map(c => c.eval());
                const paramStr = argList.join(', ') || "";
                let newlineStr = "";
                if (!semi.sourceString) {
                    newlineStr = paramStr ? `, "\\n"` : `"\\n"`;
                }
                return `print(${paramStr}${newlineStr})`;
            },
            Read(_readlit, args) {
                semanticsHelper.addInstr("read");
                const argList = args.asIteration().children.map(c => c.eval());
                const results = argList.map(identifier => `${identifier} = read()`);
                return results.join("; ");
            },
            Rem(_remLit, remain) {
                return `// ${remain.sourceString}`;
            },
            Restore(_restoreLit, e) {
                const labelStr = e.sourceString || "0";
                semanticsHelper.addRestoreLabel(labelStr);
                semanticsHelper.addInstr("restore");
                return `restore(${labelStr})`;
            },
            Return(_returnLit) {
                return "return";
            },
            RightS(_rightLit, _open, e1, _comma, e2, _close) {
                return `(${e1.eval()}).slice(-(${e2.eval()}))`;
            },
            Rnd(_rndLit, _open, _e, _close) {
                // args are ignored
                return `Math.random()`;
            },
            Round(_roundLit, _open, value, _comma, decimals, _close) {
                var _a;
                const decimalPlaces = (_a = decimals.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
                if (decimalPlaces) {
                    semanticsHelper.addInstr("round");
                    return `round(${value.eval()}, ${decimalPlaces})`;
                }
                return `Math.round(${value.eval()})`; // common round without decimals places
                // A better way to avoid rounding errors: https://www.jacklmoore.com/notes/rounding-in-javascript
            },
            Sgn(_sgnLit, _open, e, _close) {
                return `Math.sign(${e.eval()})`;
            },
            Sin(_sinLit, _open, e, _close) {
                return `Math.sin(${e.eval()})`;
            },
            SpaceS(_stringLit, _open, len, _close) {
                return `" ".repeat(${len.eval()})`;
            },
            Sqr(_sqrLit, _open, e, _close) {
                return `Math.sqrt(${e.eval()})`;
            },
            Stop(_stopLit) {
                return `return "stop"`;
            },
            StrS(_strLit, _open, e, _close) {
                const arg = e.eval();
                if (isNaN(Number(arg))) {
                    semanticsHelper.addInstr("str$");
                    return `str$(${arg})`;
                }
                // simplify if we know at compile time that arg is a positive number
                return arg >= 0 ? `(" " + String(${arg}))` : `String(${arg})`;
            },
            StringS(_stringLit, _open, len, _commaLit, chr, _close) {
                // Note: String$: we only support second parameter as string; we do not use charAt(0) to get just one char
                return `(${chr.eval()}).repeat(${len.eval()})`;
            },
            Tan(_tanLit, _open, e, _close) {
                return `Math.tan(${e.eval()})`;
            },
            Time(_timeLit) {
                semanticsHelper.addInstr("time");
                return `time()`;
            },
            UpperS(_upperLit, _open, e, _close) {
                return `(${e.eval()}).toUpperCase()`;
            },
            Val(_upperLit, _open, e, _close) {
                const numPattern = /^"[\\+\\-]?\d*\.?\d+(?:[Ee][\\+\\-]?\d+)?"$/;
                const numStr = String(e.eval());
                if (numPattern.test(numStr)) {
                    return `Number(${numStr})`; // for non-hex/bin number strings we can use this simple version
                }
                semanticsHelper.addInstr("val");
                return `val(${numStr})`;
            },
            Wend(_wendLit) {
                semanticsHelper.addIndent(-2);
                return '}';
            },
            While(_whileLit, e) {
                const cond = e.eval();
                semanticsHelper.nextIndentAdd(2);
                return `while (${cond}) {`;
            },
            XorExp_xor(a, _op, b) {
                return `${a.eval()} ^ ${b.eval()}`;
            },
            OrExp_or(a, _op, b) {
                return `${a.eval()} | ${b.eval()}`;
            },
            AndExp_and(a, _op, b) {
                return `${a.eval()} & ${b.eval()}`;
            },
            NotExp_not(_op, e) {
                return `~(${e.eval()})`;
            },
            CmpExp_eq(a, _op, b) {
                return `-(${a.eval()} === ${b.eval()})`; // or -Number(...), or -(...), or: ? -1 : 0
            },
            CmpExp_ne(a, _op, b) {
                return `-(${a.eval()} !== ${b.eval()})`;
            },
            CmpExp_lt(a, _op, b) {
                return `-(${a.eval()} < ${b.eval()})`;
            },
            CmpExp_le(a, _op, b) {
                return `-(${a.eval()} <= ${b.eval()})`;
            },
            CmpExp_gt(a, _op, b) {
                return `-(${a.eval()} > ${b.eval()})`;
            },
            CmpExp_ge(a, _op, b) {
                return `-(${a.eval()} >= ${b.eval()})`;
            },
            AddExp_plus(a, _op, b) {
                return `${a.eval()} + ${b.eval()}`;
            },
            AddExp_minus(a, _op, b) {
                return `${a.eval()} - ${b.eval()}`;
            },
            ModExp_mod(a, _op, b) {
                return `${a.eval()} % ${b.eval()}`;
            },
            DivExp_div(a, _op, b) {
                return `((${a.eval()} / ${b.eval()}) | 0)`;
            },
            MulExp_times(a, _op, b) {
                return `${a.eval()} * ${b.eval()}`;
            },
            MulExp_divide(a, _op, b) {
                return `${a.eval()} / ${b.eval()}`;
            },
            ExpExp_power(a, _, b) {
                return `Math.pow(${a.eval()}, ${b.eval()})`;
            },
            PriExp_paren(_open, e, _close) {
                return `(${e.eval()})`;
            },
            PriExp_pos(_op, e) {
                return `+${e.eval()}`;
            },
            PriExp_neg(_op, e) {
                return `-${e.eval()}`;
            },
            StrCmpExp_eq(a, _op, b) {
                return `-(${a.eval()} === ${b.eval()})`;
            },
            StrCmpExp_ne(a, _op, b) {
                return `-(${a.eval()} !== ${b.eval()})`;
            },
            StrCmpExp_lt(a, _op, b) {
                return `-(${a.eval()} < ${b.eval()})`;
            },
            StrCmpExp_le(a, _op, b) {
                return `-(${a.eval()} <= ${b.eval()})`;
            },
            StrCmpExp_gt(a, _op, b) {
                return `-(${a.eval()} > ${b.eval()})`;
            },
            StrCmpExp_ge(a, _op, b) {
                return `-(${a.eval()} >= ${b.eval()})`;
            },
            StrAddExp_plus(a, _op, b) {
                return `${a.eval()} + ${b.eval()}`;
            },
            StrPriExp_paren(_open, e, _close) {
                return `(${e.eval()})`;
            },
            ArrayArgs(args) {
                return args.asIteration().children.map(c => String(c.eval()));
            },
            ArrayIdent(ident, _open, e, _close) {
                return `${ident.eval()}[${e.eval().join("][")}]`;
            },
            StrArrayIdent(ident, _open, e, _close) {
                return `${ident.eval()}[${e.eval().join("][")}]`;
            },
            DimArrayIdent(ident, _open, indices, _close) {
                return [ident.eval(), ...indices.eval()];
            },
            decimalValue(value) {
                return value.sourceString;
            },
            hexValue(_prefix, value) {
                return `0x${value.sourceString}`;
            },
            binaryValue(_prefix, value) {
                return `0b${value.sourceString}`;
            },
            signedDecimal(sign, value) {
                return `${sign.sourceString}${value.sourceString}`;
            },
            string(_quote1, e, _quote2) {
                return `"${e.sourceString}"`;
            },
            ident(ident) {
                const name = ident.sourceString;
                return semanticsHelper.getVariable(name);
            },
            fnIdent(fn, ident) {
                const name = fn.sourceString + ident.sourceString;
                return semanticsHelper.getVariable(name);
            },
            strIdent(ident, typeSuffix) {
                const name = ident.sourceString + typeSuffix.sourceString;
                return semanticsHelper.getVariable(name);
            },
            strFnIdent(fn, ident, typeSuffix) {
                const name = fn.sourceString + ident.sourceString + typeSuffix.sourceString;
                return semanticsHelper.getVariable(name);
            }
        };
        return semantics;
    }
    class Semantics {
        constructor() {
            this.lineIndex = 0;
            this.indent = 0;
            this.indentAdd = 0;
            this.variables = {};
            this.definedLabels = [];
            this.gosubLabels = {};
            this.dataList = [];
            this.dataIndex = 0;
            this.restoreMap = {};
            this.instrMap = {};
        }
        addIndent(num) {
            if (num < 0) {
                this.applyNextIndent();
            }
            this.indent += num;
            return this.indent;
        }
        setIndent(indent) {
            this.indent = indent;
        }
        getIndent() {
            return this.indent;
        }
        getIndentStr() {
            if (this.indent < 0) {
                console.error("getIndentStr: lineIndex=", this.lineIndex, ", indent=", this.indent);
                return "";
            }
            return " ".repeat(this.indent);
        }
        applyNextIndent() {
            this.indent += this.indentAdd;
            this.indentAdd = 0;
        }
        nextIndentAdd(num) {
            this.indentAdd += num;
        }
        addDataIndex(count) {
            return this.dataIndex += count;
        }
        getDataIndex() {
            return this.dataIndex;
        }
        addDefinedLabel(label, line) {
            this.definedLabels.push({
                label,
                first: line,
                last: -1,
                dataIndex: -1
            });
        }
        getDefinedLabels() {
            return this.definedLabels;
        }
        addGosubLabel(label) {
            this.gosubLabels[label] = this.gosubLabels[label] || {
                count: 0
            };
            this.gosubLabels[label].count = (this.gosubLabels[label].count || 0) + 1;
        }
        getGosubLabels() {
            return this.gosubLabels;
        }
        getInstrMap() {
            return this.instrMap;
        }
        addInstr(name) {
            this.instrMap[name] = (this.instrMap[name] || 0) + 1;
            return this.instrMap[name];
        }
        getVariables() {
            return Object.keys(this.variables);
        }
        getVariable(name) {
            name = name.toLowerCase();
            if (Semantics.reJsKeyword.test(name)) {
                name = `_${name}`;
            }
            this.variables[name] = (this.variables[name] || 0) + 1;
            return name;
        }
        static deleteAllItems(items) {
            for (const name in items) {
                delete items[name];
            }
        }
        incrementLineIndex() {
            this.lineIndex += 1;
            return this.lineIndex;
        }
        getRestoreMap() {
            return this.restoreMap;
        }
        addRestoreLabel(label) {
            this.restoreMap[label] = -1;
        }
        getDataList() {
            return this.dataList;
        }
        resetParser() {
            this.lineIndex = 0;
            this.indent = 0;
            this.indentAdd = 0;
            Semantics.deleteAllItems(this.variables);
            this.definedLabels.length = 0;
            Semantics.deleteAllItems(this.gosubLabels);
            this.dataList.length = 0;
            this.dataIndex = 0;
            Semantics.deleteAllItems(this.restoreMap);
            Semantics.deleteAllItems(this.instrMap);
        }
        getSemantics() {
            const semanticsHelper = {
                addDataIndex: (count) => this.addDataIndex(count),
                addDefinedLabel: (label, line) => this.addDefinedLabel(label, line),
                addGosubLabel: (label) => this.addGosubLabel(label),
                addIndent: (num) => this.addIndent(num),
                addInstr: (name) => this.addInstr(name),
                addRestoreLabel: (label) => this.addRestoreLabel(label),
                applyNextIndent: () => this.applyNextIndent(),
                getDataIndex: () => this.getDataIndex(),
                getDataList: () => this.getDataList(),
                getDefinedLabels: () => this.getDefinedLabels(),
                getGosubLabels: () => this.getGosubLabels(),
                getIndent: () => this.getIndent(),
                getIndentStr: () => this.getIndentStr(),
                getInstrMap: () => this.getInstrMap(),
                getRestoreMap: () => this.getRestoreMap(),
                getVariable: (name) => this.getVariable(name),
                getVariables: () => this.getVariables(),
                incrementLineIndex: () => this.incrementLineIndex(),
                nextIndentAdd: (num) => this.nextIndentAdd(num),
                setIndent: (indent) => this.setIndent(indent)
            };
            return getSemantics(semanticsHelper);
        }
    }
    Semantics.reJsKeyword = /^(arguments|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/;

    // core.ts
    const vm = {
        _output: "",
        _fnOnCls: (() => undefined),
        _fnOnPrint: ((_msg) => undefined), // eslint-disable-line @typescript-eslint/no-unused-vars
        _fnOnPrompt: ((_msg) => ""), // eslint-disable-line @typescript-eslint/no-unused-vars
        cls: () => {
            vm._output = "";
            vm._fnOnCls();
        },
        print(...args) {
            this._output += args.join('');
            if (this._output.endsWith("\n")) {
                this._fnOnPrint(this._output);
                this._output = "";
            }
        },
        prompt: (msg) => {
            return vm._fnOnPrompt(msg);
        },
        getOutput: () => vm._output,
        setOutput: (str) => vm._output = str,
        setOnCls: (fn) => vm._fnOnCls = fn,
        setOnPrint: (fn) => vm._fnOnPrint = fn,
        setOnPrompt: (fn) => vm._fnOnPrompt = fn
    };
    class Core {
        constructor() {
            this.startConfig = {
                action: "compile,run",
                debug: 0,
                example: "",
                fileName: "",
                input: "",
                debounceCompile: 800,
                debounceExecute: 400
            };
            this.semantics = new Semantics();
            this.examples = {};
            this.vm = vm;
            this.onCheckSyntax = (_s) => __awaiter(this, void 0, void 0, function* () { return ""; }); // eslint-disable-line @typescript-eslint/no-unused-vars
        }
        getConfigObject() {
            return this.startConfig;
        }
        getConfig(name) {
            return this.startConfig[name];
        }
        getExampleObject() {
            return this.examples;
        }
        setExample(name, script) {
            this.examples[name] = script;
        }
        getExample(name) {
            return this.examples[name];
        }
        setOnCls(fn) {
            vm.setOnCls(fn);
        }
        setOnPrint(fn) {
            vm.setOnPrint(fn);
        }
        setOnPrompt(fn) {
            vm.setOnPrompt(fn);
        }
        setOnCheckSyntax(fn) {
            this.onCheckSyntax = fn;
        }
        compileScript(script) {
            if (!this.arithmeticParser) {
                this.arithmeticParser = new Parser(arithmetic.grammar, this.semantics.getSemantics());
            }
            this.semantics.resetParser();
            return this.arithmeticParser.parseAndEval(script);
        }
        executeScript(compiledScript) {
            return __awaiter(this, void 0, void 0, function* () {
                this.vm.setOutput("");
                if (compiledScript.startsWith("ERROR")) {
                    return "ERROR";
                }
                const syntaxError = yield this.onCheckSyntax(compiledScript);
                if (syntaxError) {
                    vm.cls();
                    return "ERROR: " + syntaxError;
                }
                try {
                    const fnScript = new Function("_o", compiledScript);
                    const result = fnScript(this.vm) || "";
                    let output;
                    if (result instanceof Promise) {
                        output = yield result;
                        output = this.vm.getOutput() + output;
                    }
                    else {
                        output = this.vm.getOutput() + result;
                    }
                    return output;
                }
                catch (error) {
                    let errorMessage = "ERROR: ";
                    if (error instanceof Error) {
                        errorMessage += this.vm.getOutput() + "\n" + String(error);
                        const anyErr = error;
                        const lineNumber = anyErr.lineNumber; // only on FireFox
                        const columnNumber = anyErr.columnNumber; // only on FireFox
                        if (lineNumber || columnNumber) {
                            const errLine = lineNumber - 2; // lineNumber -2 because of anonymous function added by new Function() constructor
                            errorMessage += ` (Line ${errLine}, column ${columnNumber})`;
                        }
                    }
                    else {
                        errorMessage += "unknown";
                    }
                    return errorMessage;
                }
            });
        }
        putScriptInFrame(script) {
            const result = `(function(_o) {
	${script}
})({
	_output: "",
	cls: () => undefined,
	print(...args: string[]) { this._output += args.join(''); },
	prompt: (msg) => { console.log(msg); return ""; }
});`;
            return result;
        }
    }

    // main.ts
    //
    // Usage:
    // node dist/locobasic.js [action='compile,run'] [input=<statements>] [example=<name>]
    //
    // - Examples for compile and run:
    // node dist/locobasic.js input='print "Hello!"'
    // npx ts-node dist/locobasic.js input='print "Hello!"'
    // node dist/locobasic.js input="?3 + 5 * (2 - 8)"
    // node dist/locobasic.js example=euler
    // node dist/locobasic.js fileName=dist/examples/example.bas
    //
    // - Example for compile only:
    // node dist/locobasic.js action='compile' input='print "Hello!";' > hello1.js
    //   [Windows: Use node.exe when redirecting into a file; or npx ts-node ...]
    // node hello1.js
    // [When using async functions like FRAME or INPUT, redirect to hello1.mjs]
    //
    const core = new Core();
    let ui;
    function fnHereDoc(fn) {
        return String(fn).
            replace(/^[^/]+\/\*\S*/, "").
            replace(/\*\/[^/]+$/, "");
    }
    function addItem(key, input) {
        let inputString = (typeof input !== "string") ? fnHereDoc(input) : input;
        inputString = inputString.replace(/^\n/, "").replace(/\n$/, ""); // remove preceding and trailing newlines
        // beware of data files ending with newlines! (do not use trimEnd)
        if (!key) { // maybe ""
            const firstLine = inputString.slice(0, inputString.indexOf("\n"));
            const matches = firstLine.match(/^\s*\d*\s*(?:REM|rem|')\s*(\w+)/);
            key = matches ? matches[1] : "unknown";
        }
        core.setExample(key, inputString);
    }
    let fs;
    let modulePath;
    function nodeReadFile(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!fs) {
                fs = require("fs");
            }
            if (!module) {
                module = require("module");
                modulePath = module.path || "";
                if (!modulePath) {
                    console.warn("nodeReadFile: Cannot determine module path");
                }
            }
            return fs.promises.readFile(name, "utf8");
        });
    }
    function fnParseArgs(args, config) {
        for (let i = 0; i < args.length; i += 1) {
            const [name, ...valueParts] = args[i].split("="), nameType = typeof config[name];
            let value = valueParts.join("=");
            if (value !== undefined) {
                if (nameType === "boolean") {
                    value = (value === "true");
                }
                else if (nameType === "number") {
                    value = Number(value);
                }
                config[name] = value;
            }
        }
        return config;
    }
    function keepRunning(fn, timeout) {
        const timerId = setTimeout(() => { }, timeout);
        return (() => __awaiter(this, void 0, void 0, function* () {
            fn();
            clearTimeout(timerId);
        }))();
    }
    function start(input) {
        const actionConfig = core.getConfig("action");
        if (input !== "") {
            const compiledScript = actionConfig.includes("compile") ? core.compileScript(input) : input;
            //console.log("INFO: Compiled:\n" + compiledScript + "\n---");
            if (actionConfig.includes("run")) {
                core.setOnPrint((msg) => {
                    console.log(msg.replace(/\n$/, ""));
                });
                return keepRunning(() => __awaiter(this, void 0, void 0, function* () {
                    const output = yield core.executeScript(compiledScript);
                    console.log(output.replace(/\n$/, ""));
                }), 5000);
            }
            else {
                const inFrame = core.putScriptInFrame(compiledScript);
                console.log(inFrame);
            }
        }
        else {
            console.log("No input");
        }
    }
    function main(config) {
        let input = config.input || "";
        if (config.fileName) {
            return keepRunning(() => __awaiter(this, void 0, void 0, function* () {
                input = yield nodeReadFile(config.fileName);
                start(input);
            }), 5000);
        }
        else {
            if (config.example) {
                const examples = core.getExampleObject();
                if (!Object.keys(examples).length) {
                    return keepRunning(() => __awaiter(this, void 0, void 0, function* () {
                        const jsFile = yield nodeReadFile("./dist/examples/examples.js");
                        // ?? require('./examples/examples.js');
                        const fnScript = new Function("cpcBasic", jsFile);
                        fnScript({
                            addItem: addItem
                        });
                        input = examples[config.example];
                        start(input);
                    }), 5000);
                }
                input += examples[config.example];
            }
            start(input);
        }
    }
    const config = core.getConfigObject();
    if (typeof window !== "undefined") {
        window.cpcBasic = {
            addItem: addItem
        };
        window.onload = () => {
            const UI = window.locobasicUI.UI;
            ui = new UI(core);
            const args = ui.parseUri(window.location.search.substring(1), config);
            fnParseArgs(args, config);
            core.setOnCls(() => ui.setOutputText(""));
            core.setOnPrint((msg) => ui.addOutputText(msg));
            core.setOnPrompt((msg) => window.prompt(msg));
            core.setOnCheckSyntax((s) => Promise.resolve(ui.checkSyntax(s)));
            ui.onWindowLoad(new Event("onload"));
        };
    }
    else {
        main(fnParseArgs(global.process.argv.slice(2), config));
    }

}));
//# sourceMappingURL=locobasic.js.map
