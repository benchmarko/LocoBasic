/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM lifegame - Game of Life
maxlp=10
cols=30:rows=20:DIM grid(cols+1, rows):DIM newg(cols+1, rows):DIM smc(rows)
'
MODE 1
GOSUB 700 'random
c1=5:r1=7:RESTORE 1210:GOSUB 800: 'blinker
c1=5:r1=r1+3:RESTORE 1210:GOSUB 800: 'blinker (distance 2)
c1=10:r1=5:RESTORE 1310:GOSUB 800: 'glider
'
lp=1:changed=1
WHILE lp<=maxlp AND changed<>0
  t=TIME+200
  CLS
  PRINT "L I F E G A M E"
  GOSUB 300 'output
  GOSUB 400 'compute
  GOSUB 500 'copy
  WHILE TIME<t:FRAME:WEND
  lp=lp+1
WEND
PRINT
PRINT "Stop after";lp;"generations"
IF changed=0 THEN PRINT " No change any more"
END
'
REM output
300 FOR r=1 TO rows-1
  FOR c=1 TO smc(r)
    IF grid(c,r)=0 THEN PRINT " "; ELSE PRINT "*";
  NEXT c
  PRINT
NEXT r
RETURN
'
REM compute
400 FOR r=1 TO rows-1
  mc1=0
  FOR c=1 TO cols
    nbs=grid(c-1,r-1)+grid(c-1,r)+grid(c-1,r+1)+grid(c,r-1)+grid(c,r+1)+grid(c+1,r-1)+grid(c+1,r)+grid(c+1,r+1)
    IF (nbs=3) OR ((nbs=2) AND (grid(c,r)=1)) THEN ng1=1 ELSE ng1=0
    '?? ne(i,j)=-(an=3 OR (al(i,j)=1 AND an=2))
    newg(c,r)=ng1
    IF ng1>0 THEN mc1=c
  NEXT c
  smc(r)=mc1
NEXT r
RETURN
'
REM copy newg->grid
500 changed=0
FOR r=1 TO rows-1
  FOR c=1 TO cols
    IF grid(c,r)<>newg(c,r) THEN grid(c,r)=newg(c,r):changed=-1
  NEXT c
NEXT r
RETURN
'
REM random
700 FOR w=1 TO 50
  c=INT(cols*RND(1)+1):r=INT(rows*RND(1)+1): grid(c,r)=1:IF c>smc(r) THEN smc(r)=c
NEXT w
'grid(4,5)=1:grid(5,5)=1:grid(6,5)=1
RETURN
'
REM draw pattern at pos c1,r1
800 READ n
FOR r=1 TO n
  READ pat$
  FOR c=1 TO LEN(pat$)
    IF MID$(pat$,c,1)="1" THEN grid(c1+c,r1+r)=1
  NEXT c
  IF (c1+LEN(pat$))>smc(r1+r) THEN smc(r1+r)=c1+LEN(pat$)
NEXT r
RETURN
'
' https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life#Examples_of_patterns
'
'1. Still lifes
' block
1110 DATA 2
DATA "11"
DATA "11"
'
' beevive
1120 DATA 3
DATA "0110"
DATA "1001"
DATA "0110"
'
' loaf
1130 DATA 4
DATA "0110"
DATA "1001"
DATA "0101"
DATA "0010"
'
' boat
1140 DATA 3
DATA "110"
DATA "101"
DATA "010"
'
' tub
1150 DATA 3
DATA "010"
DATA "101"
DATA "010"
'
'2. Oscillators
' blinker
1210 DATA 1
DATA "111"
'
' toad
1220 DATA 2
DATA "0111"
DATA "1110"
'
' beacon
1230 DATA 4
DATA "1100"
DATA "1100"
DATA "0011"
DATA "0011"
'...
'
'3. Spaceships
' glider (https://conwaylife.com/wiki/Glider)
1310 DATA 3
DATA "001"
DATA "101"
DATA "011"
'
'...
`);
