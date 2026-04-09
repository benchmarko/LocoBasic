/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM xmastree - Christmas tree
REM
lbasic=&8000>0: 'fast hack to detect LocoBasic
sc=0
WHILE sc < 1000
  GOSUB 100
  IF sc MOD 2=1 THEN GOSUB 2000
  t=TIME+300*6:WHILE TIME<t AND INKEY$="":WEND
  sc=sc+1
WEND
END
'
100 MODE 3
INK 0,0:INK 12,9
width1 = 640
height = 400
cx = width1 / 2
topy = 50
bottomy = height - 70
layers = 6
layerheight = (bottomy - topy) / layers
maxwidth = 200
'
' star
GRAPHICS PEN 1
stary = height-(topy - 25)
IF lbasic THEN |POLYGON, cx, stary, cx+7, stary-17, cx+24, stary-17, cx+10, stary-29, cx+15, stary-47, cx, stary-35, cx-15, stary-47, cx-10, stary-29, cx-24, stary-17, cx-7, stary-17, 1 ELSE PEN 1: GOSUB 1000
'
' layers
GRAPHICS PEN 12
FOR i = 0 TO layers-1
  ytop = topy + i * layerheight
  ybot = ytop + layerheight
  wtop = (i / layers) * maxwidth * 0.45
  wbot = ((i + 1) / layers) * maxwidth
  'draw layer
  'yTop2 = height - yTop
  'yBot2 = height - yBot
  yt=height-ytop
  yb=height-ybot
  IF lbasic THEN |POLYGON,cx - wtop,yt, cx + wtop,yt, cx + wbot,yb, cx - wbot,yb,12 ELSE MOVE cx-wtop,yt,12:DRAW cx+wtop,yt:DRAW cx+wbot,yb:DRAW cx-wbot,yb:DRAW cx-wtop,yt:MOVER 0,-4:'FILL 12
  'ornaments
  FOR j = 0 TO 4
    ox = cx + (RND - 0.5) * wbot * 1.6
    oy = ytop + layerheight * (0.45 + RND * 0.2)
    col = INT(RND*15)+1
    IF lbasic THEN |CIRCLE,ox,399-oy,5,col ELSE r=4:MOVE ox,height-(oy+r),col:FOR a=0 TO 360 STEP 60: DRAW ox+r*SIN(a),height-(oy+r*COS(a)): NEXT
496 MOVER 0,2:'FILL col
  NEXT
NEXT
'
'trunk
GRAPHICS PEN 9
IF lbasic THEN |RECT,cx - 16, height-bottomy, cx - 16+32, height-bottomy-45,9 ELSE MOVE cx-16,height-bottomy:DRAW cx+16,height-bottomy:DRAW cx+16,height-(bottomy+45):DRAW cx-16,height-(bottomy+45):DRAW cx-16,height-bottomy:MOVER 4,-4:'FILL 3
RETURN
'
' star (formula-based)
1000 DEG
cx0 = cx
cy0 = 60 ' vertical position of star
rout = 22 ' outer radius
rin = 10 ' inner radius
FOR i=0 TO 10
  ang = (i*36 - 90)
  IF i MOD 2 = 0 THEN rad1 = rout ELSE rad1 = rin
  x = cx0 + rad1 * COS(ang)
  y = cy0 + rad1 * SIN(ang)
  IF i=0 THEN MOVE x, height-y ELSE DRAW x, height-y
NEXT
MOVER 0,-5
'FILL 1
RETURN
'
' check date
2000 d$=SPACE$(11)
IF lbasic THEN |DATE,@d$ ELSE d$="00 23 12 25"
day$=MID$(d$,4,2)
month$=MID$(d$,7,2)
year$=RIGHT$(d$,2)
xmas=month$="12" AND (day$="25" OR day$="26")
DIM m$(3)
IF xmas THEN col=1:m$(1)="Happy":m$(2)="Christmas":m$(3)="20"+year$+"!" ELSE col=9:m$(1)="Waiting":m$(2)="for":m$(3)="Christmas"
TAG
GRAPHICS PEN col
y=320
FOR i=1 TO 3
  MOVE 64,y:PRINT m$(i);
  y=y-32
NEXT
ERASE m$
RETURN
`);
