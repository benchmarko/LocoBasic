/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM sievebe - Sieve Benchmark
MODE 2
n=5000
PRINT "Sieve Benchmark"
PRINT "Number of primes below n=";n
ndiv2=INT(n/2)
'
loops=10
minms=100
PRINT "Testing loops:";
t=0
WHILE t<minms
  loops=loops*10
  FRAME
  PRINT loops;
  GOSUB 500
WEND
PRINT
'
maxtput=0
tput=maxtput+1
maxruns=8
r=1
FRAME
WHILE r<=maxruns AND tput>maxtput
  GOSUB 500
  tput=loops/(t/1000)
  PRINT "n=";n;", primes=";x;", loops=";loops;", time=";DEC$(t,"####.###");" ms , loops/sec=";DEC$(tput,"######.###")
  IF tput>maxtput THEN maxtput=tput:tput=maxtput+1
  r=r+1
WEND
PRINT "maximum thoughput=";DEC$(maxtput,"######.###")
END
'
' measurement
500 t=TIME:FOR l=1 TO loops:DIM s(ndiv2+1):GOSUB 1000:ERASE s:NEXT:t=(TIME-t)*10/3
RETURN
'
' compute primes (using Sieve of Eratosthenes and a 2-wheel)
1000 i=0:m=3:x=1:WHILE m*m<=n:IF s(i)=0 THEN x=x+1:j=(m*m-3)\\2:WHILE j<ndiv2:s(j)=1:j=j+m:WEND
i=i+1:m=m+2:WEND:WHILE m<=n:IF s(i)=0 THEN x=x+1
i=i+1:m=m+2:WEND
RETURN
'
'1200 i=0:m=3:x=1
'WHILE m*m<=n
'IF s(i)=0 THEN x=x+1: j=(m*m-3)\\2: WHILE j<ndiv2: s(j)=1: j=j+m: WEND
'i=i+1:m=m+2
'WEND
'WHILE m<=n
'IF s(i)=0 THEN x=x+1
'i=i+1:m=m+2
'WEND
'RETURN
`);
