/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM funcarea - Functional Area
REM 26.11.1989
REM Functional Area with Hidden Line Removal
REM taken from: https://github.com/benchmarko/CPCBasicApps/blob/master/apps/math/funcarea.js
REM Modifications: remove GOTOs; added animation
INK 0,0
MODE 2
DIM uh(639),oh(639)
xu=-2:xo=2:yu=-2:yo=2:zu=0:zo=4
'
FOR zu=1 TO -0.2 STEP -0.1
  CLS
  GRAPHICS PEN 1
  GOSUB 200
  t=TIME+25:WHILE TIME<t:FRAME:WEND
NEXT
END
'
200 uo=xo+yo/2:uu=xu+yu/2:vo=zo+yo/2:vu=zu+yu/2
ku=639/(uo-uu):kv=399/(vo-vu)
dx=(xo-xu)/160:dy=(yo-yu)/20:'step sizes
dx1=(xo-xu)/20:dy1=(yo-yu)/160:'step sizes for second loop
GOSUB 530:GOSUB 310
GOSUB 530:GOSUB 380
RETURN
'
310 FOR y=yu TO yo STEP dy
  x=xu:GOSUB 450:s1=sp:z1=ze
  GOSUB 480:f1=f
  FOR x=xu TO xo STEP dx
    GOSUB 450:s2=sp:z2=ze
    GOSUB 480
    IF f1+f=2 THEN MOVE s1,399-z1:DRAW s2,399-z2
    s1=s2:z1=z2:f1=f
  NEXT x
NEXT y
RETURN
'
380 FOR x=xo TO xu STEP -dx1
  y=yu:GOSUB 450:s1=sp:z1=ze
  GOSUB 480:f1=f
  FOR y=yu TO yo STEP dy1
    GOSUB 450:s2=sp:z2=ze
    GOSUB 480
    IF f1+f=2 THEN MOVE s1,399-z1:DRAW s2,399-z2
    s1=s2:z1=z2:f1=f
  NEXT y
NEXT x
RETURN
'
'Calculations for point (x,y)
450 z=x*x+y*y:z=SIN(z)
IF z<zu THEN z=zu ELSE IF z>zo THEN z=zo
u=x+y/2:v=z+y/2:sp=INT(ku*(u-uu)):ze=INT(kv*(vo-v))
RETURN
'
REM visibility
480 f=0
IF ze>uh(sp) THEN f=1:uh(sp)=ze
IF ze<oh(sp) THEN f=1:oh(sp)=ze
RETURN
'
REM clear arrays
530 FOR i=0 TO 639:uh(i)=0:oh(i)=639:NEXT i
RETURN
`);
