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
     | Comparison
     | Cls
     | Data
     | Dim
     | End
     | Erase
     | ForLoop
     | Frame
     | Gosub
     | Input
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

    Erase
      = caseInsensitive<"erase"> NonemptyListOf<SimpleIdent, ",">

    Exp
      = caseInsensitive<"exp"> "(" NumExp ")"

    Fix
      = caseInsensitive<"fix"> "(" NumExp ")"

    ForLoop
      = caseInsensitive<"for"> variable "=" NumExp caseInsensitive<"to"> NumExp (caseInsensitive<"step"> NumExp)?

    Frame
      = caseInsensitive<"frame">

    Gosub
      = caseInsensitive<"gosub"> label

    Hex
      = caseInsensitive<"hex$"> "(" NumExp ("," NumExp)? ")"

    Input
      = caseInsensitive<"input"> (string (";" | ","))? AnyIdent  // or NonemptyListOf?

    Instr
      = caseInsensitive<"instr"> "(" StrExp "," StrExp ")"

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

    Read
      = caseInsensitive<"read"> NonemptyListOf<AnyIdent, ",">

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
      = NonemptyListOf<StrOrNumExp, ",">

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
//# sourceMappingURL=arithmetic.js.map