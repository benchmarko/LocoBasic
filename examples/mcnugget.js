/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM mcnugget - McNuggets problem
REM https://rosettacode.org/wiki/McNuggets_problem#Locomotive_Basic
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM modifications: removed CLEAR; replaced a(x) by ar(x)
'CLEAR
DIM ar(100)
FOR a=0 TO 100/6
  FOR b=0 TO 100/9
    FOR c=0 TO 100/20
      n=a*6+b*9+c*20
      IF n<=100 THEN ar(n)=1
    NEXT c
  NEXT b
NEXT a
FOR n=0 TO 100
  IF ar(n)=0 THEN l=n
NEXT n
PRINT "The Largest non McNugget number is:";l
END
`);
