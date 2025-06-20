/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
rem rayclip - Ray Eclipse
rem (c) Alan Scully
rem https://www.cpcwiki.eu/forum/programming/basic-files/ (BASIC02.DSK)
rem Modifications: redraw for every animation step
rem
rem RAY ECLIPSE: ALAN SCULLY for SCULL PD LIBRARY 119 Laurel Drive East Kilbride G75 9JG
DEG
MODE 0
INK 14,0:INK 0,0
GOSUB 500
'
s=50
WHILE s>0
  D=d MOD 13+1
  FOR E=1 TO 13
    INK E,COL((D+E)MOD 13)
  NEXT
  CLS
  GOSUB 400
  t=TIME+12:WHILE TIME<t:FRAME:WEND
  s=s-1
WEND
END
'
400 ORIGIN 320,50
FOR m=60 TO 300 STEP 0.5
  a=SIN(m):b=-COS(m)
  MOVE 100*a,100*b
  x=XPOS:y=YPOS
  c=m MOD 13+1
  DRAW 600*a,600*b,c
  x2=XPOS:y2=YPOS
  MOVER 4,0:DRAW x+4,y
  MOVE x,y-2:DRAW x2,y2-2
NEXT m
RETURN
'
' SET UP COLOURS
500 DIM col(14)
FOR a=0 TO 14
  READ col(a)
  INK a+1,col(a)
NEXT
RETURN
DATA 3,9,11,15,21,24,23,22,19,12,10,4,1,7,8      
`);
