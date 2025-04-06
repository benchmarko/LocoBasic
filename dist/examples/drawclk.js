/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM drawclk - Draw a clock
REM https://rosettacode.org/wiki/Draw_a_clock#Locomotive_Basic
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM modifications: draw clock every second, no xor mode; |CIRCLE
MODE 1
DEG
t$="01:30":'INPUT "Current time (HH:MM)";t$
h=VAL(MID$(t$,1,2))
m=VAL(MID$(t$,4,2))
r=150:s=0
ph=0:pm=0
ORIGIN 320,200
'
GOSUB 400:EVERY 50 GOSUB 400
'
t=TIME
WHILE INKEY$=""
  'GOSUB 400 'draw clock (no EVERY)
  t=t+50*6
  WHILE TIME<t:FRAME:WEND
WEND
t=REMAIN(0)
END
'
' draw clock
400 CLS
FOR a=0 TO 360 STEP 6
  IF a MOD 30>0 THEN z=0.9 ELSE z=0.8
  MOVE z*r*SIN(a),z*r*COS(a)
  DRAW r*SIN(a),r*COS(a)
NEXT
|CIRCLE,320,200,r
'MOVE 0,r
'FOR a=0 TO 360 STEP 6
'  DRAW r*SIN(a),r*COS(a)
'NEXT
'
' new sec
s=s+1
' draw sec
a=6*s
MOVE 0,0:DRAW 0.8*r*SIN(a-6),0.8*r*COS(a-6),3
'
IF s=60 THEN s=0:m=m+1: IF m=60 THEN m=0:h=h+1: IF h=24 THEN h=0
pm=6*m
MOVE 0,0:DRAW 0.7*r*SIN(pm),0.7*r*COS(pm),2
ph=30*h+0.5*m
MOVE 0,0:DRAW 0.5*r*SIN(ph),0.5*r*COS(ph),2
GRAPHICS PEN 1
FRAME
RETURN
`);
