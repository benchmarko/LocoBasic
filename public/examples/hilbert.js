/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM hilbert - Hilbert Curve
REM written by MV with the help of AI
REM (no trig, stack-based)
REM
MODE 2
level = 5
step1 = 4*2
DIM alevel(level+1), astate(level+1), atype(level+1)
'
REM direction vectors
DIM dx(3), dy(3)
dx(0)=1: dy(0)=0
dx(1)=0: dy(1)=-1
dx(2)=-1: dy(2)=0
dx(3)=0: dy(3)=1
'
REM turtle
x = 100
y = 100
dir = 0
'
MOVE x,y
'
REM push initial A
sp = 1
alevel(sp) = level
astate(sp) = 0
atype(sp) = 0: REM 0 = A, 1 = B
'
GOSUB 1000
END
'
REM --- interpreter loop ---
1000 WHILE sp > 0
  level = alevel(sp)
  state = astate(sp)
  type = atype(sp)
  IF level = 0 THEN sp = sp - 1 ELSE IF type = 0 THEN GOSUB 2000 ELSE GOSUB 3000
WEND
RETURN
'
REM --- A: +BF-AFA-FB+
2000 ON state+1 GOSUB 2010,2020,2030,2040,2050,2060,2070,2080,2090,2100,2110
RETURN
'
REM +
2010 dir = (dir + 1) AND 3: astate(sp)=1
RETURN
REM B
2020 astate(sp)=2: sp=sp+1: atype(sp)=1: alevel(sp)=level-1: astate(sp)=0
RETURN
REM F
2030 astate(sp)=3: GOSUB 4000
RETURN
REM -
2040 dir = (dir + 3) AND 3: astate(sp)=4
RETURN
REM A
2050 astate(sp)=5: sp=sp+1: atype(sp)=0: alevel(sp)=level-1: astate(sp)=0
RETURN
REM F
2060 astate(sp)=6: GOSUB 4000
RETURN
REM A
2070 astate(sp)=7: sp=sp+1: atype(sp)=0: alevel(sp)=level-1: astate(sp)=0
RETURN
REM -
2080 dir = (dir + 3) AND 3: astate(sp)=8
RETURN
REM F
2090 astate(sp)=9: GOSUB 4000
RETURN
REM B
2100 astate(sp)=10: sp=sp+1: atype(sp)=1: alevel(sp)=level-1: astate(sp)=0
RETURN
REM + (final)
2110 dir = (dir + 1) AND 3: sp=sp-1
RETURN
'
REM --- B: -AF+BFB+FA-
3000 ON state+1 GOSUB 3010,3020,3030,3040,3050,3060,3070,3080,3090,3100,3110
RETURN
'
3010 dir = (dir + 3) AND 3: astate(sp)=1
RETURN
3020 astate(sp)=2: sp=sp+1: atype(sp)=0: alevel(sp)=level-1: astate(sp)=0
RETURN
3030 astate(sp)=3: GOSUB 4000
RETURN
3040 dir = (dir + 1) AND 3: astate(sp)=4
RETURN
3050 astate(sp)=5: sp=sp+1: atype(sp)=1: alevel(sp)=level-1: astate(sp)=0
RETURN
3060 astate(sp)=6: GOSUB 4000
RETURN
3070 astate(sp)=7: sp=sp+1: atype(sp)=1: alevel(sp)=level-1: astate(sp)=0
RETURN
3080 dir = (dir + 1) AND 3: astate(sp)=8
RETURN
3090 astate(sp)=9: GOSUB 4000
RETURN
3100 astate(sp)=10: sp=sp+1: atype(sp)=0: alevel(sp)=level-1: astate(sp)=0
RETURN
3110 dir = (dir + 3) AND 3: sp=sp-1
RETURN
'
REM --- draw forward ---
4000 x = x + dx(dir) * step1
y = y - dy(dir) * step1
DRAW x,y
RETURN
`);
