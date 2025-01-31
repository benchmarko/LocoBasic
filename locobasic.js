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
        constructor(grammarString, semanticsMap, superParser) {
            if (superParser) {
                const superGrammar = superParser.getOhmGrammar();
                const namespace = {
                    basicGrammar: superGrammar
                };
                this.ohmGrammar = ohmJs.grammar(grammarString, namespace);
            }
            else {
                this.ohmGrammar = ohmJs.grammar(grammarString);
            }
            this.ohmSemantics = this.ohmGrammar
                .createSemantics()
                .addOperation("eval", semanticsMap);
        }
        getOhmGrammar() {
            return this.ohmGrammar;
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
        basicGrammar: `
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
      | Deg
      | Dim
      | Draw
      | Drawr
      | End
      | Erase
      | Error
      | For
      | Frame
      | Gosub
      | GraphicsPen
      | If
      | Input
      | MidSAssign
      | Mode
      | Move
      | Mover
      | Next
      | On
      | Paper
      | Pen
      | Plot
      | Plotr
      | Print
      | Rad
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

    Deg
      = deg

    Dim
      = dim NonemptyListOf<DimArrayIdent, ",">

    Draw
      = draw NumExp "," NumExp ("," NumExp)?

    Drawr
      = drawr NumExp "," NumExp ("," NumExp)?

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

    GraphicsPen
      = graphics pen NumExp

    HexS
      = hexS "(" NumExp ("," NumExp)? ")"

    Input
      = input (string (";" | ","))? AnyIdent  // or NonemptyListOf?

    Instr
      = instr "(" StrExp "," StrExp ")" -- noLen
      | instr "(" NumExp "," StrExp "," StrExp ")" -- len

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

    MidSAssign
      = midS "(" strIdent "," NumExp ("," NumExp)? ")" "=" StrExp

    Min
      = min "(" NonemptyListOf<NumExp, ","> ")"

    Mode
      = mode NumExp

    Move
      = move NumExp "," NumExp ("," NumExp)?
    
    Mover
      = mover NumExp "," NumExp ("," NumExp)?

    Pi
      = pi

    Next
      = next ListOf<variable, ",">

    On
      = on NumExp gosub NonemptyListOf<label, ",">

    Paper
      = paper NumExp

    Pen
      = pen NumExp

    Plot
      = plot NumExp "," NumExp ("," NumExp)?

    Plotr
      = plotr NumExp "," NumExp ("," NumExp)?

    PrintArg
      = &StrCmpExp NumExp -- strCmp
      | StrExp
      | NumExp
      | using StrExp ";" NonemptyListOf<NumExp, ";"> -- usingNum

    Print
      = (print | "?") ListOf<PrintArg, ";"> (";")?

    Rad
      = rad

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
      = stringS "(" NumExp "," StrExp ")" -- str
      | stringS "(" NumExp "," NumExp ")" -- num

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
      = fnIdent AnyFnArgs?

    StrFnIdent
      = strFnIdent AnyFnArgs?

    AnyFnArg
      = StrExp
      | NumExp

    AnyFnArgs
      = "(" ListOf<AnyFnArg, ","> ")"


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
      = ("abs" | "ABS") ~identPart
    after
      = ("after" | "AFTER") ~identPart
    and
      = ("and" | "AND") ~identPart
    asc
      = ("asc" | "ASC") ~identPart
    atn
      = ("atn" | "ATN") ~identPart
    auto
      = ("auto" | "AUTO") ~identPart
    binS
      = ("bin$" | "BIN$") ~identPart
    border
      = ("border" | "BORDER") ~identPart
    break
      = ("break" | "BREAK") ~identPart
    call
      = ("call" | "CALL") ~identPart
    cat
      = ("cat" | "CAT") ~identPart
    chain
      = ("chain" | "CHAIN") ~identPart
    chrS
      = ("chr$" | "CHR$") ~identPart
    cint
      = ("cint" | "CINT") ~identPart
    clear
      = ("clear" | "CLEAR") ~identPart
    clg
      = ("clg" | "CLG") ~identPart
    closein
      = ("closein" | "CLOSEIN") ~identPart
    closeout
      = ("closeout" | "CLOSEOUT") ~identPart
    cls
      = ("cls" | "CLS") ~identPart
    cont
      = ("cont" | "CONT") ~identPart
    copychrS
      = ("copychr$" | "COPYCHR$") ~identPart
    cos
      = ("cos" | "COS") ~identPart
    creal
      = ("creal" | "CREAL") ~identPart
    cursor
      = ("cursor" | "CURSOR") ~identPart
    data
      = ("data" | "DATA") ~identPart
    decS
      = ("dec$" | "DEC$") ~identPart
    def
      = ("def" | "DEF") ~identPart
    defint
      = ("defint" | "DEFINT") ~identPart
    defreal
      = ("defreal" | "DEFREAL") ~identPart
    defstr
      = ("defstr" | "DEFSTR") ~identPart
    deg
      = ("deg" | "DEG") ~identPart
    delete
      = ("delete" | "DELETE") ~identPart
    derr
      = ("derr" | "DERR") ~identPart
    di
      = ("di" | "DI") ~identPart
    dim
      = ("dim" | "DIM") ~identPart
    draw
      = ("draw" | "DRAW") ~identPart
    drawr
      = ("drawr" | "DRAWR") ~identPart
    edit
      = ("edit" | "EDIT") ~identPart
    ei
      = ("ei" | "EI") ~identPart
    else
      = ("else" | "ELSE") ~identPart
    endLit
      = ("end" | "END") ~identPart
    ent
      = ("ent" | "ENT") ~identPart
    env
      = ("env" | "ENV") ~identPart
    eof
      = ("eof" | "EOF") ~identPart
    erase
      = ("erase" | "ERASE") ~identPart
    erl
      = ("erl" | "ERL") ~identPart
    err
      = ("err" | "ERR") ~identPart
    error
      = ("error" | "ERROR") ~identPart
    every
      = ("every" | "EVERY") ~identPart
    exp
      = ("exp" | "EXP") ~identPart
    fill
      = ("fill" | "FILL") ~identPart
    fix
      = ("fix" | "FIX") ~identPart
    fn
      = ("fn" | "FN")  //~identPart
    for
      = ("for" | "FOR") ~identPart
    frame
      = ("frame" | "FRAME") ~identPart
    fre
      = ("fre" | "FRE") ~identPart
    gosub
      = ("gosub" | "GOSUB") ~identPart
    goto
      = ("goto" | "GOTO") ~identPart
    graphics
      = ("graphics" | "GRAPHICS") ~identPart
    hexS
      = ("hex$" | "HEX$") ~identPart
    himem
      = ("himem" | "HIMEM") ~identPart
    if
      = ("if" | "IF") ~identPart
    ink
      = ("ink" | "INK") ~identPart
    inkey
      = ("inkey" | "INKEY") ~identPart
    inkeyS
      = ("inkey$" | "INKEY$") ~identPart
    inp
      = ("inp" | "INP") ~identPart
    input
      = ("input" | "INPUT") ~identPart
    instr
      = ("instr" | "INSTR") ~identPart
    int
      = ("int" | "INT") ~identPart
    joy
      = ("joy" | "JOY") ~identPart
    key
      = ("key" | "KEY") ~identPart
    leftS
      = ("left$" | "LEFT$") ~identPart
    len
      = ("len" | "LEN") ~identPart
    let
      = ("let" | "LET") ~identPart
    line
      = ("line" | "LINE") ~identPart
    list
      = ("list" | "LIST") ~identPart
    load
      = ("load" | "LOAD") ~identPart
    locate
      = ("locate" | "LOCATE") ~identPart
    log
      = ("log" | "LOG") ~identPart
    log10
      = ("log10" | "LOG10") ~identPart
    lowerS
      = ("lower$" | "LOWER$") ~identPart
    mask
      = ("mask" | "MASK") ~identPart
    max
      = ("max" | "MAX") ~identPart
    memory
      = ("memory" | "MEMORY") ~identPart
    merge
      = ("merge" | "MERGE") ~identPart
    midS
      = ("mid$" | "MID$") ~identPart
    min
      = ("min" | "MIN") ~identPart
    mod
      = ("mod" | "MOD") ~identPart
    mode
      = ("mode" | "MODE") ~identPart
    move
      = ("move" | "MOVE") ~identPart
    mover
      = ("mover" | "MOVER") ~identPart
    new
      = ("new" | "NEW") ~identPart
    next
      = ("next" | "NEXT") ~identPart
    not
      = ("not" | "NOT") ~identPart
    on
      = ("on" | "ON") ~identPart
    openin
      = ("openin" | "OPENIN") ~identPart
    openout
      = ("openout" | "OPENOUT") ~identPart
    or
      = ("or" | "OR") ~identPart
    origin
      = ("origin" | "ORIGIN") ~identPart
    out
      = ("out" | "OUT") ~identPart
    paper
      = ("paper" | "PAPER") ~identPart
    peek
      = ("peek" | "PEEK") ~identPart
    pen
      = ("pen" | "PEN") ~identPart
    pi
      = ("pi" | "PI") ~identPart
    plot
      = ("plot" | "PLOT") ~identPart
    plotr
      = ("plotr" | "PLOTR") ~identPart
    poke
      = ("poke" | "POKE") ~identPart
    pos
      = ("pos" | "POS") ~identPart
    print
      = ("print" | "PRINT") ~identPart
    rad
      = ("rad" | "RAD") ~identPart
    randomize
      = ("randomize" | "RANDOMIZE") ~identPart
    read
      = ("read" | "READ") ~identPart
    release
      = ("release" | "RELEASE") ~identPart
    rem
      = ("rem" | "REM") ~identPart
    remain
      = ("remain" | "REMAIN") ~identPart
    renum
      = ("renum" | "RENUM") ~identPart
    restore
      = ("restore" | "RESTORE") ~identPart
    resume
      = ("resume" | "RESUME") ~identPart
    return
      = ("return" | "RETURN") ~identPart
    rightS
      = ("right$" | "RIGHT$") ~identPart
    rnd
      = ("rnd" | "RND") ~identPart
    round
      = ("round" | "ROUND") ~identPart
    run
      = ("run" | "RUN") ~identPart
    save
      = ("save" | "SAVE") ~identPart
    sgn
      = ("sgn" | "SGN") ~identPart
    sin
      = ("sin" | "SIN") ~identPart
    sound
      = ("sound" | "SOUND") ~identPart
    spaceS
      = ("space$" | "SPACE$") ~identPart
    spc
      = ("spc" | "SPC") ~identPart
    speed
      = ("speed" | "SPEED") ~identPart
    sq
      = ("sq" | "SQ") ~identPart
    sqr
      = ("sqr" | "SQR") ~identPart
    step
      = ("step" | "STEP") ~identPart
    stop
      = ("stop" | "STOP") ~identPart
    strS
      = ("str$" | "STR$") ~identPart
    stringS
      = ("string$" | "STRING$") ~identPart
    swap
      = ("swap" | "SWAP") ~identPart
    symbol
      = ("symbol" | "SYMBOL") ~identPart
    tab
      = ("tab" | "TAB") ~identPart
    tag
      = ("tag" | "TAG") ~identPart
    tagoff
      = ("tagoff" | "TAGOFF") ~identPart
    tan
      = ("tan" | "TAN") ~identPart
    test
      = ("test" | "TEST") ~identPart
    testr
      = ("testr" | "TESTR") ~identPart
    then
      = ("then" | "THEN") ~identPart
    time
      = ("time" | "TIME") ~identPart
    to
      = ("to" | "TO") ~identPart
    troff
      = ("troff" | "TROFF") ~identPart
    tron
      = ("tron" | "TRON") ~identPart
    unt
      = ("unt" | "UNT") ~identPart
    upperS
      = ("upper$" | "UPPER$") ~identPart
    using
      = ("using" | "USING") ~identPart
    val
      = ("val" | "VAL") ~identPart
    vpos
      = ("vpos" | "VPOS") ~identPart
    wait
      = ("wait" | "WAIT") ~identPart
    wend
      = ("wend" | "WEND") ~identPart
    while
      = ("while" | "WHILE") ~identPart
    width
      = ("width" | "WIDTH") ~identPart
    window
      = ("window" | "WINDOW") ~identPart
    write
      = ("write" | "WRITE") ~identPart
    xor
      = ("xor" | "XOR") ~identPart
    xpos
      = ("xpos" | "XPOS") ~identPart
    ypos
      = ("ypos" | "YPOS") ~identPart
    zone
      = ("zone" | "ZONE") ~identPart

    ident (an identifier)
      = ~keyword identName

    fnIdent
      = fn ~keyword identName

    identName = identStart identPart*

    identStart = letter

    identPart = letter | digit

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
  `,
        strictGrammar: `strictGrammar <: basicGrammar {
    abs
      := "ABS" ~identPart
    after
      := "AFTER" ~identPart
    and
      := "AND" ~identPart
    asc
      := "ASC" ~identPart
    atn
      := "ATN" ~identPart
    auto
      := "AUTO" ~identPart
    binS
      := "BIN$" ~identPart
    border
      := "BORDER" ~identPart
    break
      := "BREAK" ~identPart
    call
      := "CALL" ~identPart
    cat
      := "CAT" ~identPart
    chain
      := "CHAIN" ~identPart
    chrS
      := "CHR$" ~identPart
    cint
      := "CINT" ~identPart
    clear
      := "CLEAR" ~identPart
    clg
      := "CLG" ~identPart
    closein
      := "CLOSEIN" ~identPart
    closeout
      := "CLOSEOUT" ~identPart
    cls
      := "CLS" ~identPart
    cont
      := "CONT" ~identPart
    copychrS
      := "COPYCHR$" ~identPart
    cos
      := "COS" ~identPart
    creal
      := "CREAL" ~identPart
    cursor
      := "CURSOR" ~identPart
    data
      := "DATA" ~identPart
    decS
      := "DEC$" ~identPart
    def
      := "DEF" ~identPart
    defint
      := "DEFINT" ~identPart
    defreal
      := "DEFREAL" ~identPart
    defstr
      := "DEFSTR" ~identPart
    deg
      := "DEG" ~identPart
    delete
      := "DELETE" ~identPart
    derr
      := "DERR" ~identPart
    di
      := "DI" ~identPart
    dim
      := "DIM" ~identPart
    draw
      := "DRAW" ~identPart
    drawr
      := "DRAWR" ~identPart
    edit
      := "EDIT" ~identPart
    ei
      := "EI" ~identPart
    else
      := "ELSE" ~identPart
    endLit
      := "END" ~identPart
    ent
      := "ENT" ~identPart
    env
      := "ENV" ~identPart
    eof
      := "EOF" ~identPart
    erase
      := "ERASE" ~identPart
    erl
      := "ERL" ~identPart
    err
      := "ERR" ~identPart
    error
      := "ERROR" ~identPart
    every
      := "EVERY" ~identPart
    exp
      := "EXP" ~identPart
    fill
      := "FILL" ~identPart
    fix
      := "FIX" ~identPart
    fn
      := "FN"  //~identPart
    for
      := "FOR" ~identPart
    frame
      := "FRAME" ~identPart
    fre
      := "FRE" ~identPart
    gosub
      := "GOSUB" ~identPart
    goto
      := "GOTO" ~identPart
    graphics
      := "GRAPHICS" ~identPart
    hexS
      := "HEX$" ~identPart
    himem
      := "HIMEM" ~identPart
    if
      := "IF" ~identPart
    ink
      := "INK" ~identPart
    inkey
      := "INKEY" ~identPart
    inkeyS
      := "INKEY$" ~identPart
    inp
      := "INP" ~identPart
    input
      := "INPUT" ~identPart
    instr
      := "INSTR" ~identPart
    int
      := "INT" ~identPart
    joy
      := "JOY" ~identPart
    key
      := "KEY" ~identPart
    leftS
      := "LEFT$" ~identPart
    len
      := "LEN" ~identPart
    let
      := "LET" ~identPart
    line
      := "LINE" ~identPart
    list
      := "LIST" ~identPart
    load
      := "LOAD" ~identPart
    locate
      := "LOCATE" ~identPart
    log
      := "LOG" ~identPart
    log10
      := "LOG10" ~identPart
    lowerS
      := "LOWER$" ~identPart
    mask
      := "MASK" ~identPart
    max
      := "MAX" ~identPart
    memory
      := "MEMORY" ~identPart
    merge
      := "MERGE" ~identPart
    midS
      := "MID$" ~identPart
    min
      := "MIN" ~identPart
    mod
      := "MOD" ~identPart
    mode
      := "MODE" ~identPart
    move
      := "MOVE" ~identPart
    mover
      := "MOVER" ~identPart
    new
      := "NEW" ~identPart
    next
      := "NEXT" ~identPart
    not
      := "NOT" ~identPart
    on
      := "ON" ~identPart
    openin
      := "OPENIN" ~identPart
    openout
      := "OPENOUT" ~identPart
    or
      := "OR" ~identPart
    origin
      := "ORIGIN" ~identPart
    out
      := "OUT" ~identPart
    paper
      := "PAPER" ~identPart
    peek
      := "PEEK" ~identPart
    pen
      := "PEN" ~identPart
    pi
      := "PI" ~identPart
    plot
      := "PLOT" ~identPart
    plotr
      := "PLOTR" ~identPart
    poke
      := "POKE" ~identPart
    pos
      := "POS" ~identPart
    print
      := "PRINT" ~identPart
    rad
      := "RAD" ~identPart
    randomize
      := "RANDOMIZE" ~identPart
    read
      := "READ" ~identPart
    release
      := "RELEASE" ~identPart
    rem
      := "REM" ~identPart
    remain
      := "REMAIN" ~identPart
    renum
      := "RENUM" ~identPart
    restore
      := "RESTORE" ~identPart
    resume
      := "RESUME" ~identPart
    return
      := "RETURN" ~identPart
    rightS
      := "RIGHT$" ~identPart
    rnd
      := "RND" ~identPart
    round
      := "ROUND" ~identPart
    run
      := "RUN" ~identPart
    save
      := "SAVE" ~identPart
    sgn
      := "SGN" ~identPart
    sin
      := "SIN" ~identPart
    sound
      := "SOUND" ~identPart
    spaceS
      := "SPACE$" ~identPart
    spc
      := "SPC" ~identPart
    speed
      := "SPEED" ~identPart
    sq
      := "SQ" ~identPart
    sqr
      := "SQR" ~identPart
    step
      := "STEP" ~identPart
    stop
      := "STOP" ~identPart
    strS
      := "STR$" ~identPart
    stringS
      := "STRING$" ~identPart
    swap
      := "SWAP" ~identPart
    symbol
      := "SYMBOL" ~identPart
    tab
      := "TAB" ~identPart
    tag
      := "TAG" ~identPart
    tagoff
      := "TAGOFF" ~identPart
    tan
      := "TAN" ~identPart
    test
      := "TEST" ~identPart
    testr
      := "TESTR" ~identPart
    then
      := "THEN" ~identPart
    time
      := "TIME" ~identPart
    to
      := "TO" ~identPart
    troff
      := "TROFF" ~identPart
    tron
      := "TRON" ~identPart
    unt
      := "UNT" ~identPart
    upperS
      := "UPPER$" ~identPart
    using
      := "USING" ~identPart
    val
      := "VAL" ~identPart
    vpos
      := "VPOS" ~identPart
    wait
      := "WAIT" ~identPart
    wend
      := "WEND" ~identPart
    while
      := "WHILE" ~identPart
    width
      := "WIDTH" ~identPart
    window
      := "WINDOW" ~identPart
    write
      := "WRITE" ~identPart
    xor
      := "XOR" ~identPart
    xpos
      := "XPOS" ~identPart
    ypos
      := "YPOS" ~identPart
    zone
      := "ZONE" ~identPart

    identStart := lower
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
                const decimals = (format.split(".")[1] || "").length;
                const str = num.toFixed(decimals);
                const pad = " ".repeat(Math.max(0, format.length - str.length));
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
            draw: function draw(x, y) {
                _o.drawMovePlot("L", x, y);
            },
            drawr: function drawr(x, y) {
                _o.drawMovePlot("l", x, y);
            },
            end: function end() {
                _o.flush();
                return "end";
            },
            frame: function frame() {
                _o.flush();
                return new Promise(resolve => setTimeout(() => resolve(), Date.now() % 50));
            },
            graphicsPen: function graphicsPen(num) {
                _o.graphicsPen(num);
            },
            hex$: function hex$(num, pad) {
                return num.toString(16).toUpperCase().padStart(pad || 0, "0");
            },
            input: function input(msg, isNum) {
                _o.flush();
                return new Promise(resolve => setTimeout(() => {
                    const input = _o.prompt(msg);
                    resolve(isNum ? Number(input) : input);
                }, 5));
            },
            mid$Assign: function mid$Assign(s, start, newString, len) {
                start -= 1;
                len = Math.min(len !== null && len !== void 0 ? len : newString.length, newString.length, s.length - start);
                return s.substring(0, start) + newString.substring(0, len) + s.substring(start + len);
            },
            mode: function mode(num) {
                _o.mode(num);
            },
            move: function move(x, y) {
                _o.drawMovePlot("M", x, y);
            },
            mover: function mover(x, y) {
                _o.drawMovePlot("m", x, y);
            },
            paper: function paper(n) {
                _o.paper(n);
            },
            pen: function pen(n) {
                _o.pen(n);
            },
            plot: function plot(x, y) {
                _o.drawMovePlot("P", x, y);
            },
            plotr: function plotr(x, y) {
                _o.drawMovePlot("p", x, y);
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
            stop: function stop() {
                _o.flush();
                return "stop";
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
        const drawMovePlot = (lit, x, _comma1, y, _comma2, e3) => {
            var _a;
            const command = lit.sourceString.toLowerCase();
            semanticsHelper.addInstr(command);
            const pen = (_a = e3.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
            let penStr = "";
            if (pen !== undefined) {
                semanticsHelper.addInstr("graphicsPen");
                penStr = `graphicsPen(${pen}); `;
            }
            return penStr + `${command}(${x.eval()}, ${y.eval()})`;
        };
        const cosSinTan = (lit, _open, e, _close) => {
            const func = lit.sourceString.toLowerCase();
            return semanticsHelper.getDeg() ? `Math.${func}((${e.eval()}) * Math.PI / 180)` : `Math.${func}(${e.eval()})`;
        };
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
                return semanticsHelper.getDeg() ? `(Math.atan(${e.eval()}) * 180 / Math.PI)` : `Math.atan(${e.eval()})`;
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
            Cos: cosSinTan,
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
                const fnIdent = semanticsHelper.getVariable(`fn${ident.sourceString}`);
                semanticsHelper.setDefContext(true); // do not create global variables in this context
                const argStr = args.children.map(c => c.eval()).join(", ") || "()";
                const defBody = e.eval();
                semanticsHelper.setDefContext(false);
                return `${fnIdent} = ${argStr} => ${defBody}`;
            },
            Deg(_degLit) {
                semanticsHelper.setDeg(true);
                return `/* deg active */`;
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
            Draw: drawMovePlot,
            Drawr: drawMovePlot,
            End(_endLit) {
                semanticsHelper.addInstr("end");
                return `return end()`;
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
            AnyFnArgs(_open, args, _close) {
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
            GraphicsPen(_graphicsLit, _penLit, e) {
                semanticsHelper.addInstr("graphicsPen");
                return `graphicsPen(${e.eval()})`;
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
            Instr_noLen(_instrLit, _open, e1, _comma, e2, _close) {
                return `((${e1.eval()}).indexOf(${e2.eval()}) + 1)`;
            },
            Instr_len(_instrLit, _open, len, _comma1, e1, _comma2, e2, _close) {
                return `((${e1.eval()}).indexOf(${e2.eval()}, ${len.eval()} - 1) + 1)`;
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
            MidSAssign(_midLit, _open, ident, _comma1, e2, _comma2, e3, _close, _op, e) {
                var _a;
                semanticsHelper.addInstr("mid$Assign");
                const variableName = ident.sourceString;
                const resolvedVariableName = semanticsHelper.getVariable(variableName);
                const start = e2.eval();
                const newString = e.eval();
                const length = (_a = e3.child(0)) === null || _a === void 0 ? void 0 : _a.eval(); // also undefined possible
                return `${resolvedVariableName} = mid$Assign(${resolvedVariableName}, ${start}, ${newString}, ${length})`;
            },
            Min(_minLit, _open, args, _close) {
                const argList = args.asIteration().children.map(c => c.eval()); // see also: ArrayArgs
                return `Math.min(${argList})`;
            },
            Mode(_modeLit, e) {
                semanticsHelper.addInstr("mode");
                return `mode(${e.eval()})`;
            },
            Move: drawMovePlot,
            Mover: drawMovePlot,
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
            Paper(_paperLit, e) {
                semanticsHelper.addInstr("paper");
                return `paper(${e.eval()})`;
            },
            Pen(_penLit, e) {
                semanticsHelper.addInstr("pen");
                return `pen(${e.eval()})`;
            },
            Pi(_piLit) {
                return "Math.PI";
            },
            Plot: drawMovePlot,
            Plotr: drawMovePlot,
            PrintArg_strCmp(_cmp, args) {
                const paramStr = args.children[0].eval();
                return paramStr;
            },
            PrintArg_usingNum(_printLit, format, _semi, numArgs) {
                semanticsHelper.addInstr("dec$");
                const formatStr = format.eval();
                const argList = numArgs.asIteration().children.map(c => c.eval());
                const paramStr = argList.map((arg) => `dec$(${arg}, ${formatStr})`).join(', ');
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
            Rad(_radLit) {
                semanticsHelper.setDeg(false);
                return `/* rad active */`;
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
                const str = e1.eval();
                const len = e2.eval();
                return `(${str}).substring((${str}).length - (${len}))`;
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
            Sin: cosSinTan,
            SpaceS(_stringLit, _open, len, _close) {
                return `" ".repeat(${len.eval()})`;
            },
            Sqr(_sqrLit, _open, e, _close) {
                return `Math.sqrt(${e.eval()})`;
            },
            Stop(_stopLit) {
                semanticsHelper.addInstr("stop");
                return `return stop()`;
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
            StringS_str(_stringLit, _open, len, _commaLit, chr, _close) {
                // Note: we do not use charAt(0) to get just one char
                return `(${chr.eval()}).repeat(${len.eval()})`;
            },
            StringS_num(_stringLit, _open, len, _commaLit, num, _close) {
                return `String.fromCharCode(${num.eval()}).repeat(${len.eval()})`;
            },
            Tan: cosSinTan,
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
            this.isDeg = false;
            this.isDefContext = false;
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
            if (!this.isDefContext) {
                this.variables[name] = (this.variables[name] || 0) + 1;
            }
            return name;
        }
        setDefContext(isDef) {
            this.isDefContext = isDef;
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
            this.isDeg = false;
            this.isDefContext = false;
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
                setIndent: (indent) => this.setIndent(indent),
                setDeg: (isDeg) => this.isDeg = isDeg,
                getDeg: () => this.isDeg,
                setDefContext: (isDef) => this.setDefContext(isDef)
            };
            return getSemantics(semanticsHelper);
        }
    }
    Semantics.reJsKeyword = /^(arguments|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/;

    // core.ts
    //TTT: should not be here:
    const colorsForPens = [
        "#000080", //  1 Navy
        "#FFFF00", // 24 Bright Yellow
        "#00FFFF", // 20 Bright Cyan
        "#FF0000", //  6 Bright Red
        "#FFFFFF", // 26 Bright White
        "#000000", //  0 Black
        "#0000FF", //  2 Bright Blue
        "#FF00FF", //  8 Bright Magenta
        "#008080", // 10 Cyan
        "#808000", // 12 Yellow
        "#8080FF", // 14 Pastel Blue
        "#FF8080", // 16 Pink
        "#00FF00", // 18 Bright Green
        "#80FF80", // 22 Pastel Green
        "#000080", //  1 Navy (repeated)
        "#FF8080", // 16 Pink (repeated)
        "#000080" //  1 Navy (repeated)
    ];
    const vm$1 = {
        _output: "",
        _lastPaper: -1,
        _lastPen: -1,
        _mode: 2,
        _paperColors: [],
        _penColors: [],
        _graphicsBuffer: "",
        _graphicsPen: 1,
        _graphicsX: 0,
        _graphicsY: 0,
        _fnOnCls: (() => undefined),
        _fnOnPrint: ((_msg) => undefined), // eslint-disable-line @typescript-eslint/no-unused-vars
        _fnOnPrompt: ((_msg) => ""), // eslint-disable-line @typescript-eslint/no-unused-vars
        cls: () => {
            vm$1._output = "";
            vm$1._lastPaper = -1;
            vm$1._lastPen = -1;
            vm$1._graphicsBuffer = "";
            vm$1._graphicsPen = -1;
            vm$1._graphicsX = 0;
            vm$1._graphicsY = 0;
            vm$1._fnOnCls();
        },
        drawMovePlot: (type, x, y) => {
            x = Math.round(x);
            y = Math.round(y);
            if (!vm$1._graphicsBuffer) {
                vm$1._graphicsBuffer = `<path d="`;
            }
            if (vm$1._graphicsBuffer.endsWith('d="')) {
                // avoid 'Error: <path> attribute d: Expected moveto path command ('M' or 'm')'
                if (type !== "M") {
                    vm$1._graphicsBuffer += `M${vm$1._graphicsX} ${vm$1._graphicsY}`;
                }
            }
            let svg = "";
            switch (type) {
                case "L":
                case "M":
                    y = 399 - y;
                    svg = `${type}${x} ${y}`;
                    break;
                case "P":
                    y = 399 - y;
                    svg = `M${x - 1} ${y + 1}h1v1h-1v-1`;
                    break;
                case "l":
                case "m":
                    y = -y;
                    svg = `${type}${x} ${y}`;
                    x = vm$1._graphicsX + x;
                    y = vm$1._graphicsY + y;
                    break;
                case "p":
                    y = -y;
                    svg = `m${x - 1} ${y + 1}h1v1h-1v-1`;
                    x = vm$1._graphicsX + x;
                    y = vm$1._graphicsY + y;
                    break;
                default:
                    console.error(`drawMovePlot: Unknown type: ${type}`);
                    break;
            }
            vm$1._graphicsBuffer += svg;
            vm$1._graphicsX = x;
            vm$1._graphicsY = y;
        },
        flush: () => {
            if (vm$1._graphicsBuffer) {
                //vm._output += `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 640 400" transform="scale(1, -1) translate(0, -400)" stroke-width="1px" stroke="currentColor">${vm._drawBuffer}" /> </svg>`;
                const strokeWidth = vm$1._mode >= 2 ? "1px" : vm$1._mode === 1 ? "2px" : "4px";
                vm$1._output += `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 640 400" stroke-width="${strokeWidth}" stroke="currentColor">${vm$1._graphicsBuffer}" /> </svg>`;
                vm$1._graphicsBuffer = "";
            }
            if (vm$1._output) {
                vm$1._fnOnPrint(vm$1._output);
                vm$1._output = "";
            }
        },
        graphicsPen: (num) => {
            if (num === vm$1._graphicsPen) {
                return;
            }
            vm$1._graphicsPen = num;
            if (vm$1._graphicsBuffer) {
                vm$1._graphicsBuffer += `" />`; // close the path
            }
            vm$1._graphicsBuffer += `<path stroke="${colorsForPens[num]}" d="`;
        },
        mode: (num) => {
            vm$1._mode = num;
            vm$1.cls();
        },
        paper(n) {
            if (n !== this._lastPaper) {
                this._output += this._paperColors[n];
                this._lastPaper = n;
            }
        },
        pen(n) {
            if (n !== this._lastPen) {
                this._output += this._penColors[n];
                this._lastPen = n;
            }
        },
        print(...args) {
            this._output += args.join('');
        },
        prompt: (msg) => {
            vm$1.flush();
            return vm$1._fnOnPrompt(msg);
        },
        getOutput: () => vm$1._output,
        setOutput: (str) => vm$1._output = str,
        setOnCls: (fn) => vm$1._fnOnCls = fn,
        setOnPrint: (fn) => vm$1._fnOnPrint = fn,
        setOnPrompt: (fn) => vm$1._fnOnPrompt = fn,
        setPaperColors: (paperColors) => vm$1._paperColors = paperColors,
        setPenColors: (penColors) => vm$1._penColors = penColors
    };
    class Core {
        constructor() {
            this.startConfig = {
                action: "compile,run",
                debug: 0,
                example: "",
                fileName: "",
                grammar: "basic", // basic or strict
                input: "",
                debounceCompile: 800,
                debounceExecute: 400
            };
            this.semantics = new Semantics();
            this.examples = {};
            this.vm = vm$1;
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
            vm$1.setOnCls(fn);
        }
        setOnPrint(fn) {
            vm$1.setOnPrint(fn);
        }
        setOnPrompt(fn) {
            vm$1.setOnPrompt(fn);
        }
        setOnCheckSyntax(fn) {
            this.onCheckSyntax = fn;
        }
        setPaperColors(colors) {
            vm$1.setPaperColors(colors);
        }
        setPenColors(colors) {
            vm$1.setPenColors(colors);
        }
        compileScript(script) {
            if (!this.arithmeticParser) {
                const semantics = this.semantics.getSemantics();
                if (this.getConfig("grammar") === "strict") {
                    const basicParser = new Parser(arithmetic.basicGrammar, semantics);
                    this.arithmeticParser = new Parser(arithmetic.strictGrammar, semantics, basicParser);
                }
                else {
                    this.arithmeticParser = new Parser(arithmetic.basicGrammar, semantics);
                }
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
                    vm$1.cls();
                    return "ERROR: " + syntaxError;
                }
                try {
                    const fnScript = new Function("_o", compiledScript);
                    const result = fnScript(this.vm) || "";
                    let output;
                    if (result instanceof Promise) {
                        output = yield result;
                        this.vm.flush();
                        output = this.vm.getOutput();
                    }
                    else {
                        this.vm.flush();
                        output = this.vm.getOutput();
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
	flush() { if (this._output) { console.log(this._output); this._output = ""; } },
	paper: () => undefined,
	pen: () => undefined,
	print(...args) { this._output += args.join(''); },
	prompt: (msg) => { console.log(msg); return ""; }
});`;
            return result;
        }
    }

    // main.ts
    //
    // Usage:
    // node dist/locobasic.js [action='compile,run'] [input=<statements>] [example=<name>] [fileName=<file>] [grammar=<name>] [debug=0] [debounceCompile=800] [debounceExecute=400]
    //
    // - Examples for compile and run:
    // node dist/locobasic.js input='PRINT "Hello!"'
    // npx ts-node dist/locobasic.js input='PRINT "Hello!"'
    // node dist/locobasic.js input="?3 + 5 * (2 - 8)"
    // node dist/locobasic.js example=euler
    // node dist/locobasic.js fileName=dist/examples/example.bas
    // node dist/locobasic.js grammar="strict" input='a$="Bob":PRINT "Hello ";a$;"!"'
    //
    // - Example for compile only:
    // node dist/locobasic.js action='compile' input='PRINT "Hello!"' > hello1.js
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
    let vm;
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
            try {
                return yield fs.promises.readFile(name, "utf8");
            }
            catch (error) {
                console.error(`Error reading file ${name}:`, String(error));
                throw error;
            }
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
    // https://stackoverflow.com/questions/35252731/find-details-of-syntaxerror-thrown-by-javascript-new-function-constructor
    function nodeCheckSyntax(script) {
        if (!vm) {
            vm = require("vm");
        }
        const describeError = (stack) => {
            const match = stack.match(/^\D+(\d+)\n(.+\n( *)\^+)\n\n(SyntaxError.+)/);
            if (!match) {
                return ""; // parse successful?
            }
            const [, linenoPlusOne, caretString, colSpaces, message] = match;
            const lineno = Number(linenoPlusOne) - 1;
            const colno = colSpaces.length + 1;
            return `Syntax error thrown at: Line ${lineno}, col: ${colno}\n${caretString}\n${message}`;
        };
        let output = "";
        try {
            const scriptInFrame = core.putScriptInFrame(script);
            vm.runInNewContext(`throw new Error();\n${scriptInFrame}`);
        }
        catch (err) { // Error-like object
            const stack = err.stack;
            if (stack) {
                output = describeError(stack);
            }
        }
        return output;
    }
    function setColors() {
        const ansiColorsForPens = [
            "\x1b[34m", // Navy
            "\x1b[93m", // Bright Yellow
            "\x1b[96m", // Bright Cyan
            "\x1b[91m", // Bright Red
            "\x1b[97m", // Bright White
            "\x1b[30m", // Black
            "\x1b[94m", // Bright Blue
            "\x1b[95m", // Bright Magenta
            "\x1b[36m", // Cyan
            "\x1b[33m", // Yellow
            "\x1b[94m", // Pastel Blue (Bright Blue)
            "\x1b[95m", // Pink (Bright Magenta)
            "\x1b[92m", // Bright Green
            "\x1b[92m", // Pastel Green (Bright Green)
            "\x1b[34m", // Navy (repeated)
            "\x1b[95m", // Pink (repeated)
            "\x1b[34m" // Navy (repeated)
        ];
        const ansiColorsForPapers = [
            "\x1b[44m", // Navy
            "\x1b[103m", // Bright Yellow
            "\x1b[106m", // Bright Cyan
            "\x1b[101m", // Bright Red
            "\x1b[107m", // Bright White
            "\x1b[40m", // Black
            "\x1b[104m", // Bright Blue
            "\x1b[105m", // Bright Magenta
            "\x1b[46m", // Cyan
            "\x1b[43m", // Yellow
            "\x1b[104m", // Pastel Blue (Bright Blue)
            "\x1b[105m", // Pink (Bright Magenta)
            "\x1b[102m", // Bright Green
            "\x1b[102m", // Pastel Green (Bright Green)
            "\x1b[44m", // Navy (repeated)
            "\x1b[105m", // Pink (repeated)
            "\x1b[44m" // Navy (repeated)
        ];
        core.setPaperColors(ansiColorsForPapers);
        core.setPenColors(ansiColorsForPens);
    }
    function start(input) {
        const actionConfig = core.getConfig("action");
        if (input !== "") {
            core.setOnCls(() => console.clear());
            setColors();
            core.setOnCheckSyntax((s) => Promise.resolve(nodeCheckSyntax(s)));
            const compiledScript = actionConfig.includes("compile") ? core.compileScript(input) : input;
            if (compiledScript.startsWith("ERROR:")) {
                console.error(compiledScript);
                return;
            }
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
                return keepRunning(() => __awaiter(this, void 0, void 0, function* () {
                    const jsFile = yield nodeReadFile("./dist/examples/examples.js");
                    const fnScript = new Function("cpcBasic", jsFile);
                    fnScript({
                        addItem: addItem
                    });
                    const exampleScript = core.getExample(config.example);
                    if (!exampleScript) {
                        console.error(`ERROR: Example '${config.example}' not found.`);
                        return;
                    }
                    input = exampleScript;
                    start(input);
                }), 5000);
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
            core.setOnCheckSyntax((s) => Promise.resolve(ui.checkSyntax(s)));
            core.setOnCls(() => ui.setOutputText(""));
            core.setOnPrint((msg) => ui.addOutputText(msg));
            core.setOnPrompt((msg) => window.prompt(msg));
            core.setPaperColors(ui.getPaperColors());
            core.setPenColors(ui.getPenColors());
            ui.onWindowLoad(new Event("onload"));
        };
    }
    else {
        main(fnParseArgs(global.process.argv.slice(2), config));
    }

}));
//# sourceMappingURL=locobasic.js.map
