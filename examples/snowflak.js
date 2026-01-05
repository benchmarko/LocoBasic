/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM snowflak - Snowflake
REM
REM see also:
REM https://logiker.com/Vintage-Computing-Christmas-Challenge-2025
REM https://demozoo.org/parties/5456/
'
' To get the size of a program, prepend the following line (for CPCBasicTS, not LocoBasic):
'  1 PRINT 42251-FRE(0)-24:STOP
'
ver=0
CLS
'
FOR I=0 TO 8:READ A$(I):PRINT A$(I):NEXT:PRINT STRING$(19,"*"):FOR I=8 TO 0 STEP -1:PRINT A$(I):NEXT
DATA "         *"
DATA "       * * *"
DATA "  * *   ***   * *"
DATA "   **    *    **"
DATA "  ***  * * *  ***"
DATA "     *  ***  *"
DATA "      *  *  *"
DATA " *  *  * * *  *  *"
DATA "  *  *  ***  *  *"
'
msg$="- Predefined strings - half of snowflake, mirrored vertically - source: 327 code: 308"
GOSUB 9000
CLS
'
' Version by ?
' https://youtu.be/9aazdLrXah8?si=OB5ODreNJa3aof3G&t=163
' ...
'
' Version by DrSnuggles (203 / 228+2)
' https://youtu.be/9aazdLrXah8?si=W3C_zIIGQGTPREe5&t=756
' DrSnuggles_CPC_BASIC_203b_vc3-2025.zip
FOR i=1TO 19:READ a:b$=BIN$(a,9):s$="":r$="":FOR n=1 TO 9:c$=MID$(b$,n,1):IF c$="0"THEN c$=" "ELSE c$="*"
s$=s$+c$:r$=c$+r$:NEXT:?s$"*"r$:NEXT:DATA 0,2,81,48,114,9,4,146,73,511,73,146,4,9,114,48,81,2,0
'
msg$="by DrSnuggles - Data bits for one half - mirrored horizontally - source: 203 code: 230"
GOSUB 9000
CLS
'
' Version by DrSnuggles (optimized)
' https://youtu.be/9aazdLrXah8?si=W3C_zIIGQGTPREe5&t=756
FOR i=1TO 19:READ a:r$="":FOR n=1TO 9:c$=CHR$(42+10*(MID$(BIN$(a,9),n,1)="0")):?c$;:r$=c$+r$:NEXT:?"*"r$:NEXT:DATA 0,2,81,48,114,9,4,146,73,511,73,146,4,9,114,48,81,2,0
'
msg$="by DrSnuggles - optimized - avoid variables, replaced IF - source: 169 code: 179"
GOSUB 9000
CLS
'
' Version by issalig, 169 / 187 / 168
' https://youtu.be/9aazdLrXah8?si=cx3_SWDFDpMauKqY&t=931
' issalig_amstradcpc_locomotivebasic_168b_vc3-2025.zip
DIM D(9):FOR I=1TO 9:READ D(I):NEXT:DATA 73,146,4,9,114,48,81,2,0:FOR Y=-9TO 9:A=ABS(Y):FOR X=-9TO 9:B=ABS(X):?CHR$(42+10*(((A*B=0)OR(D(A)AND 2^(B-1)))=0));:NEXT:?:NEXT
'
msg$="by issalig - Data bits for one quadrant - mirrored horizontally and vertically - source: 169 code: 187"
GOSUB 9000
CLS
'
' Version by issalig (optimized): DIM not necessary, unnecessary parens removed; read 8 bytes, removed variables A,B
FOR I=1TO 8:READ D(I):NEXT:DATA 73,146,4,9,114,48,81,2:FOR Y=-9TO 9:FOR X=-9TO 9:?CHR$(42+10*((Y*X=0)OR(D(ABS(Y))AND 2^(ABS(X)-1))=0));:NEXT:?:NEXT
'
msg$="by issalig - optimized - removed DIM, parens, A,B; read 8 bytes - source: 148 code: 153"
GOSUB 9000
CLS
'
' Version by Arnolds of Leosoft (137, 126) (modified string chars +32 to use printable characters)
' https://youtu.be/9aazdLrXah8?si=2iD00mHdxY1blBf4&t=1446
' leosoft_cpc_basic_126b_vc3-2025.zip
FOR y=-9 TO 9:FOR x=-9 TO 9:PRINT CHR$(9-33*(((ABS(x)=ABS(y))AND ABS(x)<8)OR(INSTR(" $'*0>C",CHR$(ABS(x*y)+32))>0)));:NEXT:PRINT:NEXT
'
msg$="by Arnolds of Leosoft - 4 symmetries - modified - source: 135-1 code: 127-1"
GOSUB 9000
CLS
'
' Version by Arnolds of Leosoft (optimized); remove unnecessary parens and spaces
FOR y=-9TO 9:FOR x=-9TO 9:?CHR$(9-33*(ABS(x)=ABS(y) AND ABS(x)<8OR INSTR(" $'*0>C",CHR$(ABS(x*y)+32))>0));:NEXT:?:NEXT
'
msg$="by Arnolds of Leosoft - optimized - removed parens, spaces - source: 119-1 code: 120-1"
GOSUB 9000
CLS
'
' Version by David Payne (BBC BASIC) (70 Bytes), converted to Locomotive BASIC
' https://youtu.be/9aazdLrXah8?si=jST6PqBjt6DqooVR&t=1666
FOR y=-9TO 9:FOR x=-9TO 9:?CHR$(32OR 10AND INSTR(" $'*0>C",CHR$(ABS(x)*ABS(y)+32))>(ABS(x)MOD 9MOD 8=ABS(y)));:NEXT:?:NEXT
'
msg$="by David Payne (BBC BASIC) - 4 symmetries - ... - source: 123 code: 117"
GOSUB 9000
CLS
'
' Version by David Payne (BBC BASIC): (optimized): combined ABS(x)*ABS(y)
FOR y=-9TO 9:FOR x=-9TO 9:?CHR$(32OR 10AND INSTR(" $'*0>C",CHR$(ABS(x*y)+32))>(ABS(x)MOD 9MOD 8=ABS(y)));:NEXT:?:NEXT
'
msg$="by David Payne (BBC BASIC) - optimized - combined ABS(x)*ABS(y) - source: 118 code: 113"
GOSUB 9000
STOP
'
'
' Other approaches:
' - Predefined strings - source: 337 code: 339
' ZONE 80:?"         *","       * * *","  * *   ***   * *","   **    *    **","  ***  * * *  ***","     *  ***  *","      *  *  *"," *  *  * * *  *  *","  *  *  ***  *  *",STRING$(19,"*"),"  *  *  ***  *  *"," *  *  * * *  *  *","      *  *  *","     *  ***  *","  ***  * * *  ***","   **    *    **","  * *   ***   * *","       * * *"
'- Predefined strings - half of snowflake, mirrored vertically - source: 269 code: 256
' FOR I=0 TO 8:READ A$(I):PRINT A$(I):NEXT:PRINT STRING$(19,"*"):FOR I=8 TO 0 STEP -1:PRINT A$(I):NEXT:DATA "         *","       * * *","  * *   ***   * *","   **    *    **","  ***  * * *  ***","     *  ***  *","      *  *  *"," *  *  * * *  *  *","  *  *  ***  *  *"
'
'
9000 PRINT:PRINT "Version"; ver;": ";
i=1:WHILE i<=LEN(msg$):j=INSTR(i,msg$," - ")
  IF j>0 THEN PRINT MID$(msg$,i,j-i):i=j+3 ELSE PRINT MID$(msg$,i):i=LEN(msg$)+1
WEND
t=TIME+600:WHILE TIME<t AND INKEY$="":WEND
ver=ver+1
RETURN
`);
