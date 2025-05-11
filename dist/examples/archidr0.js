/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM archidr - Little Architect Draw Example (no RSX)
REM (c) M&M Vieth
REM draw example without RSX |CIRCLE and |RECT
'
MODE 2
delay=2:'delay seconds between drawings
'
READ dcnt
FOR didx=1 TO dcnt
  GOSUB 800
  FRAME
  t=TIME+delay*6*50:WHILE TIME<t AND INKEY$="":WEND
NEXT
END
'
REM draw (without RSX)
800 CLS
READ dr,gcnt:'drawing number, number of actions
x0=0:y0=399
MOVE x0,y0
g0=0
WHILE g0<gcnt
  READ cnt,art:'number of actions, action type
  g0=g0+cnt
  FOR d=1 TO cnt
    READ x,y
    IF art=0 THEN MOVE x,y
    IF art=1 THEN PLOT x,y
    IF art=2 THEN DRAW x,y
    IF art=3 THEN DRAW x,y:x=x0:y=y0:MOVE x0,y0:'draw but keep pos
    IF art=4 THEN DRAW x,y0:DRAW x,y:DRAW x0,y:DRAW x0,y0:MOVE x,y:'rectangle
    IF art=5 THEN x00=x0:y00=y0:GOSUB 1250:x=x00:y=y00:MOVE x,y:'circle
    x0=x:y0=y
  NEXT
WEND
RETURN
'
REM draw circle (not used any more, we use circle RSX)
REM https://de.wikipedia.org/wiki/Bresenham-Algorithmus
1250 radius=x
'x0=xpos:y0=ypos:'or use: origin 320,200
f=1-radius
ddfx=0
ddfy=-2*radius
x=0
y=radius
PLOT x0,y0+radius
PLOT x0,y0-radius
PLOT x0+radius,y0
PLOT x0-radius,y0
WHILE x<y
  IF f>=0 THEN y=y-1:ddfy=ddfy+2:f=f+ddfy
  x=x+1
  ddfx=ddfx+2
  f=f+ddfx+1
  PLOT x0+x,y0+y
  PLOT x0+y,y0+x
  PLOT x0+y,y0-x
  PLOT x0+x,y0-y
  PLOT x0-x,y0-y
  PLOT x0-y,y0-x
  PLOT x0-y,y0+x
  PLOT x0-x,y0+y
WEND
RETURN
'
'For each drawing:
'- drawing number, number of actions for the drawing (ignoring grouping)
'- group: number of actions in group, art type, list of coordinates for group acrtions
'
DATA 1:'number of drawings
' drawing 19 ( 80 )
DATA 19,80
DATA 1,0,345,17
DATA 5,2,244,17,244,165,349,165,349,17,343,17
DATA 1,0,349,125
DATA 1,2,244,125
DATA 1,0,257,27
DATA 1,5,4,399
DATA 1,0,275,27
DATA 1,5,4,399
DATA 1,0,275,47
DATA 1,5,4,399
DATA 1,0,275,73
DATA 1,5,4,399
DATA 1,0,275,93
DATA 1,5,4,399
DATA 1,0,275,111
DATA 1,5,4,399
DATA 1,0,292,25
DATA 1,5,4,399
DATA 1,0,308,31
DATA 1,5,4,399
DATA 1,0,308,45
DATA 1,5,4,399
DATA 1,0,308,65
DATA 1,5,4,399
DATA 1,0,308,83
DATA 1,5,4,399
DATA 1,0,308,109
DATA 1,5,4,399
DATA 1,0,295,149
DATA 1,5,4,399
DATA 1,0,295,175
DATA 1,5,4,399
DATA 1,0,255,197
DATA 1,5,10,399
DATA 1,0,291,209
DATA 1,5,14,399
DATA 1,0,337,199
DATA 1,5,12,399
DATA 1,0,283,317
DATA 1,5,82,399
DATA 1,0,387,233
DATA 1,5,14,399
DATA 1,0,170,233
DATA 1,5,16,399
DATA 1,0,216,329
DATA 5,2,216,301,216,315,229,315,229,323,229,305
DATA 1,0,242,305
DATA 5,2,242,327,258,327,258,305,258,317,242,317
DATA 1,0,273,321
DATA 2,2,273,303,287,303
DATA 1,0,300,317
DATA 2,2,300,297,314,297
DATA 1,0,337,323
DATA 5,2,325,323,325,303,338,303,338,323,335,323
DATA 1,0,562,17
DATA 4,2,573,37,577,25,583,37,587,17
DATA 1,0,576,43
DATA 2,2,577,35,584,47
`);
