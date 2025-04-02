/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM nqueens - N-queens problem
REM https://rosettacode.org/wiki/N-queens_problem#Locomotive_Basic
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM modifications: print board without LOCATE; GOTO removed
MODE 1 ':defint a-z
n=3: WHILE n<4:INPUT "How many queens (N>=4)";n:WEND
DIM q(n),e(n),o(n)
r=n MOD 6
IF r<>2 AND r<>3 THEN GOSUB 320:GOSUB 220:END
FOR i=1 TO INT(n/2)
  e(i)=2*i
NEXT
FOR i=1 TO ROUND(n/2)
  o(i)=2*i-1
NEXT
IF r=2 THEN GOSUB 410
IF r=3 THEN GOSUB 460
s=1
FOR i=1 TO n
  IF e(i)>0 THEN q(s)=e(i):s=s+1
NEXT
FOR i=1 TO n
  IF o(i)>0 THEN q(s)=o(i):s=s+1
NEXT
GOSUB 220
END
'
' print board
220 CLS
PRINT "N-queens problem"
PRINT
FOR i=1 TO n:PRINT CHR$(96+i);:NEXT:PRINT
PRINT
FOR j=1 TO n
  FOR i=1 TO n
    IF j=n+1-q(i) THEN PRINT "*"; ELSE PRINT " ";
  NEXT
  PRINT n+1-j
NEXT
'for i=1 to n
'locate i,26-q(i):print chr$(238);
'locate i,24-n   :print chr$(96+i);
'locate n+1,26-i :print i;
'next
'locate 1,1
'call &bb06
'end
RETURN
'
' the simple case
320 p=1
FOR i=1 TO n
  IF i MOD 2=0 THEN q(p)=i:p=p+1
NEXT
FOR i=1 TO n
  IF i MOD 2 THEN q(p)=i:p=p+1
NEXT
RETURN
' edit list when remainder is 2
410 FOR i=1 TO n
  IF o(i)=3 THEN o(i)=1 ELSE IF o(i)=1 THEN o(i)=3
  IF o(i)=5 THEN o(i)=-1 ELSE IF o(i)=0 THEN o(i)=5:RETURN
NEXT
GOSUB 900:' edit list when remainder is 3
GOSUB 460
RETURN
'
460 'for i=1 to n
'if e(i)=2 then e(i)=-1 else if e(i)=0 then e(i)=2:goto 500
'next
' edit list some more
FOR i=1 TO n
  IF o(i)=1 OR o(i)=3 THEN o(i)=-1 ELSE IF o(i)=0 THEN o(i)=1:o(i+1)=3:RETURN
NEXT
'
RETURN
'
' edit list when remainder is 3
900 FOR i=1 TO n
  IF e(i)=2 THEN e(i)=-1 ELSE IF e(i)=0 THEN e(i)=2:RETURN:'goto 500
NEXT
RETURN
`);
