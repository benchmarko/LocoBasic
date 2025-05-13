/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM mandelbr - Mandelbrot Set
REM https://rosettacode.org/wiki/Mandelbrot_set#Locomotive_Basic
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM https://en.wikipedia.org/wiki/Mandelbrot_set
REM modifications: optimized with DRAW, loop computations; swapped x and y
MODE 3
't=TIME
maxIteration = 100
xScale = 1 / 213 : yScale = 1 / 200
'
FOR yp = 0 TO 399
  MOVE 0, yp, 0:cs = 0
  FOR xp = 0 TO 639
    x = 0 : y = 0
    x0 = xp * xScale - 2 : y0 = yp * yScale - 1
    iteration = 0
    x2 = x * x: y2 = y * y
    WHILE x2 + y2 <= 4 AND iteration < maxiteration
      y = 2 * x * y + y0
      x = x2 - y2 + x0
      x2 = x * x: y2 = y * y
      iteration = iteration + 1
    WEND
    IF iteration < maxiteration THEN c = iteration ELSE c = 0
    c16 = c MOD 16
    IF c16 <> cs THEN DRAW xp - 1, yp, cs: cs = c16
  NEXT
  DRAW xp, yp, c16
NEXT
't=TIME-t:?ROUND(t*10/3,3)
`);
