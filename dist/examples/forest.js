/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM forest - Forest fire
REM https://rosettacode.org/wiki/Forest_fire#Locomotive_Basic
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM modifications: delay loop; cls; removed GOTO
MODE 1:INK 0,0:INK 1,9:INK 2,15
pfire=0.00002:ptree=0.002
dimx=90:dimy=90
DIM forest(dimx,dimy),forest2(dimx,dimy)
'
' Initialize forest
FOR y=1 TO dimy-1
  FOR x=1 TO dimx-1
    IF RND<0.5 THEN forest(x,y)=1
  NEXT
NEXT
GOSUB 1000
'
' Simulation loop
tend=TIME+300*5
WHILE TIME<tend
  FOR y=1 TO dimy-1
    FOR x=1 TO dimx-1
      ON forest(x,y)+1 GOSUB 500,600,700
    NEXT
  NEXT
  ' Copy new state to forest
  FOR y=1 TO dimy-1
    FOR x=1 TO dimx-1
      forest(x,y)=forest2(x,y)
    NEXT
  NEXT
  GOSUB 1000
WEND
END
'
' Empty cell
500 IF RND<ptree THEN forest2(x,y)=1
RETURN
'
' Tree cell
600 IF RND<pfire THEN forest2(x,y)=2:RETURN
FOR yy=y-1 TO y+1
  FOR xx=x-1 TO x+1
    IF forest(xx,yy)=2 THEN forest2(x,y)=2:RETURN
  NEXT
NEXT
forest2(x,y)=1
RETURN
'
' Burning cell
700 forest2(x,y)=0
RETURN
'
' Draw forest
1000 CLS
FOR y=1 TO dimy-1
  FOR x=1 TO dimx-1
    PLOT 4*x,4*y,forest(x,y)
  NEXT
NEXT
t=TIME+30:WHILE TIME<t:FRAME:WEND
RETURN
`);
