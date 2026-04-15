/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM rogueli - Rogue like
REM MV, 2026 (Generated with the help of AI)
REM Rogue like simple game
REM Player is @, monsters are g, exit is >, walls are #.
REM Move with w,a,s,d (or keypad 8 2 4 6).
'
'rogue like with dirty redraw
'
MODE 2
w=39:h=19:' width, height
DIM map(w,h)
DIM row$(h)
mcnt=5: 'monsterCount
DIM mx(mcnt-1),my(mcnt-1),mh(mcnt-1) 'monster x,y,health
'ex=0:ey=0 'exit x,y
hp=10 'player health
GOSUB 1000
GOSUB 1050
GOSUB 1100
GOSUB 1200
GOSUB 2000
PRINT "Move with w s a d, or keypad 8 2 4 6."
k$="wasd":GOSUB 9400
WHILE dirty=0:GOSUB 3000:WEND
CLS:GOSUB 2000
win=0
game=1
WHILE game=1
  GOSUB 3000
  GOSUB 4000
  GOSUB 5000
  IF dirty=1 THEN CLS:GOSUB 2000
  t=TIME+50:WHILE TIME<t:FRAME:WEND
WEND
IF win=1 THEN t$="You win!" ELSE t$="Game Over"
PRINT t$:FRAME:|SAY,t$
END
'
' Generate map
1000 FOR y=0 TO h
  FOR x=0 TO w
    IF RND<0.15 THEN map(x,y)=2:' ELSE map(x,y)=0
  NEXT x
NEXT y
FOR x=0 TO w
  map(x,0)=2:map(x,h)=2
NEXT x
FOR y=0 TO h
  map(0,y)=2:map(w,y)=2
NEXT y
RETURN
'
' add exit
1050 ex=0:ey=0
WHILE map(ex,ey)<>0
  ex=INT(RND*w):ey=INT(RND*h)
WEND
map(ex,ey)=1
RETURN
'
' build base rows with exit and walls
1100 FOR y=0 TO h
  row$(y)=STRING$(w+1," ")
  FOR x=0 TO w
    IF map(x,y)=1 THEN MID$(row$(y),x+1,1)=">" ELSE IF map(x,y)=2 THEN MID$(row$(y),x+1,1)="#"
  NEXT x
NEXT y
RETURN
'
' spawn monsters, players
1200 ok=0
WHILE ok=0
  px=INT(RND*w):py=INT(RND*h)
  IF map(px,py)=0 THEN IF map(px+1,py)=0 OR map(px-1,py)=0 OR map(px,py+1)=0 OR map(px,py-1)=0 THEN ok=1
WEND
FOR i=0 TO mcnt-1
  ok=0
  WHILE ok=0
    mx(i)=INT(RND*w):my(i)=INT(RND*h)
    IF map(mx(i),my(i))=0 THEN ok=1
  WEND
  mh(i)=3
NEXT i
RETURN
'
' draw
2000 FOR y=0 TO h
  temp$=row$(y)
  'IF y=ey THEN MID$(temp$,ex+1,1)=">"
  IF y=py THEN MID$(temp$,px+1,1)="@"
  FOR i=0 TO mcnt-1
    IF mh(i)>0 THEN IF my(i)=y THEN MID$(temp$,mx(i)+1,1)="g"
  NEXT i
  PRINT temp$
NEXT y
PRINT "HP:";hp
dirty=0
RETURN
'
' input
3000 k$=LOWER$(INKEY$):IF k$="" THEN RETURN
IF (k$="w" OR k$="8") AND map(px,py-1)<2 THEN py=py-1:dirty=1:RETURN
IF (k$="s" OR k$="2") AND map(px,py+1)<2 THEN py=py+1:dirty=1:RETURN
IF (k$="a" OR k$="4") AND map(px-1,py)<2 THEN px=px-1:dirty=1:RETURN
IF (k$="d" OR k$="6") AND map(px+1,py)<2 THEN px=px+1:dirty=1:RETURN
RETURN
'
' monster move
4000 FOR i=0 TO mcnt-1
  IF mh(i)>0 THEN GOSUB 4300
NEXT i
RETURN
'
' simple monster move towards player
4300 dx=px-mx(i):dy=py-my(i)
'IF ABS(dx)>ABS(dy) THEN...'not used
' Currently we just try to move in x direction, then y.
IF dx<>0 AND map(mx(i)+SGN(dx),my(i))=0 THEN mx(i)=mx(i)+SGN(dx):dirty=1:RETURN
IF dy<>0 AND map(mx(i),my(i)+SGN(dy))=0 THEN my(i)=my(i)+SGN(dy):dirty=1
RETURN
'
' combat + win
5000 FOR i=0 TO mcnt-1
  IF mh(i)>0 THEN IF mx(i)=px AND my(i)=py THEN mh(i)=mh(i)-1:hp=hp-1:dirty=1
  IF mh(i)=0 THEN dirty=1: 'PRINT "Monster slain"
NEXT i
IF hp<=0 THEN game=0
IF px=ex AND py=ey THEN win=1:game=0: 'PRINT "ESCAPED"
RETURN
'
' define user keys for LocoBasic UI
9400 FOR i=1 TO LEN(k$)
  KEY DEF 78,1,ASC(MID$(k$,i,1))
NEXT i
RETURN
`);
