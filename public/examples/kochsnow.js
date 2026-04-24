/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM kochsnow - Koch Snowflake
REM
REM (stack-based, no recursion)
'
MODE 2
'
level = 5
length = 300
'
' --- stack arrays ---
DIM alevel(level+1), alength(level+1), astate(level+1)
'
' --- turtle state ---
x = 160
y = 120
angle = 0
'
MOVE x,y
'
' draw 3 sides
FOR i = 1 TO 3
' initialize stack (push first "call")
  sp = 1
  alevel(sp) = level
  alength(sp) = length
  astate(sp) = 0
  GOSUB 800
  a = 120 : GOSUB 2200
NEXT i
END
'
'
' --- iterative Koch using stack ---
800 WHILE sp > 0
  level = alevel(sp)
  length = alength(sp)
  state = astate(sp)
  IF level = 0 THEN GOSUB 900 ELSE ON state+1 GOSUB 1000,1100,1200,1300,1400
WEND
RETURN
'
' draw forward
900 x2 = x + length * COS(angle * PI / 180)
y2 = y - length * SIN(angle * PI / 180)
MOVE x,y
DRAW x2,y
x = x2 : y = y2
sp = sp - 1
RETURN
'
'
' state = 0
' simulate first recursive call
1000 astate(sp) = 1
sp = sp + 1
alevel(sp) = level - 1
alength(sp) = length / 3
astate(sp) = 0
RETURN
'
' state = 1
1100 a = 60 : GOSUB 2100
astate(sp) = 2
sp = sp + 1
alevel(sp) = level - 1
alength(sp) = length / 3
astate(sp) = 0
RETURN
'
' state = 2
1200 a = 120 : GOSUB 2200
astate(sp) = 3
sp = sp + 1
alevel(sp) = level - 1
alength(sp) = length / 3
astate(sp) = 0
RETURN
'
' state = 3
1300 a = 60 : GOSUB 2100
astate(sp) = 4
sp = sp + 1
alevel(sp) = level - 1
alength(sp) = length / 3
astate(sp) = 0
RETURN
'
' state = 4
' done with this frame
1400 sp = sp - 1
RETURN
'
' --- turns ---
2100 angle = angle + a
RETURN
'
2200 angle = angle - a
RETURN
`);
