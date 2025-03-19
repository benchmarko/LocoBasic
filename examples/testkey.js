/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM testkey - Test keyboard keys
CLS
PRINT "Press some keys..."
WHILE 1
t$="":WHILE t$="":t$=INKEY$:WEND
PRINT t$;ASC(t$);
WEND
STOP
`);
