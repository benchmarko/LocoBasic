/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM drawsp1 - Draw a sphere (ASCII)
REM https://rosettacode.org/wiki/Draw_a_sphere#Locomotive_Basic
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM modifications: replaced intensity% by intensity
MODE 2:s$=".:!*oe&#%@"
DIM v(2),vec(2)
v(0)=30:v(1)=30:v(2)=-50
lung=SQR(v(0)*v(0)+v(1)*v(1)+v(2)*v(2))
v(0)=v(0)/lung
v(1)=v(1)/lung
v(2)=v(2)/lung
r=10:k=2:ambient=0.4
FOR i=INT(-r) TO INT(r)
  x=i+0.5
  FOR j=INT(-2*r) TO INT(2*r)
    y=j/2+0.5
    IF (x*x+y*y<=r*r) THEN GOSUB 1000 ELSE PRINT " ";
  NEXT j
  PRINT
NEXT i
END
'
1000 vec(0)=x
vec(1)=y
vec(2)=SQR(r*r-x*x-y*y)
GOSUB 2000
GOSUB 3000
b=d^k+ambient
intensity=(1-b)*(LEN(s$)-1)
IF (intensity<0) THEN intensity=0
IF (intensity>LEN(s$)-1) THEN intensity=LEN(s$)-2
PRINT MID$(s$,intensity+1,1);
RETURN
'
2000 lung=SQR(vec(0)*vec(0)+vec(1)*vec(1)+vec(2)*vec(2))
vec(0)=vec(0)/lung
vec(1)=vec(1)/lung
vec(2)=vec(2)/lung
RETURN
'
3000 d=v(0)*vec(0)+v(1)*vec(1)+v(2)*vec(2)
IF d<0 THEN d=-d ELSE d=0
RETURN
`);
