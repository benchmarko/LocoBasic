export const arithmetic = {
 grammar :
  `
    Arithmetic {
      Exp = AddExp
      AddExp = AddExp "+" MulExp  -- plus
             | AddExp "-" MulExp  -- minus
             | MulExp
      MulExp = MulExp "*" PriExp  -- times
             | MulExp "/" PriExp  -- divide
             | PriExp
      PriExp = "(" Exp ")"        -- paren
             | number
      number = digit+
    }
  `
};
