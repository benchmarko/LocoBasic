/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM testkey - Test keys (keyboard)
REM Test keyboard keys and their ASCII codes
REM CPCBasic-keys: ["0",,"1",,"2",,"3",,"4",,"5",,"6",,"7",,"8",,"9",]
REM CPCBasic-keys: ["a",,"b",,"c",,"d",,"e",,"f",,"g",,"h",,"i",,"j",,"k",,"l",,"m",,"n",,"o",,"p",,"q",,"r",,"s",,"t",,"u",,"v",,"w",,"x",,"y",,"z",]
REM CPCBasic-keys: [44,"",".",]
REM CPCBasic-keys: [240,"\\u2191",241,"\\u2193",242,"\\u2190",243,"\\u2192"]
REM CPCBasic-keys: [32,"Space",127,"Delete",13,"Enter"]
REM
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
