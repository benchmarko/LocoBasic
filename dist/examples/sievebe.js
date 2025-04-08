/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM sievebe - Sieve Benchmark
MODE 2
n=5000
GOSUB 2280
res=x 'expected result (669 for n=5000)
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
  x=1:GOSUB 500:IF x<>1 THEN ERROR 33
WEND
PRINT
'
maxtput=0
tput=maxtput+1
maxruns=8
r=1
FRAME
WHILE r<=maxruns AND tput>maxtput
  x=1:GOSUB 500:IF x<>1 THEN ERROR 33
  tput=loops/(t/1000)
  PRINT "n=";n;", primes=";x;", loops=";loops;", time=";DEC$(t,"####.###");" ms , loops/sec=";DEC$(tput,"######.###")
  IF tput>maxtput THEN maxtput=tput:tput=maxtput+1
  r=r+1
WEND
PRINT "maximum thoughput=";DEC$(maxtput,"######.###")
END
'
' measurement
500 t=TIME:FOR l=1 TO loops:DIM s(ndiv2+1):GOSUB 1000:ERASE s:x=x-res+1:NEXT:t=(TIME-t)*10/3
RETURN
'
' compute primes x (using Sieve of Eratosthenes and a 2-wheel)
1000 i=0:m=3:WHILE m*m<=n:IF s(i)=0 THEN x=x+1:j=(m*m-3)\\2:WHILE j<ndiv2:s(j)=1:j=j+m:WEND
i=i+1:m=m+2:WEND:WHILE m<=n:IF s(i)=0 THEN x=x+1
i=i+1:m=m+2:WEND
RETURN
'
' expanded computation
'1200 i=0:m=3:x=1
'WHILE m*m<=n
'  IF s(i)=0 THEN x=x+1: j=(m*m-3)\\2: WHILE j<ndiv2: s(j)=1: j=j+m: WEND
'  i=i+1:m=m+2
'WEND
'WHILE m<=n
'  IF s(i)=0 THEN x=x+1
'  i=i+1:m=m+2
'WEND
'RETURN
'
' alternative wayto compute primes
2280 x = 1
FOR j = 3 TO n STEP 2
  isPrime = 1
  i = 3
  WHILE (i * i <= j) AND (isPrime = 1)
    IF j MOD i = 0 THEN isPrime = 0
    i = i + 2
  WEND
  IF isPrime = 1 THEN x = x + 1
NEXT j
RETURN
`);
