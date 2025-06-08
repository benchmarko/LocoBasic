/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM testkey - Test keyboard keys
MODE 2
FOR c=&20 TO &7F
  PRINT HEX$(c,2);" ";CHR$(c);" ";
  IF c MOD 16 = 15 THEN PRINT
NEXT
PRINT
'
PRINT "Press some keys..."
FOR k=ASC("0") TO ASC("3"):GOSUB 950:NEXT
FOR k=ASC("a") TO ASC("g"):GOSUB 950:NEXT
WHILE 1
t$="":WHILE t$="":t$=INKEY$:WEND
PRINT t$;ASC(t$);
WEND
k=0:GOSUB 950
END
'
' Define user key for LocoBasic
950 KEY DEF 78,1,k
RETURN
`);
