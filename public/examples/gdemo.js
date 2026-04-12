/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM gdemo - Graphics Demo
REM Known from CPC CP/M Disk
REM Extended for different modes with more colors
FOR i=0 TO 15: READ n:INK i,n:NEXT
DATA 0,24,6,2, 20, 6, 26, 2, 8, 10, 12, 14, 16, 18, 22, 24, 11
'
FOR m=0 TO 3
  IF m<>2 THEN GOSUB 1500
NEXT m
STOP
'
1500 MODE m
ORIGIN 320,200
pens=4^(2-m MOD 3)+ABS(m=2)
n0=0
t1=TIME+50*6*2
WHILE TIME<t1 AND INKEY$=""
  n=n0
  CLS
  GOSUB 1600
  n0=(n0+1) MOD (pens-1)
  t=TIME+50:WHILE TIME<t:FRAME:WEND
WEND
RETURN
'
'draw graphics
1600 FOR a=0 TO 4*PI STEP PI/60
  MOVE 320*SIN(a/2),198*COS(a)
  DRAW 200*COS(a/2),198*SIN(a),n+1
  n=(n+1) MOD (pens-1)
NEXT
RETURN
`);
