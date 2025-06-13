/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM drawclk - Draw a clock
REM https://rosettacode.org/wiki/Draw_a_clock#Locomotive_Basic
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM modifications: draw clock every second, no xor mode; |CIRCLE; |TIME
REM
lbasic=&8000>0: 'fast hack to detect LocoBasic
IF lbasic THEN xd=1 ELSE xd=2 
MODE 1
DEG
't$="01:30:00"
' https://www.cpcwiki.eu/index.php/Dobbertin_Smart_Watch
'get current time from RTC ("HH MM SS")
IF lbasic THEN t$=SPACE$(8):|TIME,@t$ ELSE INPUT "Current time (HH:MM:SS)";t$
h=VAL(LEFT$(t$,2))
m=VAL(MID$(t$,4,2))
s=VAL(RIGHT$(t$,2))
r=150
ORIGIN 320,200
'
GOSUB 400
EVERY 50 GOSUB 400
'
WHILE INKEY$="":WEND
r=REMAIN(0)
END
'
'without every:
' t=TIME: WHILE INKEY$="": GOSUB 400: t=t+300: WHILE TIME<t:FRAME:WEND: WEND
'
' draw clock
400 CLS
TAG
MOVE -25*xd,r/2
PRINT USING "##";h;: PRINT":";: PRINT USING "##";m;: PRINT":";: PRINT USING "##";s; 'todo: PRINT USING "##:##:##";h;m;s; 
FOR a=0 TO 360 STEP 6
  IF a MOD 30>0 THEN z=0.9 ELSE z=0.8
  MOVE z*r*SIN(a),z*r*COS(a)
  DRAW r*SIN(a),r*COS(a)
NEXT
'
IF lbasic THEN |CIRCLE,320,200,r ELSE MOVE 0,r: FOR a=0 TO 360 STEP 6: DRAW r*SIN(a),r*COS(a): NEXT
'
' new sec
s=s+1
IF s=60 THEN s=0:m=m+1: IF m=60 THEN m=0:h=h+1: IF h=24 THEN h=0
a=6*s-6
MOVE 0,0:DRAW 0.8*r*SIN(a),0.8*r*COS(a),3
a=6*m
MOVE 0,0:DRAW 0.7*r*SIN(a),0.7*r*COS(a),2
a=30*h+0.5*m
MOVE 0,0:DRAW 0.5*r*SIN(a),0.5*r*COS(a)
GRAPHICS PEN 1
FRAME
RETURN
`);
