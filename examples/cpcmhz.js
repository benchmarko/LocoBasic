/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM cpcmhz - CPC MHz: Time measurement
PRINT "Measurement started."
DIM r(5)
ms300=100:mxcpc=90
loops=2
'
FOR i=0 TO loops-1
  c=0:t1=TIME:t=t1
  WHILE t=t1:t=TIME:c=c+1:WEND
  c=0:t1=t+ms300
  WHILE TIME<t1:c=c+1:WEND
  r(i)=c
NEXT
PRINT "In";ROUND(ms300*10/3);"ms we can count to:";
mx=0
FOR i=0 TO loops-1
  PRINT STR$(r(i));
  mx=MAX(mx,r(i))
NEXT
mhz=mx/mxcpc*4
PRINT "":PRINT "=> max:";STR$(mx);", CPC";mhz;"MHz"
`);
