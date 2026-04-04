/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM langtons - Langton's ant
REM https://rosettacode.org/wiki/Langton%27s_ant#Locomotive_Basic
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM modificatons: removed DEFINT, GOTO
MODE 1:'defint a-z
DEG
INK 1,0:INK 0,26
x=50:y=50:ang=270
DIM play(100,100)
GRAPHICS PEN 3:MOVE 220,100:DRAWR 200,0:DRAWR 0,200:DRAWR -200,0:DRAWR 0,-200
' move ant
WHILE 1
  IF play(x,y) THEN ang=ang-90 ELSE ang=ang+90
  play(x,y)=1-play(x,y)
  PLOT 220+2*x,100+2*y,play(x,y)
  ang=ang MOD 360
  x=x+SIN(ang)
  y=y+COS(ang)
  IF x<1 OR x>100 OR y<1 OR y>100 THEN END
WEND
`);
