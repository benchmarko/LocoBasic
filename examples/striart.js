/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM striart - String Art
MODE 2
DEG
r=180:'radius
s=360/p:'step size
DEF FNx(i)=SIN(s*i)*r+320
DEF FNy(i)=COS(s*i)*r+200
'
READ p,d,a
WHILE p>=0
  t=TIME+300
  GOSUB 980
  WHILE TIME<t AND INKEY$="":FRAME:WEND
  READ p,d,a
WEND
END
'
REM draw
980 CLS
s=360/p:'step size
FOR i=0 TO p-1:PLOT FNx(i),FNy(i):NEXT
d0=d
FOR i=0 TO p-1
  MOVE FNx(i),FNy(i)
  DRAW FNx(i+d0),FNy(i+d0)
  d0=d0+a
NEXT
RETURN
'
DATA 48,15,0:  'ring, stop at drop
DATA 48,15,1:  'rounded heart
DATA 48,15,-1: 'Fan, Rays
DATA 48,15,-2: 'Diagonally hatched
DATA 48,15,-3: 'diagonal "triangulated"
DATA 48,15,-4: 'Diagonally irregular "checkered"
DATA 48,15,-10: 'skeins with thin stripes
DATA -1,-1,-1: '"end"
`);
