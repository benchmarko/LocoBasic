/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM barnsley - Barnsley fern
REM https://rosettacode.org/wiki/Barnsley_fern#Locomotive_Basic
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM modifications: removed RANDOMIZE and GOTO; animation
MODE 2
ORIGIN 320,0
FOR scale=28 TO 58 STEP 10
GOSUB 400
t=TIME+250:WHILE TIME<t AND INKEY$="":WEND
NEXT
FOR scale=48 TO 38 STEP -10
GOSUB 400
t=TIME+250:WHILE TIME<t AND INKEY$="":WEND
NEXT
END
'
' compute and draw fern
400 CLS
INK 0,0:INK 1,18
maxpoints=20000:x=0:y=0
FOR z=1 TO maxpoints
p=RND*100
IF p<=1 THEN nx=0:ny=0.16*y ELSE IF p<=8 THEN nx=0.2*x-0.26*y:ny=0.23*x+0.22*y+1.6 ELSE IF p<=15 THEN nx=-0.15*x+0.28*y:ny=0.26*x+0.24*y+0.44 ELSE nx=0.85*x+0.04*y:ny=-0.04*x+0.85*y+1.6
x=nx:y=ny
PLOT scale*x,scale*y
NEXT
RETURN
`);
