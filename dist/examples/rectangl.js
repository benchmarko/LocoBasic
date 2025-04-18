/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM rectangl - Rectangles Test
REM Marco Vieth, 2019
FOR m=0 TO 3
  t=TIME+300
  GOSUB 290
  FRAME:WHILE TIME<t AND INKEY$="":WEND
NEXT
END
'
290 'draw rectangle
MODE m
xd=2^(2-MIN(m,2)):yd=((m=3)+2)
cols=80/xd:rows=50/yd
pens=4^(2-m MOD 3)+ABS(m=2)
indent$=SPACE$(7)
PRINT indent$;"Mode: ";m
PRINT indent$;"Cols:";cols
PRINT indent$;"Rows:";rows
PRINT indent$;"Res.:";cols*8;"x";STR$(rows*8)
PRINT indent$;"Pens:";pens
PRINT
FOR i=0 TO 48 STEP xd
  GRAPHICS PEN ROUND(((i + 1) / 2)) MOD pens
  MOVE 0+i,0+i
  DRAW 639-i,0+i
  DRAW 639-i,399-i
  DRAW 0+i,399-i
  DRAW 0+i,0+i
NEXT i
RETURN
`);
