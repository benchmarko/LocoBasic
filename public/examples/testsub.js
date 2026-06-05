/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM testsub - Test Subroutines
CLS
s=0
PRINT SPC(s)"start->800"
GOSUB 800
PRINT SPC(s)"start->1000"
GOSUB 1000
PRINT SPC(s)"t$: ";t$
PRINT SPC(s)"end"
END
'
100 s=s+2
PRINT SPC(s)"sub 100"
s=s-2
RETURN
'
200 s=s+2
PRINT SPC(s)"sub 200"
PRINT SPC(s)"200=>100"
GOSUB 100
s=s-2
RETURN
'
GOSUB 200
PRINT SPC(s)"in between"
ERROR 5: 'not called
'
300 s=s+2
PRINT SPC(s)"sub 300"
PRINT SPC(s)"(inside sub300)"
'PRINT "[6A[D"; 'cursor up and back
'PRINT "Hi -";
'PRINT "[31m Hello World (red)[39m";
'PRINT "[5;15H";"locate 15,5"
'PRINT "[4;17H";"locate 17,4"
''gosub 400
s=s-2
RETURN
'
' main
800 s=s+2
PRINT SPC(s)"sub 800 (main)"
PRINT SPC(s)"800=>100"
GOSUB 100
PRINT SPC(s)"800=>200"
GOSUB 200
PRINT SPC(s)"800=>300"
GOSUB 300
a=1
PRINT SPC(s)"800=>200 (onGosub)"
ON a GOSUB 200, 300
GOSUB 900
s=s-2
RETURN
'
900 s=s+2
PRINT SPC(s)"sub 900 (after main)"
s=s-2
RETURN
'
1000 s=s+2
PRINT SPC(s)"sub 1000"
PRINT SPC(s)"1000=>1500"
GOSUB 1500
PRINT SPC(s)"t$: ";t$
s=s-2
RETURN
'
1500 s=s+2
PRINT SPC(s)"sub 1500 (propagated async)"
PRINT SPC(s)"1500=>1600"
GOSUB 1600
t$="1500("+t$+")"
s=s-2
RETURN
'
1600 s=s+2
PRINT SPC(s)"sub 1600 (async)"
t$=INKEY$
t$="key:"+t$
t$="1600("+t$+")"
PRINT SPC(s)"t$=";t$
s=s-2
RETURN
`);
