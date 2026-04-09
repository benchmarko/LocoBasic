/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM wheels - Rotating Wheels
REM (c) Andrew Price
REM https://www.cpcwiki.eu/forum/programming/basic-files/#msg192678 (BASIC02.DSK)
REM Modifications: redraw for every animation step; simplified
' Rotating Wheels by Andrew Price
' DRAWING SPEEDED UP BY DINO FOR          SCULL PD LIBRARY
INK 0,0:INK 1,26
MODE 0
'LOCATE 3,1:PRINT"WATCH THE WHEELS"
DEG
DIM s(360),c(360)
FOR m=0 TO 360:s(m)=SIN(m):c(m)=COS(m):NEXT
'
FOR i=1 TO 8*12
  GOSUB 600
NEXT i
END
'
600 CLS
'conveyor left+right
FOR x=0 TO 320 STEP 4
MOVE x,0,(((i+x) MOD 13) = 0)+1:DRAW x,50
MOVE 640-x,0,(((i+x) MOD 13) = 0)+1:DRAW 640-x,50
NEXT
'bottom circle left
MOVE 100+100,150
FOR a=360 TO 0 STEP -4
DRAW 100+100*c(a),150+100*s(a),(((i+a) MOD 13)=0)+1
NEXT a
'bottom circle right
MOVE 538-100,150
FOR a=360 TO 0 STEP -4
DRAW 538-100*c(a),150+100*s(a),(((i+a) MOD 13)=0)+1
NEXT a
'top circle left
MOVE 100-50,300
FOR a=360 TO 0 STEP -4
DRAW 100-50*c(a),300+50*s(a),(((i+a/2) MOD 13)=0)+1
NEXT a
'top circle right
MOVE 538+50,300
FOR a=360 TO 0 STEP -4
DRAW 538+50*c(a),300+50*s(a),(((i+a/2) MOD 13)=0)+1
NEXT a
t=TIME+60:WHILE TIME<t:FRAME:WEND
RETURN
`);
