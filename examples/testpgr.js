/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM testpgr - Test Page Graphics
MODE 1
PRINT "Test Page Graphics"
'
x=40:y=50
w=60:h=50
'
DRAW x,y
DRAW x+w,y
DRAW x+w,y+h
DRAW x,y+h
DRAW x,y
'
MOVE x+w+50,y
'
'DRAWR 0,0
DRAWR w,0
DRAWR 0,h
DRAWR -w,0
DRAWR 0,-h
'
y=y+h+50
PLOT x,y
PLOT x+w,y
PLOT x+w,y+h
PLOT x,y+h
PLOT x,y
'
MOVE x+w+50,y
'
'PLOTR 0,0
PLOTR w,0
PLOTR 0,h
PLOTR -w,0
PLOTR 0,-h
'
y=y-h-50
x=x+2*(w+50)
MOVE x,y
'
'DRAW x,y
DRAW x+w,y,1
DRAW x+w,y+h,2
DRAW x,y+h,3
DRAW x,y,1
'
MOVE x+w+50,y
'
'DRAWR 0,0
DRAWR w,0,1
DRAWR 0,h,2
DRAWR -w,0,3
DRAWR 0,-h,1
'
y=y+h+50
PLOT x,y
PLOT x+w,y,1
PLOT x+w,y+h,2
PLOT x,y+h,3
PLOT x,y,1
'
MOVE x+w+50,y
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
'MOVE x+50,-20,7
'DRAW x+100,y
'
''DRAW 10,20,7,3
''DRAW 10,20,,3
''DRAW x,y,m,g1
'
''DRAWR 10,20,7,3
''DRAWR 10,20,,3
''DRAWR x,y,m,g1
'
''FILL 7
'
''GRAPHICS PAPER 5
''GRAPHICS PAPER 2.3*a
GRAPHICS PEN 3
''GRAPHICS PEN 5,1
''GRAPHICS PEN ,0
''GRAPHICS PEN 2.3*a,1+b
'
''MASK &X10101011
''MASK 2^(8-x),1
''MASK a,b
''MASK ,b
'
MOVE 10,20
MOVE -10,-20,7
''MOVE 10,20,7,3
''MOVE 10,20,,3
''MOVE x,y,m,g1
MOVER 10,20
MOVER -10,-20,7
''MOVER 10,20,7,3
''MOVER 10,20,,3
''MOVER x,y,m,g1
'
''
''PLOT 10,20,7,3
''PLOT 10,20,,3
''PLOT x,y,m,g1
'
''
''PLOTR -10,-20,7
''PLOTR 10,20,7,3
''PLOTR 10,20,,3
''PLOTR x,y,m,g1
'
''a=TEST(10,20)
''a=TEST(x,y)
''a=TESTR(10,-20)
''a=TESTR(xm,ym)
'
''a=XPOS
''a=YPOS
`);
