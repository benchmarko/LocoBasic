/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM hilbert - Hilbert curve
REM written by MV with the help of AI
REM https://en.wikipedia.org/wiki/Hilbert_curve
REM as Lindenmayer system: A -> +BF-AFA-FB+ , B -> -AF+BFB+FA-
REM Hilbert (stack-based, gap-based, compact, no trig)
REM
MODE 2
level = 5
step1 = 8
'
' stack
DIM alevel(level+1), agap(level+1), aflip(level+1)
'
' directions
DIM dx(3), dy(3)
dx(0)=1: dy(0)=0
dx(1)=0: dy(1)=-1
dx(2)=-1: dy(2)=0
dx(3)=0: dy(3)=1
'
' GAPS encoding: max 2 ops per gap
DIM glen(4), gseq1(4), gseq2(4), gnext(4)
'
' gap 0: [+] -> B
glen(0)=1: gseq1(0)=1: gnext(0)=1
' gap 1: [F,-] -> A
glen(1)=2: gseq1(1)=0: gseq2(1)=-1: gnext(1)=0
' gap 2: [F] -> A
glen(2)=1: gseq1(2)=0: gnext(2)=0
' gap 3: [-,F] -> B
glen(3)=2: gseq1(3)=-1: gseq2(3)=0: gnext(3)=1
' gap 4: [+] -> end
glen(4)=1: gseq1(4)=1: gnext(4)=-1
'
' turtle
x = 100: y = 100: dir = 0
MOVE x,y
'
' init stack
sp = 1
alevel(1)=level
agap(1)=0
aflip(1)=0
'
WHILE sp > 0
  lv = alevel(sp)
  gap = agap(sp)
  flip = aflip(sp)
  IF lv = 0 THEN sp = sp - 1 ELSE GOSUB 1500
WEND
END
'
' execute gap
1500 FOR i = 1 TO glen(gap)
  IF i=1 THEN t = gseq1(gap) ELSE t = gseq2(gap)
  IF t = 0 THEN GOSUB 2000 ELSE GOSUB 2100
NEXT i
'
nt = gnext(gap)
IF nt = -1 THEN sp = sp - 1: RETURN
agap(sp) = gap + 1
sp = sp + 1
alevel(sp) = lv - 1
agap(sp) = 0
aflip(sp)=flip XOR nt
RETURN
'
2000 x = x + dx(dir) * step1
y = y - dy(dir) * step1
DRAW x,y
RETURN
'
2100 IF flip=1 THEN t = -t
dir = (dir + t + 4) AND 3
RETURN
`);
