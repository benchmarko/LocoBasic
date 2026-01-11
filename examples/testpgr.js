/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM testpgr - Test Page Graphics
REM
lbasic=&8000>0: 'fast hack to detect LocoBasic
MODE 1
TAG:MOVE 0,399
PRINT "Test Page Graphics";
TAGOFF
'
x0=40:y0=50
w=60:h=50
'
x=x0:y=y0
'
MOVE x,y
'
DRAW x+w,y
DRAW x+w,y+h
DRAW x,y+h
DRAW x,y
'
MOVE x+w+w/2,y
'
DRAWR w,0
DRAWR 0,h
DRAWR -w,0
DRAWR 0,-h
'
x=x0+2*(w+w/2)
'
MOVE x,y
'
DRAW x+w,y,1
GRAPHICS PEN 2
DRAW x+w,y+h
DRAW x,y+h,3
DRAW x,y,1
'
MOVE x+w+w/2,y
'
DRAWR w,0,1
GRAPHICS PEN 2
DRAWR 0,h
DRAWR -w,0,3
DRAWR 0,-h,1
'
'
x=x0
y=y+h+h/2
'
PLOT x,y,5
PLOT x+w,y
PLOT x+w,y+h
PLOT x,y+h
PLOT x,y
'
MOVE x+w+w/2,y
'
'PLOTR 0,0
PLOTR w,0
PLOTR 0,h
PLOTR -w,0
PLOTR 0,-h
'
y=y-h-h
x=x+2*(w+w/2)
'
y=y+h+50
PLOT x,y
PLOT x+w,y,1
PLOT x+w,y+h,2
PLOT x,y+h,3
PLOT x,y,1
'
MOVE x+w+w/2,y
'
'PLOTR 0,0
PLOTR w,0,1
PLOTR 0,h,2
PLOTR -w,0,3
PLOTR 0,-h,1
'
'
' misc
'
''FILL 7
'
''GRAPHICS PAPER 5
GRAPHICS PEN 3
'
''MASK a,b
'
MOVE 10,20
MOVE -10,-20,7
''MOVE 10,20,7,3
MOVER 10,20
MOVER -10,-20,7
''MOVER 10,20,7,3
'
ORIGIN 440,300
DEG
FOR i=0 to 10
MOVE 0,0
DRAW SIN(360/10*i)*20,COS(360/10*i)*20
NEXT
RAD
ORIGIN 0,0
'
''PLOT 10,20,7,3
''PLOTR 10,20,7,3
'
x=x0+4:y=y0+h+20
TAG
MOVE x,y,3
PRINT "Text";
MOVE x+w+50,y-40,1
PRINT "at";
MOVE x+2*(w+50)-32,y-40,2
PRINT "gra-";
MOVE x+3*(w+50)-50,y-40,2
PRINT "phics";
TAGOFF
''a=TEST(x,y)
''a=TESTR(xm,ym)
'
MOVE x+3*(w+50)-50,y-40
a=XPOS: IF a<>324 THEN ERROR 33
a=YPOS: IF a<>80 THEN ERROR 33
MOVE 10,20
a=XPOS: IF a<>10 THEN ERROR 33
a=YPOS: IF a<>20 THEN ERROR 33
'
if NOT lbasic THEN TAG:MOVE 0,399-16:PRINT "RSX skipped.";:TAGOFF:PRINT:PRINT:STOP
'
x=x0:y=y0+2*(h+h/2)
|RECT,x,y,x+w,y+h
|RECT,x+w/4,y+h/4,x+3/4*w,y+3/4*h
'
x=x+w+w/2
|CIRCLE,x+w/2,y+h/2,w/2
|CIRCLE,x+w/2,y+h/2,w/4
'
x=x+w+w/2
|ELLIPSE,x+w/2,y+h/2,w/2,w/3
|ELLIPSE,x+w/2,y+h/2,w/5,w/4
'
x=x+w+w/2
|ARC,x,y,w/2,w/2,0,0,1,x+w,y
|ARC,x,y+h,w/2,w/2,0,0,0,x+w,y+h
'
x=x0:y=y+h+h/2
|RECT,x,y,x+w,y+h,2
'
x=x+w+w/2
|CIRCLE,x+w/2,y+h/2,w/2,2
'
x=x+w+w/2
|ELLIPSE,x+w/2,y+h/2,w/2,w/3,2
'
x=x+w+w/2
GRAPHICS PEN 3
|ARC,x,y,w/2,w/2,0,0,1,x+w,y,3
GRAPHICS PEN 2
|ARC,x,y+h,w/2,w/2,0,0,0,x+w,y+h,2
'
`);
