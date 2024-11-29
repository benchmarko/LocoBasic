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
    Exp
      = AddExp

    AddExp
      = AddExp "+" MulExp  -- plus
      | AddExp "-" MulExp  -- minus
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

    number  (a number)
      = digit* "." digit+  -- fract
      | digit+             -- whole
    }
  `
};
