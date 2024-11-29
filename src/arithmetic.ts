// https://github.com/ohmjs/ohm/blob/main/examples/math/index.html
//
// https://nextjournal.com/pangloss/ohm-parsing-made-easy
//
// https://stackoverflow.com/questions/60857610/grammar-for-expression-language
// !
//https://github.com/Gamadril/led-basic-vscode
// !
//
export const arithmetic = {
 grammar :
  `
    Arithmetic {
    Program
      = (emptyLine | Line)*

    emptyLine = comment eol

    Line
      = Statements comment? (eol | end)

    Statements
     = Statement (":" Statement)*

    Statement
     = Comparison
     | Assign
     | ForLoop
     | Next
     | Print

    Assign
      = ident "=" Exp
      | ident "=" string

    ForLoop
      = caseInsensitive<"for"> variable "=" Exp caseInsensitive<"to"> Exp (caseInsensitive<"step"> Exp)?

    Next
     = caseInsensitive<"next"> variable?

    Print
      = (caseInsensitive<"print"> | "?") PrintArgs (";")?
    
    PrintArgs
      = PrintArg (("," | ";") PrintArg)*

    PrintArg
      = Exp
      | string

    Comparison
      = caseInsensitive<"if"> Exp caseInsensitive<"then"> Statements (caseInsensitive<"else"> Statements)?

    Exp
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

    /*
    CpmOp = "=" | "<>" | "<" | "<=" | ">" | ">="

    CmpExp
      = CmpExp CpmOp AddExp  -- cmp
      | AddExp
    */

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
      = "(" Exp ")"  -- paren
      | "+" PriExp   -- pos
      | "-" PriExp   -- neg
      | ident
      | number

    ident  (an identifier)
      = letter alnum*

    variable = ident

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

    string = "\\"" ("\\\\\\"" | (~"\\"" any))* "\\""

    space := " " | "\t"
    comment = ("\\'" | "rem") (~eol any)*
    eol (end of line)
        = "\\n"
    }
  `
};
