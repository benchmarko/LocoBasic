/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM factoria - Big Factorials
MODE 2
PRINT "Big Factorials"
n=252
INPUT "Which number:"; n
PRINT
'
DEF FNnumStr$(x) = RIGHT$(STR$(x), LEN(STR$(x)) - 1)
'
PRINT "Properties of "; FNnumStr$(n); "!:"
GOSUB 400 ' number of digits of n!
GOSUB 500 ' trailing zeroes of n! (for checking the result)
PRINT
FRAME
GOSUB 1000 ' algorithm1
PRINT
FRAME
GOSUB 2000 ' algorithm2
END
'
REM Calculate number of digits
REM https://www.geeksforgeeks.org/count-digits-in-a-factorial-using-logarithm/
400 digits = 0
FOR i = 2 TO n
  digits = digits + LOG10(i)
NEXT
digits = INT(digits) + 1
'or use Stirling's formula:
econst = 2.718281828459045
digits2 = n * LOG10(n / econst) + LOG10(2 * PI * n) / 2.0
digits2 = INT(digits2+1)
IF digits<>digits2 THEN ?"digits calculation differs:"; digits; digits2
PRINT "Number of digits:"; digits
RETURN
'
REM Calculate number of trailing zeroes (to check the result)
REM https://www.geeksforgeeks.org/count-trailing-zeroes-factorial-number/
500 trailz = 0
i = 5
WHILE INT(n / i) >= 1
  trailz = trailz + INT(n / i)
  i = i * 5
WEND
PRINT "Number of trailing zeroes:"; trailz
RETURN
'
REM factorial 1
1000 t = TIME
ri = INT(digits / 5) - (digits MOD 5 <> 0): 'number of 5-digit blocks
DIM r(ri + 1): 'one more to allow carry
r(1) = 1
'
REM Calculate factorial using sum of logarithms
REM log_{10}(n!) = log_{10}(1) + log_{10}(2) + log_{10}(3) + ldots + log_{10}(n)
l = 1
FOR i = n TO 2 STEP -1
  l = l + LOG10(i)
  li = l / 5 + 1
  u = 0
  'multiply each block by the current number i; u=carry over to the next block
  FOR j = 1 TO li
    h = r(j) * i + u
    IF h < -100000 THEN u = 0 ELSE u = INT(h / 100000) : h = h - u * 100000
    r(j) = h
  NEXT j
NEXT i
t = TIME - t
'
REM Output the result
PRINT "Algorithm 1 (Sum of logarithms):"; ROUND(t * 10 / 3, 3); "ms"
PRINT FNnumStr$(n); "! ="
IF ri >= 1 THEN PRINT FNnumStr$(r(ri));
FOR i = ri - 1 TO 1 STEP -1
   PRINT RIGHT$("0000" + FNnumStr$(r(i)), 5);
NEXT
PRINT
'
REM Check result (number of trailing zeroes)
count = 0
i = 1
WHILE i <= ri AND r(i)=0
  count = count + 5
  i = i + 1
WEND
value = r(i)
DEF FNmod10(a) = a - 10 * INT(a / 10)
WHILE fnmod10(value)=0
  count = count + 1
  value = INT(value / 10)
WEND
IF count <> trailz THEN PRINT "Error in algorithm 1: trailing zeroes"; count; "<>"; trailz
RETURN
'
REM factorial2
REM based on: https://www.geeksforgeeks.org/factorial-large-number/
2000 t = TIME
DIM res(digits)
res(1) = 1
resSize = 1
FOR x = 2 TO n
  carry = 0
  FOR i = 1 TO resSize
    prod = res(i) * x + carry
    carry = INT(prod / 10)
    res(i) = prod - carry * 10
  NEXT i
  WHILE carry > 0
    resSize = resSize + 1
    res(resSize) = carry MOD 10
    carry = INT(carry / 10)
  WEND
NEXT x
t = TIME - t
'
REM Output the result
PRINT "Algorithm 2 (Multiplication of numbers 1..n):"; ROUND(t * 10 / 3, 3); "ms"
PRINT FNnumStr$(n); "! ="
FOR i = resSize TO 1 STEP -1
  PRINT FNnumStr$(res(i));
NEXT i
PRINT
'
REM Check result (number of trailing zeroes)
count = 0
i=1
WHILE i<=resSize AND res(i)=0
  count = count + 1
  i = i + 1
WEND
IF count <> trailz THEN PRINT "Error in algorithm 2: trailing zeroes"; count; "<>"; trailz
RETURN
`);
