/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM rectangl - Rectangles Test
REM Marco Vieth, 2019
FOR m=0 TO 3
t=TIME+300
GOSUB 290
FRAME:WHILE TIME<t AND INKEY$="":FRAME:WEND
NEXT
END
'
290 'draw rectangle
MODE m
xd=2^(2-MIN(m,2)):yd=((m=3)+2)
cols=80/xd:rows=50/yd
'window (9-(m=0))/80*cols,cols-8/80*cols,rows/5.4,rows-rows/6
pens=4^(2-m MOD 3)+ABS(m=2)
PRINT "Mode: ";m
PRINT "Cols:";cols
PRINT "Rows:";rows
PRINT "Res.:";cols*8;"x";STR$(rows*8)
PRINT "Pens:";pens
PRINT
FOR i=0 TO 48 STEP 2
GRAPHICS PEN ROUND(((i + 1) / 2)) MOD 16
MOVE 0+i,0+i
DRAW 639-i,0+i
DRAW 639-i,399-i
DRAW 0+i,399-i
DRAW 0+i,0+i
NEXT i
RETURN
`);
