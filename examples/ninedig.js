/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM ninedig - Nine Digits Puzzle
'21.5.1988 Kopf um Kopf
'
'The riddle is a mathematical puzzle where you need to find distinct digits from 1 to 9 that satisfy the following conditions:
'ab * c = de  and  de + fg = hi
'The goal is to find the values of a, b, c, d, e, f, g, h, and i such that the above equations hold true and all digits are distinct.
'
CLS
PRINT "Nine Digits Puzzle"
PRINT "ab * c = de ; de + fg = hi"
PRINT "with a..i are distinct digits from 1 to 9"
PRINT
PRINT "Please wait ...  ( on a real CPC approx. 1 min 34 sec )"
PRINT
'
t=TIME
FOR a=1 TO 9
  FOR b=1 TO 9
    FOR c=1 TO 9
      FOR f=1 TO 9
        FOR g=1 TO 9
          cnd = -1
          de=(a*10+b)*c
          cnd = cnd AND NOT (de>99)
          hi=de+(f*10+g)
          cnd = cnd AND NOT (hi>99)
          d=INT(de/10):e=de MOD 10:h=INT(hi/10):i=hi MOD 10
          cnd = cnd AND NOT (a=b OR a=c OR a=d OR a=e OR a=f OR a=g OR a=h OR a=i)
          cnd = cnd AND NOT (b=c OR b=d OR b=e OR b=f OR b=g OR b=h OR b=i)
          cnd = cnd AND NOT (c=d OR c=e OR c=f OR c=g OR c=h OR c=i)
          cnd = cnd AND NOT (d=e OR d=f OR d=g OR d=h OR d=i)
          cnd = cnd AND NOT (e=f OR e=g OR e=h OR e=i)
          cnd = cnd AND NOT (f=g OR f=h OR f=i)
          cnd = cnd AND NOT (g=h OR g=i)
          cnd = cnd AND NOT (h=i)
          cnd = cnd AND NOT (i=0)
          IF cnd<>0 THEN GOSUB 350: STOP
        NEXT g
      NEXT f
    NEXT c
  NEXT b
NEXT a
PRINT "No solution found!"
STOP
'
350 t=TIME-t
PRINT "The solution (computed in";ROUND(t * 10 / 3, 3); "ms):"
PRINT
DEF FNnumStr$(x) = RIGHT$(STR$(x), LEN(STR$(x)) - 1)
PRINT "ab * c = de ; de + fg = hi"
PRINT FNnumStr$(a*10+b);" *";c;"=";de;";";de;"+";f*10+g;"=";hi
PRINT
IF (a*10+b)*c<>de OR de<>68 THEN PRINT "a,b,c,de not ok": ERROR 33
IF de+f*10+g<>hi OR hi<>93 THEN PRINT "f,g,hi not ok": ERROR 33
RETURN
'
'Here it is:
'https://brainly.in/question/16558729
'ab * c = de ; de + fg = hi. values will be from 1 to 9 and no digit should be repeated
'Oberservations:
'b , c can not be 1  or 5
' as  ab * 1 = ab => ab = de ( with same digits)
' a1 * c will end with c   a5 * c  will end with 5 or 0
' ab * 5 will end with 0 or 5   ( 0 not available , 5 will be repeated digit in c & i)
'...
'17 * 4 = 68   remaining digits 2 , 3 ,  5 , 9  (68 + 25 = 93) we got 1st Solution .
'
'or:
'https://mindyourdecisions.com/blog/2024/02/26/put-the-digits-1-to-9-in-boxes-puzzle/
`);
