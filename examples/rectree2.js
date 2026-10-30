/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM rectree2 - Recursive Tree 2 (loco20)
REM (c) 1992 A. Mueller & CPC Internat.
REM Rekursiver Baum m. L-System-Fraktalen
REM Uses BASIC 2 Plus routines
DEG
MODE 2
'
SUB growTree(depth,length,angle)
  SHARED x,y,w
  IF depth=0 THEN
    x=x+COS(w)*length
    y=y+SIN(w)*length
    DRAW x,y
  ELSE
    CALL growTree(depth-1,length,angle)
    CALL growTree(depth-1,length,angle)
    w=w-angle
    savedX=x:savedY=y:savedHeading=w
    w=w-angle
    CALL growTree(depth-1,length,angle)
    w=w+angle
    CALL growTree(depth-1,length,angle)
    w=w+angle
    CALL growTree(depth-1,length,angle)
    x=savedX:y=savedY:w=savedHeading
    MOVE x,y
    w=w+angle
    savedX=x:savedY=y:savedHeading=w
    w=w+angle
    CALL growTree(depth-1,length,angle)
    w=w-angle
    CALL growTree(depth-1,length,angle)
    w=w-angle
    CALL growTree(depth-1,length,angle)
    x=savedX:y=savedY:w=savedHeading
    MOVE x,y
  END IF
END SUB
'
SUB drawTree(originX,originY,depth,length,angle)
  SHARED x,y,w
  ORIGIN originX,originY
  x=0:y=0:w=90
  CALL growTree(depth,length,angle)
END SUB
'
SUB drawForest(angle)
  CLS
  CALL drawTree(200,0,4,7,angle)
  CALL drawTree(420,160,3,5,angle)
  CALL drawTree(520,260,2,5,angle)
END SUB
'
FOR a=22.5 TO 22.9 STEP 0.1
  CALL drawForest(a)
  t1=TIME+150:WHILE TIME<t1:FRAME:WEND
NEXT
FOR a=22.9 TO 22.4 STEP -0.1
  CALL drawForest(a)
  t1=TIME+150:WHILE TIME<t1:FRAME:WEND
NEXT
END
`);