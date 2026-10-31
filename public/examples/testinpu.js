/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM testinpu - Test Input
REM CPCBasic-keys: ["1","","2","","3","","4","","5","","6","","7","","8","","9","","0",""]
REM CPCBasic-keys: ["a","","b","","c",""]
REM CPCBasic-keys: [44,"",32,"Space",127,"Del",13,"Enter"]
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
PRINT "Input was: string:";n$; ", num:"; n
'
LINE INPUT "Line input string: "; ln$
PRINT "Line input was: "; ln$
'
END
`);
