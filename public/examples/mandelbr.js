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
maxiter = 100
xScale = 1 / 213 : yScale = 1 / 200
FOR yp = 0 TO 399
  y0 = yp * yScale - 1
  MOVE 0, yp, 0: cs = 0
  FOR xp = 0 TO 639
    x0 = xp * xScale - 2
    iter = 0: x = 0: y = 0: x2 = 0: y2 = 0
    WHILE x2 + y2 <= 4 AND iter < maxiter
      y = 2 * x * y + y0
      x = x2 - y2 + x0
      x2 = x * x: y2 = y * y
      iter = iter + 1
    WEND
    IF iter < maxiter THEN c = iter MOD 16 ELSE c = 0
    IF c <> cs THEN DRAW xp, yp, cs: cs = c
  NEXT
  DRAW xp, yp, c
NEXT
't=TIME-t:?ROUND(t*10/3,3)
`);
