/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM serpent2 - Serpent 2 (optimized)
REM based on Serpent by T Magee, Amstrad Action, 1987
REM serpent with ring buffer for lines
MODE 2
ORIGIN 320,200
DIM x(20), y(20), x2(20), y2(20)
lp = 21
p = 0 'curent position in ring buffer
fi = 0 'filled positions in ring buffer
FOR a=0 TO 13.5 STEP 0.1
  x(p) = 220*SIN(a/2)
  y(p) = 98*COS(a)
  x2(p) = 200*COS(a/2)
  y2(p) = 198*SIN(a)
  CLS
  FOR i=p+1 TO fi
    MOVE x(i), y(i): DRAW x2(i), y2(i)
  NEXT
  FOR i=0 TO p
    MOVE x(i), y(i): DRAW x2(i), y2(i)
  NEXT
  FRAME
  p = (p+1) MOD lp
  IF fi < lp-1 THEN fi = fi + 1
NEXT
END
'
' alternative: using one draw loop with modular arithmetic
' FOR i=0 TO fi
'   idx = (p + 1 + i) MOD lp
'   MOVE x(idx), y(idx): DRAW x2(idx), y2(idx)
' NEXT
'
`);
