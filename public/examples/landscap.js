/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM landscap - Landscape
REM
DEF FNr(n)=INT(RND(1)*n)+1
DIM xa(64),ya(64),xa1(64),ya1(64),wa(64),wa1(64)
trees=3
MODE 1
INK 0,1:INK 1,24:INK 2,18:INK 3,12
col=2
GOSUB 300:'area
col=3
GOSUB 400:'mountains
GOSUB 900:'stones
GOSUB 500:'trees
GOSUB 1000:'moon
END
'
' Draw area
300 s1=0
z1=50+FNr(40)
PLOT s1,z1,col
WHILE s2<639
  r=FNr(5)-3
  FOR i=1 TO 7
    s2=s1+5+FNr(5)
    IF s2>639 THEN s2=639
    z2=z1+r+FNr(5)-3
    IF z2>399 THEN z2=399 ELSE IF z2<0 THEN z2=0
    DRAW s2,z2
    IF s2=639 THEN RETURN
    s1=s2
    z1=z2
  NEXT i
WEND
RETURN
'
' Draw mountains
400 s1=0
z1=180+FNr(60)
PLOT s1,z1,col
dz=FNr(50)-25
s2=0
WHILE s2<639
  s2=s1+10+FNr(60)
  IF s2>639 THEN s2=639
  IF z2+dz<100 THEN dz=ABS(dz) ELSE IF z2+dz>350 THEN dz=-dz
  z2=z1+dz
  DRAW s2,z2
  'IF s2=639 THEN RETURN
  s1=s2:z1=z2:dz=-SGN(dz)*FNr(70)
WEND
RETURN
'
' Draw trees
500 RAD
FOR tr=trees TO 1 STEP -1
  la=FNr(10)+15*(5-tr)
  wa(1)=PI/2
  f=1:c=0
  'x=FNr(20)+14
  x1=190*tr-45
  y1=2+tr*10
  x2=x1
  y2=la
  col=tr AND 3
  PLOT x1,y1,col
  DRAW x2,y2
  xa(1)=x2:ya(1)=y2
  FOR et=1 TO 6
    c=f:f=0
    FOR n=1 TO c
      FOR sign=-1 TO 1 STEP 2
        f=f+1
        w=(FNr(45)+5)*PI/180
        w=wa(n)+sign*w
        x2=COS(w)*la+xa(n)
        y2=SIN(w)*la+ya(n)
        MOVE xa(n),ya(n)
        DRAW x2,y2
        wa1(f)=w
        xa1(f)=x2
        ya1(f)=y2
      NEXT sign
    NEXT n
    FOR n=1 TO f
      wa(n)=wa1(n)
      xa(n)=xa1(n)
      ya(n)=ya1(n)
    NEXT n
    la=0.7*la
  NEXT et
NEXT tr
RETURN
'
' Draw stones
900 x1=FNr(30)+50:dz=FNr(35)+15:y1=0
st=60
WHILE x1<580
  r=FNr(11)+5
  col=FNr(3)
  MOVE 0,0,col
  IF y1+dz>99 THEN dz=-dz ELSE IF y1+dz<r*2 THEN dz=ABS(dz)
  y1=y1+dz
  MOVE x1+r,y1
  GOSUB 950
  x1=x1+70+FNr(30)
  dz=-SGN(dz)*FNr(20)
WEND
RETURN
'
' Draw one stone
950 DEG
MOVE SIN(0)*r+x1,COS(0)*r+y1
FOR i=0 TO 360 STEP st
  DRAW SIN(i)*r+x1+RND*st/4,COS(i)*r+y1
NEXT
RETURN
'
' Draw moon
1000 x1=RND*540+50
y1=RND*70+280
r=RND*30+20
st=10
GOSUB 950
f=RND*3+1
MOVE x1,y1
'FILL f
RETURN
`);
