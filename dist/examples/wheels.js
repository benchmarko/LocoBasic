/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM rotate - Rotating Wheels
REM (c) Andrew Price
REM https://www.cpcwiki.eu/forum/programming/basic-files/#msg192678 (BASIC02.DSK)
REM Modifications: redraw for every animation step;
' Rotating Wheels by Andrew Price
' DRAWING SPEEDED UP BY DINO FOR          SCULL PD LIBRARY
INK 0,0:INK 1,26
MODE 0:p=1
'PEN 1:PAPER 0:BORDER 0:FOR i=2 TO 14:INK i,i:NEXT i
'LOCATE 3,1:PRINT"WATCH THE WHEELS"
DEG
DIM s(360),c(360)
FOR m=0 TO 360:s(m)=SIN(m):c(m)=COS(m):NEXT
'
FOR j=1 TO 8
FOR i=2 TO 14
'INK i,0:FRAME:INK i,26:NEXT i
CLS
'conveyor left
FOR x=0 TO 320 STEP 2
p=p+1:IF p=15 THEN p=2
MOVE x,0,(p=i)+1:DRAW x,50
NEXT
'conveyor right
FOR x=640 TO 320 STEP -2
p=p+1:IF p=15 THEN p=2
MOVE x,0,(p=i)+1:DRAW x,50
NEXT
'bottom circle left
'MOVE 100,150
FOR a=0 TO 360
p=p+1:IF p=15 THEN p=2
PLOT 100+100*C(a),150+100*S(a),(p=i)+1
NEXT a
'bottom circle right
'MOVE 538,150
FOR a=360 TO 0 STEP -1
p=p+1:IF p=15 THEN p=2
PLOT 538+100*C(a),150+100*S(a),(p=i)+1
NEXT a
'top circle left
'MOVE 100,300
FOR a=360 TO 0 STEP -1
p=p+1:IF p=15 THEN p=2
PLOT 100+50*C(a),300+50*S(a),(p=i)+1
NEXT a
'top circle right
'MOVE 538,300
FOR a=0 TO 360
p=p+1:IF p=15 THEN p=2
PLOT 538+50*C(a),300+50*S(a),(p=i)+1
NEXT a
t=TIME+50:WHILE TIME<t:FRAME:WEND
NEXT i
NEXT j
'
'10 ' Rotating Wheels by Andrew Price
'11 ' DRAWING SPEEDED UP BY DINO FOR          SCULL PD LIBRARY
'20 MODE 0:p=1:PEN 1:INK 0,0:PAPER 0:BORDER 0:FOR i=2 TO 14:INK i,i:NEXT i:LOCATE 3,1:PRINT"WATCH THE WHEELS"
'21 DEG:DIM s(360),c(360):FOR m=0 TO 360:s(m)=SIN(m):c(m)=COS(m):NEXT
'30 FOR x=0 TO 320 STEP 2:p=p+1:IF p=15 THEN p=2
'40 PLOT x,0,p:DRAW x,50,p:NEXT:FOR x=640 TO 320 STEP-2:p=p+1:IF p=15 THEN p=2
'50 PLOT x,0,p:DRAW x,50,p:NEXT:MOVE 100,150:DEG:FOR a=0 TO 360:p=p+1:IF p=15 THEN p=2
'60 PLOT 100+100*C(a),150+100*S(a),p:NEXT a:MOVE 538,150:DEG:FOR a=360 TO 0 STEP-1:p=p+1:IF p=15 THEN p=2
'70 PLOT 538+100*C(a),150+100*S(a),p:NEXT a:MOVE 100,300:DEG:FOR a=360 TO 0 STEP-1:p=p+1:IF p=15 THEN p=2
'80 PLOT 100+50*C(a),300+50*S(a),p:NEXT a:MOVE 538,300:DEG:FOR a=0 TO 360:p=p+1:IF p=15 THEN p=2
'90 PLOT 538+50*C(a),300+50*S(a),p:NEXT a
'100 FOR i=2 TO 14:INK i,0:CALL &BD19:INK i,26:NEXT i:GOTO 100
'
`);
