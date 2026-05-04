/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM kochsnow - Koch Snowflake
REM written by MV with the help of AI
REM https://en.wikipedia.org/wiki/Koch_snowflake
REM as Lindenmayer system: F -> F+F--F+F
REM (stack-based, no recursion)
REM
MODE 2
DEG
maxlevel=4
' --- stack arrays ---
DIM alevel(maxlevel+1), alength(maxlevel+1), astate(maxlevel+1)
'
FOR level=0 TO maxlevel
  CLS
  GOSUB 200
  t=TIME+300:WHILE TIME<t AND INKEY$="":WEND
NEXT
END
'
200 length = 300
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
RETURN
'
' --- iterative Koch using stack ---
800 WHILE sp > 0
  level = alevel(sp)
  length = alength(sp)
  state = astate(sp)
  IF level = 0 THEN GOSUB 900 ELSE ON state+1 GOSUB 1000,1100,1200,1100,1400
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
' F (state 0; partly 1,2,3,4)
1000 astate(sp) = state + 1
sp = sp + 1
alevel(sp) = level - 1
alength(sp) = length / 3
astate(sp) = 0
RETURN
'
' +F (state 1, 3)
1100 angle = angle + 60
GOSUB 1000
RETURN
'
' --F (state 2)
1200 angle = angle - 120
GOSUB 1000
RETURN
'
' (state 4) done with frame
1400 sp = sp - 1
RETURN
`);
