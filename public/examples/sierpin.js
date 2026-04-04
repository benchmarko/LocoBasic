/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM sierpin - Sierpinski triangle (ASCII)
REM see also: https://en.wikipedia.org/wiki/Sierpi%C5%84ski_triangle
REM (simplified version could be put on Rosetta code... https://rosettacode.org/wiki/Sierpinski_triangle)
DEG
MODE 2
cols=80:rows=25
DIM cx(5),cy(5),r(5),lc(5),scr$(cols,rows),smc(rows)
cx(1)=320*cols/640:cy(1)=140*rows/400
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
800 FOR r1=1 TO rows
  FOR c1=1 TO cols-1
    scr$(c1,r1)=" "
  NEXT
NEXT
RETURN
'
' Compute
1000 cx1=ROUND(cx(st))
cy1=ROUND((rows-cy(st)))
scr$(cx1,cy1)=CHR$(48+st)
IF cx1>smc(cy1) THEN smc(cy1)=cx1 'update max column
IF st<5 THEN GOSUB 2000:FRAME: 'intermediate output
IF st=5 THEN RETURN
lc(st)=0
start=1
WHILE (lc(st) MOD 360)<>0 OR start=1
  start=0
  cx(st+1)=cx(st)+1.7*cols/640*r(st)*SIN(sa+lc(st))
  cy(st+1)=cy(st)+1.7*rows/400*r(st)*COS(sa+lc(st))
  st=st+1
  GOSUB 1000 'recursive call
  st=st-1
  lc(st)=lc(st)+2*sa
WEND
RETURN
'
' Output
2000 CLS
FOR r1=1 TO rows
  FOR c1=1 TO smc(r1)
    PRINT scr$(c1,r1);
  NEXT
  PRINT
NEXT
RETURN
`);
