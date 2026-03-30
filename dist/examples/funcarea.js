/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM funcarea - Functional Area with Hidden Line
REM 26.11.1989
REM https://github.com/benchmarko/CPCBasicApps/blob/master/apps/math/funcarea.js
REM Modifications: remove GOTOs
INK 0,0
MODE 2
DIM uh(639),oh(639)
xu=-2:xo=2:yu=-2:yo=2:zu=0:zo=4
'
200 uo=xo+yo/2:uu=xu+yu/2:vo=zo+yo/2:vu=zu+yu/2
ku=639/(uo-uu):kv=399/(vo-vu)
dx=(xo-xu)/160:dy=(yo-yu)/20:'Schwittweiten
dx1=(xo-xu)/20:dy1=(yo-yu)/160:'Schwittweiten
gosub 530:gosub 310
gosub 530:gosub 380
end
'
310 FOR y=yu TO yo STEP dy:x=xu:GOSUB 550:GOSUB 460:s1=sp:z1=ze
GOSUB 480:f1=f:'Sichtbarkeit
FOR x=xu TO xo STEP dx:GOSUB 550:GOSUB 460:s2=sp:z2=ze
GOSUB 480:f2=f:'Sichtbarkeit
IF f1+f2=2 THEN MOVE s1,399-z1:DRAW s2,399-z2,1
s1=s2:z1=z2:f1=f2:NEXT x:NEXT y
RETURN
'
380 FOR x=xo TO xu STEP -dx1:y=yu:GOSUB 550:GOSUB 460:s1=sp:z1=ze
GOSUB 480:f1=f:'Sichtbarkeit
FOR y=yu TO yo STEP dy1:GOSUB 550:GOSUB 460:s2=sp:z2=ze
GOSUB 480:f2=f:'Sichtbarkeit
IF f1+f2=2 THEN MOVE s1,399-z1:DRAW s2,399-z2,1
s1=s2:z1=z2:f1=f2:NEXT y:NEXT x
RETURN
'
'Abbilden eines Punktes
460 u=x+y/2:v=z+y/2:sp=int(ku*(u-uu)):ze=int(kv*(vo-v))
RETURN 'sp=ku*(u-uu):ze=kv*(vo-v):RETURN
'
REM Sichtbarkeit
480 f=0
IF ze>uh(sp) THEN f=1:uh(sp)=ze
IF ze<oh(sp) THEN f=1:oh(sp)=ze
RETURN
REM loeschen
530 FOR i=0 TO 639:uh(i)=0:oh(i)=639:NEXT i
RETURN
'Funktion
550 z=x*x+y*y:z=SIN(z)
IF z<zu THEN z=zu ELSE IF z>zo THEN z=zo
RETURN
`);
