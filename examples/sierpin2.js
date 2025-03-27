/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM sierpin2 - Sierpinski triangle (graphical)
DIM cx(5),cy(5),r(5),lc(5)
cx(1)=320:cy(1)=140
r(1)=75:r(2)=40:r(3)=20:r(4)=12:r(5)=8
'
sa=120
st=1
MODE 1
INK 0,13:INK 1,2:INK 2,6:INK 3,18
GOSUB 1900
STOP
'
'draw circle plus 3,4 or 6 around it
1900 cx1=cx(st):cy1=cy(st):lc(st)=0
rst=r(st)
FOR x=1 TO rst
  'draw frame
  MOVE cx1,cy1
  DRAWR rst*SIN(x*360*PI/(rst*180)),r(st)*COS(x*360*PI/(rst*180)),1+(st MOD 3)
  DRAW cx1+rst*SIN((x+1)*360*PI/(rst*180)),cy1+rst*COS((x+1)*360*PI/(rst*180))
NEXT x
IF st=5 THEN RETURN
lc(st)=0
start=1
WHILE (lc(st) MOD 360)<>0 OR start=1
  start=0
  cx(st+1)=cx(st)+1.7*r(st)*SIN((sa+lc(st))*PI/180)
  cy(st+1)=cy(st)+1.7*r(st)*COS((sa+lc(st))*PI/180)
  st=st+1
  GOSUB 1900:'recursive
  st=st-1
  lc(st)=lc(st)+2*sa
WEND
RETURN
`);
