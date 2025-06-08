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
x=7*8:y=399-7*8
TAG
MOVE x,y-0 :PRINT "Mode";STR$(m);
MOVE x,y-16:PRINT "Cols";STR$(cols);
MOVE x,y-32:PRINT "Rows";STR$(rows);
MOVE x,y-48:PRINT "Res.";cols*8;"x";STR$(rows*8);
MOVE x,y-64:PRINT "Pens";STR$(pens);
TAGOFF
FOR i=0 TO 48 STEP xd
  MOVE 0+i,0+i,ROUND(((i + 1) / 2)) MOD pens
  DRAW 639-i,0+i
  DRAW 639-i,399-i
  DRAW 0+i,399-i
  DRAW 0+i,0+i
NEXT i
RETURN
`);
