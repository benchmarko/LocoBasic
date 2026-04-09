/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM yinyang0 - Yin and yang (textual)
REM https://rosettacode.org/wiki/Yin_and_yang#Lua (converted from Lua)
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM
MODE 2
DEF FNcircle(c, r)=(r * r) >= (x * x) / 4 + ((y - c) * (y - c))
'
r=11
FOR y=-r TO r
  FOR x=-2*r TO 2*r
    p$=" "
    IF FNcircle(-r/2,r/6) THEN p$="#" ELSE IF FNcircle(r/2,r/6) THEN p$="." ELSE IF FNcircle(-r/2,r/2) THEN p$="." ELSE IF FNcircle(r/2,r/2) THEN p$="#" ELSE IF FNcircle(0,r) THEN IF x < 0 THEN p$="." ELSE p$="#"
    PRINT p$;
  NEXT
  PRINT
NEXT
`);
