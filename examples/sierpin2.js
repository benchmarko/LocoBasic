/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM sierpin2 - Sierpinski triangle (graphical)
DIM cx(5),cy(5),r(5)
cx(1)=320:cy(1)=140
r(1)=75:r(2)=40:r(3)=20:r(4)=12:r(5)=8
DEG
MODE 1:INK 0,13:INK 1,2:INK 2,6:INK 3,18
st=1
GOSUB 1900
END
'draw filled circle with outline
1900 cx1=cx(st):cy1=cy(st)
rst=r(st)
FOR x=1 TO rst
  MOVE cx1,cy1
  DRAWR rst*SIN(x*360/rst),rst*COS(x*360/rst),1+(st MOD 3)
  DRAW cx1+rst*SIN((x+1)*360/rst),cy1+rst*COS((x+1)*360/rst)
NEXT
IF st=5 THEN RETURN
'three recursive calls
st=st+1
cx(st)=cx(st-1)
cy(st)=cy(st-1)+1.7*r(st-1)
GOSUB 1900 'top
cx(st)=cx(st-1)+1.472*r(st-1)
cy(st)=cy(st-1)-0.85*r(st-1)
GOSUB 1900 'lower right
cx(st)=cx(st-1)-1.472*r(st-1)
cy(st)=cy(st-1)-0.85*r(st-1)
GOSUB 1900 'lower left
st=st-1
RETURN
`);
