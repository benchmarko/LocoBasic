/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM mandelb0 - Mandelbrot Set (ASCII)
REM
REM based on: https://rosettacode.org/wiki/Mandelbrot_set#B
MODE 2
DEFINT a-w
minx=-8601
maxx=2867
miny=-4915
maxy=4915
maxiter=32
dx=(maxx-minx)\\79
dy=(maxy-miny)\\24
cy=miny
WHILE cy<=maxy
  cx=minx
  WHILE cx<=maxx
    x=0:y=0:x2=0:y2=0:iter=0
    WHILE iter<maxiter AND x2+y2<=16384
      y=INT(x*y/2048)+cy
      x=x2-y2+cx
      x2=INT(x*x/4096)
      y2=INT(y*y/4096)
      iter=iter+1
    WEND
  PRINT CHR$(iter+32);
  cx=cx+dx
  WEND
  cy=cy+dy
  IF POS(#0)>1 THEN PRINT: 'LocoBasic
WEND
'WHILE INKEY$="":WEND
`);
