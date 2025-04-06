/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM seconds - Seconds Test
REM Marco Vieth, 2019
CLS
loops=2
PRINT "Timing 1 (FRAME)"
FOR cnt=1 TO loops
  t=TIME
  FOR i=1 TO 50:FRAME:NEXT
  t=TIME-t
  PRINT ROUND(t/300,3)
NEXT
'
PRINT "Timing 2 (check time)"
FOR cnt=1 TO loops
  t=TIME
  ct=TIME+300:WHILE TIME<ct:FRAME:WEND
  t=TIME-t
  PRINT ROUND(t/300,3)
NEXT
'
PRINT "Timing 3 (AFTER)"
FOR cnt=1 TO loops
  flg=0:AFTER 50 GOSUB 500
  t=TIME
  WHILE flg=0:FRAME:WEND
  t=TIME-t
  PRINT ROUND(t/300,3)
NEXT
'
PRINT "Timing 4 (EVERY)"
cnt=0
t=TIME
EVERY 50 GOSUB 600
WHILE cnt<=1:FRAME:WEND
flg=REMAIN(0)
'
END
'
500 flg=REMAIN(0)+1
RETURN
'
600 cnt=cnt+1
t=TIME-t
PRINT ROUND(t/300,3)
t=TIME
RETURN
`);
