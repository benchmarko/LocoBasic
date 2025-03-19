/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM manspri - Man Sprite
REM Sample from http://www.cpcwiki.eu/forum/programming/silly-programming-ideas-turning-text-into-graphics/msg33246/#msg33246
REM
MODE 2
FOR ind = 1 TO 20 STEP 2
  CLS
  indent$=SPACE$(ind)
  GOSUB 2000
  t=TIME+30:WHILE TIME<t:FRAME:WEND
NEXT
END
'
2000 'output
RESTORE 3000
FOR y=1 TO 22
  PRINT indent$;
  FOR x=1 TO 11
    READ p
    IF p>0 THEN ch$=CHR$(65+p) ELSE ch$=" "
    PRINT STRING$(4,ch$);
  NEXT x
  PRINT
NEXT y
RETURN
'
3000 DATA 0,4,4,4,4,4,4,0,0,0,0
DATA 0,4,4,4,4,4,4,4,4,4,0
DATA 0,4,4,4,4,4,4,9,4,4,0
DATA 4,4,4,4,4,4,4,9,4,4,0
DATA 4,4,4,4,4,4,9,9,9,4,4
DATA 4,4,4,4,1,0,9,0,1,4,4
DATA 4,9,4,9,1,0,9,0,1,4,4
DATA 0,9,4,9,1,0,9,0,1,4,4
DATA 0,9,9,9,1,0,9,0,1,4,0
DATA 0,4,9,9,1,1,9,1,9,9,0
DATA 0,4,9,9,9,1,9,1,9,9,0
DATA 0,4,9,9,9,9,9,9,9,9,0
DATA 0,7,4,9,9,9,0,9,9,9,0
DATA 7,7,7,9,9,9,9,9,9,8,0
DATA 7,7,7,8,7,7,7,8,7,8,0
DATA 7,7,9,8,7,7,7,8,9,9,0
DATA 7,9,9,9,8,8,8,8,9,9,0
DATA 0,9,9,8,6,1,6,1,8,9,0
DATA 0,8,8,8,8,6,6,6,6,8,0
DATA 0,8,8,8,8,8,8,8,8,8,8
DATA 0,4,6,6,6,0,6,6,6,6,4
DATA 0,4,4,4,4,0,4,4,4,4,4
`);
