/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM animate2 - Animate a pendulum (graphical)
REM https://rosettacode.org/wiki/Animate_a_pendulum#Locomotive_Basic
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM modifications: use CLS instead of drawing with PEN 0
MODE 1
theta=PI/2
g=9.81
l=1
sp=0:px=320:py=300:bx=px:by=py
WHILE i<180
CLS
'MOVE bx-4,by+4:GRAPHICS PEN 0:TAG:PRINT "O";:TAGOFF
'MOVE px,py:DRAW bx,by
bx=px+l*250*SIN(theta)
by=py+l*250*COS(theta)
MOVE bx-4,by+4:'GRAPHICS PEN 1
TAG:PRINT "O";:TAGOFF
MOVE px,py:DRAW bx,by
accel=g*SIN(theta)/l/100
sp=sp+accel/100
theta=theta+sp
FRAME
i=i+1
WEND
`);
