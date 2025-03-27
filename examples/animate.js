/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM animate - Animate a pendulum (ASCII)
REM see also: https://rosettacode.org/wiki/Animate_a_pendulum#Locomotive_Basic
MODE 1
cols=40:rows=25
DIM scr$(cols,rows),smc(rows)
'
theta = PI/2
g = 9.81
l = 0.5
speed1 = 0
px = 20
py = 1
'
i=0
WHILE i<48
  t=TIME+25
  GOSUB 1000 'init
  GOSUB 500 'compute
  GOSUB 3000 'output
  WHILE TIME<t:FRAME:WEND
  i=i+1
WEND
END
'
500 bx = px+l*20*SIN(theta)
by = py-l*20*COS(theta)
FOR x=px TO bx STEP (bx-px)/10
  y=py+(x-px)*(by-py)/(bx-px)
  rx=ROUND(x): ry=ROUND(y)
  scr$(rx,ry)="."
  IF rx>smc(ry) THEN smc(ry)=rx
NEXT
rx=ROUND(bx): ry=ROUND(by)
scr$(rx,ry)="o"
IF rx>smc(ry) THEN smc(ry)=rx
accel=g*SIN(theta)/l/50
speed1=speed1+accel/10
theta=theta+speed1
RETURN
'
REM Initialize scr with spaces
1000 FOR y = 1 TO rows
  FOR x = 1 TO cols
    scr$(x,y) = " "
  NEXT x
  smc(y)=0
NEXT y
RETURN
'
'REM output scr
3000 CLS
FOR y = 1 TO rows
  FOR x = 1 TO smc(y)
    PRINT scr$(x,y);
  NEXT x
  PRINT
NEXT y
RETURN
`);
