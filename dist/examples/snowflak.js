/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM snowflak - Snowflake
REM
REM see also: https://logiker.com/Vintage-Computing-Christmas-Challenge-2025
REM Certainly this is not the shortest program.
'
ver=0
CLS
'
DIM A$(9)
A$(0)="         *"
A$(1)="       * * *"
A$(2)="  * *   ***   * *"
A$(3)="   **    *    **"
A$(4)="  ***  * * *  ***"
A$(5)="     *  ***  *"
A$(6)="      *  *  *"
A$(7)=" *  *  * * *  *  *"
A$(8)="  *  *  ***  *  *"
FOR I=0 TO 8:PRINT A$(I):NEXT
PRINT STRING$(19,"*")
FOR I=8 TO 0 STEP -1:PRINT A$(I):NEXT
'
GOSUB 9000
CLS
'
' version by ?
' https://youtu.be/9aazdLrXah8?si=OB5ODreNJa3aof3G&t=163
' ...
'
' version by DrSnuggles 203 / 358 / 228 (source: 208+4 code: 233)
' https://youtu.be/9aazdLrXah8?si=W3C_zIIGQGTPREe5&t=756
FOR i=1 TO 19:READ a:b$=BIN$(a,9):s$="":r$="":FOR n=1 TO 9:c$=MID$(b$,n,1):IF c$="0"THEN c$=" " ELSE c$="*"
s$=s$+c$:r$=c$+r$:NEXT:PRINT s$"*"r$:NEXT:DATA 0,2,81,48,114,9,4,146,73,511,73,146,4,9,114,48,81,2,0
'
GOSUB 9000
CLS
'
' version by issalig, 169 / 187 / 168 (source: 170+4 code: 193) ??
' https://youtu.be/9aazdLrXah8?si=cx3_SWDFDpMauKqY&t=931
' Logiker's Christmas Challenge VCCC 2025 - The Presentation
DIM D(9):FOR I=1TO 9:READ D(I):NEXT:DATA 73,146,4,9,114,48,81,2,0
FOR Y=-9 TO 9:A=ABS(Y):FOR X=-9 TO 9:B=ABS(X):?CHR$(42+10*(((A*B=0)OR(D(A)AND 2^(B-1)))=0));:NEXT:?:NEXT
'
GOSUB 9000
CLS
'
' version by issalig (modified): one line, DIM not necessary, DATA at the end, unneccessary brackets removed; read 8 bytes, D(9)=0 anyway; removed variables A,B (source: 149+2 code: 155)
FOR I=1TO 8:READ D(I):NEXT:FOR Y=-9 TO 9:FOR X=-9 TO 9:?CHR$(42+10*((Y*X=0 OR D(ABS(Y))AND 2^(ABS(X)-1))=0));:NEXT:?:NEXT:DATA 73,146,4,9,114,48,81,2
'
GOSUB 9000
CLS
'
' https://youtu.be/9aazdLrXah8?si=2iD00mHdxY1blBf4&t=1446
' version by Arnolds of Leosoft (modified string chars +32 to use printable characters)(source: 137+2 code: 127-2)
FOR y=-9 TO 9:FOR x=-9 TO 9:PRINT CHR$(9-33*(((ABS(x)=ABS(y))AND ABS(x)<8)OR(INSTR(" $'*0>C",CHR$(ABS(x*y)+32))>0)));:NEXT:PRINT:NEXT
'
GOSUB 9000
CLS
'
' version by Arnolds of Leosoft (modified string chars +32 to use printable characters); remove unnecessary brackets (source: 130+2 code: 124-2)
FOR y=-9 TO 9:FOR x=-9 TO 9:PRINT CHR$(9-33*(ABS(x)=ABS(y) AND ABS(x)<8 OR INSTR(" $'*0>C",CHR$(ABS(x*y)+32))>0));:NEXT:PRINT:NEXT
'
GOSUB 9000
CLS
'
' BBC BASIC (70 Bytes), converted to Locomotive BASIC (source: 137+2 code: 124)
' https://youtu.be/9aazdLrXah8?si=jST6PqBjt6DqooVR&t=1666
FOR y=-9 TO 9:FOR x=-9 TO 9:PRINT CHR$(32 OR 10 AND INSTR(" $'*0>C",CHR$(ABS(x)*ABS(y)+32))>(ABS(x) MOD 9 MOD 8=ABS(y)));:NEXT:PRINT:NEXT
'
GOSUB 9000
CLS
'
' BBC BASIC (70 Bytes), converted to Locomotive BASIC, combined ABS(x)*ABS(y) (source: 132+2 code: 120)
FOR y=-9 TO 9:FOR x=-9 TO 9:PRINT CHR$(32 OR 10 AND INSTR(" $'*0>C",CHR$(ABS(x*y)+32))>(ABS(x) MOD 9 MOD 8=ABS(y)));:NEXT:PRINT:NEXT
'
GOSUB 9000
STOP
'
9000 ver=ver+1
?:? "Version"; ver
t=TIME+300:WHILE TIME<t AND INKEY$="":WEND
RETURN
`);
