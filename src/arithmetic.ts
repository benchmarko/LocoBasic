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
      = Line*

    Line
      = Statement (":" Statement)? comment? (eol | end)

    Statement
     = Assign
     | Print

    Assign
      = ident "=" Exp
      | ident "=" string

    Print
      = ("print" | "?") PrintArg
      
    PrintArg = Exp
      | string

    Exp
      = XorExp

    XorExp
      = OrExp "xor" XorExp  -- xor
      | OrExp

    OrExp
      = AndExp "or" OrExp  -- or
      | AndExp

    AndExp
      = NotExp "and" AndExp  -- and
      | NotExp    

    NotExp
      = "not" NotExp  -- not
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
      = ModExp "mod" DivExp -- mod
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

    binaryDigit = "0".."1"

    decimalValue  (decimal number)
      = digit* "." digit+  -- fract
      | digit+             -- whole

    hexValue
      = "&" hexDigit+

    binaryValue
      = "&x" binaryDigit+

    number  (a number)
      = decimalValue
      | hexValue
      | binaryValue

    string = "\\"" ("\\\\\\"" | (~"\\"" any))* "\\""

    comment = ("\\'" | "rem") (~eol any)*
    eol (end of line)
        = "\\n"
    }
  `
};
