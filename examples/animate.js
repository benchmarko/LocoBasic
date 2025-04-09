/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM animate - Animate a pendulum (ASCII)
REM see also: https://rosettacode.org/wiki/Animate_a_pendulum#Locomotive_Basic
MODE 1
cols=40:rows=25
DIM scr$(cols,rows),smc(rows)
'
' Pendulum parameters
theta = PI/2
g = 9.81
l = 0.5
speed1 = 0
px = 20
py = 1
scale = 20 ' Scale factor for pendulum length
steps = 10 ' Number of steps for drawing the pendulum
accelFactor = 50
'
' Main loop
FOR i = 0 TO 47
  t=TIME+25
  GOSUB 1000 ' Initialize screen
  GOSUB 500  ' Compute pendulum position
  GOSUB 3000 ' Output screen
  WHILE TIME<t:FRAME:WEND
NEXT i
END
'
' Compute pendulum position
500 bx = px + l * scale * SIN(theta)
by = py - l * scale * COS(theta)
'
dx = (bx - px) / steps
dy = (by - py) / steps
FOR step1 = 0 TO steps
  x = px + step1 * dx
  y = py + step1 * dy
  rx = ROUND(x)
  ry = ROUND(y)
  scr$(rx, ry) = "."
  IF rx > smc(ry) THEN smc(ry) = rx
NEXT
'
rx = ROUND(bx)
ry = ROUND(by)
scr$(rx, ry) = "o"
IF rx > smc(ry) THEN smc(ry) = rx
accel = g * SIN(theta) / l / accelFactor
speed1 = speed1 + accel / steps
theta = theta + speed1
RETURN
'
' Initialize screen with spaces
1000 FOR y = 1 TO rows
  FOR x = 1 TO cols
    scr$(x, y) = " "
  NEXT x
  smc(y) = 0
NEXT y
RETURN
'
' Output screen
3000 CLS
FOR y = 1 TO rows
  FOR x = 1 TO smc(y)
    PRINT scr$(x,y);
  NEXT x
  PRINT
NEXT y
RETURN
`);
