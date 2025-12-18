/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM primebe2 - Prime Benchmark (Sieve of Atkin)
MODE 2
'DEFINT a-s,u-z
n=5000
res=669 'expected result (669 for n=5000)
PRINT "Prime Benchmark (Sieve of Atkin)"
PRINT "Number of primes below n=";n;"(primes=";STR$(res);")"
'
loops=1
minms=100
maxruns=8
t=0:r=1
PRINT "Testing loops:";
WHILE t<minms
  loops=loops*10:FRAME:PRINT STR$(loops);
  xr=1:GOSUB 500:IF xr<>1 THEN ERROR 33
WEND
PRINT
GOSUB 400
FRAME
tput=tputMax+0.001
WHILE r<=maxruns AND tput>tputMax
  xr=1:GOSUB 500:IF xr<>1 THEN ERROR 33
  GOSUB 400
  r=r+1
WEND
'
PRINT
PRINT "Maximum thoughput=";DEC$(tputMax,"######.###")
END
'
' print results
400 tput=loops/(t/1000)
PRINT "time=";DEC$(t,"######.###");" ms, loops/sec=";DEC$(tput,"######.###")
IF tput>tputMax THEN tputMax=tput:tput=tputMax+1
RETURN
'
' measurement
500 t=TIME:FOR l=1 TO loops:DIM s(n+1):GOSUB 1000:ERASE s:xr=xr-res+1:NEXT:t=(TIME-t)*10/3
RETURN
'
' compute primes x (using Sieve of Atkin)
1000 x = 1
IF n >= 3 THEN x = x + 1
limit = INT(SQR(n))
FOR x1 = 1 TO limit
  xx1 = x1*x1
  FOR y1 = 1 TO limit
    yy1 = y1*y1
    n1 = 4*xx1 + yy1
    IF n1 <= n AND (n1 MOD 12 = 1 OR n1 MOD 12 = 5) THEN s(n1) = 1 - s(n1)
    n2 = 3*xx1 + yy1
    IF n2 <= n AND n2 MOD 12 = 7 THEN s(n2) = 1 - s(n2)
    n3 = 3*xx1 - yy1
    IF x1 > y1 AND n3 <= n AND n3 MOD 12 = 11 THEN s(n3) = 1 - s(n3)
  NEXT
NEXT
'
FOR i = 5 TO limit
  IF s(i) THEN x = x + 1: k = i*i: FOR j = k TO n STEP k: s(j) = 0: NEXT
NEXT
'
FOR i = limit + 1 TO n
  IF s(i) THEN x = x + 1
NEXT
xr=x
RETURN
`);
