/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM seconds - Seconds Test
REM Marco Vieth, 2019
CLS
loops=2
PRINT "Timing 1 (FRAME):"
FOR cnt=1 TO loops
  t1=TIME
  FOR i=1 TO 50:FRAME:NEXT
  t1=TIME-t1
  PRINT INT(1000*t1/300)/1000
NEXT
'
PRINT "Timing 2 (check time):"
FOR cnt=1 TO loops
  t1=TIME
  civ=50:ct=TIME+civ*6:WHILE TIME<ct:FRAME:WEND
  t1=TIME-t1
  PRINT INT(1000*t1/300)/1000
NEXT
'
'print"Timing 3 (after)"
END
`);
