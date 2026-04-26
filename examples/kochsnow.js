/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM kochsnow - Koch Snowflake
REM written by MV with the help of AI
REM (stack-based, no recursion)
'
MODE 2
DEG
maxlevel=4
FOR level=1 TO maxlevel
  CLS
  GOSUB 200
  t=TIME+300:WHILE TIME<t AND INKEY$="":WEND
NEXT
END
'
'level = 4
200 length = 300
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
  angle = angle - 120
NEXT i
ERASE alevel, alength, astate
RETURN
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
900 x = x + length * COS(angle)
y = y - length * SIN(angle)
DRAW x,y
sp = sp - 1
RETURN
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
1100 angle = angle + 60
astate(sp) = 2
sp = sp + 1
alevel(sp) = level - 1
alength(sp) = length / 3
astate(sp) = 0
RETURN
'
' state = 2
1200 angle = angle - 120
astate(sp) = 3
sp = sp + 1
alevel(sp) = level - 1
alength(sp) = length / 3
astate(sp) = 0
RETURN
'
' state = 3
1300 angle = angle + 60
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
`);
