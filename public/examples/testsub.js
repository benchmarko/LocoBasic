/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM testsub - Test Subroutines
CLS
PRINT "start"
GOSUB 350
PRINT "end"
END
'
100 PRINT "sub100"
RETURN
'
200 PRINT "sub200"
  PRINT "inside sub200"
  GOSUB 100
RETURN
'
GOSUB 200
PRINT "in between"
'
300 PRINT "sub300"
  PRINT "inside sub300"
  'PRINT "\\x1b[6A\\x1b[D"; 'cursor up and back
  'PRINT "Hi -";
  'PRINT "\\x1b[31m Hello World (red)\\x1b[39m";
  'PRINT "\\x1b[5;15H";"locate 15,5"
  'PRINT "\\x1b[4;17H";"locate 17,4"
  ''gosub 400
RETURN
'
350 'main
GOSUB 100
GOSUB 200
GOSUB 300
a=1
ON a GOSUB 200, 300
RETURN
`);
