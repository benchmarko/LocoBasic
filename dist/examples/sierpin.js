/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM sierpin - Sierpinski triangle
REM see also: https://en.wikipedia.org/wiki/Sierpi%C5%84ski_triangle
DEG
MODE 2
DIM cx(5),cy(5),r(5),lc(5),s$(80,25),smc(25)
cx(1)=320*80/640:cy(1)=140*25/400
r(1)=75:r(2)=40:r(3)=20:r(4)=12:r(5)=8
'
sa=120
st=1
GOSUB 800: 'init
GOSUB 1000: 'compute
GOSUB 2000: 'output
END
'
' Initialize output array
800 FOR r1=1 TO 25
  FOR c1=1 TO 79
    s$(c1,r1)=" "
  NEXT
NEXT
RETURN
'
' Compute
1000 cx1=ROUND(cx(st))
cy1=ROUND((25-cy(st)))
'lc(st)=0
s$(cx1,cy1)=CHR$(48+st)
IF cx1>smc(cy1) THEN smc(cy1)=cx1 'update max column
IF st<5 THEN GOSUB 2000:FRAME: 'intermediate output
IF st=5 THEN RETURN
lc(st)=0
start=1
WHILE (lc(st) MOD 360)<>0 OR start=1
  start=0
  cx(st+1)=cx(st)+1.7*80/640*r(st)*SIN(sa+lc(st))
  cy(st+1)=cy(st)+1.7*25/400*r(st)*COS(sa+lc(st))
  st=st+1
  GOSUB 1000 'recursive call
  st=st-1
  lc(st)=lc(st)+2*sa
WEND
RETURN
'
' Output
2000 CLS
FOR r1=1 TO 25
  FOR c1=1 TO smc(r1)
    PRINT s$(c1,r1);
  NEXT
  PRINT
NEXT
RETURN
`);
