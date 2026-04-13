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
GOSUB 9500
MODE 2
w=39:h=19:' width, height
DIM map(w,h)
DIM row$(h)
mcnt=5: 'monsterCount
DIM mx(mcnt-1),my(mcnt-1),mh(mcnt-1) 'monster x,y,health
'ex=0:ey=0 'exit x,y
hp=10 'player health
GOSUB 1000
GOSUB 1100
GOSUB 1200
GOSUB 2000:dirty=0
k=asc("r"):GOSUB 9500
PRINT "Move with w s a d (or keypad 8 2 4 6)."
PRINT "Press r to run"
WHILE LOWER$(INKEY$)<>"r":WEND
k=0:GOSUB 9500
k=asc("w"):GOSUB 9500
k=asc("s"):GOSUB 9500
k=asc("a"):GOSUB 9500
k=asc("d"):GOSUB 9500
win=0:game=1
WHILE game=1
  GOSUB 3000
  GOSUB 4000
  GOSUB 5000
  IF dirty=1 THEN CLS:GOSUB 2000:dirty=0
  t=TIME+50:WHILE TIME<t:FRAME:WEND
WEND
IF win=1 THEN t$="You win!" ELSE t$="Game Over"
PRINT t$:FRAME:|SAY,t$
END
'
' Generate map
1000 FOR y=0 TO h
  FOR x=0 TO w
    IF RND<0.15 THEN map(x,y)=1 ELSE map(x,y)=0
  NEXT x
NEXT y
FOR x=0 TO w
  map(x,0)=1:map(x,h)=1
NEXT x
FOR y=0 TO h
  map(0,y)=1:map(w,y)=1
NEXT y
RETURN
'
' build base rows
1100 FOR y=0 TO h
  row$(y)=STRING$(w+1," ")
  FOR x=0 TO w
  IF map(x,y)=1 THEN MID$(row$(y),x+1,1)="#"
  NEXT x
NEXT y
RETURN
'
' spawn monsters, players, exit
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
WHILE map(ex,ey)=1
  ex=INT(RND*w):ey=INT(RND*h)
WEND
RETURN
'
' draw
2000 FOR y=0 TO h
  temp$=row$(y)
  IF y=ey THEN MID$(temp$,ex+1,1)=">"
  IF y=py THEN MID$(temp$,px+1,1)="@"
  FOR i=0 TO mcnt-1
    IF mh(i)>0 THEN IF my(i)=y THEN MID$(temp$,mx(i)+1,1)="g"
  NEXT i
  PRINT temp$
NEXT y
PRINT "HP:";hp
RETURN
'
' input
3000 k$=LOWER$(INKEY$):IF k$="" THEN RETURN
IF (k$="w" OR k$="8") AND map(px,py-1)=0 THEN py=py-1:dirty=1:RETURN
IF (k$="s" OR k$="2") AND map(px,py+1)=0 THEN py=py+1:dirty=1:RETURN
IF (k$="a" OR k$="4") AND map(px-1,py)=0 THEN px=px-1:dirty=1:RETURN
IF (k$="d" OR k$="6") AND map(px+1,py)=0 THEN px=px+1:dirty=1:RETURN
RETURN
'
' monster move
4000 FOR i=0 TO mcnt-1
  IF mh(i)>0 THEN GOSUB 4300
NEXT i
RETURN
'
' simple monster move towards player
4300 dx=SGN(px-mx(i)):dy=SGN(py-my(i))
IF ABS(px-mx(i))>ABS(py-my(i)) THEN dy=0 ELSE dx=0
nx=mx(i)+dx:ny=my(i)+dy
IF map(nx,ny)=0 THEN IF nx<>mx(i) OR ny<>my(i) THEN mx(i)=nx:my(i)=ny:dirty=1
RETURN
'
' combat + win
5000 FOR i=0 TO mcnt-1
  IF mh(i)>0 THEN IF mx(i)=px AND my(i)=py THEN mh(i)=mh(i)-1:hp=hp-1:dirty=1
  IF mh(i)=0 THEN PRINT "Monster slain":dirty=1
NEXT i
IF hp<=0 THEN game=0
IF px=ex AND py=ey THEN PRINT "ESCAPED":win=1:game=0
RETURN
'
' define user key for LocoBasic UI
9500 KEY DEF 78,1,k
RETURN
`);
