/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM dragon - Dragon curve
REM Based on: https://rosettacode.org/wiki/Dragon_curve#Commodore_BASIC
MODE 2
DIM s(7),c(7)
qpi=ATN(1):sq2=SQR(2)
FOR i=0 TO 7
s(i)=SIN(i*qpi)
c(i)=COS(i*qpi)
NEXT
level=15
insize=128
x=98:y=68
rotqpi=0:rq=1
DIM r(level)
GOSUB 1000
END
'
' Dragon routine
1000 rotqpi=rotqpi AND 7
IF level=1 THEN GOSUB 2000:RETURN
insize=insize*sq2/2
rotqpi=(rotqpi+rq) AND 7
level=level-1
r(level)=rq:rq=1
GOSUB 1000
rotqpi=(rotqpi-r(level)*2) AND 7
rq=-1
GOSUB 1000
rq=r(level)
rotqpi=(rotqpi+rq) AND 7
level=level+1
insize=insize*sq2
RETURN
'
' Draw segment
2000 xn=c(rotqpi)*insize+x
yn=s(rotqpi)*insize+y
MOVE x,y:DRAW xn,yn
x=xn:y=yn
RETURN
`);
