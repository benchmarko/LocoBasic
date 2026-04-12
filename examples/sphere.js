/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM sphere - Sphere 1
REM
'
DEG
w1=10:w2=0:w3=80:r=180
INK 0,0:INK 1,24:INK 3,6
'
FOR m=0 TO 3
  GOSUB 160
NEXT
END
'
160 MODE m
ORIGIN 320,200
pens=4^(2-m MOD 3)+ABS(m=2)
'Longitude lines
GRAPHICS PEN 1
FOR a=0 TO 180 STEP 15
FOR h=0 TO 360 STEP 15
GOSUB 390
IF h=0 THEN MOVE bx,by ELSE DRAW bx,by
NEXT h
NEXT a
'Latitude lines
GRAPHICS PEN 3 MOD pens
FOR h=-90 TO 90 STEP 15
FOR a=0 TO 360 STEP 15
GOSUB 390
IF a=0 THEN MOVE bx,by ELSE DRAW bx,by
NEXT a
NEXT h
t=TIME+300:WHILE TIME<t AND INKEY$="":WEND
RETURN
'
'Rotation Matrix
390 x=COS(h)*COS(a)
y=COS(h)*SIN(a)
z=SIN(h)
ma[1]=COS(w2)*COS(w3)
ma[2]=-COS(w2)*SIN(w3)
ma[3]=SIN(w2)
ma[4]=COS(w1)*SIN(w3)+SIN(w1)*SIN(w2)*COS(w3)
ma[5]=COS(w1)*COS(w3)-SIN(w1)*SIN(w2)*SIN(w3)
ma[6]=-SIN(w1)*COS(w2)
ma[7]=SIN(w1)*SIN(w3)-COS(w1)*SIN(w2)*COS(w3)
ma[8]=SIN(w1)*COS(w3)+COS(w1)*SIN(w2)*SIN(w3)
ma[9]=COS(w1)*COS(w2)
xa=ma[1]*x+ma[2]*y+ma[3]*z
ya=ma[4]*x+ma[5]*y+ma[6]*z
za=ma[7]*x+ma[8]*y+ma[9]*z
bx=r*xa:by=r*za:' projection
RETURN
`);
