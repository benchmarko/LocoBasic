/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM nicholas - House of St. Nicholas
REM with Characters using Bresenham's Line Algorithm
REM
MODE 2
GOSUB 5000 :'read cooordinates
'
DIM house$(25,80),smc(25): 'house will grow so we do not need to init smc
'
FOR sc=0.5 TO 1 STEP 0.1
t=TIME+50
GOSUB 1000 'init
GOSUB 2000 'draw
GOSUB 3000 'print
'
WHILE TIME<t AND INKEY$="":FRAME:WEND
NEXT
END
'
REM Initialize the grid with spaces
1000 FOR y = 1 TO 25
  FOR x = 1 TO 80
    house$(y, x) = " "
  NEXT x
NEXT y
RETURN
'
REM Draw the house
2000 i=0
x0=xp(i):y0=yp(i)
FOR i = 1 TO 18
  x1=xp(i):y1=yp(i)
  GOSUB 2500 'DrawLine x0, y0, x1, y1
  x0=x1
  y0=y1
NEXT i
RETURN
'
REM Bresenham's Line Algorithm
'SUB DrawLine(x0, y0, x1, y1)
2500 dx = ABS(x1 - x0)
  dy = ABS(y1 - y0)
  sx = SGN(x1 - x0)
  sy = SGN(y1 - y0)
  err1 = dx - dy
'
  WHILE x0 <> x1 OR y0 <> y1
    'house$(y0, x0) = "*"
    y0s=ROUND(y0*sc): x0s=ROUND(x0*sc)
    house$(y0s, x0s) = "*"
    IF x0s>smc(y0s) THEN smc(y0s)=x0s 
    e2 = 2 * err1
    IF e2 > -dy THEN err1 = err1 - dy: x0 = x0 + sx
    IF e2 < dx THEN err1 = err1 + dx: y0 = y0 + sy
  WEND
RETURN
'END SUB
'
REM Print the house
3000 CLS
FOR y = 1 TO 25
  FOR x = 1 TO smc(y)
    PRINT house$(y, x);
  NEXT x
  PRINT
NEXT y
RETURN
'
REM Define the house shape using coordinates
DATA 40,2 : 'move
DATA 40,13, 35,18, 35,24, 30,24, 30,20, 25,25, 15,13, 15,2
DATA 40,13, 15,13, 40,2, 15,2
DATA 10,2, 10,7, 15,9, 5,12, 10,9, 20,11
'
REM Read the coordinates
5000 DIM xp(18),yp(18) 
FOR i = 0 TO 18 STEP 1
  READ xp(i),yp(i)
  yp(i)=25+1-yp(i)
NEXT i
RETURN
`);
