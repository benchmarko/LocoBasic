/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM drawsp2 - Draw a sphere (graphical)
REM https://rosettacode.org/wiki/Draw_a_sphere#Locomotive_Basic
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM modifications: -
MODE 2:ORIGIN 320,200:INK 0,0:INK 1,26
DIM v(2),vec(2)
v(0)=30:v(1)=30:v(2)=-50
lung=SQR(v(0)*v(0)+v(1)*v(1)+v(2)*v(2))
v(0)=v(0)/lung
v(1)=v(1)/lung
v(2)=v(2)/lung
r=180:k=1.5:ambient=0.03
FOR i=INT(-r) TO INT(r)
x=i
FOR j=INT(-2*r) TO INT(2*r)
y=j/2
IF (x*x+y*y<=r*r) THEN GOSUB 1000
NEXT j
NEXT i
END
1000 vec(0)=x
vec(1)=y
vec(2)=SQR(r*r-x*x-y*y)
GOSUB 2000
GOSUB 3000
b=(d^k+ambient)/(1+ambient)
IF b>RND THEN PLOT x,-y
RETURN
2000 lung=SQR(vec(0)*vec(0)+vec(1)*vec(1)+vec(2)*vec(2))
vec(0)=vec(0)/lung
vec(1)=vec(1)/lung
vec(2)=vec(2)/lung
RETURN
3000 d=v(0)*vec(0)+v(1)*vec(1)+v(2)*vec(2)
IF d<0 THEN d=-d ELSE d=0
RETURN
`);
