/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM sphere - Sphere 1
REM
'
DEG
r=180
wy=0:wz=0
INK 0,0:INK 1,24:INK 3,6
'
FOR m=0 TO 3
  i$=""
  pens=4^(2-m MOD 3)+ABS(m=2)
  MODE m
  ORIGIN 320,200
  FOR wx=80 TO 0 STEP -10:GOSUB 600:NEXT:wx=0
  t=TIME+100:WHILE TIME<t AND i$="":i$=INKEY$:WEND
  FOR wy=0 TO 40 STEP 10:GOSUB 600:NEXT
  FOR wy=40 TO 0 STEP -10:GOSUB 600:NEXT:wy=0
  FOR wx=0 TO 80 STEP 10:GOSUB 600:NEXT
  t=TIME+300:WHILE TIME<t AND i$="":i$=INKEY$:WEND
NEXT
END
'
600 cx=COS(wx): sx=SIN(wx)
cy=COS(wy): sy=SIN(wy)
cz=COS(wz): sz=SIN(wz)
CLS
' longitude (fix a, vary h)
GRAPHICS PEN 1
FOR a=0 TO 360 STEP 15
  FOR h=-90 TO 90 STEP 15
    GOSUB 800
    IF h=-90 THEN MOVE bx,by ELSE DRAW bx,by
  NEXT h
NEXT a
'
' latitude (fix h, vary a)
GRAPHICS PEN 3 MOD pens
FOR h=-90 TO 90 STEP 15
  FOR a=0 TO 360 STEP 15
    GOSUB 800
    IF a=0 THEN MOVE bx,by ELSE DRAW bx,by
  NEXT a
NEXT h
t=TIME+50:WHILE TIME<t AND i$="":i$=INKEY$:WEND
RETURN
'
' calculate 3D coordinates of a point on the sphere and project to 2D
800 x=COS(h)*COS(a)
y=COS(h)*SIN(a)
z=SIN(h)
'--- rotate around X
y1 = y*cx - z*sx
z1 = y*sx + z*cx
'--- rotate around Y
x2 = x*cy - z1*sy
z2 = -x*sy + z1*cy
'--- rotate around Z
x3 = x2*cz - y1*sz
y3 = x2*sz + y1*cz
'd = 1.3
bx = r*x3: '/(z2+d)
by = r*y3: '/(z2+d)
RETURN
`);
