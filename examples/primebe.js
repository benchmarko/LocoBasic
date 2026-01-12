/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM primebe - Prime Benchmark (Division)
REM Trial division
MODE 2
'DEFINT a-s,u-z
n=5000
res=669 'expected result (669 for n=5000)
PRINT "Prime Benchmark (trial division)"
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
500 t=TIME:FOR l=1 TO loops:GOSUB 1000:xr=xr-res+1:NEXT:t=(TIME-t)*10/3
RETURN
'
' compute primes x (using trial division)
1000 x = 1
FOR j = 3 TO n STEP 2
  isPrime = 1
  i = 3
  WHILE (i * i <= j) AND (isPrime = 1)
    IF j MOD i = 0 THEN isPrime = 0
    i = i + 2
  WEND
  IF isPrime = 1 THEN x = x + 1
NEXT j
xr=x
RETURN
`);
