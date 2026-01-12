/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM primebe3 - Prime Benchmark (Eratosthenes)
REM Sieve of Eratosthenes
MODE 2
DEFINT s ' DEFINT a-s,u-z
n=5000
res=669 'expected result (669 for n=5000)
PRINT "Prime Benchmark (Sieve of Eratosthenes)"
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
500 ndiv2=INT(n/2)
t=TIME:FOR l=1 TO loops:DIM s(ndiv2+1):GOSUB 1000:ERASE s:xr=xr-res+1:NEXT:t=(TIME-t)*10/3
RETURN
'
' compute primes x (using Sieve of Eratosthenes and a 2-wheel)
1000 i=0:m=3
x=1
WHILE m*m<=n
  IF s(i)=0 THEN x=x+1: j=(m*m-3)\\2: WHILE j<ndiv2: s(j)=1: j=j+m: WEND
  i=i+1:m=m+2
WEND
WHILE m<=n
  IF s(i)=0 THEN x=x+1
  i=i+1:m=m+2
WEND
xr=x
RETURN
`);
