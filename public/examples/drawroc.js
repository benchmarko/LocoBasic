/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM drawroc - Draw Rocking CPC Demo Organ
REM (c) Manfred Lipowski, Februar 1987
REM taken from Rocking CPC Music Demo
REM
MODE 1
INK 0,0:INK 2,2
FOR a=175 TO 275
  PLOT 126,a,1:DRAW 500,a
NEXT a
DRAWR 0,-100,2:DRAWR -374,0:DRAWR 0,100:DRAWR 374,0
PLOT 502,279,3:DRAWR 0,-106:DRAWR -380,0:DRAWR 0,106:DRAWR 378,0
FOR a=126 TO 500 STEP 16.3
  PLOT a,275,2
  DRAWR 0,-100
NEXT a
FOR a=142 TO 500 STEP 16.3
  FOR b=-4 TO 4 STEP 1
    PLOT a+b,266,3
    DRAWR 0,-50
  NEXT b
NEXT a
'
a$="' Rocking C P C '":b=4:c=1:e=3:GOSUB 500
a$=" by Manfred Lipowski":b=16:c=3:e=2:GOSUB 500
a$="Februar 1987":b=18:c=3:e=1:GOSUB 500
PEN 2
END
'
500 d=20-INT(LEN(a$)/2)
TAG
MOVE d*17.2-28,416-b*16,c
PRINT a$;
TAGOFF
RETURN
`);
