/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM yinyang2 - Yin and yang (RSX)
REM https://rosettacode.org/wiki/Yin_and_yang#Locomotive_Basic
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM modifications: removed DEFINT, BORDER, FILL, wait loop; use |CIRCLE, |ARC
MODE 2:DEG
INK 0,26:INK 1,0
xp=320:yp=200:cr=150:GOSUB 100: 'large yinyang
xp=550:yp=350:cr=40:GOSUB 100: 'small yinyang
END
'
100 cr2=cr/2
|ARC,xp,yp+cr,cr,cr,0,0,0,xp,yp-cr,0 :'left semi circle
|ARC,xp,yp+cr,cr,cr,0,0,1,xp,yp-cr,5 :'right black semi circle
|ARC,xp,yp+cr,cr2,cr2,0,0,1,xp,yp,0 :'half white semi circle
|ARC,xp,yp-cr,cr2,cr2,0,0,1,xp,yp,5 :'half black semi circle
cr8=cr/8
|CIRCLE,xp,yp+cr2,cr8,5: 'upper black small circle
GRAPHICS PEN 0
|CIRCLE,xp,yp-cr2,cr8,0: 'lower white small circle
GRAPHICS PEN 1
RETURN
`);
