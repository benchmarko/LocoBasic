(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('ohm-js')) :
    typeof define === 'function' && define.amd ? define(['ohm-js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ohm));
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
      = Label? Statements ":"* Comment? (eol | end)

    Label
      = label

    Statements
      = ":"* Statement (":"+ Statement)*

    Statement
      = Comment
      | After
      | Auto
      | Border
      | Call
      | Cat
      | Chain
      | Clear
      | Clg
      | Closein
      | Closeout
      | Cls
      | Cont
      | Cursor
      | Data
      | Def
      | Defint
      | Defreal
      | Defstr
      | Deg
      | Delete
      | Di
      | Dim
      | Draw
      | Drawr
      | Edit
      | Ei
      | End
      | Ent
      | Env
      | Erase
      | Error
      | Every
      | Fill
      | ForNextBlock
      | Frame
      | Gosub
      | Goto
      | GraphicsPaper
      | GraphicsPen
      | If
      | Ink
      | Input
      | Key
      | Let
      | LineInput
      | List
      | Load
      | Locate
      | Mask
      | Memory
      | Merge
      | MidSAssign
      | Mode
      | Move
      | Mover
      | New
      | On
      | Openin
      | Openout
      | Origin
      | Out
      | Paper
      | Pen
      | Plot
      | Plotr
      | Poke
      | Print
      | Rad
      | Randomize
      | Read
      | Release
      | Rem
      | Renum
      | Restore
      | Resume
      | Return
      | Rsx
      | Run
      | Save
      | Sound
      | Speed
      | Stop
      | Symbol
      | Tag
      | Tagoff
      | Troff
      | Tron
      | Wait
      | WhileWendBlock
      | Width
      | Window
      | Write
      | Zone
      | ArrayAssign
      | Assign

    ArrayAssign
      = ArrayIdent "=" NumExp
      | StrArrayIdent "=" StrExp

    LoopBlockContent
      = LoopBlockSeparator? Statements

    LoopBlockSeparator
      = ":"+ -- colon
      | Comment? eol Label? -- newline

    Abs
      = abs "(" NumExp ")"

    AddressOf
      = "@" AnyIdent

    After
      = after NumExp ("," NumExp)? gosub label

    Asc
      = asc "(" StrExp ")"

    Atn
      = atn "(" NumExp ")"

    Assign
      = PlainIdent "=" NumExp
      | StrPlainIdent "=" StrExp

    Auto
      = auto label? ("," digit+)?

    BinS
      = binS "(" NumExp ("," NumExp)? ")"

    Border
      = border NumExp ("," NumExp)?

    Call
      = call NonemptyListOf<NumExp, ",">

    Cat
      = cat

    Chain
      = chain merge? StrExp ("," NumExp)? ("," Delete)?

    ChrS
      = chrS "(" NumExp ")"

    Cint
      = cint "(" NumExp ")"

    Clear
      = clear input -- input
      | clear -- clear

    Clg
      = clg NumExp?

    Closein
      = closein

    Closeout
      = closeout

    Cls
      = cls StreamArg?

    Comment
      = "\\'" partToEol

    Cont
      = cont

		CopychrS
      = copychrS "(" StreamArg ")"

    Cos
      = cos "(" NumExp ")"

    Creal
      = creal "(" NumExp ")"

    Cursor
      = cursor NumExp ("," NumExp)?

    DataUnquoted
      = binaryValue
      | hexValue
      | dataUnquoted

    DataItem
      = string
      | DataUnquoted

    Data
      = data NonemptyListOf<DataItem, ",">

    DecS
      = decS "(" NumExp "," StrExp ")"

    Def
      = def fn DefAssign

    DefArgs
      = "(" ListOf<SimpleIdent, ","> ")"

    DefAssign
      = PlainIdent DefArgs? "=" NumExp
      | StrPlainIdent DefArgs? "=" StrExp

    LabelRange
      = label ("-" label)?

    LetterRange
      = letter ("-" letter)?

    Defint
      = defint NonemptyListOf<LetterRange, ",">

    Defreal
      = defreal NonemptyListOf<LetterRange, ",">

    Defstr
      = defstr NonemptyListOf<LetterRange, ",">

    Deg
      = deg

    Delete
      = delete LabelRange?

    Derr
      = derr

    Di
      = di

    Dim
      = dim NonemptyListOf<DimArrayIdent, ",">

    Draw
      = draw NumExp "," NumExp ("," NumExp)? ("," NumExp)?

    Drawr
      = drawr NumExp "," NumExp ("," NumExp)? ("," NumExp)?

    Edit
      = edit label

    Ei
      = ei

    Else
      = else

    End
      = endLit

    Ent
      = ent ListOf<NumExp, ",">

    Env
      = env ListOf<NumExp, ",">

    Eof
      = eof

    Erase
      = erase NonemptyListOf<EraseIdent, ",">

    Erl
      = erl

    Err
      = err

    Error
      = error NumExp

    Every
      = every NumExp ("," NumExp)? gosub label

    Exp
      = exp "(" NumExp ")"

    Fill
      = fill NumExp

    Fix
      = fix "(" NumExp ")"

    For
      = for PlainIdent "=" NumExp to NumExp (step NumExp)?

    ForNextBlock
      = For LoopBlockContent* LoopBlockSeparator Next

    Frame
      = frame

    Fre
      = fre "(" (StrExp | NumExp) ")"

    Gosub
      = gosub label

    Goto
      = goto label

    GraphicsPaper
      = graphics paper NumExp

    GraphicsPen
      = graphics pen NumExp ("," NumExp)?

    HexS
      = hexS "(" NumExp ("," NumExp)? ")"

    Himem
      = himem

    Ink
      = ink NumExp "," NumExp ("," NumExp)?

    Inkey
      = inkey "(" NumExp ")"

    InkeyS
      = inkeyS

    Inp
      = inp "(" NumExp ")"

    Input
      = input (StreamArg ",")? ";"? (string (";" | ","))? NonemptyListOf<AnyIdent, ",">

    Instr
      = instr "(" StrExp "," StrExp ")" -- noLen
      | instr "(" NumExp "," StrExp "," StrExp ")" -- len

    Int
      = int "(" NumExp ")"

    Joy
      = joy "(" NumExp ")"

    Key 
      = key NumExp "," StrExp -- key
      | key def NumExp "," NumExp ("," ListOf<NumExp, ",">)? -- def

    LeftS
      = leftS "(" StrExp "," NumExp ")"

    Len
      = len "(" StrExp ")"

    Let
      = let (ArrayAssign | Assign)

    LineInput
      = line input (StreamArg ",")? (string (";" | ","))? (StrArrayIdent | StrPlainIdent)

    List
      = list LabelRange? ("," StreamArg)?

    Load
      = load StrExp ("," NumExp)?

    Locate
      = locate (StreamArg ",")? NumExp ("," NumExp)?

    Log
      = log "(" NumExp ")"

    Log10
      = log10 "(" NumExp ")"

    LowerS
      = lowerS "(" StrExp ")"

    Mask
      = mask NumExp ("," NumExp)? ("," NumExp)?

    Max
      = max "(" NonemptyListOf<NumExp, ","> ")"

    Memory
      = memory NumExp

    Merge
      = merge StrExp

    MidS
      = midS "(" StrExp "," NumExp ("," NumExp)? ")"

    MidSAssign
      = midS "(" (StrArrayIdent | StrPlainIdent) "," NumExp ("," NumExp)? ")" "=" StrExp

    Min
      = min "(" NonemptyListOf<NumExp, ","> ")"

    Mode
      = mode NumExp

    Move
      = move NumExp "," NumExp ("," NumExp)? ("," NumExp)?

    Mover
      = mover NumExp "," NumExp ("," NumExp)? ("," NumExp)?

    New
      = new

    Next 
      = next PlainIdent?

    On
      = on NumExp gosub NonemptyListOf<label, ","> -- numGosub
      | on NumExp goto NonemptyListOf<label, ","> -- numGoto
      | on break cont -- breakCont
      | on break gosub label -- breakGosub
      | on break stop -- breakStop
      | on error goto label -- errorGoto

    Openin
      = openin StrExp

    Openout
      = openout StrExp

    Origin
      = origin NumExp "," NumExp ("," NumExp)*

    Out
      = out NumExp "," NumExp

    Paper
      = paper (StreamArg ",")? NumExp

    Peek
      = peek "(" NumExp ")"

    Pen
      = pen (StreamArg ",")? NumExp ("," NumExp)?

    Pi
      = pi

    Plot
      = plot NumExp "," NumExp ("," NumExp)? ("," NumExp)?

    Plotr
      = plotr NumExp "," NumExp ("," NumExp)? ("," NumExp)?

    Poke
      = poke NumExp "," NumExp

    Pos
      = pos "(" "#" NumExp ")"

    PrintCommaOp
      = ","

    PrintArg
      = &StrCmpExp NumExp -- strCmp
      | StrExp
      | NumExp
      | using StrExp ";" NonemptyListOf<NumExp, ";"> -- usingNum
      | Spc
      | Tab
      | PrintCommaOp -- commaOp

    StreamArg
      = "#" NumExp

    PrintSep
      = ";" | ""

    Print
      = (print | "?") (StreamArg ("," | &":" | &Comment | &else | &end | &eol))? ListOf<PrintArg, PrintSep> (";")?

    Rad
      = rad

    Randomize
      = randomize NumExp?

    Read
      = read NonemptyListOf<AnyIdent, ",">

    Release
      = release NumExp

    Rem
      = rem partToEol

    Renum
      = renum label? ("," label)? ("," number)?

    Remain
      = remain "(" NumExp ")"

    Restore
      = restore label?

    Resume
      = resume (label | next)?

    Return
      = return

    RightS
      = rightS "(" StrExp "," NumExp ")"

    Rnd
      = rnd ("(" NumExp ")")?

    Round
      = round "(" NumExp ("," NumExp)? ")"

    Rsx
      = "|" #rsxIdentName RsxArgs?

    RsxAddressOf
      = "@" AnyIdent

    RsxArg = RsxAddressOf | AnyFnArg

    RsxArgs
      = "," NonemptyListOf<RsxArg, ",">

    Run
      = run (StrExp | label)?

    Save
      = save StrExp ("," letter)? ("," NumExp)? ("," NumExp)? ("," NumExp)?

    Sgn
      = sgn "(" NumExp ")"

    Sin
      = sin "(" NumExp ")"

    Sound
      = sound NumExp "," NumExp ("," NumExp?)*

    SpaceS
      = spaceS "(" NumExp ")"

    Spc
      = spc "(" NumExp ")"

    Speed
      = speed ink NumExp "," NumExp -- ink
      | speed key NumExp "," NumExp -- key
      | speed write NumExp -- write

    Sq
      = sq "(" NumExp ")"

    Sqr
      = sqr "(" NumExp ")"

    Stop
      = stop

    StrS
      = strS "(" NumExp ")"

    StringS
      = stringS "(" NumExp "," StrExp ")" -- str
      | stringS "(" NumExp "," NumExp ")" -- num

    Symbol
      = symbol NonemptyListOf<NumExp, ","> -- def // simplified
      | symbol after NumExp -- after

    Tab
       = tab "(" NumExp ")"

    Tag
      = tag StreamArg?

    Tagoff
      = tagoff StreamArg?

    Tan
      = tan "(" NumExp ")"

    Test
      = test "(" NumExp "," NumExp ")"

    Testr
      = testr "(" NumExp "," NumExp ")"

    Time
      = time

    Troff
      = troff

    Tron
      = tron

    Unt
      = unt "(" NumExp ")"

    UpperS
      = upperS "(" StrExp ")"

    Val
      = val "(" StrExp ")"

    Vpos
      = vpos "(" "#" NumExp ")"

    Wait
      = wait NumExp "," NumExp ("," NumExp)?

    Wend
      = wend

    While
      = while CondExp

    WhileWendBlock
      = While LoopBlockContent* LoopBlockSeparator Wend

    Width
      = width NumExp

    Window
      = window (StreamArg ",")? NumExp "," NumExp "," NumExp "," NumExp -- def
      | window swap NumExp ("," NumExp)? -- swap

    WriteArg
      = StrExp
      | NumExp

    Write
      = write (StreamArg ",")? ListOf<WriteArg, (";" | ",")>

    Xpos
      = xpos

    Ypos
      = ypos

    Zone
      = zone NumExp

    IfExp
      = Statements
      | label -- label

    IfThen
      = then IfExp -- then
      | Goto

    If
      = if CondExp IfThen (":"* else IfExp)?

    StrExp
      = StrAddExp

    StrAddExp
      = StrAddExp "+" StrPriExp  -- plus
      | StrPriExp

    StrPriExp
      = "(" StrExp ")"  -- paren
      | BinS
      | ChrS
      | CopychrS
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
      | StrPlainIdent
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
      | PlainIdent
      | number
      | Abs
      | AddressOf
      | Asc
      | Atn
      | Cint
      | Cos
      | Creal
      | Derr
      | Eof
      | Erl
      | Err
      | Exp
      | Fix
      | Fre
      | Himem
      | Inkey
      | Inp
      | Instr
      | Int
      | Joy
      | Len
      | Log
      | Log10
      | Max
      | Min
      | Peek
      | Pi
      | Pos
      | Remain
      | Rnd
      | Round
      | Sgn
      | Sin
      | Sq
      | Sqr
      | Tan
      | Test
      | Testr
      | Time
      | Unt
      | Val
      | Vpos
      | Xpos
      | Ypos

    CondExp
      = NumExp

    PlainIdent
      = ident

    StrPlainIdent
      = strIdent

    ArrayArgs
      = NonemptyListOf<NumExp, ",">

    ArrayIdent
      = ident "(" ArrayArgs ")"
      | ident "[" ArrayArgs "]"

    StrArrayIdent
      = strIdent "(" ArrayArgs ")"
      | strIdent "[" ArrayArgs "]"

    DimArrayArgs
      = NonemptyListOf<NumExp, ",">

    DimArrayIdent
      = ident "(" DimArrayArgs ")"
      | strIdent "(" DimArrayArgs ")"
      | ident "[" DimArrayArgs "]"
      | strIdent "[" DimArrayArgs "]"

    EraseIdent
     = strIdent
     | ident

    SimpleIdent
      = StrPlainIdent
      | PlainIdent

    AnyIdent
      = StrArrayIdent
      | ArrayIdent
      | StrPlainIdent
      | PlainIdent

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
      = ("fn" | "FN")
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
      = ~keyword identName ("%" | "!")?

    fnIdent
      = fn space* ~keyword identName ("%" | "!")?

    rsxIdentName = letter identPart*

    identName = identStart identPart*

    identStart = letter

    identPart = alnum | "."

    strIdent
      = ~keyword identName "$"

    strFnIdent
      = fn space* ~keyword identName "$"

    binaryDigit = "0".."1"

    dataUnquoted = (~(eol | "," | ":" | "'") any)*

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

    stringDelimiter = "\\""

    string
      = stringDelimiter (~(stringDelimiter | eol | end) any)* (stringDelimiter | &eol | &end)

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
      := "FN"
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

    rsxIdentName := upper (upper | digit | ".")*
}
  `
    };

    class SemanticsHelper {
        constructor() {
            this.lineIndex = 0;
            this.indent = 0;
            this.compileMessages = [];
            this.variables = {};
            this.variableScopes = {};
            this.varLetterTypes = {};
            this.currentFunction = "";
            this.definedLabels = [];
            this.usedLabels = {};
            this.dataList = [];
            this.dataIndex = 0;
            this.restoreMap = {};
            this.instrMap = {};
            this.isDeg = false;
            this.isTag = false;
            this.defContextStatus = ""; // collect | use | ""
            this.defContextVars = [];
        }
        addCompileMessage(message) {
            this.compileMessages.push(message);
        }
        getCompileMessages() {
            return this.compileMessages;
        }
        getDeg() {
            return this.isDeg;
        }
        setDeg(isDeg) {
            this.isDeg = isDeg;
        }
        getTag() {
            return this.isTag;
        }
        setTag(isTag) {
            this.isTag = isTag;
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
        createVariableOrCount(name, type) {
            if (!this.variables[name]) {
                this.variables[name] = {
                    count: 1,
                    type
                };
            }
            else {
                this.variables[name].count += 1;
                if (type !== this.variables[name].type) {
                    console.warn(`Var type changed for '${name}': ${this.variables[name].type} => ${type}`);
                    this.addCompileMessage(`WARNING: Variable has plain and array type: ${name}`);
                    this.variables[name].type = type;
                }
            }
            if (!this.variableScopes[name]) {
                this.variableScopes[name] = {};
            }
            const variableScope = this.variableScopes[name];
            variableScope[this.currentFunction] = (variableScope[this.currentFunction] || 0) + 1;
        }
        getVariable(name, type = "") {
            name = name.toLowerCase();
            const matches = name.match(/\/\* not supported: [%|!] \*\//);
            if (matches) {
                name = name.substring(0, matches.index);
            }
            if (SemanticsHelper.reJsKeyword.test(name)) {
                name = `_${name}`;
            }
            const defContextStatus = this.defContextStatus;
            if (defContextStatus === "") { // not in defContext?
                this.createVariableOrCount(name, type);
            }
            else if (defContextStatus === "collect") {
                this.defContextVars.push(name);
            }
            else if (defContextStatus === "use") {
                if (!this.defContextVars.includes(name)) { // variable not bound to DEF FN?
                    this.createVariableOrCount(name, type);
                }
            }
            return name + (matches ? matches[0] : "");
        }
        getVariableEntry(name) {
            return this.variables[name];
        }
        getVariableScopes() {
            return this.variableScopes;
        }
        setCurrentFunction(label) {
            this.currentFunction = label;
        }
        setDefContextStatus(status) {
            this.defContextStatus = status;
            if (status === "collect" || status === "") {
                this.defContextVars.length = 0;
            }
        }
        setVarLetterTypes(letters, type) {
            for (const letter of letters) {
                this.varLetterTypes[letter] = type;
            }
        }
        getVarLetterType(name) {
            const letter = name.charAt(0);
            return this.varLetterTypes[letter] || "";
        }
        static deleteAllItems(items) {
            for (const name in items) {
                delete items[name]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
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
            this.compileMessages.length = 0;
            SemanticsHelper.deleteAllItems(this.variables);
            SemanticsHelper.deleteAllItems(this.variableScopes);
            SemanticsHelper.deleteAllItems(this.varLetterTypes);
            this.currentFunction = "";
            this.definedLabels.length = 0;
            SemanticsHelper.deleteAllItems(this.usedLabels);
            this.dataList.length = 0;
            this.dataIndex = 0;
            SemanticsHelper.deleteAllItems(this.restoreMap);
            SemanticsHelper.deleteAllItems(this.instrMap);
            this.isDeg = false;
            this.isTag = false;
            this.defContextStatus = "";
            this.defContextVars.length = 0;
        }
    }
    SemanticsHelper.reJsKeyword = /^(arguments|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/;

    const CommaOpChar = "\u2192"; // Unicode arrow right
    const TabOpChar = "\u21d2"; // Unicode double arrow right
    const basicErrors = [
        "Improper argument", // 0
        "Unexpected NEXT", // 1
        "Syntax Error", // 2
        "Unexpected RETURN", // 3
        "DATA exhausted", // 4
        "Improper argument", // 5
        "Overflow", // 6
        "Memory full", // 7
        "Line does not exist", // 8
        "Subscript out of range", // 9
        "Array already dimensioned", // 10
        "Division by zero", // 11
        "Invalid direct command", // 12
        "Type mismatch", // 13
        "String space full", // 14
        "String too long", // 15
        "String expression too complex", // 16
        "Cannot CONTinue", // 17
        "Unknown user function", // 18
        "RESUME missing", // 19
        "Unexpected RESUME", // 20
        "Direct command found", // 21
        "Operand missing", // 22
        "Line too long", // 23
        "EOF met", // 24
        "File type error", // 25
        "NEXT missing", // 26
        "File already open", // 27
        "Unknown command", // 28
        "WEND missing", // 29
        "Unexpected WEND", // 30
        "File not open", // 31,
        "Broken", // 32 "Broken in" (derr=146: xxx not found)
        "Unknown error" // 33...
    ];

    function evalChildren(children) {
        return children.map(child => child.eval());
    }
    function evalOptionalArg(arg) {
        var _a;
        const argEval = (_a = arg.child(0)) === null || _a === void 0 ? void 0 : _a.eval();
        return argEval !== undefined ? `, ${argEval}` : "";
    }
    function createComparisonExpression(a, op, b) {
        return `-(${a.eval()} ${op} ${b.eval()})`;
    }
    function expandLetterRanges(lettersAndRanges) {
        // a list of single letters "a" or range "a-b", expand to single letters
        const letters = lettersAndRanges.flatMap(x => x.length === 1
            ? x
            : Array.from({ length: x.charCodeAt(2) - x.charCodeAt(0) + 1 }, (_, i) => String.fromCharCode(x.charCodeAt(0) + i)));
        return letters;
    }
    function getSemanticsActions(semanticsHelper) {
        const adaptIdentName = (str) => str.replace(/\./g, "_");
        const drawMovePlot = (lit, x, _comma1, y, _comma2, pen, _comma3, mode) => {
            const command = lit.sourceString.toLowerCase();
            semanticsHelper.addInstr(command);
            const modeStr = mode.child(0) ? notSupported(mode.child(0)) : "";
            return `${command}(${x.eval()}, ${y.eval()}${evalOptionalArg(pen)}${modeStr})`;
        };
        const cosSinTan = (lit, _open, num, _close) => {
            const func = lit.sourceString.toLowerCase();
            semanticsHelper.addInstr(func);
            if (!semanticsHelper.getDeg()) {
                return `${func}(${num.eval()})`;
            }
            semanticsHelper.addInstr("toRad");
            return `${func}(toRad(${num.eval()}))`;
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
        const uncommentNotSupported = (str) => {
            const regExpNotSupp = new RegExp("/\\* not supported: (.*) \\*/");
            if (regExpNotSupp.test(str)) {
                return str.replace(regExpNotSupp, "$1");
            }
            return str;
        };
        const evalAnyFn = (arg) => {
            if (arg.isIteration()) {
                return arg.children.map(evalAnyFn).join(",");
            }
            else if (arg.isLexical() || arg.isTerminal()) {
                return arg.sourceString;
            }
            const argStr = arg.eval();
            return uncommentNotSupported(argStr);
        };
        const notSupported = (str, ...args) => {
            const name = evalAnyFn(str);
            const argList = args.map(evalAnyFn);
            const argStr = argList.length ? ` ${argList.join(" ")}` : "";
            const message = str.source.getLineAndColumnMessage();
            semanticsHelper.addCompileMessage(`WARNING: Not supported: ${message}`);
            return `/* not supported: ${name}${uncommentNotSupported(argStr)} */`;
        };
        function processSubroutines(lineList, definedLabels, variableList, variableScopes) {
            const usedLabels = semanticsHelper.getUsedLabels();
            const gosubLabels = usedLabels["gosub"] || {};
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
                    // determine which variables are local to this function only
                    const funcVars = [];
                    for (const varName of variableList) {
                        const usage = variableScopes[varName];
                        if (usage[subroutineStart.label] && Object.keys(usage).length === 1) {
                            funcVars.push(varName);
                        }
                    }
                    let hasAwait = false;
                    for (let i = first; i <= label.last; i += 1) {
                        if (lineList[i].includes("await ")) {
                            hasAwait = true; // quick check
                        }
                        lineList[i] = "  " + lineList[i]; // indent
                        lineList[i] = lineList[i].replace(/\n/g, "\n  ");
                    }
                    const asyncStr = hasAwait ? "async " : "";
                    // Add function-local variable declarations if any
                    let funcVarDecl = "";
                    if (funcVars.length > 0) {
                        funcVarDecl = `\n${indentStr}  let ` + funcVars.map((v) => { var _a; return ((_a = semanticsHelper.getVariableEntry(v)) === null || _a === void 0 ? void 0 : _a.type) === "A" ? `${v} = []` : v.endsWith("$") ? `${v} = ""` : `${v} = 0`; }).join(", ") + ";";
                    }
                    lineList[first] = `${indentStr}${asyncStr}function _${subroutineStart.label}() {${funcVarDecl}${indentStr}\n` + lineList[first];
                    lineList[label.last] = lineList[label.last].replace(`${indentStr}  return;`, `${indentStr}}`); // end of subroutine: replace "return" by "}" (can also be on same line)
                    if (hasAwait) {
                        awaitLabels.push(subroutineStart.label);
                    }
                    subroutineStart = undefined;
                }
            }
            return awaitLabels;
        }
        const addSemicolon = (str) => {
            return str.endsWith("}") ? str : str + ";"; // add semicolon, but not for closing bracket
        };
        const stringCapitalize = (str) => {
            return str.charAt(0).toUpperCase() + str.substring(1);
        };
        const semantics = {
            Program(lines) {
                const lineList = evalChildren(lines.children);
                const variableList = semanticsHelper.getVariables();
                const variableScopes = semanticsHelper.getVariableScopes();
                // Create global variable declarations (excluding function-local ones)
                const globalVars = variableList.filter(varName => {
                    const usage = variableScopes[varName];
                    return usage[""] || Object.keys(usage).length !== 1;
                });
                const variableDeclarations = globalVars.length ? "let " + globalVars.map((v) => { var _a; return ((_a = semanticsHelper.getVariableEntry(v)) === null || _a === void 0 ? void 0 : _a.type) === "A" ? `${v} = []` : v.endsWith("$") ? `${v} = ""` : `${v} = 0`; }).join(", ") + ";" : "";
                const definedLabels = semanticsHelper.getDefinedLabels();
                const awaitLabels = processSubroutines(lineList, definedLabels, variableList, variableScopes);
                const instrMap = semanticsHelper.getInstrMap();
                const dataList = semanticsHelper.getDataList();
                // Prepare data definition snippet if needed
                let dataListSnippet = "";
                if (dataList.length) {
                    const restoreMap = semanticsHelper.getRestoreMap();
                    for (const label of definedLabels) {
                        if (restoreMap[label.label] === -1) {
                            restoreMap[label.label] = label.dataIndex;
                        }
                    }
                    for (const key of Object.keys(restoreMap)) {
                        if (restoreMap[key] < 0) {
                            restoreMap[key] = 0;
                        }
                    }
                    dataListSnippet = `
function _defineData() {
	_o._data = [
${dataList.join(",\n")}
	];
	_o._restoreMap = ${JSON.stringify(restoreMap)};
}
`;
                }
                const libraryFunctions = Object.keys(instrMap).sort();
                // Assemble code lines
                const codeLines = [
                    '"use strict";',
                    libraryFunctions ? `const {${libraryFunctions.join(", ")}} = _o;` : '',
                    dataList.length ? '_defineData();' : '',
                    variableDeclarations,
                    ...lineList.filter(line => line.trimEnd() !== ''),
                    dataListSnippet
                ].filter(Boolean);
                let lineStr = codeLines.join('\n');
                if (!lineStr.endsWith("\n")) {
                    lineStr += "\n";
                }
                if (awaitLabels.length) {
                    for (const label of awaitLabels) {
                        const regEx = new RegExp(`_${label}\\(\\);`, "g");
                        lineStr = lineStr.replace(regEx, `await _${label}();`);
                    }
                }
                return lineStr;
            },
            LabelRange(start, minus, end) {
                return [start, minus, end].map((node) => evalAnyFn(node)).join("");
            },
            LetterRange(start, minus, end) {
                return [start, minus, end].map((node) => evalAnyFn(node)).join("");
            },
            Line(label, stmts, colons2, comment, _eol) {
                const labelString = label.sourceString;
                const currentLineIndex = semanticsHelper.incrementLineIndex() - 1;
                if (labelString) {
                    semanticsHelper.addDefinedLabel(labelString, currentLineIndex);
                    // Check if this is a gosub label and set it as current function
                    const usedLabels = semanticsHelper.getUsedLabels();
                    const gosubLabels = usedLabels["gosub"] || {};
                    if (gosubLabels[labelString]) {
                        semanticsHelper.setCurrentFunction(labelString);
                    }
                }
                const lineStr = stmts.eval();
                if (colons2.children.length) { // are there trailing colons?
                    notSupported(colons2);
                }
                if (lineStr === "return") {
                    const definedLabels = semanticsHelper.getDefinedLabels();
                    if (definedLabels.length) {
                        const lastLabelItem = definedLabels[definedLabels.length - 1];
                        lastLabelItem.last = currentLineIndex;
                    }
                    // reset current function when returning
                    semanticsHelper.setCurrentFunction("");
                }
                const commentStr = comment.sourceString ? `; //${comment.sourceString.substring(1)}` : "";
                const semi = lineStr === "" || lineStr.endsWith("{") || lineStr.endsWith("}") || lineStr.startsWith("//") || commentStr ? "" : ";";
                const indentStr = semanticsHelper.getIndentStr();
                return indentStr + lineStr + commentStr + semi;
            },
            Statements(colons1, stmt, colons2, stmts) {
                var _a;
                if (colons1.children.length) { // are there leading colons?
                    notSupported(colons1);
                }
                // separate statements, use ";", if the last stmt does not end with "{"
                if (((_a = colons2.child(0)) === null || _a === void 0 ? void 0 : _a.children.length) > 1) { // are there additional colons between statements?
                    notSupported(colons2.child(0)); // ok, let's mark all
                }
                const statements = [stmt.eval(), ...evalChildren(stmts.children)];
                return statements.reduce((acc, current) => acc.endsWith("{") ? `${acc} ${current}` : `${acc}; ${current}`);
            },
            ArrayAssign(ident, _op, e) {
                return `${ident.eval()} = ${e.eval()}`;
            },
            Assign(ident, _op, e) {
                const variableName = ident.eval();
                const resolvedVariableName = semanticsHelper.getVariable(variableName);
                const value = e.eval();
                return `${resolvedVariableName} = ${value}`;
            },
            LoopBlockContent(separator, stmts) {
                var _a;
                const separatorStr = ((_a = separator === null || separator === void 0 ? void 0 : separator.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
                const lineStr = stmts.eval();
                return `${separatorStr}${lineStr}`;
            },
            LoopBlockSeparator_colon(colons) {
                if (colons.children.length > 1) { // are there additional colons between statements?
                    notSupported(colons); // ok, let's mark all
                }
                return "";
            },
            LoopBlockSeparator_newline(comment, eol, _label) {
                // labels in blocks are ignored
                const commentStr = comment.sourceString ? ` //${comment.sourceString.substring(1)}` : "";
                const eolStr = eol.sourceString + semanticsHelper.getIndentStr();
                return `${commentStr}${eolStr}`;
            },
            Abs(_absLit, _open, e, _close) {
                semanticsHelper.addInstr("abs");
                return `abs(${e.eval()})`; // or inline:`Math.abs(${e.eval()})`
            },
            AddressOf(op, ident) {
                return notSupported(op, ident) + "0";
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
            Asc(_ascLit, _open, str, _close) {
                semanticsHelper.addInstr("asc");
                return `asc(${str.eval()})`;
            },
            Atn(_atnLit, _open, num, _close) {
                semanticsHelper.addInstr("atn");
                if (!semanticsHelper.getDeg()) {
                    return `atn(${num.eval()})`;
                }
                semanticsHelper.addInstr("toDeg");
                return `toDeg(atn(${num.eval()}))`;
            },
            Auto(lit, label, comma, step) {
                return notSupported(lit, label, comma, step);
            },
            BinS(_binLit, _open, num, _comma, pad, _close) {
                semanticsHelper.addInstr("bin$");
                return `bin$(${num.eval()}${evalOptionalArg(pad)})`;
            },
            Border(lit, num, comma, num2) {
                return notSupported(lit, num, comma, num2);
            },
            Call(lit, args) {
                const num = Number(args.asIteration().child(0).eval()); // only works for constants
                let result = "";
                switch (num) {
                    case 0xbb06: // fall through...
                    case 0xbb18:
                        result = `while (await inkey$() === "") {}`;
                        semanticsHelper.addInstr("inkey$");
                        break;
                    case 0xbd19:
                        result = "frame()";
                        semanticsHelper.addInstr("frame");
                        break;
                }
                return notSupported(lit, args.asIteration()) + result;
            },
            Cat: notSupported,
            Chain(lit, merge, file, comma, num, comma2, del) {
                return notSupported(lit, merge, file, comma, num, comma2, del);
            },
            ChrS(_chrLit, _open, e, _close) {
                semanticsHelper.addInstr("chr$");
                return `chr$(${e.eval()})`;
            },
            Cint(_cintLit, _open, e, _close) {
                semanticsHelper.addInstr("cint");
                return `cint(${e.eval()})`;
            },
            Clear_clear: notSupported,
            Clear_input(_lit, _inputLit) {
                semanticsHelper.addInstr("clearInput");
                return "clearInput()";
            },
            Clg(lit, num) {
                return notSupported(lit, num);
            },
            Closein: notSupported,
            Closeout: notSupported,
            Cls(_clsLit, stream) {
                var _a;
                semanticsHelper.addInstr("cls");
                const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
                return `cls(${streamStr})`;
            },
            Comment(_commentLit, remain) {
                return `//${remain.sourceString}`;
            },
            Cont: notSupported,
            CopychrS(lit, open, stream, close) {
                return notSupported(lit, open, stream, close) + '" "';
            },
            Cos: cosSinTan,
            Creal(_lit, _open, num, _close) {
                semanticsHelper.addInstr("creal");
                return `creal(${num.eval()})`;
            },
            Cursor(lit, num, comma, num2) {
                return notSupported(lit, num, comma, num2);
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
                semanticsHelper.setDefContextStatus("start"); // do not create global variables in this context
                const name = ident.eval();
                semanticsHelper.setDefContextStatus("collect");
                const argStr = evalChildren(args.children).join(", ") || "()";
                semanticsHelper.setDefContextStatus("use");
                const defBody = e.eval();
                semanticsHelper.setDefContextStatus("");
                const fnIdent = semanticsHelper.getVariable(`fn${name}`);
                return `${fnIdent} = ${argStr} => ${defBody}`;
            },
            Defint(_lit, letterRange) {
                const lettersAndRanges = evalChildren(letterRange.asIteration().children); // a list of single letters "a" or range "a-b"
                const letters = expandLetterRanges(lettersAndRanges);
                semanticsHelper.setVarLetterTypes(letters, "I");
                return `/* defint ${lettersAndRanges.join(",")} */`;
            },
            Defreal(lit, letterRange) {
                return notSupported(lit, letterRange.asIteration());
            },
            Defstr(lit, letterRange) {
                return notSupported(lit, letterRange.asIteration());
            },
            Deg(_degLit) {
                semanticsHelper.setDeg(true);
                return `/* deg */`; // we assume to check it at compile time
            },
            Delete(lit, labelRange) {
                return notSupported(lit, labelRange);
            },
            Derr(lit) {
                return notSupported(lit) + "0";
            },
            Di: notSupported,
            Dim(_dimLit, dimArgs) {
                const argumentList = evalChildren(dimArgs.asIteration().children);
                return argumentList.join("; ");
            },
            Draw: drawMovePlot,
            Drawr: drawMovePlot,
            Edit(lit, label) {
                return notSupported(lit, label);
            },
            Ei: notSupported,
            End(_endLit) {
                semanticsHelper.addInstr("end");
                return `return end()`;
            },
            Ent(lit, nums) {
                return notSupported(lit, nums.asIteration());
            },
            Env(lit, nums) {
                return notSupported(lit, nums.asIteration());
            },
            Eof(lit) {
                return notSupported(lit) + "-1";
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
            Erl(lit) {
                return notSupported(lit) + "0";
            },
            Err(lit) {
                return notSupported(lit) + "0";
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
            Exp(_expLit, _open, num, _close) {
                semanticsHelper.addInstr("exp");
                return `exp(${num.eval()})`;
            },
            Fill(lit, num) {
                return notSupported(lit, num);
            },
            Fix(_fixLit, _open, num, _close) {
                semanticsHelper.addInstr("fix");
                return `fix(${num.eval()})`;
            },
            Fre(lit, open, e, close) {
                return notSupported(lit, open, e, close) + "0";
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
            Gosub(_gosubLit, label) {
                const labelString = label.sourceString;
                semanticsHelper.addUsedLabel(labelString, "gosub");
                return `_${labelString}()`;
            },
            Goto(lit, label) {
                const labelString = label.sourceString;
                semanticsHelper.addUsedLabel(labelString, "goto"); // set label so that we do not remove it
                return notSupported(lit, label);
            },
            GraphicsPaper(lit, paperLit, num) {
                return notSupported(lit, paperLit, num);
            },
            GraphicsPen(_graphicsLit, _penLit, num, _comma, mode) {
                semanticsHelper.addInstr("graphicsPen");
                const modeStr = mode.child(0) ? notSupported(mode.child(0)) : "";
                return `graphicsPen(${num.eval()}${modeStr})`;
            },
            HexS(_hexLit, _open, num, _comma, pad, _close) {
                semanticsHelper.addInstr("hex$");
                return `hex$(${num.eval()}${evalOptionalArg(pad)})`;
            },
            Himem(lit) {
                return notSupported(lit) + "0";
            },
            IfExp_label(label) {
                const labelString = label.sourceString;
                semanticsHelper.addUsedLabel(labelString, "goto"); // set label so that we do not remove it
                return notSupported(label);
            },
            IfThen_then(_thenLit, thenStat) {
                const thenStatement = thenStat.eval();
                return thenStatement;
            },
            If(_iflit, condExp, thenStat, colons, elseLit, elseStat) {
                var _a;
                const initialIndent = semanticsHelper.getIndentStr();
                semanticsHelper.addIndent(2);
                const increasedIndent = semanticsHelper.getIndentStr();
                const condition = condExp.eval();
                const thenStatement = addSemicolon(thenStat.eval());
                if ((_a = colons.child(0)) === null || _a === void 0 ? void 0 : _a.children.length) { // are there colons before else?
                    notSupported(colons.child(0));
                }
                let result = `if (${condition}) {\n${increasedIndent}${thenStatement}\n${initialIndent}}`; // put in newlines to also allow line comments
                if (elseLit.sourceString) {
                    const elseStatement = addSemicolon(evalChildren(elseStat.children).join('; '));
                    result += ` else {\n${increasedIndent}${elseStatement}\n${initialIndent}}`;
                }
                semanticsHelper.addIndent(-2);
                return result;
            },
            Ink(_inkLit, num, _comma, col, _comma2, col2) {
                semanticsHelper.addInstr("ink");
                const col2Str = col2.child(0) ? notSupported(col2.child(0)) : "";
                return `ink(${num.eval()}, ${col.eval()}${col2Str})`;
            },
            Inkey(lit, open, num, close) {
                return notSupported(lit, open, num, close) + "0";
            },
            InkeyS(_inkeySLit) {
                semanticsHelper.addInstr("inkey$");
                return `await inkey$()`;
            },
            Inp(lit, open, num, close) {
                return notSupported(lit, open, num, close) + "0";
            },
            Input(_inputLit, stream, _comma, _semi, message, _commaSemi, ids) {
                var _a;
                semanticsHelper.addInstr("input");
                const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
                const messageString = message.sourceString.replace(/\s*[;,]$/, "") || '""';
                const identifiers = evalChildren(ids.asIteration().children);
                const identifierStr = `[${identifiers.join(", ")}]`;
                const typesStr = identifiers.map(id => id.includes("$") ? "s" : "n").join("");
                return `${identifierStr} = (await input(${streamStr}${messageString}, "${typesStr}"))`;
            },
            Instr_noLen(_instrLit, _open, e1, _comma, e2, _close) {
                semanticsHelper.addInstr("instr");
                return `instr(${e1.eval()}, ${e2.eval()})`;
            },
            Instr_len(_instrLit, _open, len, _comma1, e1, _comma2, e2, _close) {
                semanticsHelper.addInstr("instr");
                return `instr(${e1.eval()}, ${e2.eval()}, ${len.eval()})`;
            },
            Int(_intLit, _open, num, _close) {
                semanticsHelper.addInstr("int");
                return `int(${num.eval()})`;
            },
            Joy(lit, open, num, close) {
                return notSupported(lit, open, num, close) + "0";
            },
            Key_key(lit, num, comma, str) {
                return notSupported(lit, num, comma, str);
            },
            Key_def(lit, defLit, num, comma, repeat, comma2, codes) {
                //const codesIteration = codes.child(0) ? codes.child(0).asIteration() : undefined;
                if (num.eval() === "78" && repeat.eval() === "1") {
                    const codeList = codes.child(0) ? evalChildren(codes.child(0).asIteration().children) : undefined;
                    const codeListStr = codeList ? `, ${codeList.join(", ")}` : "";
                    semanticsHelper.addInstr("keyDef");
                    return `keyDef(${num.eval()}, ${repeat.eval()}${codeListStr})`;
                }
                return notSupported(lit, defLit, num, comma, repeat, comma2, codes.child(0) ? codes.child(0).asIteration() : codes);
            },
            LeftS(_leftLit, _open, pos, _comma, len, _close) {
                semanticsHelper.addInstr("left$");
                return `left$(${pos.eval()}, ${len.eval()})`;
            },
            Len(_lenLit, _open, str, _close) {
                semanticsHelper.addInstr("len");
                return `len(${str.eval()})`;
            },
            Let(_letLit, assign) {
                return `${assign.eval()}`;
            },
            LineInput(_lit, _inputLit, stream, _comma, message, _semi, id) {
                var _a;
                semanticsHelper.addInstr("lineInput");
                const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
                const messageString = message.sourceString.replace(/\s*[;,]$/, "") || '""';
                const identifier = id.eval();
                return `${identifier} = await lineInput(${streamStr}${messageString})`;
            },
            List(lit, labelRange, comma, stream) {
                return notSupported(lit, labelRange, comma, stream);
            },
            Load(lit, file, comma, address) {
                return notSupported(lit, file, comma, address);
            },
            Locate(lit, stream, comma, x, comma2, y) {
                return notSupported(lit, stream, comma, x, comma2, y);
            },
            Log(_logLit, _open, num, _close) {
                semanticsHelper.addInstr("log");
                return `log(${num.eval()})`;
            },
            Log10(_log10Lit, _open, num, _close) {
                semanticsHelper.addInstr("log10");
                return `log10(${num.eval()})`;
            },
            LowerS(_lowerLit, _open, str, _close) {
                semanticsHelper.addInstr("lower$");
                return `lower$(${str.eval()})`;
            },
            Mask(lit, num, comma, num2, comma2, num3) {
                return notSupported(lit, num, comma, num2, comma2, num3);
            },
            Max(_maxLit, _open, args, _close) {
                semanticsHelper.addInstr("max");
                return `max(${evalChildren(args.asIteration().children)})`;
            },
            Memory(lit, num) {
                return notSupported(lit, num);
            },
            Merge(lit, file) {
                return notSupported(lit, file);
            },
            MidS(_midLit, _open, str, _comma1, start, _comma2, len, _close) {
                semanticsHelper.addInstr("mid$");
                return `mid$(${str.eval()}, ${start.eval()}${evalOptionalArg(len)})`;
            },
            MidSAssign(_midLit, _open, ident, _comma1, start, _comma2, len, _close, _op, newStr) {
                semanticsHelper.addInstr("mid$Assign");
                const variableName = ident.eval();
                return `${variableName} = mid$Assign(${variableName}, ${start.eval()}, ${newStr.eval()}${evalOptionalArg(len)})`;
            },
            Min(_minLit, _open, args, _close) {
                semanticsHelper.addInstr("min");
                return `min(${evalChildren(args.asIteration().children)})`;
            },
            Mode(_modeLit, num) {
                semanticsHelper.addInstr("mode");
                return `mode(${num.eval()})`;
            },
            Move: drawMovePlot,
            Mover: drawMovePlot,
            New: notSupported,
            Next(_nextLit, _variable) {
                // we cannot parse NEXT with multiple variables, if we want to match FOR and NEXT
                semanticsHelper.addIndent(-2);
                return `}`;
            },
            On_numGosub(_onLit, e1, _gosubLit, args) {
                const index = e1.eval();
                const argumentList = args.asIteration().children.map(child => child.sourceString);
                for (let i = 0; i < argumentList.length; i += 1) {
                    const labelString = argumentList[i];
                    semanticsHelper.addUsedLabel(labelString, "gosub");
                }
                return `([${argumentList.map((label) => `_${label}`).join(",")}]?.[${index} - 1] || (() => undefined))()`; // 1-based index
            },
            On_numGoto(_lit, _num, gotoLit, labels) {
                const argumentList = labels.asIteration().children.map(child => child.sourceString);
                for (let i = 0; i < argumentList.length; i += 1) {
                    const labelString = argumentList[i];
                    semanticsHelper.addUsedLabel(labelString, "goto");
                }
                return notSupported(gotoLit, labels.asIteration());
            },
            On_breakCont(lit, breakLit, contLit) {
                return notSupported(lit, breakLit, contLit);
            },
            On_breakGosub(lit, breakLit, gosubLit, label) {
                const labelString = label.sourceString;
                semanticsHelper.addUsedLabel(labelString, "gosub");
                return notSupported(lit, breakLit, gosubLit, label);
            },
            On_breakStop(lit, breakLit, stopLit) {
                return notSupported(lit, breakLit, stopLit);
            },
            On_errorGoto(lit, errorLit, gotoLit, label) {
                const labelString = label.sourceString;
                semanticsHelper.addUsedLabel(labelString, "goto");
                return notSupported(lit, errorLit, gotoLit, label);
            },
            Openin(lit, file) {
                return notSupported(lit, file);
            },
            Openout(lit, file) {
                return notSupported(lit, file);
            },
            Origin(_originLit, x, _comma, y, _comma2, win) {
                semanticsHelper.addInstr("origin");
                const winStr = win.child(0) ? notSupported(win.child(0)) : "";
                return `origin(${x.eval()}, ${y.eval()}${winStr})`;
            },
            Out(lit, num, comma, num2) {
                return notSupported(lit, num, comma, num2);
            },
            Paper(_paperLit, stream, _comma, e) {
                var _a;
                semanticsHelper.addInstr("paper");
                const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
                return `paper(${streamStr}${e.eval()})`;
            },
            Peek(lit, open, num, close) {
                return notSupported(lit, open, num, close) + "0";
            },
            Pen(_penLit, stream, _comma, e, _comma2, e2) {
                var _a;
                semanticsHelper.addInstr("pen");
                const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
                const modeStr = e2.child(0) ? notSupported(e2.child(0)) : "";
                return `pen(${streamStr}${e.eval()}${modeStr})`;
            },
            Pi(_piLit) {
                semanticsHelper.addInstr("pi");
                return `pi`;
            },
            Plot: drawMovePlot,
            Plotr: drawMovePlot,
            Poke(lit, num, comma, num2) {
                return notSupported(lit, num, comma, num2);
            },
            Pos(lit, open, streamLit, num, close) {
                if (num.eval() !== "0") {
                    return notSupported(lit, open, streamLit, num, close) + "0";
                }
                semanticsHelper.addInstr("pos");
                return "pos()";
            },
            PrintArg_strCmp(_cmp, args) {
                const parameterString = args.children[0].eval();
                return parameterString;
            },
            PrintArg_usingNum(_printLit, format, _semi, numArgs) {
                semanticsHelper.addInstr("using");
                const formatString = format.eval();
                const argumentList = evalChildren(numArgs.asIteration().children);
                const parameterString = argumentList.join(', ');
                return `using(${formatString}, ${parameterString})`;
            },
            PrintArg_commaOp(_comma) {
                return `"${CommaOpChar}"`; // Unicode arrow right
            },
            StreamArg(streamLit, stream) {
                return notSupported(streamLit, stream) + "";
            },
            Print(_printLit, stream, _comma, args, semi) {
                var _a;
                const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
                const argumentList = evalChildren(args.asIteration().children);
                const parameterString = argumentList.join(', ') || "";
                const tag = semanticsHelper.getTag();
                const hasCommaOrTab = parameterString.includes(`"${CommaOpChar}`) || parameterString.includes(`"${TabOpChar}`);
                const printInstr = (hasCommaOrTab ? "printTab" : "print") + (tag ? "Tag" : "");
                semanticsHelper.addInstr(printInstr);
                let newlineString = "";
                if (!semi.sourceString) {
                    newlineString = parameterString ? `, "\\n"` : `"\\n"`;
                }
                return `${printInstr}(${streamStr}${parameterString}${newlineString})`;
            },
            Rad(_radLit) {
                semanticsHelper.setDeg(false);
                return `/* rad */`; // we assume to check it at compile time
            },
            Randomize(lit, num) {
                return notSupported(lit, num);
            },
            Read(_readlit, args) {
                semanticsHelper.addInstr("read");
                const argumentList = evalChildren(args.asIteration().children);
                const results = argumentList.map(identifier => `${identifier} = read()`);
                return results.join("; ");
            },
            Release(lit, num) {
                return notSupported(lit, num);
            },
            Rem(_remLit, remain) {
                return `// ${remain.sourceString}`;
            },
            Remain(_remainLit, _open, e, _close) {
                semanticsHelper.addInstr("remain");
                return `remain(${e.eval()})`;
            },
            Renum(lit, num, comma, num2, comma2, num3) {
                return notSupported(lit, num, comma, num2, comma2, num3);
            },
            Restore(_restoreLit, e) {
                const labelString = e.sourceString || "0";
                semanticsHelper.addRestoreLabel(labelString);
                semanticsHelper.addUsedLabel(labelString, "restore");
                semanticsHelper.addInstr("restore");
                return `restore(${labelString})`;
            },
            Resume(lit, labelOrNext) {
                const labelString = labelOrNext.sourceString;
                if (labelString.toLowerCase() !== "next") {
                    semanticsHelper.addUsedLabel(labelString, "goto");
                }
                return notSupported(lit, labelOrNext);
            },
            Return(_returnLit) {
                return "return";
            },
            RightS(_rightLit, _open, str, _comma, len, _close) {
                semanticsHelper.addInstr("right$");
                return `right$(${str.eval()}, ${len.eval()})`;
            },
            Rnd(_rndLit, _open, e, _close) {
                var _a, _b;
                semanticsHelper.addInstr("rnd");
                const arg = (_b = (_a = e.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) !== null && _b !== void 0 ? _b : ""; // we ignore arg, but...
                return `rnd(${arg})`;
            },
            Round(_roundLit, _open, num, _comma, decimals, _close) {
                const decimalPlaces = evalOptionalArg(decimals);
                if (decimalPlaces) {
                    semanticsHelper.addInstr("round");
                    return `round(${num.eval()}${decimalPlaces})`;
                }
                semanticsHelper.addInstr("round1");
                return `round1(${num.eval()})`;
                // A better way to avoid rounding errors: https://www.jacklmoore.com/notes/rounding-in-javascript
            },
            Rsx(_rsxLit, cmd, e) {
                var _a;
                const cmdString = adaptIdentName(cmd.sourceString).toLowerCase();
                const rsxArgs = ((_a = e.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
                const knownRsx = ["arc", "circle", "date", "ellipse", "geolocation", "pitch", "polygon", "rect", "say", "time"];
                if (!knownRsx.includes(cmdString)) {
                    return notSupported(_rsxLit, cmd, e);
                }
                const rsxCall = "rsx" + stringCapitalize(cmdString);
                semanticsHelper.addInstr(rsxCall);
                const asyncStr = ["geolocation", "say"].includes(cmdString) ? "await " : "";
                if (rsxArgs === "") {
                    return `${asyncStr}${rsxCall}(${rsxArgs})`;
                }
                // need assign, not so nice to use <RSXFUNCTION>" as separator
                return rsxArgs.replace("<RSXFUNCTION>", `${asyncStr}${rsxCall}(`) + ")";
            },
            RsxAddressOf(_adressOfLit, ident) {
                const identString = ident.eval().toLowerCase();
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
                const result = `${assignments}<RSXFUNCTION>${argumentListNoAddr.join(", ")}`;
                return result;
            },
            Run(lit, labelOrFileOrNoting) {
                const labelString = labelOrFileOrNoting.sourceString;
                if (labelString !== "" && !labelString.startsWith('"')) {
                    semanticsHelper.addUsedLabel(labelString, "goto");
                }
                return notSupported(lit, labelOrFileOrNoting);
            },
            Save(lit, file, comma, type, comma2, num, comma3, num2, comma4, num3) {
                return notSupported(lit, file, comma, type, comma2, num, comma3, num2, comma4, num3);
            },
            Sgn(_sgnLit, _open, num, _close) {
                semanticsHelper.addInstr("sgn");
                return `sgn(${num.eval()})`;
            },
            Sin: cosSinTan,
            Sound(lit, state, comma, period, comma2, args) {
                return notSupported(lit, state, comma, period, comma2, args);
            },
            SpaceS(_stringLit, _open, num, _close) {
                semanticsHelper.addInstr("space$");
                return `space$(${num.eval()})`;
            },
            Spc(_lit, _open, num, _close) {
                semanticsHelper.addInstr("spc");
                return `spc(${num.eval()})`;
            },
            Speed_ink(lit, inkLit, num, comma, num2) {
                return notSupported(lit, inkLit, num, comma, num2);
            },
            Speed_key(lit, keyLit, num, comma, num2) {
                return notSupported(lit, keyLit, num, comma, num2);
            },
            Speed_write(lit, writeLit, num) {
                return notSupported(lit, writeLit, num);
            },
            Sq(lit, open, num, close) {
                return notSupported(lit, open, num, close) + "0";
            },
            Sqr(_sqrLit, _open, num, _close) {
                semanticsHelper.addInstr("sqr");
                return `sqr(${num.eval()})`;
            },
            Stop(_stopLit) {
                semanticsHelper.addInstr("stop");
                return `return stop()`;
            },
            StrS(_strLit, _open, num, _close) {
                semanticsHelper.addInstr("str$");
                return `str$(${num.eval()})`;
            },
            StringS_str(_stringLit, _open, len, _commaLit, chr, _close) {
                // Note: we do not use charAt(0) to get just one char
                semanticsHelper.addInstr("string$Str");
                return `string$Str(${len.eval()}, ${chr.eval()})`;
            },
            StringS_num(_stringLit, _open, len, _commaLit, num, _close) {
                semanticsHelper.addInstr("string$Num");
                return `string$Num(${len.eval()}, ${num.eval()})`;
            },
            Symbol_def(lit, args) {
                return notSupported(lit, args.asIteration());
            },
            Symbol_after(lit, afterLit, num) {
                return notSupported(lit, afterLit, num);
            },
            Tab(_lit, _open, num, _close) {
                return `"${TabOpChar}" + String(${num.eval()})`; // Unicode double arrow right
            },
            Tag(lit, stream) {
                var _a;
                //semanticsHelper.addInstr("tag");
                semanticsHelper.setTag(true);
                const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
                if (streamStr) {
                    return notSupported(lit, stream);
                }
                return `/* tag */`; // we assume to check it at compile time
                //return `tag(${streamStr})`;
            },
            Tagoff(lit, stream) {
                var _a;
                //semanticsHelper.addInstr("tagoff");
                semanticsHelper.setTag(false);
                const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
                if (streamStr) {
                    return notSupported(lit, stream);
                }
                return `/* tagoff */`; // we assume to check it at compile time
                //eturn `tagoff(${streamStr})`;
            },
            Tan: cosSinTan,
            Test(lit, open, num, comma, num2, close) {
                return notSupported(lit, open, num, comma, num2, close) + "0";
            },
            Testr(lit, open, num, comma, num2, close) {
                return notSupported(lit, open, num, comma, num2, close) + "0";
            },
            Time(_timeLit) {
                semanticsHelper.addInstr("time");
                return `time()`;
            },
            Troff: notSupported,
            Tron: notSupported,
            Unt(_lit, _open, num, _close) {
                semanticsHelper.addInstr("unt");
                return `unt(${num.eval()})`;
            },
            UpperS(_upperLit, _open, str, _close) {
                semanticsHelper.addInstr("upper$");
                return `upper$(${str.eval()})`;
            },
            Val(_upperLit, _open, e, _close) {
                const numPattern = /^"[\\+\\-]?\d*\.?\d+(?:[Ee][\\+\\-]?\d+)?"$/;
                const numStr = String(e.eval());
                if (numPattern.test(numStr)) { // for non-hex/bin number strings we can use this simple version
                    semanticsHelper.addInstr("val1");
                    return `val1(${numStr})`;
                }
                semanticsHelper.addInstr("val");
                return `val(${numStr})`;
            },
            Vpos(lit, open, streamLit, num, close) {
                if (num.eval() !== "0") {
                    return notSupported(lit, open, streamLit, num, close) + "0";
                }
                semanticsHelper.addInstr("vpos");
                return "vpos()";
            },
            Wait(lit, num, comma, num2, comma2, num3) {
                return notSupported(lit, num, comma, num2, comma2, num3);
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
            Width(lit, num) {
                return notSupported(lit, num);
            },
            Window_def(lit, stream, comma0, num, comma, num2, comma2, num3, comma3, num4) {
                return notSupported(lit, stream, comma0, num, comma, num2, comma2, num3, comma3, num4);
            },
            Window_swap(lit, swapLit, num, comma, num2) {
                return notSupported(lit, swapLit, num, comma, num2);
            },
            Write(_printLit, stream, _comma, args) {
                var _a;
                const writeInst = semanticsHelper.getTag() ? "writeTag" : "write";
                semanticsHelper.addInstr(writeInst);
                const streamStr = ((_a = stream.child(0)) === null || _a === void 0 ? void 0 : _a.eval()) || "";
                const parameterString = evalChildren(args.asIteration().children).join(', ');
                return `${writeInst}(${streamStr}${parameterString})`;
            },
            Xpos(_xposLit) {
                semanticsHelper.addInstr("xpos");
                return `xpos()`;
            },
            Ypos(_xposLit) {
                semanticsHelper.addInstr("ypos");
                return `ypos()`;
            },
            Zone(_lit, num) {
                semanticsHelper.addInstr("zone");
                return `zone(${num.eval()})`;
            },
            AndExp_and(a, _op, b) {
                return `${a.eval()} & ${b.eval()}`;
            },
            NotExp_not(_op, e) {
                return `~(${e.eval()})`;
            },
            OrExp_or(a, _op, b) {
                return `${a.eval()} | ${b.eval()}`;
            },
            XorExp_xor(a, _op, b) {
                return `${a.eval()} ^ ${b.eval()}`;
            },
            AddExp_minus(a, _op, b) {
                return `${a.eval()} - ${b.eval()}`;
            },
            AddExp_plus(a, _op, b) {
                return `${a.eval()} + ${b.eval()}`;
            },
            CmpExp_eq(a, _op, b) {
                return createComparisonExpression(a, "===", b);
            },
            CmpExp_ge(a, _op, b) {
                return createComparisonExpression(a, ">=", b);
            },
            CmpExp_gt(a, _op, b) {
                return createComparisonExpression(a, ">", b);
            },
            CmpExp_le(a, _op, b) {
                return createComparisonExpression(a, "<=", b);
            },
            CmpExp_lt(a, _op, b) {
                return createComparisonExpression(a, "<", b);
            },
            CmpExp_ne(a, _op, b) {
                return createComparisonExpression(a, "!==", b);
            },
            DivExp_div(a, _op, b) {
                return `((${a.eval()} / ${b.eval()}) | 0)`;
            },
            ExpExp_power(a, _, b) {
                return `Math.pow(${a.eval()}, ${b.eval()})`;
            },
            ModExp_mod(a, _op, b) {
                return `${a.eval()} % ${b.eval()}`;
            },
            MulExp_divide(a, _op, b) {
                return `${a.eval()} / ${b.eval()}`;
            },
            MulExp_times(a, _op, b) {
                return `${a.eval()} * ${b.eval()}`;
            },
            PriExp_neg(_op, e) {
                return `-${e.eval()}`;
            },
            PriExp_paren(_open, e, _close) {
                return `(${e.eval()})`;
            },
            PriExp_pos(_op, e) {
                return `+${e.eval()}`;
            },
            StrAddExp_plus(a, _op, b) {
                return `${a.eval()} + ${b.eval()}`;
            },
            StrCmpExp_eq(a, _op, b) {
                return `-(${a.eval()} === ${b.eval()})`;
            },
            StrCmpExp_ge(a, _op, b) {
                return `-(${a.eval()} >= ${b.eval()})`;
            },
            StrCmpExp_gt(a, _op, b) {
                return `-(${a.eval()} > ${b.eval()})`;
            },
            StrCmpExp_le(a, _op, b) {
                return `-(${a.eval()} <= ${b.eval()})`;
            },
            StrCmpExp_lt(a, _op, b) {
                return `-(${a.eval()} < ${b.eval()})`;
            },
            StrCmpExp_ne(a, _op, b) {
                return `-(${a.eval()} !== ${b.eval()})`;
            },
            StrPriExp_paren(_open, e, _close) {
                return `(${e.eval()})`;
            },
            ArrayArgs(args) {
                return evalChildren(args.asIteration().children).join("][");
            },
            ArrayIdent(ident, _open, e, _close) {
                const name = semanticsHelper.getVariable(ident.eval(), "A");
                return `${name}[${e.eval()}]`;
            },
            DimArrayArgs(args) {
                return evalChildren(args.asIteration().children).join(", ");
            },
            DimArrayIdent(ident, _open, indices, _close) {
                const identStr = semanticsHelper.getVariable(ident.eval(), "A");
                const indicesStr = indices.eval();
                const isMultiDimensional = indicesStr.includes(","); // also for expressions containing comma
                const isStringIdent = identStr.endsWith("$");
                const valueStr = isStringIdent ? ', ""' : "";
                const indicesStr2 = isMultiDimensional ? `[${indicesStr}]` : indicesStr;
                let instr = "";
                if (isMultiDimensional) {
                    instr = "dim";
                }
                else if (!isStringIdent && semanticsHelper.getVarLetterType(identStr) === "I") { // defint seen?
                    instr = "dim1i16";
                }
                else {
                    instr = "dim1";
                }
                semanticsHelper.addInstr(instr);
                return `${identStr} = ${instr}(${indicesStr2}${valueStr})`;
            },
            StrArrayIdent(ident, _open, e, _close) {
                const name = semanticsHelper.getVariable(ident.eval(), "A");
                return `${name}[${e.eval()}]`;
            },
            EraseIdent(ident) {
                const name = semanticsHelper.getVariable(ident.eval(), "A"); // for erase we have arrayvariables but withoutt indices
                return name;
            },
            CondExp(e) {
                return e.eval().replace(/^-?(\(.*\))$/, '$1'); // remove "-" in top-level condition
            },
            dataUnquoted(data) {
                const str = data.sourceString;
                if (!isNaN(Number(str))) {
                    return str;
                }
                return notSupported(data) + `"${str}"`;
            },
            decimalValue(value) {
                const valueStr = value.sourceString.replace(/^(-?)(0+)(\d)/, "$1$3"); // avoid octal numbers: remove leading zeros, but keep sign
                if (valueStr !== value.sourceString) {
                    notSupported(value);
                }
                return valueStr;
            },
            hexValue(_prefix, value) {
                return `0x${value.sourceString}`;
            },
            binaryValue(_prefix, value) {
                return `0b${value.sourceString}`;
            },
            string(_quote1, e, quote2) {
                const str = e.sourceString.replace(/\\/g, "\\\\"); // escape backslashes
                const varStr = quote2.sourceString !== '"' ? notSupported(quote2).replace("\n", "eol") : "";
                return `"${str}"${varStr}`;
            },
            PlainIdent(ident) {
                const name = ident.eval();
                return semanticsHelper.getVariable(name);
            },
            StrPlainIdent(ident) {
                const name = ident.eval();
                return semanticsHelper.getVariable(name);
            },
            ident(ident, suffix) {
                var _a;
                const name = adaptIdentName(ident.sourceString);
                const suffixStr = (_a = suffix.child(0)) === null || _a === void 0 ? void 0 : _a.sourceString;
                if (suffixStr !== undefined) { // real or integer suffix
                    return name + notSupported(suffix);
                }
                return name; //semanticsHelper.getVariable(name);
            },
            fnIdent(fn, _space, ident, suffix) {
                var _a;
                const name = fn.sourceString + adaptIdentName(ident.sourceString);
                const suffixStr = (_a = suffix.child(0)) === null || _a === void 0 ? void 0 : _a.sourceString;
                if (suffixStr !== undefined) { // real or integer suffix
                    return semanticsHelper.getVariable(name) + notSupported(suffix);
                }
                return semanticsHelper.getVariable(name);
            },
            strIdent(ident, typeSuffix) {
                const name = adaptIdentName(ident.sourceString) + typeSuffix.sourceString;
                return name; //semanticsHelper.getVariable(name);
            },
            strFnIdent(fn, _space, ident, typeSuffix) {
                const name = fn.sourceString + adaptIdentName(ident.sourceString) + typeSuffix.sourceString;
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
        getSemanticsActions() {
            return getSemanticsActions(this.helper);
        }
        getSemanticsActionDict() {
            return this.getSemanticsActions();
        }
        getHelper() {
            return this.helper;
        }
    }

    // Script creator for standalone scripts (complied script + worker function)
    class ScriptCreator {
        constructor(debug) {
            this.debug = debug;
        }
        // Build dependency map by analyzing vm properties
        analyzeDependencies(vmObj) {
            const depMap = {};
            for (const key in vmObj) {
                const deps = [];
                const noPropertyDeps = key === "cls"; // no property deps for cls function
                const value = vmObj[key];
                const valueStr = String(value);
                // Find all vm.propertyName references
                const regex = /vm\.([\w$]+)/g;
                let match;
                while ((match = regex.exec(valueStr)) !== null) {
                    const refProp = match[1];
                    if (!deps.includes(refProp)) {
                        if (!refProp.startsWith("_") || !noPropertyDeps) {
                            deps.push(refProp);
                        }
                    }
                }
                depMap[key] = deps;
            }
            return depMap;
        }
        ;
        // Calculate transitive closure of dependencies
        getTransitiveDeps(usedFunctions, depMap) {
            const result = new Set(usedFunctions);
            let changed = true;
            while (changed) {
                changed = false;
                for (const fn of Array.from(result)) {
                    const deps = depMap[fn] || [];
                    for (const dep of deps) {
                        if (!result.has(dep)) {
                            result.add(dep);
                            changed = true;
                        }
                    }
                }
            }
            return result;
        }
        // Filter vm object based on used functions
        filterVM(vmObj, usedFunctions) {
            const depMap = this.analyzeDependencies(vmObj);
            if (this.debug) {
                const allKeys = Object.keys(vmObj);
                for (const fn of usedFunctions) {
                    if (!allKeys.includes(fn)) {
                        console.warn(`Warning: Function '${fn}' does not exist in vm object`);
                    }
                }
            }
            // Get transitive closure
            const includeKeys = this.getTransitiveDeps(usedFunctions, depMap);
            // Build filtered object (maintain original vm order)
            const filtered = {};
            for (const key in vmObj) {
                if (includeKeys.has(key)) {
                    filtered[key] = vmObj[key];
                }
            }
            if (this.debug >= 2) {
                console.log(`Filtered VM object, included keys: [${Array.from(includeKeys).join(", ")}]`);
            }
            return filtered;
        }
        createParentPort() {
            const parentPort = new class {
                constructor() {
                    // Dummy message handler
                    this.onMessageHandler = (data) => {
                        console.log("onMessageHandler called with:", data);
                    };
                }
                // This method will be stringified into the standalone script
                on(_event, messageHandler) {
                    this.onMessageHandler = messageHandler;
                    this.onMessageHandler({
                        type: "config",
                        isTerminal: true
                    });
                }
                // This method will be stringified into the standalone script
                postMessage(data) {
                    switch (data.type) {
                        case 'flush':
                            if (data.needCls) {
                                console.clear();
                            }
                            console.log(data.message);
                            break;
                        case 'geolocation':
                            this.onMessageHandler({
                                type: "continue",
                                result: ""
                            });
                            break;
                        case 'input':
                            console.log(data.prompt);
                            this.onMessageHandler({
                                type: "input",
                                input: ""
                            });
                            break;
                        case 'keyDef':
                            break;
                        case 'result':
                            break;
                        case 'speak':
                            this.onMessageHandler({
                                type: "continue",
                                result: ""
                            });
                            break;
                        default:
                            console.error("postMessageHandler: Unknown message type:", data);
                            break;
                    }
                }
            };
            return parentPort;
        }
        // Generate source code for filtered vm object
        generateSource(vmObj) {
            const indent = " ".repeat(8);
            let output = "";
            const keys = Object.keys(vmObj);
            for (const [index, key] of keys.entries()) {
                const value = vmObj[key];
                const comma = index === keys.length - 1 ? "" : ",";
                const valueStr = typeof value === "function" ? String(value) : JSON.stringify(value);
                output += `${indent}${key}: ${valueStr}${comma}\n`;
            }
            return output;
        }
        compiledCodeInFrame(compiledScript, workerFnString) {
            const parentPort = this.createParentPort();
            const parentFns = [];
            parentFns.push(String(parentPort.on));
            parentFns.push(String(parentPort.postMessage));
            // replace indentation
            const parentPortStr = parentFns.map((fnStr) => fnStr.replace(/\n\s{12}/g, "\n")).join(",\n    ");
            const inFrame = `(async (_o) => {
    ${compiledScript}
})(
    ((parentPort) => {
        const vm = {
${workerFnString}
        };
        parentPort.on('message', (data) => vm.onMessageHandler(data));
        globalThis.LocoBasicVm = vm;
        return vm;
    })({
    ${parentPortStr}
    })
).then((result) => {
    globalThis.LocoBasicVm.flush();
});`;
            return inFrame;
        }
        createStandaloneScript(workerFn, compiledScript, usedInstr) {
            const mockParent = {
                on: () => undefined,
                postMessage: () => undefined,
            };
            const vmObj = workerFn.workerFn(mockParent);
            const filteredVM = this.filterVM(vmObj, [...usedInstr, "flush", "onMessageHandler"]);
            const workerString = this.generateSource(filteredVM);
            const inFrame = this.compiledCodeInFrame(compiledScript, workerString);
            return inFrame;
        }
    }

    class Core {
        constructor(defaultConfig) {
            this.semantics = new Semantics();
            this.databaseMap = {};
            this.addIndex = (dir, input) => {
                if (typeof input === "function") {
                    input = {
                        [dir]: JSON.parse(Core.fnHereDoc(input).trim())
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
                let inputString = typeof input !== "string" ? Core.fnHereDoc(input) : input;
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
        static expandNextStatements(src, semanticsHelper) {
            return src.split('\n').map((line, lineIdx) => {
                // Find the first REM or ' that is not inside a string
                let commentIdx = -1;
                let inString = false;
                for (let i = 0; i < line.length; i++) {
                    const c = line[i];
                    if (c === '"')
                        inString = !inString;
                    // Check for REM (case-insensitive) or '
                    if (!inString) {
                        if (line.slice(i, i + 3).toUpperCase() === "REM" && (i === 0 || /\s/.test(line[i - 1]))) {
                            commentIdx = i;
                            break;
                        }
                        if (c === "'") {
                            commentIdx = i;
                            break;
                        }
                    }
                }
                let code = line;
                let comment = "";
                if (commentIdx !== -1) {
                    code = line.slice(0, commentIdx);
                    comment = line.slice(commentIdx);
                }
                // Replace NEXT i,j,k with NEXT i : NEXT j : NEXT k (not inside strings)
                code = code.replace(/NEXT\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)+)/gi, (match, vars, offset) => {
                    const before = code.slice(0, offset);
                    const quoteCount = (before.match(/"/g) || []).length;
                    if (quoteCount % 2 !== 0)
                        return match; // inside string, skip
                    const col = offset + 1;
                    semanticsHelper.addCompileMessage(`WARNING: Not supported: Line ${lineIdx + 1}, col ${col}: Expanding NEXT statement: ${vars}\n`);
                    return vars.split(/\s*,\s*/).map(v => `NEXT ${v}`).join(' : ');
                });
                return code + comment;
            }).join('\n');
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
            const semanticsHelper = this.semantics.getHelper();
            const preprocessedScript = Core.expandNextStatements(script, semanticsHelper); // some preprocessing
            const compiledScript = this.arithmeticParser.parseAndEval(preprocessedScript);
            const messages = semanticsHelper.getCompileMessages();
            return { compiledScript, messages };
        }
        getSemantics() {
            return this.semantics;
        }
        static fnHereDoc(fn) {
            return String(fn).replace(/^[^/]+\/\*\S*/, "").replace(/\*\/[^/]+$/, "");
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
        createStandaloneScript(workerFn, compiledScript, usedInstr) {
            if (!this.scriptCreator) {
                this.scriptCreator = new ScriptCreator(this.config.debug);
            }
            const inFrame = this.scriptCreator.createStandaloneScript(workerFn, compiledScript, usedInstr);
            return inFrame;
        }
    }

    class VmMessageHandler {
        constructor(callbacks, postMessage) {
            this.code = "";
            this.callbacks = callbacks;
            this.postMessage = postMessage;
        }
        setCode(code) {
            this.code = code;
        }
        getFinishedPromise() {
            return this.finishedPromise;
        }
        createFinishedPromise() {
            if (this.finishedPromise) {
                console.error("createFinishedPromise: Already created");
                return this.finishedPromise;
            }
            this.finishedPromise = new Promise((resolve) => {
                this.finishedResolverFn = resolve;
            });
            return this.finishedPromise;
        }
        onResultResolved(message = "") {
            if (this.finishedResolverFn) {
                this.finishedResolverFn(message);
                this.finishedResolverFn = undefined;
                this.finishedPromise = undefined;
            }
        }
        static describeError(stringToEval, lineno, colno) {
            const lines = stringToEval.split("\n");
            const line = lines[lineno - 1];
            return `${line}\n${" ".repeat(colno - 1) + "^"}`;
        }
        async handleMessage(data) {
            switch (data.type) {
                case 'flush':
                    this.callbacks.onFlush(data.message, data.needCls, data.hasGraphics);
                    break;
                case 'geolocation': {
                    let result = "";
                    try {
                        result = await this.callbacks.onGeolocation();
                    }
                    catch (msg) {
                        console.warn(msg);
                        this.callbacks.onFlush(String(msg));
                        //this.postMessage({ type: 'stop' });
                    }
                    this.postMessage({ type: 'continue', result });
                    break;
                }
                case 'input': {
                    setTimeout(async () => {
                        const input = await this.callbacks.onInput(data.prompt);
                        this.postMessage({ type: 'input', input });
                    }, 50); // 50ms delay to allow UI update
                    break;
                }
                case 'keyDef':
                    this.callbacks.onKeyDef(data.codes);
                    break;
                case 'result': {
                    let res = data.result || "";
                    if (res.startsWith("{")) {
                        const json = JSON.parse(res);
                        const { lineno, colno, message } = json;
                        if (message === "No Error: Parsing successful!") {
                            res = "";
                        }
                        else {
                            res = `Syntax error thrown at: Line ${lineno - 2}, col: ${colno}\n`
                                + VmMessageHandler.describeError(this.code, lineno - 2, colno) + "\n"
                                + message;
                        }
                    }
                    else if (res === "Error: INFO: Program stopped") {
                        res = "";
                    }
                    else {
                        const match1 = res.match(/^Error: (\d+)$/);
                        if (match1) {
                            res += ": " + basicErrors[Number(match1[1])];
                        }
                    }
                    this.onResultResolved(res);
                    break;
                }
                case 'speak': {
                    try {
                        await this.callbacks.onSpeak(data.message, data.pitch);
                    }
                    catch (msg) {
                        console.log(msg);
                        //this.postMessage({ type: 'stop' });
                    }
                    this.postMessage({ type: 'continue', result: '' });
                    break;
                }
                default:
                    console.error("VmMessageHandler: Unknown message type:", data);
                    break;
            }
        }
    }

    class NodeVmMain {
        constructor(callbacks, createNodeWorker) {
            this.workerOnMessageHandler = (data) => {
                this.messageHandler.handleMessage(data);
            };
            this.messageHandler = new VmMessageHandler(callbacks, (message) => this.postMessage(message));
            this.createNodeWorker = createNodeWorker;
        }
        postMessage(message) {
            var _a;
            (_a = this.worker) === null || _a === void 0 ? void 0 : _a.postMessage(message);
        }
        getOrCreateWorker() {
            if (!this.worker) {
                this.worker = this.createNodeWorker();
                this.worker.on('message', this.workerOnMessageHandler);
                this.postMessage({ type: 'config', isTerminal: true });
            }
            return this.worker;
        }
        async run(code) {
            if (!code.endsWith("\n")) {
                code += "\n"; // make sure the script ends with a new line (needed for line comment in last line)
            }
            this.messageHandler.setCode(code); // for error message
            this.getOrCreateWorker();
            const finishedPromise = this.messageHandler.createFinishedPromise();
            this.postMessage({ type: 'run', code });
            return finishedPromise;
        }
        frameTime(time) {
            this.postMessage({ type: 'frameTime', time });
        }
        stop() {
            console.log("stop: Stop requested.");
            this.postMessage({ type: 'stop' });
        }
        reset() {
            if (this.worker) {
                this.worker.terminate();
                this.worker = undefined;
            }
            this.messageHandler.onResultResolved("terminated.");
        }
        putKeys(keys) {
            this.postMessage({ type: 'putKeys', keys });
        }
    }

    class NodeParts {
        constructor() {
            this.locoVmWorkerName = "";
            this.loadedNodeModules = {};
            this.modulePath = "";
        }
        getNodeModule(module) {
            if (!this.loadedNodeModules[module]) {
                this.loadedNodeModules[module] = require(module);
            }
            return this.loadedNodeModules[module];
        }
        getNodePath() {
            return this.getNodeModule("path");
        }
        nodeGetAbsolutePath(name) {
            const path = this.getNodePath();
            // https://stackoverflow.com/questions/8817423/why-is-dirname-not-defined-in-node-repl
            const dirname = __dirname || path.dirname(__filename);
            return path.resolve(dirname, name); // absolute path
        }
        async nodeReadFile(name) {
            const nodeFs = this.getNodeModule("fs");
            if (!module) {
                const module = this.getNodeModule("module");
                this.modulePath = module.path || "";
                if (!this.modulePath) {
                    console.warn("nodeReadFile: Cannot determine module path");
                }
            }
            try {
                return await nodeFs.promises.readFile(name, "utf8");
            }
            catch (error) {
                console.error(`Error reading file ${name}:`, String(error));
                throw error;
            }
        }
        async nodeReadUrl(url) {
            const nodeHttps = this.getNodeModule("https");
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
        createNodeWorker() {
            const nodeWorkerThreads = this.getNodeModule("worker_threads");
            const path = this.getNodePath();
            return new nodeWorkerThreads.Worker(path.resolve(__dirname, this.locoVmWorkerName));
        }
        getNodeWorkerFn(workerFile) {
            const path = this.getNodePath();
            const workerFnPath = path.resolve(__dirname, workerFile);
            return this.getNodeModule(workerFnPath);
        }
        static isUrl(s) {
            return s.startsWith("http"); // http or https
        }
        loadScript(fileOrUrl) {
            return NodeParts.isUrl(fileOrUrl) ? this.nodeReadUrl(fileOrUrl) : this.nodeReadFile(fileOrUrl);
        }
        ;
        keepRunning(fn, timeout) {
            const timerId = setTimeout(() => { }, timeout);
            return (async () => {
                fn();
                clearTimeout(timerId);
            })();
        }
        /* TODO
        private nodeCheckSyntax(script: string): string {
            if (!this.nodeVm) {
                this.nodeVm = require("vm") as NodeVm;
            }

            const describeError = (stack: string): string => {
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
            } catch (err) { // Error-like object
                const stack = (err as Error).stack;
                if (stack) {
                    output = describeError(stack);
                }
            }
            return output;
        }
        */
        fnOnKeypress(_chunk, key) {
            if (key) {
                const keySequenceCode = key.sequence.charCodeAt(0);
                if (key.name === 'c' && key.ctrl === true) {
                    // key: '<char>' { sequence: '\x03', name: 'c', ctrl: true, meta: false, shift: false }
                    process.exit();
                }
                else if (key.name === "escape") {
                    this.getNodeVmMain().stop(); // request stop
                }
                else if (keySequenceCode === 0x0d || (keySequenceCode >= 32 && keySequenceCode <= 128)) {
                    //this.putKeyInBuffer(key.sequence);
                    this.getNodeVmMain().putKeys(key.sequence);
                }
            }
        }
        initKeyboardInput() {
            const nodeReadline = this.getNodeModule("readline");
            if (process.stdin.isTTY) {
                nodeReadline.emitKeypressEvents(process.stdin);
                process.stdin.setRawMode(true);
                this.fnOnKeyPressHandler = this.fnOnKeypress.bind(this);
                process.stdin.on('keypress', this.fnOnKeyPressHandler);
            }
            else {
                console.warn("initKeyboardInput: not a TTY", process.stdin);
            }
        }
        createMessageHandlerCallbacks() {
            const callbacks = {
                onFlush: (message, needCls) => {
                    if (needCls) {
                        console.clear();
                    }
                    console.log(message);
                },
                onInput: (prompt) => {
                    console.log(prompt);
                    const input = ""; //TODO
                    return Promise.resolve(input);
                },
                onGeolocation: async () => {
                    // TODO
                    return '';
                },
                onSpeak: async () => {
                    // TODO
                },
                onKeyDef: () => {
                    //TODO
                }
            };
            return callbacks;
        }
        getNodeVmMain() {
            if (!this.nodeVmMain) {
                const messageHandlerCallbacks = this.createMessageHandlerCallbacks();
                this.nodeVmMain = new NodeVmMain(messageHandlerCallbacks, () => this.createNodeWorker());
            }
            return this.nodeVmMain;
        }
        async startRun(core, compiledScript, usedInstrMap) {
            if (core.getConfigMap().debug) {
                console.log("DEBUG: running compiled script...");
            }
            if (usedInstrMap["inkey$"]) { // do we need inkey$
                this.initKeyboardInput();
            }
            const nodeVmMain = this.getNodeVmMain();
            const output = await nodeVmMain.run(compiledScript);
            console.log(output.replace(/\n$/, ""));
            nodeVmMain.reset(); // terminate worker
            if (this.fnOnKeyPressHandler) {
                process.stdin.off('keypress', this.fnOnKeyPressHandler);
                process.stdin.setRawMode(false);
                process.exit(0); // hmm, not so nice
            }
        }
        start(core, input) {
            const actionConfig = core.getConfigMap().action;
            //core.setOnCheckSyntax((s: string) => Promise.resolve(this.nodeCheckSyntax(s)));
            const needCompile = actionConfig.includes("compile");
            const { compiledScript, messages } = needCompile ? core.compileScript(input) : {
                compiledScript: input,
                messages: []
            };
            if (compiledScript.startsWith("ERROR:")) {
                console.error(compiledScript);
                return;
            }
            if (messages) {
                console.log(messages.join("\n"));
            }
            const usedInstrMap = core.getSemantics().getHelper().getInstrMap();
            if (actionConfig.includes("run")) {
                return this.keepRunning(async () => {
                    return this.startRun(core, compiledScript, usedInstrMap);
                }, 5000);
            }
            else { // compile only: output standalone script
                const workerFn = this.getNodeWorkerFn(this.locoVmWorkerName);
                const inFrame = core.createStandaloneScript(workerFn, compiledScript, Object.keys(usedInstrMap));
                console.log(inFrame);
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
            return example.script || "";
        }
        async nodeMain(core, locoVmWorkerName) {
            const config = core.getConfigMap();
            core.parseArgs(global.process.argv.slice(2), config);
            this.locoVmWorkerName = locoVmWorkerName;
            if (config.input) {
                return this.keepRunning(async () => {
                    this.start(core, config.input);
                }, 5000);
            }
            else if (config.fileName) {
                return this.keepRunning(async () => {
                    const inputFromFile = await this.nodeReadFile(config.fileName);
                    this.start(core, inputFromFile);
                }, 5000);
            }
            else if (config.example) {
                const databaseMap = core.initDatabaseMap();
                const database = config.database;
                const databaseItem = databaseMap[database];
                if (!databaseItem) {
                    console.error(`Error: Database ${database} not found in ${config.databaseDirs}`);
                    return;
                }
                return this.keepRunning(async () => {
                    if (!NodeParts.isUrl(databaseItem.source)) {
                        databaseItem.source = this.nodeGetAbsolutePath(databaseItem.source);
                    }
                    await this.getExampleMap(databaseItem, core);
                    const exampleName = config.example;
                    const example = core.getExample(exampleName);
                    if (example) {
                        const script = await this.getExampleScript(example, core);
                        this.start(core, script);
                    }
                    else {
                        console.error(`Error: Example not found: ${exampleName}`);
                    }
                }, 5000);
            }
            else {
                console.log(NodeParts.getHelpString());
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
node dist/locobasic.js example=abelian1
node dist/locobasic.js example=archidr0 > test1.svg
node dist/locobasic.js example=binary database=rosetta databaseDirs=examples,https://benchmarko.github.io/CPCBasicApps/apps,https://benchmarko.github.io/CPCBasicApps/rosetta
node dist/locobasic.js grammar='strict' input='a$="Bob":PRINT "Hello ";a$;"!"'
node dist/locobasic.js fileName=dist/examples/example.bas  (if you have an example.bas file)

- Example for compile only:
node dist/locobasic.js action='compile' input='PRINT "Hello!"' > hello1.js
[Windows: Use node.exe when redirecting into a file; or npx ts-node ...]
node hello1.js
[When using async functions like FRAME or INPUT, redirect to hello1.mjs]
- Combined:
node dist/locobasic.js example=testpage action=compile | node
`;
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
        exampleFilter: "",
        fileName: "",
        grammar: "basic", // basic or strict
        input: "",
        showBasic: true,
        showCompiled: false,
        showOutput: true
    });
    const locoVmWorkerName = "locoVmWorker.js";
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
            ui.onWindowLoadContinue(core, locoVmWorkerName);
        };
    }
    else { // node.js
        new NodeParts().nodeMain(core, locoVmWorkerName);
    }

}));
//# sourceMappingURL=locobasic.js.map
