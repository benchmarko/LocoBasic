/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM antipri - Anti-primes
REM task: https://rosettacode.org/wiki/Anti-primes
REM Natural numbers with more factors than any smaller than itself
pmax=20
n=1
dmax=0
pc=0
WHILE pc<pmax
  GOSUB 500
  IF dc>dmax THEN pc=pc+1:dmax=dc:PRINT STR$(n);
  n=n+1
WEND
PRINT
STOP
'
'dc=countDivisors(n)
500 dc=0
i=1
WHILE i*i<=n
  IF (n MOD i)=0 THEN dc=dc+1:IF i*i<n THEN dc=dc+1
  i=i+1
WEND
RETURN
`);
