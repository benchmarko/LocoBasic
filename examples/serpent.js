/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM serpent - Serpent
REM based on Serpent by T Magee, Amstrad Action, 1987
REM
MODE 2
ORIGIN 320,200
FOR a=0 TO 13.5 STEP 0.1
  CLS
  FOR b=MAX(a-2,0) TO a STEP 0.1
    MOVE 220*SIN(b/2),98*COS(b):DRAW 200*COS(b/2),198*SIN(b)
  NEXT
  FRAME
NEXT
END
`);
