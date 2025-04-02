/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM mandelbr - Mandelbrot Set
REM https://rosettacode.org/wiki/Mandelbrot_set#Locomotive_Basic
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM modifications: added timing; optimized to use DRAW
REM https://en.wikipedia.org/wiki/Mandelbrot_set
MODE 3 ' Note the CPCBasic-only screen mode!
t=TIME
FOR xp = 0 TO 639
MOVE xp,0,0:cs=0
FOR yp = 0 TO 399
x = 0 : y = 0
x0 = xp / 213 - 2 : y0 = yp / 200 - 1
iteration = 0
maxIteration = 100
WHILE (x * x + y * y <= (2 * 2) AND iteration < maxIteration)
xtemp = x * x - y * y + x0
y = 2 * x * y + y0
x = xtemp
iteration = iteration + 1
WEND
IF iteration <> maxIteration THEN c = iteration ELSE c = 0
c16=c MOD 16
IF c16<>cs THEN DRAW xp,yp-1,cs:cs=c16
NEXT
IF YPOS<399 THEN DRAW xp,yp,c16
NEXT
t=TIME-t
FRAME
PRINT ROUND(t*10/3,3)
`);
