/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM colorbar - Colour bars (Display)
REM https://rosettacode.org/wiki/Colour_bars/Display#Locomotive_Basic
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM modifications: removed BORDER, ORIGIN, CALL; use DRAWR, MOVER; parameter for MODE
m=0
MODE m
xd=2^(2-MIN(m,2))
FOR x=0 TO 15
  FOR z=0 TO 39 STEP xd:DRAWR 0,400,x:MOVER xd,-400:NEXT z
NEXT x
`);
