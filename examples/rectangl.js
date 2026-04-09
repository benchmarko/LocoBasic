/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM rectangl - Rectangles Test
REM Marco Vieth, 2019
INK 0,0
FOR m=0 TO 3
  GOSUB 290
  FRAME
  t=TIME+300:WHILE TIME<t AND INKEY$="":WEND
NEXT
END
'
290 MODE m
xm=2^(2-MIN(m,2)):ym=((m=3)+2)
cols=80/xm:rows=50/ym
pens=4^(2-m MOD 3)+ABS(m=2)
ytxt=2*8
x=9*8:y=399-8*8
TAG
MOVE x,y-0,1 :PRINT "Mode";STR$(m);
MOVE x,y-1*ytxt:PRINT "Cols";STR$(cols);
MOVE x,y-2*ytxt:PRINT "Rows";STR$(rows);
MOVE x,y-3*ytxt:PRINT "Res.";cols*8;"x";STR$(rows*8);
MOVE x,y-4*ytxt:PRINT "Pens";STR$(pens);
MOVE x,y-5*ytxt:PRINT "xMul";STR$(xm);
MOVE x,y-6*ytxt:PRINT "yMul";STR$(ym);
TAGOFF
FOR i=0 TO x-16 STEP 4
  p=i/4 MOD pens
  IF p>0 THEN MOVE 0+i,0+i,p:DRAW 639-i,0+i:DRAW 639-i,399-i:DRAW 0+i,399-i:DRAW 0+i,0+i
  'IF p>0 THEN GRAPHICS PEN p:|RECT,i,i,639-i,399-i 'using RECT
NEXT i
RETURN
`);
