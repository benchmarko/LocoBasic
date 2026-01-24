/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM starste1 - Stars Test 1
REM
REM see also: Stars Test 1: https://benchmarko.github.io/CPCBasicTS/index.html?database=apps&example=test/stars
REM
MODE 1
DIM x(24),y(24),s(24)
DEF FNr1(n)=n*RND
INK 0,0:INK 1,26
FOR i=0 TO 24
x(i)=FNr1(640):y(i)=FNr1(400):s(i)=FNr1(8)+1
PLOT x(i),y(i),1
NEXT
t=TIME+300*5
WHILE INKEY$="" AND TIME<t
FRAME
CLS
FOR i=0 TO 24
y(i)=y(i)+s(i):IF y(i)>=400 THEN y(i)=0
PLOT x(i),y(i),1
NEXT
WEND
`);
