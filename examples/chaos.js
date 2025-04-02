/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM chaos - Chaos game
REM https://rosettacode.org/wiki/Chaos_game#Locomotive_Basic
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM modifications: removed RANDOMIZE, DEFINT, ON ... GOTO; added INK
MODE 1:'randomize time:defint a-z
INK 0,1
x=640*RND
y=400*RND
FOR i=1 TO 20000
  v=ROUND(RND*2+1)
  IF v=1 THEN x=x/2:y=y/2 ELSE IF v=2 THEN x=320+(320-x)/2:y=400-(400-y)/2 ELSE x=640-(640-x)/2:y=y/2
  PLOT x,y,v
NEXT i
`);
