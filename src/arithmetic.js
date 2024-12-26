// arithmetics.ts
//
export const arithmetic = {
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
//# sourceMappingURL=arithmetic.js.map