/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM colorbar - Colour bars (Display)
REM https://rosettacode.org/wiki/Colour_bars/Display#Locomotive_Basic
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM modifications: removed BORDER, ORIGIN, CALL; use DRAWR, MOVER
MODE 0
FOR x=0 TO 15
  FOR z=0 TO 39 STEP 4:DRAWR 0,400,x:MOVER 4,-400:NEXT z
NEXT x
`);
