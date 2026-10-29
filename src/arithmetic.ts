// arithmetics.ts
//
export const arithmetic = {
  basicGrammar:
    `
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

    PrintUsingSep
      = ";"
      | ","

    PrintArg
      = &StrCmpExp NumExp -- strCmp
      | StrExp
      | NumExp
      | using StrExp ";" ListOf<AnyExp, PrintUsingSep> -- using
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

    IfElseBlock
      = else LoopBlockContent* LoopBlockSeparator

    IfBlock
      = if CondExp then LoopBlockContent* LoopBlockSeparator IfElseBlock? endif

    If
      = if CondExp IfThen (":"* else IfExp)? -- singleLine
      | IfBlock -- multiLine

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

    AnyExp
      = StrExp
      | NumExp

    keyword
      = abs | after | and | asc | atn | auto | binS | border | break
      | call | cat | chain | chrS | cint | clear | clg | closein | closeout | cls | cont | copychrS | cos | creal | cursor
      | data | decS | def | defint | defreal | defstr | deg | delete | derr | di | dim | draw | drawr
      | edit | ei | else | endif | endLit | ent | env | eof | erase | erl | err | error | every | exp | fill | fix | fn | for | frame | fre | gosub | goto | graphics
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
    endif
      = ("endif" | "ENDIF") ~identPart
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

};
