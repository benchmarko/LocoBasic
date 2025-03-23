/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM abelian - Abelian sandpile model (ASCII)
REM https://rosettacode.org/wiki/Abelian_sandpile_model#Locomotive_Basic
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM modifications: removed DEFINT, GOTO; added textual output, different sizes
MODE 1: 'DEFINT a-z
'INK 0,0
INK 1,18:INK 2,8:INK 3,24
FOR rows = 5 TO 25 STEP 5
  cols = rows
  height=4*cols*rows + rows
  t0=TIME
  DIM grid(cols,rows)
  GOSUB 200 'calculate
  t=TIME-t0
  CLS
  PRINT "height";height;", cols=";cols;", rows=";rows;", time=";ROUND(t*10/3,3)
  PRINT
  GOSUB 600 'textual output
  FRAME:t=t0+300:WHILE TIME<t AND INKEY$="":FRAME:WEND
NEXT rows
END
'
' calculate
200 grid(ROUND(cols/2),ROUND(rows/2))=height
moretodo=1
WHILE moretodo
  moretodo=0
  FOR x=1 TO cols
    FOR y=1 TO rows
      IF grid(x,y)>=4 THEN moretodo=1: GOSUB 500
    NEXT
  NEXT
WEND
RETURN
'
' cell overspill
500 overspill=INT(grid(x,y)/4)
grid(x,y)=grid(x,y) MOD 4
IF x>1 THEN grid(x-1,y)=grid(x-1,y)+overspill
IF y>1 THEN grid(x,y-1)=grid(x,y-1)+overspill
IF x<cols THEN grid(x+1,y)=grid(x+1,y)+overspill
IF y<rows THEN grid(x,y+1)=grid(x,y+1)+overspill
RETURN
'
' textual output
600 FOR y=1 TO rows
  FOR x=1 TO cols
    PEN grid(x,y)
    PRINT CHR$(48+grid(x,y));
  NEXT
  PRINT
NEXT
PEN 1
RETURN
`);
