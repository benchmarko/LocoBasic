/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM rectree - Recursive Tree
REM (c) 1992 A. Mueller & CPC Internat.
REM Rekursiver Baum m. L-System-Fraktalen
REM Modified
DEG
MODE 2
m=4:'Rekursionstiefe
DIM xa(m),ya(m),wa(m)
a=22.5:'Winkel der einzelnen Glieder eines Zweiges zueinander
l=7:'Laenge der Gliedstrecken
'
FOR a=22.5 TO 22.9 STEP 0.1
  GOSUB 50
  t1=TIME+150:WHILE TIME<t1:FRAME:WEND
NEXT
FOR a=22.9 TO 22.4 STEP -0.1
  GOSUB 50
  t1=TIME+150:WHILE TIME<t1:FRAME:WEND
NEXT
END
'
50 CLS
ORIGIN 200,0
t=0:s=0:x=0:y=0:w=90
l=7:m=4:GOSUB 100
'
l=5:m=3
ORIGIN 420,160
t=0:s=0:x=0:y=0:w=90
GOSUB 100
'
l=5:m=2
ORIGIN 520,260
t=0:s=0:x=0:y=0:w=90
GOSUB 100
RETURN
'
'Grafikaufbau
100 IF t=m THEN x=x+COS(w)*l:y=y+SIN(w)*l:DRAW x,y:RETURN
t=t+1
GOSUB 100 ' F
GOSUB 100 ' F
w=w-a     ' +
GOSUB 330 ' [
w=w-a     ' +
GOSUB 100 ' F
w=w+a     ' -
GOSUB 100 ' F
w=w+a     ' -
GOSUB 100 ' F
GOSUB 340 ' ]
w=w+a     ' -
GOSUB 330 ' [
w=w+a     ' -
GOSUB 100 ' F
w=w-a     ' +
GOSUB 100 ' F
w=w-a     ' +
GOSUB 100 ' F
GOSUB 340 ' ]
t=t-1
RETURN
'
'Neuer Zweig
330 xa(s)=x:ya(s)=y:wa(s)=w:s=s+1
RETURN
'Abschluss eines Zweiges  
340 s=s-1:x=xa(s):y=ya(s):w=wa(s):MOVE x,y
RETURN
`);
