/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM testspch - Test Speech Synthesis
PRINT "Test Speech Synthesis"
a$="This is an example of speech synthesis"
GOSUB 500
a$="|PITCH,20"
|PITCH,20
GOSUB 500
a$="Goodbye"
GOSUB 500
|PITCH,10
END
'
500 PRINT "|SAY, ";CHR$(34);a$;CHR$(34)
FRAME
|SAY,a$
RETURN
`);
