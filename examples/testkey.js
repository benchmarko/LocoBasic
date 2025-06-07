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
WHILE 1
t$="":WHILE t$="":t$=INKEY$:WEND
PRINT t$;ASC(t$);
WEND
END
`);
