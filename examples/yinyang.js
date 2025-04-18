/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM yinyang - Yin and yang
REM https://rosettacode.org/wiki/Yin_and_yang#Locomotive_Basic
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM modifications: removed DEFINT, BORDER, FILL, wait loop
REM TODO: fill
MODE 2:DEG:'defint a-z
INK 0,26:INK 1,0 ':border 26
xp=320:yp=200:size=150:GOSUB 100
xp=550:yp=350:size=40:GOSUB 100
'WHILE INKEY$="":WEND
END
'
100 cx=xp:cy=yp:cr=size:GOSUB 1000
cy=yp+size/2:cr=size/8:GOSUB 1000
cr=size/2:half=0:GOSUB 2000
cy=yp-size/2:cr=size/8:GOSUB 1000
cr=size/2:half=1:GOSUB 2000
MOVE xp, yp+size/2 ':fill 1
MOVE xp+size/2, yp ':fill 1
RETURN
'
1000 PLOT cx,cy+cr
FOR i=0 TO 360 STEP 10
DRAW cx+cr*SIN(i),cy+cr*COS(i)
NEXT
RETURN
'
2000 p=180*half
PLOT cx+cr*SIN(p),cy+cr*COS(p)
FOR i=p TO p+180 STEP 10
DRAW cx+cr*SIN(i),cy+cr*COS(i)
NEXT
RETURN
`);
