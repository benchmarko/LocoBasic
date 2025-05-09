(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('ohm-js')) :
    typeof define === 'function' && define.amd ? define(['ohm-js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ohmJs));
})(this, (function (ohmJs) { 'use strict';

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
            this.matcher = this.ohmGrammar.matcher();
            this.ohmSemantics = this.ohmGrammar
                .createSemantics()
                .addOperation("eval", semanticsMap);
        }
        getOhmGrammar() {
            return this.ohmGrammar;
        }
        diffPartsStart(oldInput, newInput) {
            let common = 0;
            while (common < oldInput.length && common < newInput.length && oldInput[common] === newInput[common]) {
                common += 1;
            }
            return common;
        }
        diffPartsEnd(oldInput, newInput, start) {
            let common = newInput.length;
            const oldIndexDiff = oldInput.length - newInput.length;
            const minCommon = oldIndexDiff < 0 ? start - oldIndexDiff : start;
            while (common > minCommon && oldInput[common - 1 + oldIndexDiff] === newInput[common - 1]) {
                common -= 1;
            }
            return common;
        }
        // Function to parse and evaluate an expression
        parseAndEval(input) {
            const matcher = this.matcher;
            const oldInput = matcher.getInput();
            const start = this.diffPartsStart(oldInput, input);
            const end = this.diffPartsEnd(oldInput, input, start);
            const oldEnd = oldInput.length - (input.length - end);
            try {
                if (start > 0) {
                    matcher.replaceInputRange(start, oldEnd, input.substring(start, end));
                }
                else {
                    matcher.setInput(input);
                }
                const matchResult = matcher.match();
                if (matchResult.succeeded()) {
                    return this.ohmSemantics(matchResult).eval();
                }
                else {
                    return `ERROR: Parsing failed: ${matchResult.message}`;
                }
            }
            catch (error) {
                return `ERROR: Parsing evaluator failed: ${error instanceof Error ? error.message : "unknown"}`;
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
      | After
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
      | Every
      | ForNextBlock
      | Frame
      | Gosub
      | GraphicsPen
      | If
      | Ink
      | Input
      | MidSAssign
      | Mode
      | Move
      | Mover
      | On
      | Origin
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
      | Rsx
      | Stop
      | Tag
      | Tagoff
      | WhileWendBlock
      | ArrayAssign
      | Assign

    ArrayAssign
      = ArrayIdent "=" NumExp
      | StrArrayIdent "=" StrExp

    LoopBlockContent
      = LoopBlockSeparator Statements

    LoopBlockSeparator
      = ":" -- colon
      | Comment? eol Label? -- newline

    Abs
      = abs #"(" NumExp ")"
    
    After
      = after NumExp ("," NumExp)? gosub label

    Asc
      = asc #"(" StrExp ")"

    Atn
      = atn #"(" NumExp ")"

    Assign
      = ident "=" NumExp
      | strIdent "=" StrExp

    BinS
      = binS #"(" NumExp ("," NumExp)? ")"

    ChrS
      = chrS #"(" NumExp ")"

    Cint
      = cint #"(" NumExp ")"

    Cls
      = cls

    Comment
      = "\\'" partToEol

    Cos
      = cos #"(" NumExp ")"

    DataItem
      = string | number | signedDecimal

    Data
      = data NonemptyListOf<DataItem, ",">

    DecS
      = decS #"(" NumExp "," StrExp ")"

    Def
      = def fn DefAssign
    
    DefArgs
      = #"(" ListOf<SimpleIdent, ","> ")"

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

    Every
      = every NumExp ("," NumExp)? gosub label

    Exp
      = exp #"(" NumExp ")"

    Fix
      = fix #"(" NumExp ")"

    For
      = for variable "=" NumExp to NumExp (step NumExp)?

    ForNextBlock
      = For LoopBlockContent* LoopBlockSeparator Next

    Frame
      = frame

    Gosub
      = gosub label

    GraphicsPen
      = graphics pen NumExp

    HexS
      = hexS #"(" NumExp ("," NumExp)? ")"

    Ink
      = ink NumExp "," NumExp ("," NumExp)?

    InkeyS
      = inkeyS

    Input
      = input (string (";" | ","))? AnyIdent  // or NonemptyListOf?

    Instr
      = instr #"(" StrExp "," StrExp ")" -- noLen
      | instr #"(" NumExp "," StrExp "," StrExp ")" -- len

    Int
      = int #"(" NumExp ")"

    LeftS
      = leftS #"(" StrExp "," NumExp ")"

    Len
      = len #"(" StrExp ")"

    Log
      = log #"(" NumExp ")"

    Log10
      = log10 #"(" NumExp ")"

    LowerS
      = lowerS #"(" StrExp ")"

    Max
      = max #"(" NonemptyListOf<NumExp, ","> ")"

    MidS
      = midS #"(" StrExp "," NumExp ("," NumExp)? ")"

    MidSAssign
      = midS #"(" strIdent "," NumExp ("," NumExp)? ")" "=" StrExp

    Min
      = min #"(" NonemptyListOf<NumExp, ","> ")"

    Mode
      = mode NumExp

    Move
      = move NumExp "," NumExp ("," NumExp)?
    
    Mover
      = mover NumExp "," NumExp ("," NumExp)?

    Pi
      = pi

    Next
      = next variable?

    On
      = on NumExp gosub NonemptyListOf<label, ",">

    Origin
      = origin NumExp "," NumExp

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

    Remain
      = remain #"(" NumExp ")"

    Restore
      = restore label?

    Return
      = return

    RightS
      = rightS "(" StrExp "," NumExp ")"

    Rnd
      = rnd (#"(" NumExp ")")?
    
    Round
      = round #"(" NumExp ("," NumExp)? ")"

    Rsx
      = "|" #rsxIdentName RsxArgs?

    RsxAddressOfIdent
      = "@" AnyIdent

    RsxArg = AnyFnArg | RsxAddressOfIdent

    RsxArgs
      = "," NonemptyListOf<RsxArg, ",">

    Sgn
      = sgn #"(" NumExp ")"

    Sin
      = sin #"(" NumExp ")"

    SpaceS
      = spaceS #"(" NumExp ")"

    Sqr
      = sqr #"(" NumExp ")"

    Stop
      = stop

    StrS
      = strS #"(" NumExp ")"

    StringS
      = stringS #"(" NumExp "," StrExp ")" -- str
      | stringS #"(" NumExp "," NumExp ")" -- num

    Tag
      = tag

    Tagoff
      = tagoff
      
    Tan
      = tan #"(" NumExp ")"

    Time
      = time

    UpperS
      = upperS #"(" StrExp ")"

    Val
      = val #"(" StrExp ")"

    Wend
      = wend

    While
      = while NumExp

    WhileWendBlock
      = While LoopBlockContent* LoopBlockSeparator Wend

    Xpos
      = xpos

    Ypos
      = ypos

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
      | InkeyS
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
      | Remain
      | Rnd
      | Round
      | Sgn
      | Sin
      | Sqr
      | Tan
      | Time
      | Val
      | Xpos
      | Ypos

    ArrayArgs
      = NonemptyListOf<NumExp, ",">

    ArrayIdent
      = ident #"(" ArrayArgs ")"

    StrArrayIdent
      = strIdent #"(" ArrayArgs ")"

    DimArrayArgs
      = NonemptyListOf<NumExp, ",">

    DimArrayIdent
      = ident #"(" DimArrayArgs ")"
      | strIdent #"(" DimArrayArgs ")"

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
      = #"(" ListOf<AnyFnArg, ","> ")"


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

    rsxIdentName = letter alnum*

    identName = identStart identPart*

    identStart = letter

    identPart = alnum

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

    rsxIdentName := upper (upper | digit)*
}
  `
    };

    class SemanticsHelper {
        constructor() {
            this.lineIndex = 0;
            this.indent = 0;
            this.variables = {};
            this.definedLabels = [];
            this.usedLabels = {};
            this.dataList = [];
            this.dataIndex = 0;
            this.restoreMap = {};
            this.instrMap = {};
            this.isDeg = false;
            this.isDefContext = false;
        }
        getDeg() {
            return this.isDeg;
        }
        setDeg(isDeg) {
            this.isDeg = isDeg;
        }
        addIndent(num) {
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
        addUsedLabel(label, type) {
            if (!this.usedLabels[type]) {
                this.usedLabels[type] = {};
            }
            const usedLabelsForType = this.usedLabels[type];
            usedLabelsForType[label] = usedLabelsForType[label] || {
                count: 0
            };
            usedLabelsForType[label].count = (usedLabelsForType[label].count || 0) + 1;
        }
        getUsedLabels() {
            return this.usedLabels;
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
            if (SemanticsHelper.reJsKeyword.test(name)) {
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
            SemanticsHelper.deleteAllItems(this.variables);
            this.definedLabels.length = 0;
            SemanticsHelper.deleteAllItems(this.usedLabels);
            this.dataList.length = 0;
            this.dataIndex = 0;
            SemanticsHelper.deleteAllItems(this.restoreMap);
            SemanticsHelper.deleteAllItems(this.instrMap);
            this.isDeg = false;
            this.isDefContext = false;
        }
    }
    SemanticsHelper.reJsKeyword = /^(arguments|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/;

    function getCodeSnippets() {
        const _o = {};
        const _data = [];
        let _dataPtr = 0;
        const _restoreMap = {};
        const _startTime = 0;
        const frame = async () => { }; // dummy
        const codeSnippets = {
            after: function after(timeout, timer, fn) {
                _o.getTimerMap()[timer] = setTimeout(() => fn(), timeout * 20);
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
            dim: function dim(dims, value = 0) {
                const createRecursiveArray = (depth) => {
                    const length = dims[depth] + 1;
                    const array = new Array(length);
                    depth += 1;
                    if (depth < dims.length) {
                        for (let i = 0; i < length; i += 1) {
                            array[i] = createRecursiveArray(depth);
                        }
                    }
                    else {
                        array.fill(value);
                    }
                    return array;
                };
                return createRecursiveArray(0);
            },
            dim1: function dim1(dim, value = 0) {
                return new Array(dim + 1).fill(value);
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
            every: function every(timeout, timer, fn) {
                _o.getTimerMap()[timer] = setInterval(() => fn(), timeout * 20);
            },
            frame: async function frame() {
                _o.flush();
                if (_o.getEscape()) {
                    throw new Error("INFO: Program stopped");
                }
                return new Promise(resolve => setTimeout(() => resolve(), Date.now() % 50));
            },
            graphicsPen: function graphicsPen(num) {
                _o.graphicsPen(num);
            },
            hex$: function hex$(num, pad) {
                return num.toString(16).toUpperCase().padStart(pad || 0, "0");
            },
            ink: function ink(num, col) {
                _o.ink(num, col);
            },
            inkey$: async function inkey$() {
                await frame();
                return await _o.inkey$();
            },
            input: async function input(msg, isNum) {
                await frame();
                const input = await _o.input(msg);
                if (input === null) {
                    throw new Error("INFO: Input canceled");
                }
                else if (isNum && isNaN(Number(input))) {
                    throw new Error("Invalid number input");
                }
                else {
                    return isNum ? Number(input) : input;
                }
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
            origin: function origin(x, y) {
                _o.origin(x, y);
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
            remain: function remain(timer) {
                const timerMap = _o.getTimerMap();
                const value = timerMap[timer];
                clearTimeout(value);
                clearInterval(value);
                timerMap[timer] = undefined;
                return value; // not really remain
            },
            restore: function restore(label) {
                _dataPtr = _restoreMap[label];
            },
            round: function round(num, dec) {
                return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
            },
            rsx: async function rsx(cmd, ...args) {
                return _o.rsx(cmd, args);
            },
            stop: function stop() {
                _o.flush();
                return "stop";
            },
            str$: function str$(num) {
                return num >= 0 ? ` ${num}` : String(num);
            },
            tag: function tag(active) {
                _o.tag(active);
            },
            time: function time() {
                return ((Date.now() - _startTime) * 3 / 10) | 0;
            },
            val: function val(str) {
                return Number(str.replace("&x", "0b").replace("&", "0x"));
            },
            xpos: function xpos() {
                return _o.xpos();
            },
            ypos: function ypos() {
                return _o.ypos();
            }
        };
        return codeSnippets;
    }
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
        return children.map(child => child.eval());
    }
    function createComparisonExpression(a, op, b) {
        return `-(${a.eval()} ${op} ${b.eval()})`;
    }
    function getSemanticsActionDict(semanticsHelper) {
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
        const loopBlock = (startNode, content, separator, endNode) => {
            const startStr = startNode.eval();
            const contentStr = evalChildren(content.children).join(';');
            const endStr = endNode.eval();
            let separatorStr = separator.eval();
            if (contentStr && !contentStr.endsWith("}")) {
                separatorStr = ";" + separatorStr;
            }
            return `${startStr}${contentStr}${separatorStr}${endStr}`;
        };
        const semantics = {
            Program(lines) {
                const lineList = evalChildren(lines.children);
                const variableList = semanticsHelper.getVariables();
                const variableDeclarations = variableList.length ? "let " + variableList.map((v) => v.endsWith("$") ? `${v} = ""` : `${v} = 0`).join(", ") + ";" : "";
                // find subroutines
                const definedLabels = semanticsHelper.getDefinedLabels();
                const usedLabels = semanticsHelper.getUsedLabels();
                const gosubLabels = usedLabels["gosub"] || {};
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
                            lineList[i] = lineList[i].replace(/\n/g, "\n  ");
                        }
                        const asyncStr = hasAwait ? "async " : "";
                        lineList[first] = `${indentStr}${asyncStr}function _${subroutineStart.label}() {${indentStr}\n` + lineList[first];
                        lineList[label.last] += `\n${indentStr}}`;
                        if (hasAwait) {
                            awaitLabels.push(subroutineStart.label);
                        }
                        subroutineStart = undefined;
                    }
                    if (restoreMap[label.label] === -1) {
                        restoreMap[label.label] = label.dataIndex;
                    }
                }
                const instrMap = semanticsHelper.getInstrMap();
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
                const codeSnippets = getCodeSnippets();
                let needsAsync = false;
                let needsStartTime = false;
                for (const key of Object.keys(codeSnippets)) {
                    if (instrMap[key]) {
                        const code = String((codeSnippets[key]).toString());
                        const adaptedCode = trimIndent(code);
                        lineList.push(adaptedCode);
                        if (adaptedCode.startsWith("async ")) {
                            needsAsync = true;
                        }
                        if (adaptedCode.includes("_startTime")) {
                            needsStartTime = true;
                        }
                    }
                }
                if (variableDeclarations) {
                    lineList.unshift(variableDeclarations);
                }
                if (needsStartTime) {
                    lineList.unshift(`const _startTime = Date.now();`);
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
            LoopBlockContent(separator, stmts) {
                const separatorStr = separator.eval();
                const lineStr = stmts.eval();
                return `${separatorStr}${lineStr}`;
            },
            LoopBlockSeparator_colon(_colonLit) {
                return "";
            },
            LoopBlockSeparator_newline(comment, eol, _label) {
                // labels in blocks are ignored
                const commentStr = comment.sourceString ? ` //${comment.sourceString.substring(1)}` : "";
                const eolStr = eol.sourceString + semanticsHelper.getIndentStr();
                return `${commentStr}${eolStr}`;
            },
            Abs(_absLit, _open, e, _close) {
                return `Math.abs(${e.eval()})`;
            },
            After(_afterLit, e1, _comma1, e2, _gosubLit, label) {
                var _a;
                semanticsHelper.addInstr("after");
                const timeout = e1.eval();
                const timer = ((_a = e2.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || 0;
                const labelString = label.sourceString;
                semanticsHelper.addUsedLabel(labelString, "gosub");
                return `after(${timeout}, ${timer}, _${labelString})`;
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
                const argList = evalChildren(args.asIteration().children);
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
                const argList = evalChildren(arrayIdents.asIteration().children);
                return `(${argList.join(", ")})`;
            },
            DefAssign(ident, args, _equal, e) {
                const fnIdent = semanticsHelper.getVariable(`fn${ident.sourceString}`);
                semanticsHelper.setDefContext(true); // do not create global variables in this context
                const argStr = evalChildren(args.children).join(", ") || "()";
                const defBody = e.eval();
                semanticsHelper.setDefContext(false);
                return `${fnIdent} = ${argStr} => ${defBody}`;
            },
            Deg(_degLit) {
                semanticsHelper.setDeg(true);
                return `/* deg active */`;
            },
            Dim(_dimLit, dimArgs) {
                const argumentList = evalChildren(dimArgs.asIteration().children);
                return argumentList.join("; ");
            },
            Draw: drawMovePlot,
            Drawr: drawMovePlot,
            End(_endLit) {
                semanticsHelper.addInstr("end");
                return `return end()`;
            },
            Erase(_eraseLit, arrayIdents) {
                const arrayIdentifiers = evalChildren(arrayIdents.asIteration().children);
                const results = [];
                for (const ident of arrayIdentifiers) {
                    const initValStr = ident.endsWith("$") ? '""' : '0';
                    results.push(`${ident} = ${initValStr}`);
                }
                return results.join("; ");
            },
            Error(_errorLit, e) {
                return `throw new Error(${e.eval()})`;
            },
            Every(_everyLit, e1, _comma1, e2, _gosubLit, label) {
                var _a;
                semanticsHelper.addInstr("every");
                const timeout = e1.eval();
                const timer = ((_a = e2.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || 0;
                const labelString = label.sourceString;
                semanticsHelper.addUsedLabel(labelString, "gosub");
                return `every(${timeout}, ${timer}, _${labelString})`;
            },
            Exp(_expLit, _open, e, _close) {
                return `Math.exp(${e.eval()})`;
            },
            Fix(_fixLit, _open, e, _close) {
                return `Math.trunc(${e.eval()})`;
            },
            AnyFnArgs(_open, args, _close) {
                const argumentList = evalChildren(args.asIteration().children);
                return `(${argumentList.join(", ")})`;
            },
            FnIdent(fnIdent, args) {
                var _a;
                const argumentString = ((_a = args.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "()";
                return `${fnIdent.eval()}${argumentString}`;
            },
            StrFnIdent(fnIdent, args) {
                var _a;
                const argStr = ((_a = args.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "()";
                return `${fnIdent.eval()}${argStr}`;
            },
            For(_forLit, variable, _eqSign, start, _dirLit, end, _stepLit, step) {
                var _a;
                const variableExpression = variable.eval();
                const startExpression = start.eval();
                const endExpression = end.eval();
                const stepExpression = ((_a = step.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "1";
                const stepAsNumber = Number(stepExpression);
                let comparisonStatement = "";
                if (isNaN(stepAsNumber)) {
                    comparisonStatement = `${stepExpression} >= 0 ? ${variableExpression} <= ${endExpression} : ${variableExpression} >= ${endExpression}`;
                }
                else {
                    comparisonStatement = stepAsNumber >= 0 ? `${variableExpression} <= ${endExpression}` : `${variableExpression} >= ${endExpression}`;
                }
                semanticsHelper.addIndent(2);
                const result = `for (${variableExpression} = ${startExpression}; ${comparisonStatement}; ${variableExpression} += ${stepExpression}) {`;
                return result;
            },
            ForNextBlock: loopBlock,
            Frame(_frameLit) {
                semanticsHelper.addInstr("frame");
                return `await frame()`;
            },
            Gosub(_gosubLit, e) {
                const labelString = e.sourceString;
                semanticsHelper.addUsedLabel(labelString, "gosub");
                return `_${labelString}()`;
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
                const condition = condExp.eval();
                const thenStatement = thenStat.eval();
                let result = `if (${condition}) {\n${increasedIndent}${thenStatement}\n${initialIndent}}`; // put in newlines to also allow line comments
                if (elseLit.sourceString) {
                    const elseStatement = evalChildren(elseStat.children).join('; ');
                    result += ` else {\n${increasedIndent}${elseStatement}\n${initialIndent}}`;
                }
                semanticsHelper.addIndent(-2);
                return result;
            },
            Ink(_inkLit, num, _comma, col, _comma2, _col2) {
                semanticsHelper.addInstr("ink");
                return `ink(${num.eval()}, ${col.eval()})`;
            },
            InkeyS(_inkeySLit) {
                semanticsHelper.addInstr("inkey$");
                semanticsHelper.addInstr("frame");
                return `await inkey$()`;
            },
            Input(_inputLit, message, _semi, e) {
                semanticsHelper.addInstr("input");
                semanticsHelper.addInstr("frame");
                const messageString = message.sourceString.replace(/\s*[;,]$/, "");
                const identifier = e.eval();
                const isNumberString = identifier.includes("$") ? "" : ", true";
                return `${identifier} = await input(${messageString}${isNumberString})`;
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
                const argumentList = evalChildren(args.asIteration().children);
                return `Math.max(${argumentList})`;
            },
            MidS(_midLit, _open, e1, _comma1, e2, _comma2, e3, _close) {
                var _a;
                const length = (_a = e3.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
                const lengthString = length === undefined ? "" : `, ${length}`;
                return `(${e1.eval()}).substr(${e2.eval()} - 1${lengthString})`;
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
                const argumentList = evalChildren(args.asIteration().children);
                return `Math.min(${argumentList})`;
            },
            Mode(_modeLit, e) {
                semanticsHelper.addInstr("mode");
                return `mode(${e.eval()})`;
            },
            Move: drawMovePlot,
            Mover: drawMovePlot,
            Next(_nextLit, _variable) {
                semanticsHelper.addIndent(-2);
                return "}";
            },
            On(_onLit, e1, _gosubLit, args) {
                const index = e1.eval();
                const argumentList = args.asIteration().children.map(child => child.sourceString);
                for (let i = 0; i < argumentList.length; i += 1) {
                    const labelString = argumentList[i];
                    semanticsHelper.addUsedLabel(labelString, "gosub");
                }
                return `([${argumentList.map((label) => `_${label}`).join(",")}]?.[${index} - 1] || (() => undefined))()`; // 1-based index
            },
            Origin(_originLit, x, _comma1, y) {
                semanticsHelper.addInstr("origin");
                return `origin(${x.eval()}, ${y.eval()})`;
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
                const parameterString = args.children[0].eval();
                return parameterString;
            },
            PrintArg_usingNum(_printLit, format, _semi, numArgs) {
                semanticsHelper.addInstr("dec$");
                const formatString = format.eval();
                const argumentList = evalChildren(numArgs.asIteration().children);
                const parameterString = argumentList.map((arg) => `dec$(${arg}, ${formatString})`).join(', ');
                return parameterString;
            },
            Print(_printLit, args, semi) {
                semanticsHelper.addInstr("print");
                const argumentList = evalChildren(args.asIteration().children);
                const parameterString = argumentList.join(', ') || "";
                let newlineString = "";
                if (!semi.sourceString) {
                    newlineString = parameterString ? `, "\\n"` : `"\\n"`;
                }
                return `print(${parameterString}${newlineString})`;
            },
            Rad(_radLit) {
                semanticsHelper.setDeg(false);
                return `/* rad active */`;
            },
            Read(_readlit, args) {
                semanticsHelper.addInstr("read");
                const argumentList = evalChildren(args.asIteration().children);
                const results = argumentList.map(identifier => `${identifier} = read()`);
                return results.join("; ");
            },
            Rem(_remLit, remain) {
                return `// ${remain.sourceString}`;
            },
            Remain(_remainLit, _open, e, _close) {
                semanticsHelper.addInstr("remain");
                return `remain(${e.eval()})`;
            },
            Restore(_restoreLit, e) {
                const labelString = e.sourceString || "0";
                semanticsHelper.addRestoreLabel(labelString);
                semanticsHelper.addUsedLabel(labelString, "restore");
                semanticsHelper.addInstr("restore");
                return `restore(${labelString})`;
            },
            Return(_returnLit) {
                return "return";
            },
            RightS(_rightLit, _open, e1, _comma, e2, _close) {
                const string = e1.eval();
                const length = e2.eval();
                return `(${string}).substring((${string}).length - (${length}))`;
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
            Rsx(_rsxLit, cmd, e) {
                var _a;
                semanticsHelper.addInstr("rsx");
                const cmdString = cmd.sourceString.toLowerCase();
                const rsxArgs = ((_a = e.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
                if (rsxArgs === "") {
                    return `await rsx("${cmdString}"${rsxArgs})`;
                }
                // need assign, not so nice to use <RSXFUNCTION>" as separator
                return rsxArgs.replace("<RSXFUNCTION>", `await rsx("${cmdString}"`) + ")";
            },
            RsxAddressOfIdent(_adressOfLit, ident) {
                const identString = ident.sourceString.toLowerCase();
                return `@${identString}`;
            },
            RsxArgs(_comma, args) {
                const argumentList = evalChildren(args.asIteration().children);
                // Remove "@" prefix from arguments
                const argumentListNoAddr = argumentList.map(arg => arg.startsWith("@") ? arg.substring(1) : arg);
                // Extract assignments and remove "@" prefix
                const assignList = argumentList.map(arg => arg.startsWith("@") ? arg.substring(1) : undefined);
                // Remove trailing undefined values
                while (assignList.length && assignList[assignList.length - 1] === undefined) {
                    assignList.pop();
                }
                // Build the result string
                const assignments = assignList.length ? `[${assignList.join(", ")}] = ` : "";
                const result = `${assignments}<RSXFUNCTION>, ${argumentListNoAddr.join(", ")}`;
                return result;
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
                const argument = e.eval();
                if (isNaN(Number(argument))) {
                    semanticsHelper.addInstr("str$");
                    return `str$(${argument})`;
                }
                // simplify if we know at compile time that arg is a positive number
                return argument >= 0 ? `(" " + String(${argument}))` : `String(${argument})`;
            },
            StringS_str(_stringLit, _open, len, _commaLit, chr, _close) {
                // Note: we do not use charAt(0) to get just one char
                return `(${chr.eval()}).repeat(${len.eval()})`;
            },
            StringS_num(_stringLit, _open, len, _commaLit, num, _close) {
                return `String.fromCharCode(${num.eval()}).repeat(${len.eval()})`;
            },
            Tag(_tagLit) {
                semanticsHelper.addInstr("tag");
                return `tag(true)`;
            },
            Tagoff(_tagoffLit) {
                semanticsHelper.addInstr("tag");
                return `tag(false)`;
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
                semanticsHelper.addIndent(2);
                return `while (${cond}) {`;
            },
            WhileWendBlock: loopBlock,
            Xpos(_xposLit) {
                semanticsHelper.addInstr("xpos");
                return `xpos()`;
            },
            Ypos(_xposLit) {
                semanticsHelper.addInstr("ypos");
                return `ypos()`;
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
                return createComparisonExpression(a, "===", b);
            },
            CmpExp_ne(a, _op, b) {
                return createComparisonExpression(a, "!==", b);
            },
            CmpExp_lt(a, _op, b) {
                return createComparisonExpression(a, "<", b);
            },
            CmpExp_le(a, _op, b) {
                return createComparisonExpression(a, "<=", b);
            },
            CmpExp_gt(a, _op, b) {
                return createComparisonExpression(a, ">", b);
            },
            CmpExp_ge(a, _op, b) {
                return createComparisonExpression(a, ">=", b);
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
                return evalChildren(args.asIteration().children).join("][");
            },
            ArrayIdent(ident, _open, e, _close) {
                return `${ident.eval()}[${e.eval()}]`;
            },
            StrArrayIdent(ident, _open, e, _close) {
                return `${ident.eval()}[${e.eval()}]`;
            },
            DimArrayArgs(args) {
                return evalChildren(args.asIteration().children).join(", ");
            },
            DimArrayIdent(ident, _open, indices, _close) {
                const identStr = ident.eval();
                const indicesStr = indices.eval();
                const isMultiDimensional = indicesStr.includes(","); // also for expressions containing comma
                const valueStr = identStr.endsWith("$") ? ', ""' : "";
                if (isMultiDimensional) { // one value (not detected for expressions containing comma)
                    semanticsHelper.addInstr("dim");
                    return `${identStr} = dim([${indicesStr}]${valueStr})`;
                }
                semanticsHelper.addInstr("dim1");
                return `${identStr} = dim1(${indicesStr}${valueStr})`;
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
            this.helper = new SemanticsHelper();
        }
        resetParser() {
            this.helper.resetParser();
        }
        getUsedLabels() {
            return this.helper.getUsedLabels();
        }
        getSemanticsActionDict() {
            return getSemanticsActionDict(this.helper);
        }
        getHelper() {
            return this.helper;
        }
    }

    function fnHereDoc(fn) {
        return String(fn).replace(/^[^/]+\/\*\S*/, "").replace(/\*\/[^/]+$/, "");
    }
    class Core {
        constructor(defaultConfig) {
            this.semantics = new Semantics();
            this.databaseMap = {};
            this.onCheckSyntax = async (_s) => ""; // eslint-disable-line @typescript-eslint/no-unused-vars
            this.addIndex = (dir, input) => {
                if (typeof input === "function") {
                    input = {
                        [dir]: JSON.parse(fnHereDoc(input).trim())
                    };
                }
                const exampleMap = {};
                for (const value in input) {
                    const item = input[value];
                    for (let i = 0; i < item.length; i += 1) {
                        exampleMap[item[i].key] = item[i];
                    }
                }
                this.setExampleMap(exampleMap);
            };
            this.addItem = (key, input) => {
                let inputString = typeof input !== "string" ? fnHereDoc(input) : input;
                inputString = inputString.replace(/^\n/, "").replace(/\n$/, ""); // remove preceding and trailing newlines
                if (!key) { // maybe ""
                    console.warn("addItem: no key!");
                    key = "unknown";
                }
                const example = this.getExample(key);
                if (example) {
                    example.script = inputString;
                }
            };
            this.defaultConfig = defaultConfig;
            this.config = Object.assign({}, defaultConfig);
        }
        getDefaultConfigMap() {
            return this.defaultConfig;
        }
        getConfigMap() {
            return this.config;
        }
        initDatabaseMap() {
            const databaseDirs = this.config.databaseDirs.split(",");
            for (const source of databaseDirs) {
                const parts = source.split("/");
                const key = parts[parts.length - 1];
                this.databaseMap[key] = {
                    key,
                    source,
                    exampleMap: undefined
                };
            }
            return this.databaseMap;
        }
        getDatabaseMap() {
            return this.databaseMap;
        }
        getDatabase() {
            return this.databaseMap[this.config.database];
        }
        getExampleMap() {
            const exampleMap = this.databaseMap[this.config.database].exampleMap;
            if (!exampleMap) {
                console.error("getExampleMap: Undefined exampleMap for database", this.config.database);
                return {};
            }
            return exampleMap;
        }
        setExampleMap(exampleMap) {
            this.databaseMap[this.config.database].exampleMap = exampleMap;
        }
        getExample(name) {
            const exampleMap = this.getExampleMap();
            return exampleMap[name];
        }
        setOnCheckSyntax(fn) {
            this.onCheckSyntax = fn;
        }
        compileScript(script) {
            if (!this.arithmeticParser) {
                const semanticsActionDict = this.semantics.getSemanticsActionDict();
                if (this.config.grammar === "strict") {
                    const basicParser = new Parser(arithmetic.basicGrammar, semanticsActionDict);
                    this.arithmeticParser = new Parser(arithmetic.strictGrammar, semanticsActionDict, basicParser);
                }
                else {
                    this.arithmeticParser = new Parser(arithmetic.basicGrammar, semanticsActionDict);
                }
            }
            this.semantics.resetParser();
            return this.arithmeticParser.parseAndEval(script);
        }
        async executeScript(compiledScript, vm) {
            vm.setOutput("");
            if (compiledScript.startsWith("ERROR:")) {
                return "ERROR";
            }
            const syntaxError = await this.onCheckSyntax(compiledScript);
            if (syntaxError) {
                vm.cls();
                return "ERROR: " + syntaxError;
            }
            let output = "";
            try {
                const fnScript = new Function("_o", compiledScript);
                const result = await fnScript(vm);
                if (this.config.debug > 0) {
                    console.debug("executeScript: ", result);
                }
                vm.flush();
                output = vm.getOutput() || "";
            }
            catch (error) {
                output = vm.getOutput() || "";
                if (output) {
                    output += "\n";
                }
                output += String(error).replace("Error: INFO: ", "INFO: ");
                if (error instanceof Error) {
                    const anyErr = error;
                    const lineNumber = anyErr.lineNumber; // only on FireFox
                    const columnNumber = anyErr.columnNumber; // only on FireFox
                    if (lineNumber || columnNumber) {
                        const errLine = lineNumber - 2; // lineNumber -2 because of anonymous function added by new Function() constructor
                        output += ` (Line ${errLine}, column ${columnNumber})`;
                    }
                }
            }
            // remain for all timers
            const timerMap = vm.getTimerMap();
            for (const timer in timerMap) {
                if (timerMap[timer] !== undefined) {
                    const timerMap = vm.getTimerMap();
                    const value = timerMap[timer];
                    clearTimeout(value);
                    clearInterval(value);
                    timerMap[timer] = undefined;
                }
            }
            return output;
        }
        getSemantics() {
            return this.semantics;
        }
        parseArgs(args, config) {
            for (const arg of args) {
                const [name, ...valueParts] = arg.split("=");
                const nameType = typeof config[name];
                let value = valueParts.join("=");
                if (value !== undefined) {
                    if (nameType === "boolean") {
                        value = value === "true";
                    }
                    else if (nameType === "number") {
                        value = Number(value);
                    }
                    config[name] = value;
                }
            }
            return config;
        }
    }

    const strokeWidthForMode = [4, 2, 1, 1];
    class BasicVmCore {
        constructor(penColors, paperColors) {
            this.output = "";
            this.currPaper = -1;
            this.currPen = -1;
            this.currMode = 2;
            this.graphicsBuffer = [];
            this.graphicsPathBuffer = [];
            this.currGraphicsPen = -1;
            this.originX = 0;
            this.originY = 0;
            this.graphicsX = 0;
            this.graphicsY = 0;
            this.colorsForPens = [];
            this.backgroundColor = "";
            this.isTag = false; // text at graphics
            this.timerMap = {};
            this.pitch = 1;
            this.fnOnSpeak = () => Promise.resolve();
            this.defaultColorsForPens = [
                1, 24, 20, 6, 26, 0, 2, 8, 10, 12, 14, 16, 18, 22, 1, 16, 1
            ];
            this.rsxArc = (args) => {
                const [x, y, rx, ry, rotx, long, sweep, endx, endy, fill] = args.map((p) => Math.round(p));
                this.flushGraphicsPath(); // maybe a path is open
                const strokeAndFillStr = this.getStrokeAndFillStr(fill);
                const svgPathCmd = `M${x} ${399 - y} A${rx} ${ry} ${rotx} ${long} ${sweep} ${endx} ${399 - endy}`;
                this.graphicsBuffer.push(`<path d="${svgPathCmd}"${strokeAndFillStr} />`);
            };
            this.rsxCircle = (args) => {
                const [cx, cy, r, fill] = args.map((p) => Math.round(p));
                const strokeAndFillStr = this.getStrokeAndFillStr(fill);
                this.flushGraphicsPath(); // maybe a path is open
                // if we want origin: x + this.originX, 399 - y - this.originY
                this.graphicsBuffer.push(`<circle cx="${cx}" cy="${399 - cy}" r="${r}"${strokeAndFillStr} />`);
            };
            // returns a date string in the format "ww DD MM YY" with ww=day of week
            // see https://www.cpcwiki.eu/imgs/b/b4/DXS_RTC_-_User_Manual.pdf
            this.rsxDate = async (args) => {
                const date = new Date();
                // Get the day of the week (0-6) and convert to 1-7
                const dayOfWeek = (date.getDay() + 1) % 7;
                const day = date.getDate();
                const month = date.getMonth() + 1; // Months are zero-based
                const year = date.getFullYear() % 100; // Get last two digits of the year
                const dateStr = `${String(dayOfWeek).padStart(2, '0')} ${String(day).padStart(2, '0')} ${String(month).padStart(2, '0')} ${String(year).padStart(2, '0')}`;
                args[0] = dateStr;
                return Promise.resolve(args);
            };
            this.rsxEllipse = (args) => {
                const [cx, cy, rx, ry, fill] = args.map((p) => Math.round(p));
                const strokeAndFillStr = this.getStrokeAndFillStr(fill);
                this.flushGraphicsPath();
                this.graphicsBuffer.push(`<ellipse cx="${cx}" cy="${399 - cy}" rx="${rx}" ry="${ry}"${strokeAndFillStr} />`);
            };
            this.rsxRect = (args) => {
                const [x1, y1, x2, y2, fill] = args.map((p) => Math.round(p));
                const x = Math.min(x1, x2);
                const y = Math.max(y1, y2); // y is inverted
                const width = Math.abs(x2 - x1);
                const height = Math.abs(y2 - y1);
                const strokeAndFillStr = this.getStrokeAndFillStr(fill);
                this.flushGraphicsPath();
                this.graphicsBuffer.push(`<rect x="${x}" y="${399 - y}" width="${width}" height="${height}"${strokeAndFillStr} />`);
            };
            this.rsxPitch = (args) => {
                this.pitch = args[0] / 10; // 0..20 => 0..2
            };
            this.rsxSay = async (args) => {
                const text = args[0];
                return this.fnOnSpeak(text, this.pitch).then(() => args);
            };
            // returns a time string in the format "HH MM SS"
            // see https://www.cpcwiki.eu/imgs/b/b4/DXS_RTC_-_User_Manual.pdf
            this.rsxTime = async (args) => {
                const date = new Date();
                const hours = date.getHours();
                const minutes = date.getMinutes();
                const seconds = date.getSeconds();
                const timeStr = `${String(hours).padStart(2, '0')} ${String(minutes).padStart(2, '0')} ${String(seconds).padStart(2, '0')}`;
                args[0] = timeStr;
                return Promise.resolve(args);
            };
            this.rsxMap = {
                arc: {
                    argTypes: ["number", "number", "number", "number", "number", "number", "number", "number", "number", "number?"],
                    fn: this.rsxArc
                },
                circle: {
                    argTypes: ["number", "number", "number", "number?"],
                    fn: this.rsxCircle
                },
                date: {
                    argTypes: ["string"],
                    fn: this.rsxDate
                },
                ellipse: {
                    argTypes: ["number", "number", "number", "number", "number?"],
                    fn: this.rsxEllipse
                },
                pitch: {
                    argTypes: ["number"],
                    fn: this.rsxPitch
                },
                rect: {
                    argTypes: ["number", "number", "number", "number", "number?"],
                    fn: this.rsxRect
                },
                say: {
                    argTypes: ["string"],
                    fn: this.rsxSay
                },
                time: {
                    argTypes: ["string"],
                    fn: this.rsxTime
                }
            };
            this.penColors = penColors;
            this.paperColors = paperColors;
            this.reset();
        }
        static getCpcColors() {
            return BasicVmCore.cpcColors;
        }
        reset() {
            this.colorsForPens.splice(0, this.colorsForPens.length, ...this.defaultColorsForPens);
            this.backgroundColor = "";
            this.originX = 0;
            this.originY = 0;
            this.pitch = 1;
        }
        cls() {
            this.output = "";
            this.isTag = false;
            this.currPaper = -1;
            this.currPen = -1;
            this.graphicsBuffer.length = 0;
            this.graphicsPathBuffer.length = 0;
            this.currGraphicsPen = -1;
            this.graphicsX = 0;
            this.graphicsY = 0;
        }
        drawMovePlot(type, x, y) {
            x = Math.round(x);
            y = Math.round(y);
            if (!this.graphicsPathBuffer.length && type !== "M" && type !== "P") { // path must start with an absolute move
                this.graphicsPathBuffer.push(`M${this.graphicsX + this.originX} ${399 - this.graphicsY - this.originY}`);
            }
            const isAbsolute = type === type.toUpperCase();
            if (isAbsolute) {
                this.graphicsX = x;
                this.graphicsY = y;
                x = this.graphicsX + this.originX;
                y = 399 - this.graphicsY - this.originY;
            }
            else {
                this.graphicsX += x;
                this.graphicsY += y;
                y = -y;
            }
            const svgPathCmd = (type === "P" || type === "p")
                ? `${isAbsolute ? "M" : "m"}${x} ${y}h1v1h-1v-1`
                : `${type}${x} ${y}`;
            this.graphicsPathBuffer.push(svgPathCmd);
        }
        flushGraphicsPath() {
            if (this.graphicsPathBuffer.length) {
                let strokeStr = "";
                if (this.currGraphicsPen >= 0) {
                    const color = BasicVmCore.cpcColors[this.colorsForPens[this.currGraphicsPen]];
                    strokeStr = `stroke="${color}" `;
                }
                this.graphicsBuffer.push(`<path ${strokeStr}d="${this.graphicsPathBuffer.join("")}" />`);
                this.graphicsPathBuffer.length = 0;
            }
        }
        flushGraphics() {
            this.flushGraphicsPath();
            if (this.graphicsBuffer.length) {
                // separate print for svg graphics
                // in another module, we check if output starts with "<svg" to enable export SVG button
                const backgroundColorStr = this.backgroundColor !== "" ? ` style="background-color:${this.backgroundColor}"` : '';
                const graphicsBufferStr = this.graphicsBuffer.join("\n");
                this.graphicsBuffer.length = 0;
                return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 640 400" stroke-width="${strokeWidthForMode[this.currMode]}px" shape-rendering="optimizeSpeed" stroke="currentColor"${backgroundColorStr}>\n${graphicsBufferStr}"\n</svg>\n`;
            }
            return "";
        }
        flushText() {
            const output = this.output;
            this.output = "";
            return output;
        }
        graphicsPen(num) {
            if (num === this.currGraphicsPen) {
                return;
            }
            this.flushGraphicsPath();
            this.currGraphicsPen = num;
        }
        ink(num, col) {
            this.colorsForPens[num] = col;
            // we modify inks, so set default pens and papers
            if (this.currGraphicsPen < 0) {
                this.graphicsPen(1);
            }
            if (this.currPen < 0) {
                this.pen(1);
            }
            else if (num === this.currPen) {
                this.currPen = -1;
                this.pen(num);
            }
            if (this.currPaper < 0) {
                this.paper(0);
            }
            else if (num === this.currPaper) {
                this.currPaper = -1;
                this.paper(num);
            }
            if (num === 0) {
                this.backgroundColor = BasicVmCore.cpcColors[this.colorsForPens[0]];
            }
        }
        mode(num) {
            this.currMode = num;
            this.cls();
            this.origin(0, 0);
        }
        origin(x, y) {
            this.originX = x;
            this.originY = y;
        }
        paper(n) {
            if (n !== this.currPaper) {
                if (n < 0 || n >= this.paperColors.length) {
                    throw new Error("Invalid paper color index");
                }
                this.output += this.paperColors[this.colorsForPens[n]];
                this.currPaper = n;
            }
        }
        pen(n) {
            if (n !== this.currPen) {
                if (n < 0 || n >= this.penColors.length) {
                    throw new Error("Invalid pen color index");
                }
                this.output += this.penColors[this.colorsForPens[n]];
                this.currPen = n;
            }
        }
        printGraphicsText(text) {
            const yOffset = 16;
            let styleStr = "";
            if (this.currGraphicsPen >= 0) {
                const color = BasicVmCore.cpcColors[this.colorsForPens[this.currGraphicsPen]];
                styleStr = ` style="color: ${color}"`;
            }
            this.flushGraphicsPath(); // maybe a path is open
            this.graphicsBuffer.push(`<text x="${this.graphicsX + this.originX}" y="${399 - this.graphicsY - this.originY + yOffset}"${styleStr}>${text}</text>`);
        }
        print(...args) {
            const text = args.join('');
            if (this.isTag) {
                this.printGraphicsText(text);
            }
            else {
                this.output += text;
            }
        }
        setOnSpeak(fnOnSpeak) {
            this.fnOnSpeak = fnOnSpeak;
        }
        getStrokeAndFillStr(fill) {
            const cpcColors = BasicVmCore.cpcColors;
            const strokeStr = this.currGraphicsPen >= 0 ? ` stroke="${cpcColors[this.colorsForPens[this.currGraphicsPen]]}"` : "";
            const fillStr = fill >= 0 ? ` fill="${cpcColors[this.colorsForPens[fill]]}"` : "";
            return `${strokeStr}${fillStr}`;
        }
        async rsx(cmd, args) {
            if (!this.rsxMap[cmd]) {
                throw new Error(`Unknown RSX command: |${cmd.toUpperCase()}`);
            }
            const rsxInfo = this.rsxMap[cmd];
            const expectedArgs = rsxInfo.argTypes.length;
            const optionalArgs = rsxInfo.argTypes.filter((type) => type.endsWith("?")).length;
            if (args.length < expectedArgs - optionalArgs) {
                throw new Error(`|${cmd.toUpperCase()}: Wrong number of arguments: ${args.length} < ${expectedArgs - optionalArgs}`);
            }
            if (args.length > expectedArgs) {
                throw new Error(`|${cmd.toUpperCase()}: Wrong number of arguments: ${args.length} > ${expectedArgs}`);
            }
            for (let i = 0; i < args.length; i += 1) {
                const expectedType = rsxInfo.argTypes[i].replace("?", "");
                const arg = args[i];
                if (typeof arg !== expectedType) {
                    throw new Error(`|${cmd.toUpperCase()}: Wrong argument type (pos ${i}): ${typeof arg}`);
                }
            }
            const result = rsxInfo.fn(args);
            if (result instanceof Promise) {
                return result;
            }
            else {
                return args;
            }
        }
        tag(active) {
            this.isTag = active;
        }
        xpos() {
            return this.graphicsX;
        }
        ypos() {
            return this.graphicsY;
        }
        getTimerMap() {
            return this.timerMap;
        }
        getOutput() {
            const output = this.output;
            this.reset();
            return output;
        }
        setOutput(str) {
            this.output = str;
        }
    }
    BasicVmCore.cpcColors = [
        "#000000", //  0 Black
        "#000080", //  1 Blue
        "#0000FF", //  2 Bright Blue
        "#800000", //  3 Red
        "#800080", //  4 Magenta
        "#8000FF", //  5 Mauve
        "#FF0000", //  6 Bright Red
        "#FF0080", //  7 Purple
        "#FF00FF", //  8 Bright Magenta
        "#008000", //  9 Green
        "#008080", // 10 Cyan
        "#0080FF", // 11 Sky Blue
        "#808000", // 12 Yellow
        "#808080", // 13 White
        "#8080FF", // 14 Pastel Blue
        "#FF8000", // 15 Orange
        "#FF8080", // 16 Pink
        "#FF80FF", // 17 Pastel Magenta
        "#00FF00", // 18 Bright Green
        "#00FF80", // 19 Sea Green
        "#00FFFF", // 20 Bright Cyan
        "#80FF00", // 21 Lime
        "#80FF80", // 22 Pastel Green
        "#80FFFF", // 23 Pastel Cyan
        "#FFFF00", // 24 Bright Yellow
        "#FFFF80", // 25 Pastel Yellow
        "#FFFFFF", // 26 Bright White
        "#808080", // 27 White (same as 13)
        "#FF00FF", // 28 Bright Magenta (same as 8)
        "#FFFF80", // 29 Pastel Yellow (same as 25)
        "#000080", // 30 Blue (same as 1)
        "#00FF80" //  31 Sea Green (same as 19)
    ];

    function getAnsiColors(background) {
        const colorCodes = [
            30, //  0 Black
            34, //  1 Blue 
            94, //  2 Bright Blue
            31, //  3 Red
            35, //  4 Magenta (Purple?)
            35, //  5 Mauve ???
            91, //  6 Bright Red
            35, //  7 Purple
            95, //  8 Bright Magenta ?
            32, //  9 Green
            36, // 10 Cyan
            94, // 11 Sky Blue ?
            33, // 12 Yellow
            37, // 13 White
            94, // 14 Pastel Blue ?
            91, // 15 Orange ?
            95, // 16 Pink (Bright Magenta?)
            95, // 17 Pastel Magenta?
            92, // 18 Bright Green
            92, // 19 Sea Green
            96, // 20 Bright Cyan
            96, // 21 Lime ?
            92, // 22 Pastel Green (Bright Green)
            96, // 23 Pastel Cyan ?
            93, // 24 Bright Yellow
            93, // 25 Pastel Yellow
            37, // 26 Bright White
            37, // 27 White (same as 13)
            95, // 28 Bright Magenta (same as 8)
            93, // 29 Pastel Yellow (same as 25)
            34, // 30 Blue (same as 1)
            92 //  31 Sea Green (same as 19)
        ];
        const add = background ? 10 : 0;
        return colorCodes.map((code) => `\x1b[${code + add}m`); // e.g. Navy: pen: "\x1b[34m" or paper: "\x1b[44m"
    }
    class BasicVmNode {
        constructor(nodeParts) {
            this.nodeParts = nodeParts;
            const penColors = getAnsiColors(false);
            const paperColors = getAnsiColors(true);
            this.vmCore = new BasicVmCore(penColors, paperColors);
        }
        cls() {
            this.vmCore.cls();
            console.clear();
        }
        drawMovePlot(type, x, y) {
            this.vmCore.drawMovePlot(type, x, y);
        }
        static fnOnPrint(msg) {
            console.log(msg.replace(/\n$/, ""));
        }
        flush() {
            const textOutput = this.vmCore.flushText();
            if (textOutput) {
                BasicVmNode.fnOnPrint(textOutput);
            }
            const graphicsOutput = this.vmCore.flushGraphics();
            if (graphicsOutput) {
                BasicVmNode.fnOnPrint(graphicsOutput);
            }
        }
        graphicsPen(num) {
            this.vmCore.graphicsPen(num);
        }
        ink(num, col) {
            this.vmCore.ink(num, col);
        }
        inkey$() {
            const key = this.nodeParts.getKeyFromBuffer();
            return Promise.resolve(key);
        }
        async fnOnInput(msg) {
            console.log(msg);
            return Promise.resolve("");
        }
        input(msg) {
            this.flush();
            return this.fnOnInput(msg);
        }
        mode(num) {
            this.vmCore.mode(num);
        }
        origin(x, y) {
            this.vmCore.origin(x, y);
        }
        paper(n) {
            this.vmCore.paper(n);
        }
        pen(n) {
            this.vmCore.pen(n);
        }
        print(...args) {
            this.vmCore.print(...args);
        }
        async rsx(cmd, args) {
            return this.vmCore.rsx(cmd, args);
        }
        tag(active) {
            this.vmCore.tag(active);
        }
        xpos() {
            return this.vmCore.xpos();
        }
        ypos() {
            return this.vmCore.ypos();
        }
        getEscape() {
            return this.nodeParts.getEscape();
        }
        getTimerMap() {
            return this.vmCore.getTimerMap();
        }
        getOutput() {
            return this.vmCore.getOutput();
        }
        setOutput(str) {
            this.vmCore.setOutput(str);
        }
    }

    // The functions from dummyVm will be stringified in the putScriptInFrame function
    const dummyVm = {
        _output: "",
        debug(..._args) { }, // eslint-disable-line @typescript-eslint/no-unused-vars
        cls() { },
        drawMovePlot(type, x, y) { this.debug("drawMovePlot:", type, x, y); },
        flush() { if (this._output) {
            console.log(this._output);
            this._output = "";
        } },
        graphicsPen(num) { this.debug("graphicsPen:", num); },
        ink(num, col) { this.debug("ink:", num, col); },
        async inkey$() { return Promise.resolve(""); },
        async input(msg) { console.log(msg); return ""; },
        mode(num) { this.debug("mode:", num); },
        origin(x, y) { this.debug("origin:", x, y); },
        paper(num) { this.debug("paper:", num); },
        pen(num) { this.debug("pen:", num); },
        print(...args) { this._output += args.join(''); },
        rsx(cmd, args) { this._output += cmd + "," + args.join(''); return Promise.resolve([]); },
        tag(active) { this.debug("tag:", active); },
        xpos() { this.debug("xpos:"); return 0; },
        ypos() { this.debug("ypos:"); return 0; },
        getEscape() { return false; },
        getTimerMap() { return {}; }
    };
    function isUrl(s) {
        return s.startsWith("http"); // http or https
    }
    class NodeParts {
        constructor() {
            this.modulePath = "";
            this.keyBuffer = []; // buffered pressed keys
            this.escape = false;
        }
        nodeGetAbsolutePath(name) {
            if (!this.nodePath) {
                this.nodePath = require("path");
            }
            const path = this.nodePath;
            // https://stackoverflow.com/questions/8817423/why-is-dirname-not-defined-in-node-repl
            const dirname = __dirname || path.dirname(__filename);
            const absolutePath = path.resolve(dirname, name);
            return absolutePath;
        }
        async nodeReadFile(name) {
            if (!this.nodeFs) {
                this.nodeFs = require("fs");
            }
            if (!module) { //TTT
                const module = require("module");
                this.modulePath = module.path || "";
                if (!this.modulePath) {
                    console.warn("nodeReadFile: Cannot determine module path");
                }
            }
            try {
                return await this.nodeFs.promises.readFile(name, "utf8");
            }
            catch (error) {
                console.error(`Error reading file ${name}:`, String(error));
                throw error;
            }
        }
        async nodeReadUrl(url) {
            if (!this.nodeHttps) {
                this.nodeHttps = require("https");
            }
            const nodeHttps = this.nodeHttps;
            return new Promise((resolve, reject) => {
                nodeHttps.get(url, (resp) => {
                    let data = "";
                    resp.on("data", (chunk) => {
                        data += chunk;
                    });
                    resp.on("end", () => {
                        resolve(data);
                    });
                }).on("error", (err) => {
                    console.error("Error: " + err.message);
                    reject(err);
                });
            });
        }
        loadScript(fileOrUrl) {
            if (isUrl(fileOrUrl)) {
                return this.nodeReadUrl(fileOrUrl);
            }
            else {
                return this.nodeReadFile(fileOrUrl);
            }
        }
        ;
        keepRunning(fn, timeout) {
            const timerId = setTimeout(() => { }, timeout);
            return (async () => {
                fn();
                clearTimeout(timerId);
            })();
        }
        putScriptInFrame(script) {
            const dummyFunctions = Object.values(dummyVm).filter((value) => value).map((value) => `${value}`).join(",\n  ");
            const result = `(function(_o) {
    ${script}
    _o.flush();
})({
    _output: "",
    ${dummyFunctions}
});`;
            return result;
        }
        nodeCheckSyntax(script) {
            if (!this.nodeVm) {
                this.nodeVm = require("vm");
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
                const scriptInFrame = this.putScriptInFrame(script);
                this.nodeVm.runInNewContext(`throw new Error();\n${scriptInFrame}`);
            }
            catch (err) { // Error-like object
                const stack = err.stack;
                if (stack) {
                    output = describeError(stack);
                }
            }
            return output;
        }
        putKeyInBuffer(key) {
            this.keyBuffer.push(key);
        }
        fnOnKeypress(_chunk, key) {
            if (key) {
                const keySequenceCode = key.sequence.charCodeAt(0);
                if (key.name === 'c' && key.ctrl === true) {
                    // key: '<char>' { sequence: '\x03', name: 'c', ctrl: true, meta: false, shift: false }
                    process.exit();
                }
                else if (key.name === "escape") {
                    this.escape = true;
                }
                else if (keySequenceCode === 0x0d || (keySequenceCode >= 32 && keySequenceCode <= 128)) {
                    this.putKeyInBuffer(key.sequence);
                }
            }
        }
        initKeyboardInput() {
            this.nodeReadline = require('readline');
            if (process.stdin.isTTY) {
                this.nodeReadline.emitKeypressEvents(process.stdin);
                process.stdin.setRawMode(true);
                this.fnOnKeyPressHandler = this.fnOnKeypress.bind(this);
                process.stdin.on('keypress', this.fnOnKeyPressHandler);
            }
            else {
                console.warn("initKeyboardInput: not a TTY", process.stdin);
            }
        }
        getKeyFromBuffer() {
            if (!this.nodeReadline) {
                this.initKeyboardInput();
            }
            const key = this.keyBuffer.length ? this.keyBuffer.shift() : "";
            return key;
        }
        getEscape() {
            return this.escape;
        }
        start(core, vm, input) {
            const actionConfig = core.getConfigMap().action;
            if (input !== "") {
                core.setOnCheckSyntax((s) => Promise.resolve(this.nodeCheckSyntax(s)));
                const compiledScript = actionConfig.includes("compile") ? core.compileScript(input) : input;
                if (compiledScript.startsWith("ERROR:")) {
                    console.error(compiledScript);
                    return;
                }
                if (actionConfig.includes("run")) {
                    return this.keepRunning(async () => {
                        const output = await core.executeScript(compiledScript, vm);
                        console.log(output.replace(/\n$/, ""));
                        if (this.fnOnKeyPressHandler) {
                            process.stdin.off('keypress', this.fnOnKeyPressHandler);
                            process.stdin.setRawMode(false);
                            process.exit(0); // hmm, not so nice
                        }
                    }, 5000);
                }
                else {
                    const inFrame = this.putScriptInFrame(compiledScript);
                    console.log(inFrame);
                }
            }
            else {
                console.log("No input");
                console.log(NodeParts.getHelpString());
            }
        }
        async getExampleMap(databaseItem, core) {
            if (databaseItem.exampleMap) {
                return databaseItem.exampleMap;
            }
            databaseItem.exampleMap = {};
            const scriptName = databaseItem.source + "/0index.js";
            try {
                const jsFile = await this.loadScript(scriptName);
                const fnScript = new Function("cpcBasic", jsFile);
                fnScript({
                    addIndex: core.addIndex
                });
            }
            catch (error) {
                console.error("Load Example Map ", scriptName, error);
            }
            return databaseItem.exampleMap;
        }
        async getExampleScript(example, core) {
            if (example.script !== undefined) {
                return example.script;
            }
            const database = core.getDatabase();
            const scriptName = database.source + "/" + example.key + ".js";
            try {
                const jsFile = await this.loadScript(scriptName);
                const fnScript = new Function("cpcBasic", jsFile);
                fnScript({
                    addItem: (key, input) => {
                        if (!key) { // maybe ""
                            key = example.key;
                        }
                        core.addItem(key, input);
                    }
                });
            }
            catch (error) {
                console.error("Load Example", scriptName, error);
            }
            return example.script || ""; //TTT
        }
        async nodeMain(core) {
            const vm = new BasicVmNode(this);
            const config = core.getConfigMap();
            core.parseArgs(global.process.argv.slice(2), config);
            if (config.input) {
                return this.keepRunning(async () => {
                    this.start(core, vm, config.input);
                }, 5000);
            }
            if (config.fileName) {
                return this.keepRunning(async () => {
                    const inputFromFile = await this.nodeReadFile(config.fileName);
                    this.start(core, vm, inputFromFile);
                }, 5000);
            }
            if (config.example) {
                const databaseMap = core.initDatabaseMap();
                const database = config.database;
                const databaseItem = databaseMap[database];
                if (!databaseItem) {
                    console.error(`Error: Database ${database} not found in ${config.databaseDirs}`);
                    return;
                }
                return this.keepRunning(async () => {
                    if (!isUrl(databaseItem.source)) {
                        databaseItem.source = this.nodeGetAbsolutePath(databaseItem.source);
                    }
                    await this.getExampleMap(databaseItem, core);
                    const exampleName = config.example;
                    const example = core.getExample(exampleName);
                    const script = await this.getExampleScript(example, core);
                    this.start(core, vm, script);
                }, 5000);
            }
        }
        static getHelpString() {
            return `
Usage:
node dist/locobasic.js [<option=<value(s)>] [<option=<value(s)>]

- Options:
action=compile,run
databaseDirs=examples,...
database=examples
debounceCompile=800
debounceExecute=400
debug=0
example=euler
fileName=<file>
grammar=<name>
input=<statements>

- Examples for compile and run:
node dist/locobasic.js input='PRINT "Hello!"'
npx ts-node dist/locobasic.js input='PRINT "Hello!"'
node dist/locobasic.js input='?3 + 5 * (2 - 8)' example=''
node dist/locobasic.js example=euler
node dist/locobasic.js example=binary database=rosetta databaseDirs=examples,https://benchmarko.github.io/CPCBasicApps/rosetta
node dist/locobasic.js fileName=dist/examples/example.bas
node dist/locobasic.js grammar='strict' input='a$="Bob":PRINT "Hello ";a$;"!"'

- Example for compile only:
node dist/locobasic.js action='compile' input='PRINT "Hello!"' > hello1.js
[Windows: Use node.exe when redirecting into a file; or npx ts-node ...]
node hello1.js
[When using async functions like FRAME or INPUT, redirect to hello1.mjs]
`;
        }
    }

    class BasicVmBrowser {
        constructor(ui) {
            this.ui = ui;
            const cpcColors = BasicVmCore.getCpcColors();
            const penColors = cpcColors.map((color) => ui.getColor(color, false));
            const paperColors = cpcColors.map((color) => ui.getColor(color, true));
            this.vmCore = new BasicVmCore(penColors, paperColors);
            this.vmCore.setOnSpeak(this.fnOnSpeak.bind(this));
        }
        cls() {
            this.vmCore.cls();
            this.ui.setOutputText("");
        }
        drawMovePlot(type, x, y) {
            this.vmCore.drawMovePlot(type, x, y);
        }
        fnOnPrint(msg) {
            this.ui.addOutputText(msg);
        }
        flush() {
            const textOutput = this.vmCore.flushText();
            if (textOutput) {
                this.fnOnPrint(textOutput);
            }
            const graphicsOutput = this.vmCore.flushGraphics();
            if (graphicsOutput) {
                this.fnOnPrint(graphicsOutput);
            }
        }
        graphicsPen(num) {
            this.vmCore.graphicsPen(num);
        }
        ink(num, col) {
            this.vmCore.ink(num, col);
        }
        inkey$() {
            const key = this.ui.getKeyFromBuffer();
            return Promise.resolve(key);
        }
        /**
         * Prompts the user with a message and returns the input.
         * @param msg - The message to prompt.
         * @returns A promise that resolves to the user input or null if canceled.
         */
        async fnOnInput(msg) {
            const input = this.ui.prompt(msg);
            return Promise.resolve(input);
        }
        input(msg) {
            this.flush();
            return this.fnOnInput(msg);
        }
        mode(num) {
            this.vmCore.mode(num);
        }
        origin(x, y) {
            this.vmCore.origin(x, y);
        }
        paper(n) {
            this.vmCore.paper(n);
        }
        pen(n) {
            this.vmCore.pen(n);
        }
        print(...args) {
            this.vmCore.print(...args);
        }
        async fnOnSpeak(text, pitch) {
            return this.ui.speak(text, pitch);
        }
        async rsx(cmd, args) {
            return this.vmCore.rsx(cmd, args);
        }
        tag(active) {
            this.vmCore.tag(active);
        }
        xpos() {
            return this.vmCore.xpos();
        }
        ypos() {
            return this.vmCore.ypos();
        }
        getEscape() {
            return this.ui.getEscape();
        }
        getTimerMap() {
            return this.vmCore.getTimerMap();
        }
        getOutput() {
            return this.vmCore.getOutput();
        }
        setOutput(str) {
            this.vmCore.setOutput(str);
        }
    }

    const core = new Core({
        action: "compile,run",
        autoCompile: true,
        autoExecute: true,
        databaseDirs: "examples", // example base directories (comma separated)
        database: "examples", // examples, apps, saved
        debounceCompile: 800,
        debounceExecute: 400,
        debug: 0,
        example: "locobas",
        fileName: "",
        grammar: "basic", // basic or strict
        input: "",
        showBasic: true,
        showCompiled: false,
        showOutput: true
    });
    if (typeof window !== "undefined") {
        window.onload = () => {
            const UI = window.locobasicUI.UI; // we expect that it is already loaded in the HTML page
            const ui = new UI();
            window.cpcBasic = {
                addIndex: core.addIndex,
                addItem: (key, input) => {
                    if (!key) { // maybe ""
                        key = ui.getCurrentDataKey();
                    }
                    core.addItem(key, input);
                }
            };
            ui.onWindowLoadContinue(core, new BasicVmBrowser(ui));
        };
    }
    else { // node.js
        new NodeParts().nodeMain(core);
    }

}));
//# sourceMappingURL=locobasic.js.map
