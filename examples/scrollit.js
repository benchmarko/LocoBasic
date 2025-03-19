/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM scrollit - Scrolling text
REM
MODE 1
width1=38
steps=60
a$="This is a very simple scrolling text for the CPC..."
a=LEN(a$)
a$=a$+a$
frame1$="+"+STRING$(width1, "-")+"+"
FOR i=1 TO steps
  t=TIME+20
  CLS
  PRINT frame1$
  PRINT "|";MID$(a$,(i MOD a)+1,width1);"|"
  PRINT frame1$
  WHILE TIME<t:FRAME:WEND
NEXT i
END
`);
