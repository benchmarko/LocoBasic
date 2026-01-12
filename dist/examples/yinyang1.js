/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM yinyang1 - Yin and yang
REM https://rosettacode.org/wiki/Yin_and_yang#Locomotive_Basic
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM modifications: removed DEFINT, BORDER, FILL, wait loop; draw horizontal lines to fill
m=2
MODE m:DEG
INK 0,26:INK 1,0
lbasic=&8000>0: 'fast hack to detect LocoBasic
IF lbasic OR m=3 THEN yd=1 ELSE yd=2
xp=320:yp=200:size=150:GOSUB 100: 'large yinyang
xp=550:yp=350:size=40:GOSUB 100: 'small yinyang
END
'
100 ORIGIN xp,yp
cr=size:cr2=size/2
GOSUB 1000: 'filled right half of yinyang
GOSUB 1500: 'continue with left half circle
ORIGIN xp,yp+cr2
cr=size/8
GOSUB 2000: 'upper small circle
GRAPHICS PEN 0
ORIGIN xp,yp-cr2
GOSUB 2000: 'lower filled small circle (background color)
GRAPHICS PEN 1
RETURN
'
' Draw filled right half of Yin-Yang
1000 FOR y=0 TO cr-1 STEP yd
  dx=SQR(cr^2-y^2)
  dx2=SQR(cr2^2-(y-cr2)^2)
  MOVE -dx2,-y: DRAW dx,-y 'lower half
  MOVE dx2,y: DRAW dx,y 'upper half
NEXT
RETURN
'
' Draw left half circle (no MOVE)
1500 FOR i=360 TO 180 STEP -10
  DRAW cr*SIN(i),cr*COS(i)
NEXT
RETURN
'
' Draw a filled circle
2000 FOR y=0 TO cr STEP yd
  dx=SQR(cr^2-y^2)
  MOVE -dx,-y: DRAW dx,-y 'lower half
  MOVE -dx,y: DRAW dx,y 'upper half
NEXT
RETURN
`);
