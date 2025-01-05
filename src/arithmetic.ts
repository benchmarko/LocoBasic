// arithmetics.ts
//
export const arithmetic = {
  basicGrammar:
    `
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
      | End
      | Erase
      | Error
      | For
      | Frame
      | Gosub
      | If
      | Input
      | MidSAssign
      | Mode
      | Next
      | On
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

  strictGrammar:
  `strictGrammar <: basicGrammar {
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
