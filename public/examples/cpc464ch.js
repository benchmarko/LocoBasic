/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM cpc464ch - CPC 464 Character Art
MODE 1
pens=4
xw=27
xoff=0:yoff=1
p=1
INK 0,1:INK 1,24:INK 2,16:INK 3,6
'
FOR yoff=1 TO 6
  GOSUB 300
NEXT
FOR yoff=6 TO 1 STEP -1
  GOSUB 300
NEXT
END
'
' print lines
300 CLS
PAPER 0
FOR i=1 TO yoff
  PRINT SPACE$(xoff+xw)
NEXT
RESTORE
cnt=0
WHILE cnt>=0
 READ cnt
 GOSUB 600
WEND
t=TIME+30:WHILE TIME<t AND INKEY$="":WEND
RETURN
'
' print a line
600 PEN p
PRINT SPACE$(xoff);
x=0
FOR i=1 TO cnt
  READ s1,w1
  PRINT SPACE$(s1);
  PRINT STRING$(w1,"#");
  x=x+s1+w1
NEXT i
PRINT SPACE$(xw-x)
p=p+1:IF p>pens-1 THEN p=1
RETURN
'
DATA 3, 5,3, 3,4, 8,3
DATA 4, 4,4, 3,1, 2,2, 6,4
DATA 4, 2,3, 6,1, 3,1, 4,3
DATA 4, 1,2, 8,1, 3,1, 3,2
DATA 4, 1,1, 9,1, 2,2, 3,1
DATA 3, 1,1, 9,4, 4,1
DATA 3, 1,1, 9,1, 7,1
DATA 3, 1,2, 8,1, 7,2
DATA 3, 2,3, 6,1, 8,3
DATA 3, 4,4, 3,1, 10,4
DATA 3, 5,3, 3,1, 11,3
DATA 0 
DATA 3, 7,1, 5,4, 1,1
DATA 5, 7,1, 1,1, 3,1, 4,1, 1,1
DATA 3, 7,4, 2,4, 1,4
DATA 4, 9,1, 3,1, 2,1, 3,1
DATA 1, 13,4
DATA -1
`);
