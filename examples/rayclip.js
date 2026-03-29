/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM rayclip - Ray Eclipse
REM (c) Alan Scully
REM https://www.cpcwiki.eu/forum/programming/basic-files/#msg192678 (BASIC02.DSK)
REM Modifications: redraw for every animation step; simplified for small beams
REM
REM RAY ECLIPSE: ALAN SCULLY for SCULL PD LIBRARY 119 Laurel Drive East Kilbride G75 9JG
DEG
MODE 0
INK 0,0
GOSUB 500
ORIGIN 320,50
'
s=0
WHILE s<100
  FOR e=1 TO 13
    INK e,col((s+e) MOD 13)
  NEXT
  CLS
  FOR m=60 TO 300 STEP 1
    a=SIN(m):b=-COS(m)
    MOVE 100*a,100*b
    DRAW 500*a,500*b,m MOD 13+1
  NEXT m
  t=TIME+15:WHILE TIME<t:FRAME:WEND
  s=s+1
WEND
END
'
' SET UP COLOURS
500 DIM col(12)
FOR a=0 TO 12
  READ col(a)
NEXT
RETURN
DATA 3,9,11,15,21,24,23,22,19,12,10,4,1
`);
