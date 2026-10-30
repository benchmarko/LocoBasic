/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM bounce2 - Bounce 2 (loco20)
REM (c) Richard Fairhurst
REM Uses BASIC 2 Plus routines
REM
' BOUNCE from Scull PD
' By Richard Fairhurst
'
hasCircle=&8000>0
DEG
INK 0,13:INK 1,0:INK 2,26:INK 3,2
MODE 1
r=68
'
SUB drawCircle(x0,y0,r0,outlineColour,circleColour)
  SHARED hasCircle
  GRAPHICS PEN outlineColour
  IF hasCircle THEN
    |CIRCLE,x0,y0,r0,circleColour
  ELSE
    MOVE x0,y0+r0
    FOR a=0 TO 360 STEP 6
      DRAW x0+r0*SIN(a),y0+r0*COS(a)
    NEXT
  END IF
END SUB
'
SUB drawBall(x,height,radius)
  y0=200+height*10
  CALL drawCircle(x,y0,radius,1,2)
  shadowRadius=radius/(5*68/radius)
  CALL drawCircle(x+20,y0-40,shadowRadius,3,3)
END SUB
'
SUB drawFrame(height)
  SHARED r
  CLS
  CALL drawBall(230,height,r)
  CALL drawBall(230+r*100/68,height,r)
  t=TIME+15
  WHILE TIME<t
    FRAME
  WEND
END SUB
'
FOR y=0 TO 10
  CALL drawFrame(y)
NEXT
FOR y=10 TO -10 STEP -1
  CALL drawFrame(y)
NEXT
FOR y=-10 TO 0
  CALL drawFrame(y)
NEXT
END
`);