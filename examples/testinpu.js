/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM testinpu - Test Input
CLS
PRINT "Test Input"
PRINT
'
PRINT "Input string: "; 
INPUT n$
PRINT
PRINT "Input was: ";n$
'
INPUT "string,number:"; n$, n
PRINT "Input was: ";n$, n
'
END
`);
