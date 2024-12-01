(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('ohm-js')) :
    typeof define === 'function' && define.amd ? define(['exports', 'ohm-js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.locobasic = {}, global.ohmJs));
})(this, (function (exports, ohmJs) { 'use strict';

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
     | Comparison
     | Cls
     | Data
     | Dim
     | End
     | ForLoop
     | Gosub
     | Next
     | On
     | Print
     | Read
     | Rem
     | Restore
     | Return
     | Stop
     | WhileLoop
     | Wend
     | ArrayAssign
     | Assign

    ArrayAssign
      = ArrayIdent "=" NumExp
      | StrArrayIdent "=" StrExp

    Abs
      = caseInsensitive<"abs"> "(" NumExp ")"

    Asc
      = caseInsensitive<"asc"> "(" StrExp ")"

    Atn
      = caseInsensitive<"atn"> "(" NumExp ")"

    Assign
      = ident "=" NumExp
      | strIdent "=" StrExp

    Bin
      = caseInsensitive<"bin$"> "(" NumExp ("," NumExp)? ")"

    Chr
      = caseInsensitive<"chr$"> "(" NumExp ")"

    Cint
      = caseInsensitive<"cint"> "(" NumExp ")"

    Cls
      = caseInsensitive<"cls">

    Comment
      = "\\'" partToEol

    Cos
      = caseInsensitive<"cos"> "(" NumExp ")"

    DataItem
      = string | number

    Data
      = caseInsensitive<"data"> NonemptyListOf<DataItem, ",">  // TODO: also hex number?

    Dim
      = caseInsensitive<"dim"> NonemptyListOf<DimArrayIdent, ",">

    End
      = caseInsensitive<"end">

    Exp
      = caseInsensitive<"exp"> "(" NumExp ")"

    Fix
      = caseInsensitive<"fix"> "(" NumExp ")"

    ForLoop
      = caseInsensitive<"for"> variable "=" NumExp caseInsensitive<"to"> NumExp (caseInsensitive<"step"> NumExp)?

    Gosub
      = caseInsensitive<"gosub"> label

    Hex
      = caseInsensitive<"hex$"> "(" NumExp ("," NumExp)? ")"

    Int
      = caseInsensitive<"int"> "(" NumExp ")"

    Left
      = caseInsensitive<"left$"> "(" StrExp "," NumExp ")"

    Len
      = caseInsensitive<"len"> "(" StrExp ")"

    Log
      = caseInsensitive<"log"> "(" NumExp ")"

    Log10
      = caseInsensitive<"log10"> "(" NumExp ")"

    Lower
      = caseInsensitive<"lower$"> "(" StrExp ")"

    Max
      = caseInsensitive<"max"> "(" NonemptyListOf<NumExp, ","> ")"

    Mid
      = caseInsensitive<"mid$"> "(" StrExp "," NumExp ("," NumExp)? ")"

    Min
      = caseInsensitive<"min"> "(" NonemptyListOf<NumExp, ","> ")"

    Pi
      = caseInsensitive<"pi">

    Next
     = caseInsensitive<"next"> ListOf<variable, ",">

    On
     = caseInsensitive<"on"> NumExp caseInsensitive<"gosub"> NonemptyListOf<label, ",">

    Print
      = (caseInsensitive<"print"> | "?") PrintArgs? (";")?

    PrintArgs
      = PrintArg (("," | ";") PrintArg)*

    PrintArg
      = StrOrNumExp

    ReadItem
      = StrArrayIdent
      | ArrayIdent
      | strIdent
      | ident

    Read
      = caseInsensitive<"read"> NonemptyListOf<ReadItem, ",">

    Rem
      = caseInsensitive<"Rem"> partToEol

    Restore
      = caseInsensitive<"Restore"> label?

    Return
      = caseInsensitive<"return">

    Right
      = caseInsensitive<"right$"> "(" StrExp "," NumExp ")"

    Rnd
      = caseInsensitive<"rnd"> "(" NumExp? ")"
    
    Round
      = caseInsensitive<"round"> "(" NumExp ("," NumExp)? ")"

    Sgn
      = caseInsensitive<"sgn"> "(" NumExp ")"

    Sin
      = caseInsensitive<"sin"> "(" NumExp ")"

    Space2
      = caseInsensitive<"space$"> "(" NumExp ")"

    Sqr
      = caseInsensitive<"sqr"> "(" NumExp ")"

    Stop
      = caseInsensitive<"stop">

    Str
      = caseInsensitive<"str$"> "(" NumExp ")"

    String2
      = caseInsensitive<"string$"> "(" NumExp "," StrExp ")"

    Tan
      = caseInsensitive<"tan"> "(" NumExp ")"

    Time
      = caseInsensitive<"time">

    Upper
      = caseInsensitive<"upper$"> "(" StrExp ")"

    Val
      = caseInsensitive<"val"> "(" StrExp ")"

    Wend
      = caseInsensitive<"wend">

    WhileLoop
      = caseInsensitive<"while"> StrOrNumExp

    Comparison
      = caseInsensitive<"if"> StrOrNumExp caseInsensitive<"then"> Statements (caseInsensitive<"else"> Statements)?

    StrExp
      = StrOrExp

    StrOrExp
      = StrAndExp caseInsensitive<"or"> StrOrExp  -- or
      | StrAndExp

    StrAndExp
      = StrCmpExp caseInsensitive<"and"> StrAndExp  -- and
      | StrCmpExp

    StrCmpExp
      = StrCmpExp "=" StrAddExp  -- eq
      | StrCmpExp "<>" StrAddExp  -- ne
      | StrAddExp

    StrAddExp
      = StrAddExp "+" StrPriExp  -- plus
      | StrPriExp

    StrPriExp
      = "(" StrExp ")"  -- paren
      | Bin
      | Chr
      | Hex
      | Left
      | Lower
      | Mid
      | Right
      | Space2
      | Str
      | String2
      | Upper
      | StrArrayIdent
      | strIdent
      | string

    StrOrNumExp
      = StrExp | NumExp

    NumExp
      = XorExp

    XorExp
      = OrExp caseInsensitive<"xor"> XorExp  -- xor
      | OrExp

    OrExp
      = AndExp caseInsensitive<"or"> OrExp  -- or
      | AndExp

    AndExp
      = NotExp caseInsensitive<"and"> AndExp  -- and
      | NotExp

    NotExp
      = caseInsensitive<"not"> NotExp  -- not
      | CmpExp

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
      = ModExp caseInsensitive<"mod"> DivExp -- mod
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
      = NonemptyListOf<StrOrNumExp, ",">

    ArrayIdent
      = ident "(" ArrayArgs ")"

    StrArrayIdent
      = strIdent "(" ArrayArgs ")"

    DimArrayIdent
      = ident "(" ArrayArgs ")"
      | strIdent "(" ArrayArgs ")"

    keyword
      = abs | after | and | asc | atn | auto | bin | border | break
      | call | cat | chain | chr | cint | clear | clg | closein | closeout | cls | cont | copychr | cos | creal | cursor
      | data | dec | def | defint | defreal | defstr | deg | delete | derr | di | dim | draw | drawr
      | edit | ei | else | end2 | ent | env | eof | erase | erl | err | error | every | exp | fill | fix | fn | for | frame | fre | gosub | goto | graphics
      | hex | himem | if | ink | inkey | inp | input | instr | int | joy | key | left | len | let | line | list | load | locate | log | log10 | lower2
      | mask | max | memory | merge | mid | min | mod | mode | move | mover | new | next | not | on | openin | openout | or | origin | out
      | paper | peek | pen | pi | plot | plotr | poke | pos | print
      | rad | randomize | read | release | rem | remain | renum | restore | resume | return | right | rnd | round | run
      | save | sgn | sin | sound | space2 | spc | speed | sq | sqr | step | stop | str | string2 | swap | symbol
      | tab | tag | tagoff | tan | test | testr | then | time | to | troff | tron | unt | upper2 | using
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
    bin
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
    chr
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
    copychr
    = caseInsensitive<"copychr$"> ~identPart
    cos
    = caseInsensitive<"cos"> ~identPart
    creal
    = caseInsensitive<"creal"> ~identPart
    cursor
    = caseInsensitive<"cursor"> ~identPart
    data
    = caseInsensitive<"data"> ~identPart
    dec
    = caseInsensitive<"dec"> ~identPart
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
    end2
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
    = caseInsensitive<"fn"> ~identPart
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
    hex
    = caseInsensitive<"hex$"> ~identPart
    himem
    = caseInsensitive<"himem"> ~identPart
    if
    = caseInsensitive<"if"> ~identPart
    ink
    = caseInsensitive<"ink"> ~identPart
    inkey
    = caseInsensitive<"inkey"> ~identPart
    | caseInsensitive<"inkey$"> ~identPart
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
    left
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
    lower2
    = caseInsensitive<"lower$"> ~identPart
    mask
    = caseInsensitive<"mask"> ~identPart
    max
    = caseInsensitive<"max"> ~identPart
    memory
    = caseInsensitive<"memory"> ~identPart
    merge
    = caseInsensitive<"merge"> ~identPart
    mid
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
    right
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
    space2
    = caseInsensitive<"space"> ~identPart
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
    str
    = caseInsensitive<"str$"> ~identPart
    string2
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
    upper2
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


    ident (an identifier) =
      ~keyword identName

    identName = identStart identPart*

    identStart = letter

    identPart = identStart | digit

    variable = ident

    strIdent
     = ~keyword identName ("$")

    binaryDigit = "0".."1"

    decimalValue  (decimal number)
      = digit* "." digit+  -- fract
      | digit+             -- whole

    hexValue
      = "&" hexDigit+

    binaryValue
      = caseInsensitive<"&x"> binaryDigit+

    number  (a number)
      = decimalValue
      | hexValue
      | binaryValue

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

    // parser.ts
    // A simple parser for arithmetic expressions using Ohm
    //
    // Usage:
    // node dist/locobasic.js input="?3 + 5 * (2 - 8)"
    // node dist/locobasic.js fileName=dist/examples/example.bas
    // node dist/locobasic.js example=euler
    //
    // [ npx ts-node parser.ts input="?3 + 5 * (2 - 8)" ]
    const startConfig = {
        debug: 0,
        example: "",
        fileName: "",
        input: "",
        debounceCompile: 800,
        debounceExecute: 400
    };
    const examples = {};
    function dimArray(dims, initVal = 0) {
        const createRecursiveArray = function (depth) {
            const length = dims[depth] + 1, // +1 because of 0-based index
            array = new Array(length);
            depth += 1;
            if (depth < dims.length) { // more dimensions?
                for (let i = 0; i < length; i += 1) {
                    array[i] = createRecursiveArray(depth); // recursive call
                }
            }
            else { // one dimension
                array.fill(initVal);
            }
            return array;
        };
        return createRecursiveArray(0);
    }
    const vm = {
        _output: "",
        _fnOnCls: (() => undefined),
        dimArray: dimArray,
        cls: () => {
            vm._output = "";
            vm._fnOnCls();
        },
        print: (...args) => vm._output += args.join(''),
        getOutput: () => vm._output,
        setOutput: (str) => vm._output = str,
        setOnCls: (fn) => vm._fnOnCls = fn
    };
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
    const variables = {};
    const reJsKeyword = /^(arguments|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/;
    function getVariable(name) {
        name = name.toLowerCase();
        if (reJsKeyword.test(name)) {
            name = `_${name}`;
        }
        variables[name] = (variables[name] || 0) + 1;
        return name;
    }
    function deleteAllItems(items) {
        for (const name in items) { // eslint-disable-line guard-for-in
            delete items[name];
        }
    }
    const definedLabels = [];
    const gosubLabels = {};
    let lineIndex = 0;
    const dataList = [];
    const restoreMap = {};
    function addDefinedLabel(label, line) {
        definedLabels.push({
            label,
            first: line,
            last: -1,
            dataIndex: -1
        });
    }
    function addGosubLabel(label) {
        gosubLabels[label] = gosubLabels[label] || {
            count: 0
        };
        gosubLabels[label].count = (gosubLabels[label].count || 0) + 1;
    }
    function addRestoreLabel(label) {
        restoreMap[label] = -1;
    }
    function resetParser() {
        deleteAllItems(variables);
        definedLabels.length = 0;
        deleteAllItems(gosubLabels);
        lineIndex = 0;
        dataList.length = 0;
        deleteAllItems(restoreMap);
    }
    function evalChildren(children) {
        return children.map(c => c.eval());
    }
    // Semantics to evaluate an arithmetic expression
    const semantics = {
        Program(lines) {
            const lineList = evalChildren(lines.children);
            const variabeList = Object.keys(variables);
            const varStr = variabeList.length ? "let " + variabeList.map((v) => v.endsWith("$") ? `${v} = ""` : `${v} = 0`).join(", ") + ";\n" : "";
            // find subroutines
            let subFirst;
            for (let index = 0; index < definedLabels.length; index += 1) {
                const item = definedLabels[index];
                if (gosubLabels[item.label]) {
                    subFirst = item;
                }
                if (subFirst && item.last >= 0) {
                    const first = subFirst.first;
                    const indent = lineList[first].search(/\S|$/);
                    const indentStr = " ".repeat(indent);
                    for (let i = first; i <= item.last; i += 1) {
                        lineList[i] = "  " + lineList[i]; // ident
                    }
                    lineList[first] = `${indentStr}function _${subFirst.label}() {${indentStr}\n` + lineList[first];
                    lineList[item.last] += `\n${indentStr}` + "}"; //TS issue when using the following? `\n${indentStr}};`
                    subFirst = undefined;
                }
                if (restoreMap[item.label] === -1) {
                    restoreMap[item.label] = item.dataIndex;
                }
            }
            if (dataList.length) {
                lineList.unshift(`const _data = _getData();\nconst _restoreMap = _getRestore();\nlet _dataPrt = 0;`);
                lineList.push(`function _getData() {\nreturn [\n${dataList.join(",\n")}\n];\n}`);
                lineList.push(`function _getRestore() {\nreturn [\n${JSON.stringify(restoreMap)}\n];\n}`);
            }
            const lineStr = lineList.join('\n');
            return varStr + lineStr;
        },
        Line(label, stmts, comment, _eol) {
            const labelStr = label.sourceString;
            if (labelStr) {
                addDefinedLabel(labelStr, lineIndex);
            }
            const lineStr = stmts.eval();
            if (lineStr === "return") {
                if (definedLabels.length) {
                    const lastLabelItem = definedLabels[definedLabels.length - 1];
                    lastLabelItem.last = lineIndex;
                }
            }
            const commentStr = comment.sourceString ? `; //${comment.sourceString.substring(1)}` : "";
            const semi = lineStr === "" || lineStr.endsWith("{") || lineStr.startsWith("//") || commentStr ? "" : ";";
            lineIndex += 1;
            return lineStr + commentStr + semi;
        },
        Statements(stmt, _stmtSep, stmts) {
            return [stmt.eval(), ...evalChildren(stmts.children)].join('; ');
            //TODO: return [stmt.eval(), ...evalChildren(stmts.children)].map((e) => e.endsWith("{") ? e : `${e};`).join(' ');
        },
        ArrayAssign(ident, _op, e) {
            return `${ident.eval()} = ${e.eval()}`;
        },
        Assign(ident, _op, e) {
            const name = ident.sourceString;
            const name2 = getVariable(name);
            const value = e.eval();
            return `${name2} = ${value}`;
        },
        PrintArgs(arg, _printSep, args) {
            return [arg.eval(), ...evalChildren(args.children)].join(', ');
        },
        Print(_printLit, params, semi) {
            var _a;
            const paramStr = ((_a = params.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
            let newlineStr = "";
            if (!semi.sourceString) {
                newlineStr = paramStr ? ` + "\\n"` : `"\\n"`;
            }
            return `_o.print(${paramStr}${newlineStr})`;
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
        Bin(_binLit, _open, e, _comma, n, _close) {
            var _a;
            const pad = (_a = n.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
            const padStr = pad !== undefined ? `.padStart(${pad} || 0, "0")` : '';
            return `(${e.eval()}).toString(2).toUpperCase()${padStr}`;
        },
        Chr(_chrLit, _open, e, _close) {
            return `String.fromCharCode(${e.eval()})`;
        },
        Comment(_commentLit, remain) {
            return `//${remain.sourceString}`;
        },
        Cos(_cosLit, _open, e, _close) {
            return `Math.cos(${e.eval()})`;
        },
        Data(_datalit, args) {
            const argList = args.asIteration().children.map(c => c.eval());
            const dataIndex = dataList.length;
            if (definedLabels.length) {
                const currentLabel = definedLabels[definedLabels.length - 1];
                currentLabel.dataIndex = dataIndex;
            }
            dataList.push(argList.join(", "));
            return "";
        },
        Dim(_dimLit, arrayIdents) {
            const argList = arrayIdents.asIteration().children.map(c => c.eval());
            const results = [];
            for (const arg of argList) {
                const [ident, ...indices] = arg;
                const initValStr = ident.endsWith("$") ? ', ""' : '';
                results.push(`${ident} = _o.dimArray([${indices}]${initValStr})`); // automatically joined with comma
            }
            return results.join("; ");
        },
        Cint(_cintLit, _open, e, _close) {
            return `Math.round(${e.eval()})`;
        },
        Cls(_clsLit) {
            return `_o.cls()`;
        },
        Comparison(_iflit, condExp, _thenLit, thenStat, elseLit, elseStat) {
            const cond = condExp.eval();
            const thSt = thenStat.eval();
            let result = `if (${cond}) {\n${thSt}\n}`; // put in newlines to also allow line comments
            if (elseLit.sourceString) {
                const elseSt = evalChildren(elseStat.children).join('; ');
                result += ` else {\n${elseSt}\n}`;
            }
            return result;
        },
        End(_endLit) {
            return `return "end"`;
        },
        Exp(_expLit, _open, e, _close) {
            return `Math.exp(${e.eval()})`;
        },
        Fix(_fixLit, _open, e, _close) {
            return `Math.trunc(${e.eval()})`;
        },
        ForLoop(_forLit, variable, _eqSign, start, _dirLit, end, _stepLit, step) {
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
            const result = `for (${varExp} = ${startExp}; ${cmpSt}; ${varExp} += ${stepExp}) {`;
            return result;
        },
        Gosub(_gosubLit, e) {
            const labelStr = e.sourceString;
            addGosubLabel(labelStr);
            return `_${labelStr}()`;
        },
        Hex(_hexLit, _open, e, _comma, n, _close) {
            var _a;
            const pad = (_a = n.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
            const padStr = pad !== undefined ? `.padStart(${pad} || 0, "0")` : '';
            return `(${e.eval()}).toString(16).toUpperCase()${padStr}`;
        },
        Int(_intLit, _open, e, _close) {
            return `Math.floor(${e.eval()})`;
        },
        Left(_leftLit, _open, e1, _comma, e2, _close) {
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
        Lower(_lowerLit, _open, e, _close) {
            return `(${e.eval()}).toLowerCase()`;
        },
        Max(_maxLit, _open, args, _close) {
            const argList = args.asIteration().children.map(c => c.eval()); // see also: ArrayArgs
            return `Math.max(${argList})`;
        },
        Mid(_midLit, _open, e1, _comma1, e2, _comma2, e3, _close) {
            var _a;
            const length = (_a = e3.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
            const lengthStr = length === undefined ? "" : `, ${length}`;
            return `(${e1.eval()}).substr(${e2.eval()} - 1${lengthStr})`;
        },
        Min(_minLit, _open, args, _close) {
            const argList = args.asIteration().children.map(c => c.eval()); // see also: ArrayArgs
            return `Math.min(${argList})`;
        },
        Next(_nextLit, variables) {
            const argList = variables.asIteration().children.map(c => c.eval());
            if (!argList.length) {
                argList.push("_any");
            }
            return '}'.repeat(argList.length);
        },
        On(_nLit, e1, _gosubLit, args) {
            const index = e1.eval();
            const argList = args.asIteration().children.map(c => c.sourceString);
            for (let i = 0; i < argList.length; i += 1) {
                addGosubLabel(argList[i]);
            }
            return `[${argList.map((label) => `_${label}`).join(",")}]?.[${index} - 1]()`; // 1-based index
        },
        Pi(_piLit) {
            return "Math.PI";
        },
        Read(_readlit, args) {
            const argList = args.asIteration().children.map(c => c.eval());
            const results = [];
            for (const ident of argList) {
                results.push(`${ident} = _data[_dataPrt++]`);
            }
            return results.join("; ");
        },
        Rem(_remLit, remain) {
            return `// ${remain.sourceString}`;
        },
        Restore(_restoreLit, e) {
            const labelStr = e.sourceString || "0";
            addRestoreLabel(labelStr);
            return `_dataPtr = _restoreMap[${labelStr}]`;
        },
        Return(_returnLit) {
            return "return";
        },
        Right(_rightLit, _open, e1, _comma, e2, _close) {
            return `(${e1.eval()}).slice(-${e2.eval()})`;
        },
        Rnd(_rndLit, _open, _e, _close) {
            // args are ignored
            return `Math.random()`;
        },
        Round(_roundLit, _open, e, _comma, e2, _close) {
            var _a;
            const dec = (_a = e2.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
            if (dec) {
                return `(Math.round(${e.eval()} * Math.pow(10, ${dec})) / Math.pow(10, ${dec}))`;
            }
            return `Math.round(${e.eval()})`;
            // A better way to avoid rounding errors: https://www.jacklmoore.com/notes/rounding-in-javascript
        },
        Sgn(_sgnLit, _open, e, _close) {
            return `Math.sign(${e.eval()})`;
        },
        Sin(_sinLit, _open, e, _close) {
            return `Math.sin(${e.eval()})`;
        },
        Space2(_stringLit, _open, len, _close) {
            return `" ".repeat(${len.eval()})`;
        },
        Sqr(_sqrLit, _open, e, _close) {
            return `Math.sqrt(${e.eval()})`;
        },
        Stop(_stopLit) {
            return `return "stop"`;
        },
        Str(_strLit, _open, e, _close) {
            return `String(${e.eval()})`; // TODO: additional space for n>0?
        },
        String2(_stringLit, _open, len, _commaLit, chr, _close) {
            // Note: String$: we only support second parameter as string; we do not use charAt(0) to get just one char
            return `(${chr.eval()}).repeat(${len.eval()})`;
        },
        Tan(_tanLit, _open, e, _close) {
            return `Math.tan(${e.eval()})`;
        },
        Time(_timeLit) {
            return `Date.now()`; // TODO; or *300/1000
        },
        Upper(_upperLit, _open, e, _close) {
            return `(${e.eval()}).toUpperCase()`;
        },
        Val(_upperLit, _open, e, _close) {
            const numPattern = /^"[\\+\\-]?\d*\.?\d+(?:[Ee][\\+\\-]?\d+)?"$/;
            const numStr = String(e.eval());
            if (numPattern.test(numStr)) {
                return `Number(${numStr})`; // for non-hex/bin number strings we can use this simple version
            }
            return `Number((${numStr}).replace("&x", "0b").replace("&", "0x"))`;
        },
        Wend(_wendLit) {
            return '}';
        },
        WhileLoop(_whileLit, e) {
            const cond = e.eval();
            return `while (${cond}) {`;
        },
        StrOrNumExp(e) {
            return String(e.eval());
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
            return `${a.eval()} === ${b.eval()} ? -1 : 0`;
        },
        CmpExp_ne(a, _op, b) {
            return `${a.eval()} !== ${b.eval()} ? -1 : 0`;
        },
        CmpExp_lt(a, _op, b) {
            return `${a.eval()} < ${b.eval()} ? -1 : 0`;
        },
        CmpExp_le(a, _op, b) {
            return `${a.eval()} <= ${b.eval()} ? -1 : 0`;
        },
        CmpExp_gt(a, _op, b) {
            return `${a.eval()} > ${b.eval()} ? -1 : 0`;
        },
        CmpExp_ge(a, _op, b) {
            return `${a.eval()} >= ${b.eval()} ? -1 : 0`;
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
            return `(${a.eval()} / ${b.eval()}) | 0`;
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
            return String(e.eval());
        },
        PriExp_neg(_op, e) {
            return `-${e.eval()}`;
        },
        StrCmpExp_eq(a, _op, b) {
            return `${a.eval()} === ${b.eval()} ? -1 : 0`;
        },
        StrCmpExp_ne(a, _op, b) {
            return `${a.eval()} !== ${b.eval()} ? -1 : 0`;
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
            return [ident.eval(), ...indices.eval()]; //TTT
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
        string(_quote1, e, _quote2) {
            return `"${e.sourceString}"`;
        },
        ident(ident) {
            const name = ident.sourceString;
            return getVariable(name);
        },
        strIdent(ident, typeSuffix) {
            const name = ident.sourceString + typeSuffix.sourceString;
            return getVariable(name);
        }
    };
    let arithmeticParser;
    function compileScript(script) {
        if (!arithmeticParser) {
            arithmeticParser = new Parser(arithmetic.grammar, semantics);
        }
        resetParser();
        const compiledScript = arithmeticParser.parseAndEval(script);
        return compiledScript;
    }
    function executeScript(compiledScript) {
        return __awaiter(this, void 0, void 0, function* () {
            vm.setOutput("");
            if (compiledScript.startsWith("ERROR")) {
                return "ERROR" + "\n";
            }
            let output;
            try {
                const fnScript = new Function("_o", compiledScript); // eslint-disable-line no-new-func
                const result = fnScript(vm) || "";
                if (result instanceof Promise) {
                    output = vm.getOutput() + (yield result);
                }
                else {
                    output = vm.getOutput() + result;
                }
            }
            catch (error) {
                output = "ERROR: ";
                if (error instanceof Error) {
                    output += error.message;
                    const anyErr = error;
                    const lineNumber = anyErr.lineNumber; // only on FireFox
                    const columnNumber = anyErr.columnNumber; // only on FireFox
                    if (lineNumber || columnNumber) {
                        const errLine = lineNumber - 2; // for some reason line 0 is 2
                        output += ` (line ${errLine}, column ${columnNumber})`;
                    }
                }
                else {
                    output += "unknown";
                }
            }
            return output + "\n";
        });
    }
    function debounce(func, delayPara) {
        let timeoutId;
        return function (...args) {
            const context = this;
            const delay = startConfig[delayPara];
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    }
    function keepRunning(fn, timeout) {
        const timerId = setTimeout(() => { }, timeout);
        return (() => __awaiter(this, void 0, void 0, function* () {
            fn();
            clearTimeout(timerId);
        }))();
    }
    function asyncDelay(fn, timeout) {
        return (() => __awaiter(this, void 0, void 0, function* () {
            const timerId = setTimeout(fn, timeout);
            return timerId;
        }))();
    }
    let basicCm;
    let compiledCm;
    function getOutputText() {
        const outputText = document.getElementById("outputText");
        return outputText.value;
    }
    function setOutputText(value) {
        const outputText = document.getElementById("outputText");
        outputText.value = value;
    }
    function onExecuteButtonClick(_event) {
        return __awaiter(this, void 0, void 0, function* () {
            const compiledText = document.getElementById("compiledText");
            const compiledScript = compiledCm ? compiledCm.getValue() : compiledText.value;
            const output = yield executeScript(compiledScript);
            setOutputText(getOutputText() + output);
        });
    }
    function oncompiledTextChange(_event) {
        const autoExecuteInput = document.getElementById("autoExecuteInput");
        if (autoExecuteInput.checked) {
            const executeButton = window.document.getElementById("executeButton");
            executeButton.dispatchEvent(new Event('click'));
        }
    }
    function onCompileButtonClick(_event) {
        const basicText = document.getElementById("basicText");
        const compiledText = document.getElementById("compiledText");
        const input = compiledCm ? basicCm.getValue() : basicText.value;
        const compiledScript = compileScript(input);
        if (compiledCm) {
            compiledCm.setValue(compiledScript);
        }
        else {
            compiledText.value = compiledScript;
            const autoExecuteInput = document.getElementById("autoExecuteInput");
            if (autoExecuteInput.checked) {
                const newEvent = new Event('change');
                compiledText.dispatchEvent(newEvent);
            }
        }
    }
    function onbasicTextChange(_event) {
        const autoCompileInput = document.getElementById("autoCompileInput");
        if (autoCompileInput.checked) {
            const compileButton = window.document.getElementById("compileButton");
            compileButton.dispatchEvent(new Event('click'));
        }
    }
    function onExampleSelectChange(event) {
        const exampleSelect = event.target;
        const basicText = document.getElementById("basicText");
        const value = examples[exampleSelect.value];
        setOutputText("");
        if (basicCm) {
            basicCm.setValue(value);
        }
        else {
            basicText.value = value;
            basicText.dispatchEvent(new Event('change'));
        }
    }
    function setExampleSelectOptions(examples) {
        const exampleSelect = document.getElementById("exampleSelect");
        for (const key of Object.keys(examples)) {
            const value = key; //examples[key];
            const option = window.document.createElement("option");
            option.value = value;
            option.text = value;
            option.title = value;
            option.selected = false;
            exampleSelect.add(option);
        }
    }
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
            const matches = inputString.match(/^\s*\d*\s*(?:REM|rem|')\s*(\w+)/);
            key = matches ? matches[1] : "unknown";
        }
        examples[key] = inputString;
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
    function fnDecodeUri(s) {
        let decoded = "";
        try {
            decoded = decodeURIComponent(s.replace(/\+/g, " "));
        }
        catch (err) {
            if (err instanceof Error) {
                err.message += ": " + s;
            }
            console.error(err);
        }
        return decoded;
    }
    // https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
    function fnParseUri(urlQuery, config) {
        const rSearch = /([^&=]+)=?([^&]*)/g, args = [];
        let match;
        while ((match = rSearch.exec(urlQuery)) !== null) {
            const name = fnDecodeUri(match[1]), value = fnDecodeUri(match[2]);
            if (value !== null && config[name] !== undefined) {
                args.push(name + "=" + value);
            }
        }
        return fnParseArgs(args, config);
    }
    function start(input) {
        if (input !== "") {
            const compiledScript = compileScript(input);
            console.log("INFO: Compiled:\n" + compiledScript + "\n");
            return keepRunning(() => __awaiter(this, void 0, void 0, function* () {
                const output = yield executeScript(compiledScript);
                console.log(output);
            }), 5000);
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
            console.log("start");
            start(input);
        }
    }
    if (typeof window !== "undefined") {
        window.cpcBasic = {
            addItem: addItem
        };
        window.onload = () => {
            const basicText = window.document.getElementById("basicText");
            basicText.addEventListener('change', onbasicTextChange);
            const compiledText = window.document.getElementById("compiledText");
            compiledText.addEventListener('change', oncompiledTextChange);
            const compileButton = window.document.getElementById("compileButton");
            compileButton.addEventListener('click', onCompileButtonClick, false);
            const executeButton = window.document.getElementById("executeButton");
            executeButton.addEventListener('click', onExecuteButtonClick, false);
            const exampleSelect = window.document.getElementById("exampleSelect");
            exampleSelect.addEventListener('change', onExampleSelectChange);
            const WinCodeMirror = window.CodeMirror;
            if (WinCodeMirror) {
                //const debounceMs = 800;
                basicCm = WinCodeMirror.fromTextArea(basicText, {
                    lineNumbers: true,
                    mode: 'javascript'
                });
                basicCm.on('changes', debounce(onbasicTextChange, "debounceCompile"));
                compiledCm = WinCodeMirror.fromTextArea(compiledText, {
                    lineNumbers: true,
                    mode: 'javascript'
                });
                compiledCm.on('changes', debounce(oncompiledTextChange, "debounceExecute"));
            }
            vm.setOnCls(() => setOutputText(""));
            return asyncDelay(() => {
                setExampleSelectOptions(examples);
                const config = fnParseUri(window.location.search.substring(1), startConfig);
                if (config.example) {
                    const exampleSelect = document.getElementById("exampleSelect");
                    exampleSelect.value = config.example;
                }
                //const input = examples[config.example as string];
                exampleSelect.dispatchEvent(new Event('change'));
            }, 10);
        };
    }
    else {
        main(fnParseArgs(global.process.argv.slice(2), startConfig));
    }
    const testParser = {
        dimArray: dimArray
    };

    exports.testParser = testParser;

}));
//# sourceMappingURL=locobasic.js.map
