/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM testloco - LocoBasic syntax test
REM Select syntax=locomotive to see the multi-line IF syntax warning.
REM This checks syntax only, not runtime compatibility.
MODE 1
PRINT "Multi-line IF / ELSE / ENDIF"
value=7
IF value>5 THEN
  PRINT "Value is greater than 5"
ELSE
  PRINT "Value is 5 or less"
ENDIF
IF value=7 THEN
  PRINT "The second condition is true"
ENDIF
END
`);