/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM juliaset - Julia set
REM https://rosettacode.org/wiki/Julia_set#Locomotive_Basic
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM modifications: -
MODE 3
FOR xp = 0 TO 639
  FOR yp = 0 TO 399
    x0 = -0.5125114983878472 : y0 = 0.5212955730948472
    x = xp / 213 - 1.5 : y = yp / 200 - 1
    iteration = 0
    maxiteration = 100
    WHILE (x * x + y * y <= (2 * 2) AND iteration < maxiteration)
      xtemp = x * x - y * y + x0
      y = 2 * x * y + y0
      x = xtemp
      iteration = iteration + 1
    WEND
    IF iteration <> maxiteration THEN c = iteration ELSE c = 0
    PLOT xp, yp, c MOD 16
  NEXT
NEXT
`);
