export const examples: Record<string, string> = {
    euler:
`REM euler - Compute e with 1000 digits
PRINT"Compute e with 1000 digits"
DIM a(202)
b=100000:a(0)=1
FOR n=450 TO 1 STEP -1
  if a(0)>0 then FOR i=0 TO 201: q=INT(a(i)/n):r=a(i)-q*n: a(i)=q:a(i+1)=a(i+1)+b*r: NEXT
  a(0)=a(0)+1
NEXT
'Round 
a(201)=a(201)+INT(a(202)/b+0.5)
FOR i=200 TO 1 STEP -1
  u=INT(a(i)/b):a(i)=a(i)-b*u
  a(i-1)=a(i-1)+u
NEXT
'rem
PRINT"e=";a(0);"."
FOR i=1 TO 200
  a$=STR$(a(i)):a$=RIGHT$(a$,LEN(a$)-1)
  PRINT RIGHT$("0000"+a$,5);" ";
NEXT
`,

    lifegame:
`rem lifegame - Game of Life
ze=10:sp=10:DIM al(ze,sp+1):DIM ne(ze,sp+1)
PRINT"L I F E G A M E"
FOR w=1 TO 18
  x=INT(7*RND(1)+1):y=INT(7*RND(1)+1):IF al(x,y)<>1 THEN al(x,y)=1
NEXT w
al(5,4)=1:al(5,5)=1:al(5,6)=1
FOR i=1 TO ze-1:FOR j=1 TO sp
  IF al(i,j)=0 THEN PRINT " "; ELSE PRINT "*";
NEXT j: PRINT "": NEXT i
FOR i=1 TO ze-1:FOR j=1 TO sp:an=0:ne(i,j)=0
  an=al(i-1,j-1)+al(i-1,j)+al(i-1,j+1)+al(i,j-1)+al(i,j+1)+al(i+1,j-1)+al(i+1,j)+al(i+1,j+1)
  IF al(i,j)<>0 THEN IF an=2 THEN ne(i,j)=1
  IF an=3 THEN ne(i,j)=1
NEXT j:NEXT i
FOR i=1 TO ze-1:FOR j=1 TO sp:al(i,j)=ne(i,j):NEXT j:NEXT i
`,

sieve:
`REM sieve
n=1000000
DIM sieve1(n + 1)
nHalf = INT(n / 2)
REM initialize sieve
FOR i = 0 TO nHalf: sieve1(i) = 0: NEXT i
REM compute primes
i = 0
m = 3
x = 1
WHILE m * m <= n
  IF sieve1(i) = 0 THEN x = x + 1
  j = INT((m * m - 3) / 2)
  WHILE j < nHalf
    sieve1(j) = 1
    j = j + m
  WEND
  i = i + 1
  m = m + 2
WEND
REM count remaining primes
WHILE m <= n
  IF sieve1(i) = 0 THEN x = x + 1
  i = i + 1
  m = m + 2
WEND
PRINT "Number of primes below ";n;": ";x
`,

testSub:
`?"start"
'
100 ?"sub100"
return
'
200 ?"sub200"
  ?"inside sub200"
  gosub 100
return
'
gosub 200
?"in between"
'
300 ?"sub300"
  ?"inside sub300"
  'gosub 400
return
'
gosub 300
a=1
on a gosub 200, 300
?"at end"
`,

time:
`REM cpcmhz - CPC MHz: Time measurement
PRINT "Measurement started."
DIM r(5)
ms=100/10:mxcpc=90/10
'
FOR i=0 TO 4
c=0:t1=INT(TIME*300/1000)
t=t1: WHILE t=t1:t=INT(TIME*300/1000):c=c+1:WEND
c=0:t1=t+ms
WHILE t<t1:t=INT(TIME*300/1000):c=c+1:WEND
r(i)=c
NEXT
PRINT "In";ms;"ms we can count to:";
mx=0
FOR i=0 TO 4
PRINT STR$(r(i));
mx=MAX(mx,r(i))
NEXT
mhz=mx/mxcpc*4
PRINT "":PRINT "=> max:";STR$(mx);", CPC";mhz;"MHz"
`
};
