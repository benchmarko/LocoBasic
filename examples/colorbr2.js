/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM colorbr2 - Colour Bars 2 (RSX)
REM
MODE 0
p=0
FOR x=0 TO 600 step 40
  GRAPHICS PEN p
  |RECT,x,0,x+36,399,p
  p=p+1
NEXT
`);
