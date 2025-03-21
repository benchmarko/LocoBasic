/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM barnsley - Barnsley fern
REM https://rosettacode.org/wiki/Barnsley_fern#Locomotive_Basic
MODE 2:INK 0,0:INK 1,18:'randomize time
scale=38
maxpoints=20000:x=0:y=0
FOR z=1 TO maxpoints
p=RND*100
IF p<=1 THEN nx=0:ny=0.16*y ELSE IF p<=8 THEN nx=0.2*x-0.26*y:ny=0.23*x+0.22*y+1.6 ELSE IF p<=15 THEN nx=-0.15*x+0.28*y:ny=0.26*x+0.24*y+0.44 ELSE nx=0.85*x+0.04*y:ny=-0.04*x+0.85*y+1.6
x=nx:y=ny
PLOT scale*x+320,scale*y
NEXT
`);
