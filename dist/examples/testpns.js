/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM testpns - Test Page Not Supported
REM These command and constructs are parsable but not (yet) supported
REM (Make sure that this file can be compiled by CPCBasicTS because it is used as a test there.)
MODE 2
ON ERROR GOTO 65535
'CLS
''CLS #5
''CLS #a+7-2*b
'
PRINT "Test Page Not Supported"
'
PRINT "Numbers: ";
'''a=&x2
'
PRINT "hex(&), ";
'
PRINT "bin(&x)"
'
PRINT "Strings"
'''a$="\\"
'
PRINT "Variables: types: $, ";
a!=1.4 'TTT
a%=1.4 'TTT
'
'''1 a$=a%
'''1 a$=a!
'''1 abc=DEF
'
PRINT "Arrays"
'DIM a$[2]:a$[2]="1.4":ERASE a$: 'TTT
'DIM a[9],b[1,2]:a[9]=b[1,2]
'
PRINT "Expressions, Operators +-*..."
''a=+++++++++---9
'
' Line numbers
'''0 c=1
'''65535 c=1
'''65536 c=1
'''2 c=1
'''1 c=1
'
' ABS, AFTER GOSUB, AND, ASC, ATN, AUTO
'
PRINT "ABS, ";
'
PRINT "AFTER, ";
'
PRINT "AND (and OR), ";
'
PRINT "ASC, ";
'
PRINT "ATN, ";
'
PRINT "AUTO, ";
AUTO
AUTO 100
'
' BIN$, BORDER
'
PRINT "BIN$, ";
'
PRINT "BORDER, ";
BORDER 5
BORDER 5,a
'
' CALL, CAT, CHAIN, CHAIN MERGE, CHR$, CINT, CLG, CLOSEIN, CLOSEOUT, CLS, CONT, COPYCHR$, COS, CREAL, CURSOR
'
PRINT "CALL, ";
CALL &A7BC
CALL 4711,1,2,3,4
'
PRINT "CAT, ";
CAT
'
PRINT "CHAIN, ";
CHAIN "f1"
CHAIN "f2" , 10
CHAIN "f3" , 10+3
CHAIN "f4" , 10+3, DELETE 100-200
'CHAIN "f5" , , DELETE 100-200 'TTT
'
PRINT "CHAIN MERGE, ";
CHAIN MERGE "f1"
CHAIN MERGE "f2" , 10
CHAIN MERGE "f3" , 10+3
CHAIN MERGE "f4" , 10+3, DELETE 100-200
'CHAIN MERGE "f5" , , DELETE 100-200 'TTT
'
PRINT "CHR$, ";
'
PRINT "CINT, ";
'
PRINT "CLEAR, ";
CLEAR
'
PRINT "CLEAR INPUT, ";
'
PRINT "CLG, ";
CLG
CLG 15-1
'
PRINT "CLOSEIN, ";
CLOSEIN
'
PRINT "CLOSEOUT, ";
CLOSEOUT
'
PRINT "CLS, ";
''CLS 'tested on top
''CLS #5
''CLS #a+7-2*b
'
PRINT "CONT, ";
CONT
'
PRINT "COPYCHR, ";
a$=COPYCHR$(#0)
a$=COPYCHR$(#a+1)
'
PRINT "COS, ";
'
PRINT "CURSOR, ";
'CURSOR 'TTT
CURSOR 0
CURSOR 1
CURSOR 1,1
'CURSOR ,1
'CURSOR #2
'CURSOR #2,1
'CURSOR #2,1,1
'CURSOR #2,,1
'
'
' DATA, DEC$, DEF FN, DEFINT, DEFREAL, DEFSTR, DEG, DELETE, DERR, DI, DIM, DRAW, DRAWR
'
PRINT "DATA (and READ)"
''DATA
''DATA ,
DATA data 1,2,3
READ a$,a: IF a$<>"data 1" OR a<>2 THEN ERROR 33
READ a: IF a<>3 THEN ERROR 33
DATA item1,item2,item3
READ a$,b$: IF a$<>"item1" OR b$<>"item2" THEN ERROR 33
READ a$: IF a$<>"item3" THEN ERROR 33
''DATA "string in data with ... newline"
'
PRINT "DEC$, ";
''a$=DEC$(1.005,"##.##"): IF a$<>" 1.01" THEN ERROR 33
''a$=DEC$(8.575,"##.##"): IF a$<>" 8.58" THEN ERROR 33
''a$=DEC$(15.355,"#.##"): IF a$<>"15.36" THEN ERROR 33
'
PRINT "DEF FN (and FN), ";
'''def fnCLS=1
'''def fncls1(x+1)=1
'''def fx=1
'''def fx y=1
'''a=FNf2(): 'this should not work
'
'PRINT "DEFINT, ";
'DEFINT a
'DEFINT a-t
'DEFINT a-T
'DEFINT a,b,c
'DEFINT a,b-c,v,x-y
'DEFINT a: b=a+c
'DEFINT a: a=a+1
'DEFINT a: a!=a!+a%:a$="7"
''DEFINT a: ab=ab+de[7] 'TTT
''1 DEFINT z-a
'
PRINT "DEFREAL, ";
DEFREAL a
DEFREAL a-t
DEFREAL a-T
DEFREAL a,b,c
DEFREAL a,b-c,v,x-y
DEFREAL a: b=a+c
DEFREAL a: a=a+1
DEFREAL a: a!=a!+a%:a$="7"
''DEFREAL a: ab=ab+de[7] 'TTT
''1 DEFREAL z-a
'
PRINT "DEFSTR, ";
DEFSTR a
DEFSTR a-t
DEFSTR a-T
DEFSTR a,b,c
DEFSTR a,b-c,v,x-y
DEFSTR a: b=a+c
DEFSTR a: a=a+1
DEFSTR a: a!=a!+a%:a$="7"
''DEFSTR a: ab=ab+de[7] 'TTT
''1 DEFSTR z-a
''DEFSTR f:f(x)="w"
'
PRINT "DEG, ";
'
PRINT "DELETE, ";
DELETE
''DELETE -
''DELETE ,
''DELETE -,
DELETE 10
''DELETE 1-
''DELETE -1
DELETE 1-2
''1 DELETE 2-1
'''1 DELETE 1+2
'''1 DELETE a
'
PRINT "DERR, ";
a=DERR
'
PRINT "DI, ";
DI
'
PRINT "DIM, ";
DIM a!(1)
DIM a%(1)
ERASE a!,a%
'
''DIM a[2,13) 'TTT
''DIM a(4):FOR i=0 TO 4:a(i)=i:NEXT
''a=0:FOR i=0 TO 4:a=a+a(i):NEXT:IF a<>10 THEN ERROR 33
''ERASE a
'
PRINT "DRAW, ";
''DRAW 10,20,7,3
''DRAW 10,20,,3
''DRAW x,y,m,g1
''DRAWR 10,20,7,3
''DRAWR 10,20,,3
''DRAWR x,y,m,g1
'
' EDIT, EI, ELSE, END, ENT, ENV, EOF, ERASE, ERL, ERR, ERROR, EVERY GOSUB, EXP
'
PRINT "EDIT, ";
EDIT 20
'
PRINT "EI, ";
EI
'
''ELSE
''ELSE 10
''ELSE a=7
' see below: END
'
PRINT "ENT, ";
ENT 1
ENT 1,2,a,4
ENT num,steps,dist,ti,steps2,dist2,ti2
'ENT num,=period,ti,=period2,ti2 'TTT
'
PRINT "ENV, ";
ENV 1
ENV 1,2,a,4
ENV num,steps,dist,ti,steps2,dist2,ti2
'ENV num,=reg,period,=reg2,period2 'TTT
'
PRINT "EOF, ";
a=EOF
'
PRINT "ERASE, ";
'''1 ERASE 5
'
PRINT "ERL, ";
a=ERL
'
PRINT "ERR, ";
a=ERR
'
''ERROR 7
''ERROR 5+a
'
PRINT "EVERY, ";
'
PRINT "EXP, ";
'
' FILL, FIX, FN, FOR, FRAME, FRE
'
PRINT "FILL, ";
FILL 7
'
PRINT "FIX, ";
'
PRINT "FN, ";
'
PRINT "FOR, ";
FOR a%=1.5 TO 9.5: NEXT
FOR a!=1.5 TO 9.5: NEXT
''1 FOR a$=1 TO 2: NEXT
''FOR a=b TO c STEP s:a=0:NEXT
'
PRINT "FRAME, ";
'
PRINT "FRE, ";
a=FRE(0)
a=FRE("")
a=FRE(b-2)
a=FRE(a$)
'
' GOSUB, GOTO, GRAPHICS PAPER, GRAPHICS PEN
'
PRINT "GOSUB, ";
'''1 GOSUB a
'
PRINT "GOTO, ";
'GOTO 10010
'''1 GOTO a
'
PRINT "GRAPHICS PAPER, ";
'GRAPHICS PAPER 5
'GRAPHICS PAPER 2.3*a
''GRAPHICS PEN 5
''GRAPHICS PEN 5,1
''GRAPHICS PEN ,0
''GRAPHICS PEN 2.3*a,1+b
'
' HEX$, HIMEM
'
PRINT "HEX$"
'
PRINT "HIMEM"
''a=HIMEM
'
' IF, INK, INKEY, INKEY$, INP, INPUT, INSTR, INT
'
PRINT "IF, ";
:IF 0=1 THEN :a=6::b=7 :ELSE a=8::b=9:
''IF a=1 THEN
''IF a=1 THEN ELSE
''IF a=1 THEN a=2 ELSE
''IF a=1 THEN ELSE a=1
''IF a=1 THEN IF b=1 THEN ELSE ELSE a=1
''10 IF a=1 THEN GOTO 10010
''10 IF a=1 THEN 10010
''10 IF a=1 GOTO 10010
''10 IF a=1 THEN a=a+1:GOTO 10
''10 IF a=1 THEN 10:a=never1
''10 IF a=1 THEN 10 ELSE 20 '20 REM
''10 IF a=1 THEN 10 ELSE GOTO 20 '20 REM
''10 IF a=b+5*c THEN a=a+1: GOTO 10 ELSE a=a-1:GOTO 20
'
PRINT "INK, ";
''INK 2,19
''INK 2,19,22
''INK a*2,b-1,c
'
PRINT "INKEY, ";
a=INKEY(0)
'
PRINT "INKEY$, ";
'
PRINT "INP, ";
a=INP(&FF77)
'
PRINT "INPUT, ";
''INPUT a$
''INPUT a$,b
''INPUT ;a$,b
''INPUT "para",a$,b
''INPUT "para";a$,b
''INPUT ;"para noCRLF";a$,b
''INPUT #2,;"para noCRLF";a$,b
''INPUT #stream,;"string";a$,b
'
PRINT "INSTR, ";
''a=INSTR("", ""): IF a<>0 THEN ERROR 33
''a=INSTR(start,a$,b$)
''a=INSTR(1, "", ""): IF a<>0 THEN ERROR 33
a=INSTR(1, "ab", ""): IF a<>1 THEN ERROR 33
'
PRINT "INT, ";
'
' JOY
'
PRINT "JOY, ";
a=JOY(0)
a=JOY(b+1)
'
' KEY, KEY DEF
'
PRINT "KEY, ";
KEY 11,"border 13:paper 0"
KEY a,b$
'
PRINT "KEY DEF, ";
KEY DEF 68,1
KEY DEF 68,1,159
KEY DEF 68,1,159,160
KEY DEF 68,1,159,160,161
KEY DEF num,a,b,b,b
'
' LEFT$, LEN, LET, LINE INPUT, LIST, LOAD, LOCATE, LOG, LOG10, LOWER$
'
PRINT "LEFT$, ";
'
PRINT "LEN, ";
'
PRINT "LET, ";
'
PRINT "LINE INPUT, ";
''LINE INPUT a$
''LINE INPUT ;a$
''LINE INPUT "para",a$
''LINE INPUT "para";a$
''LINE INPUT ;"para noCRLF";a$
''LINE INPUT #2,;"para noCRLF";a$
''LINE INPUT #stream,;"string";a$
'
PRINT "LIST, ";
LIST
''LIST -
''LIST ,
''LIST -,
LIST 10
''LIST 1-
''LIST -1
LIST 1-2
''LIST #3
''LIST ,#3
LIST 10,#3
''LIST 1-,#3
''LIST -1,#3
LIST 1-2,#3
'''LIST a
'
PRINT "LOAD, ";
LOAD "file"
LOAD "file.scr",&C000
LOAD f$,adr
'
PRINT "LOCATE, ";
LOCATE 10,20
LOCATE #2,10,20
LOCATE #s,a,b
'
PRINT "LOG, ";
'
PRINT "LOG10, ";
'
PRINT "LOWER$, ";
'
' MASK, MAX, MEMORY, MERGE, MID$, MIN, MOD, MODE, MOVE, MOVER
'
'
PRINT "MASK, ";
MASK &X10101011
MASK 2^(8-x),1
MASK a,b
''MASK ,b
'
PRINT "MAX, ";
''a$=MAX("abc")
''1 a$=MAX("abc","d")
''a$=MAX("abc"):IF a$<>"abc" THEN ERROR 33
'
PRINT "MEMORY, ";
MEMORY &3FFF
MEMORY a
'
PRINT "MERGE, ";
MERGE "file"
MERGE a$
'
PRINT "MID$, ";
''PRINT "MID$ as assign"
''MID$(a$,2)=b$
''MID$(a$,2,2)=b$
''MID$(a$,b%,c!)="string"
'
PRINT "MIN, ";
''a$=MIN("abc")
''1 a$=MIN("abc","d")
''a$=MIN("abc"): IF a$<>"abc" THEN ERROR 33
'
PRINT "MOD, ";
'
PRINT "MODE, ";
''MODE 0 'testet on top
''MODE n+1
'
PRINT "MOVE, ";
''MOVE 10,20
''MOVE -10,-20,7
''MOVE 10,20,7,3
''MOVE 10,20,,3
''MOVE x,y,m,g1
'
PRINT "MOVER, ";
''MOVER 10,20
''MOVER -10,-20,7
''MOVER 10,20,7,3
''MOVER 10,20,,3
''MOVER x,y,m,g1
'
PRINT
'
' NEW, NEXT, NOT
'
''NEW
'
PRINT "NEXT, ";
''NEXT b,a
'
PRINT "NOT, ";
'
' ON BREAK ..., ON ERROR GOTO, ON GOSUB, ON GOTO, ON SQ GOSUB, OPENIN, OPENOUT, OR, ORIGIN, OUT
'
PRINT "ON BREAK, ";
ON BREAK CONT
ON BREAK GOSUB 10010
ON BREAK STOP
'
PRINT "ON ERROR, ";
ON ERROR GOTO 0
ON ERROR GOTO 10010
'''1 ON ERROR GOTO 0:a=ASC(0)
''1 ON ERROR GOTO 2:a=ASC(0) '2 REM
'''1 ON ERROR GOTO 0:?chr$("A")
''1 ON ERROR GOTO 2:?CHR$("A") '2 REM
'''1 ON ERROR GOTO 0:a$=DEC$(b$,"\\    \\")
''1 ON ERROR GOTO 2:a$=DEC$(b$,"\\    \\") '2 REM
'''1 ON ERROR GOTO 0:MASK ,
''1 ON ERROR GOTO 2:MASK , '2 REM
'
PRINT "ON GOSUB, ";
ON SQ(1) GOSUB 10010
ON SQ(a) GOSUB 10010
'
PRINT "ON GOTO, ";
ON 1 GOTO 10010
ON i GOTO 10010,10010
ON i+1 GOTO 10010,10010,10010
'
PRINT "OPENIN, ";
OPENIN "file"
OPENIN f$
'
PRINT "OPENOUT, ";
OPENOUT "file"
OPENOUT f$
'
PRINT "OR, ";
'
PRINT "ORIGIN, ";
''ORIGIN 10,20,5,200,50,15: 'x,y,left,right,top,bottom
'
PRINT "OUT, ";
OUT &BC12,&12
OUT a,b
'
' PAPER, PEEK, PEN, PI, PLOT, PLOTR, POKE, POS, PRINT
'
PRINT "PAPER, ";
''PAPER 2
''PAPER #stream,p
'
PRINT "PEEK, ";
a=PEEK(&C000)
a=PEEK(adr+5)
'
PRINT "PEN, ";
''PEN 2
''PEN 2,1
''PEN #3,2,1
''PEN #stream,p,trans
'
PRINT "PI, ";
'
PRINT "PLOT, ";
''PLOT 10,20
''PLOT -10,-20,7
''PLOT 10,20,7,3
''PLOT 10,20,,3
''PLOT x,y,m,g1
'
PRINT "PLOTR, ";
''PLOTR 10,20
''PLOTR -10,-20,7
''PLOTR 10,20,7,3
''PLOTR 10,20,,3
''PLOTR x,y,m,g1
'
PRINT "POKE, ";
POKE &C000,23
POKE adr,by
'
PRINT "POS, ";
'
PRINT
PRINT "PRINT: ";
'PRINT #2;
PRINT #2,"comma"
''PRINT #2,a$,b
'
PRINT "PRINT USING: ";
''PRINT USING "####";ri;
''PRINT USING "### ########";a,b
''PRINT USING "\\   \\";"n1";"n2";" xx3";
''PRINT USING "!";"a1";"a2";
''PRINT USING "&";"a1";"a2";
''PRINT #9,TAB(t);t$;i;"h1"
'
PRINT "?: ";
'
' RAD, RANDOMIZE, READ, RELEASE, REM, REMAIN, RENUM, RESTORE, RESUME, RETURN, RIGHT$, RND, ROUND, RUN
'
PRINT "RAD, ";
''RAD
'
PRINT "RANDOMIZE, ";
RANDOMIZE
RANDOMIZE 123.456
'
PRINT "READ, ";
'
PRINT "RELEASE, ";
RELEASE 1
RELEASE a+1
'
PRINT "REM, ";
REM
'
PRINT "REMAIN, ";
'
PRINT "RENUM, ";
RENUM
RENUM 100
RENUM 100,50
RENUM 100,50,2
'
PRINT "RESTORE, ";
'
PRINT "RESUME, ";
RESUME
RESUME 10010
RESUME NEXT
'
PRINT "RETURN, ";
''RETURN
'
PRINT "RIGHT$, ";
'
PRINT "RND, ";
'
PRINT "ROUND, ";
'a=ROUND(-2.50): IF a<>-3 THEN ERROR 33
'a=ROUND(8.575,2): IF a<>8.58 THEN ERROR 33
'a=ROUND(-8.575,2): IF a<>-8.58 THEN ERROR 33
'a=ROUND(1.005,2): IF a<>1.01 THEN ERROR 33
'a=ROUND(-1.005,2): IF a<>-1.01 THEN ERROR 33
''a=ROUND(PI,0.4): IF a<>3 THEN ERROR 33
''a=ROUND(PI,2.4): IF a<>3.14 THEN ERROR 33
''a=ROUND(8.575,2): IF a<>8.58 THEN ERROR 33
''a=ROUND(-8.575,2): IF a<>-8.58 THEN ERROR 33
''a=ROUND(1.005,2): IF a<>1.01 THEN ERROR 33
''a=ROUND(-1.005,2): IF a<>-1.01 THEN ERROR 33
'
PRINT "RUN, ";
RUN
RUN 10010
RUN "file"
RUN a$
'
' SAVE, SGN, SIN, SOUND, SPACE$, SPEED INK, SPEED WRITE, SQ, STOP, STR$, STRING$, SYMBOL
'
PRINT "SAVE, ";
SAVE "file"
SAVE "file",p
SAVE "file",a
SAVE "file.scr",b,&C000,&4000
SAVE "file.bin",b,&8000,&100,&8010
'
PRINT "SGN, ";
'
PRINT "SIN, ";
'
PRINT "SOUND, ";
SOUND 1,100
SOUND 1,100,400
SOUND 1,100,400,15
SOUND 1,100,400,15,1
SOUND 1,100,400,15,1,1
SOUND 1,100,400,15,1,1,4
SOUND 1,100,400,,,,4
''SOUND ch,period,duration,,,,noise
''SOUND ch,period,duration,vol,env1,ent1,noise
'
PRINT "SPACE$, ";
'
PRINT "SPEED INK, ";
SPEED INK 10,5
SPEED INK a,b
'
PRINT "SPEED KEY, ";
SPEED KEY 10,5
SPEED KEY a,b
'
PRINT "SPEED WRITE, ";
SPEED WRITE 1
SPEED WRITE a-1
'
PRINT "SQ, ";
a=SQ(1)
a=SQ(b)
'
PRINT "SQR, ";
'
PRINT "STOP, ";
'' 'below: STOP
'
PRINT "STR$, ";
'
PRINT "STRING$"
'
PRINT "SYMBOL"
SYMBOL 255,1,2,3,4,5,6,7,&X10110011
SYMBOL 255,1
'
PRINT "SYMBOL AFTER"
SYMBOL AFTER 255
'
' TAG, TAGOFF, TAN, TEST, TESTR, TIME, TROFF, TRON
'
PRINT "TAG, ";
TAG #2: TAGOFF #2
'
PRINT "TAGOFF, ";
TAGOFF #2
'
PRINT "TAN, ";
'
PRINT "TEST, ";
a=TEST(10,20)
a=TEST(x,y)
'
PRINT "TESTR, ";
a=TESTR(10,-20)
a=TESTR(x,y)
'
PRINT "TIME, ";
'
PRINT "TROFF, ";
TROFF
'
PRINT "TRON, ";
TRON
'
' UNT, UPPER$
'
PRINT "UNT, ";
'
PRINT "UPPER$, ";
'
' VAL, VPOS
'
PRINT "VAL, ";
''a=VAL("4r"): IF a<>4 THEN ERROR 33 'TTT
'
PRINT "VPOS, ";
'
' WAIT, WEND, WHILE, WIDTH, WINDOW, WINDOW SWAP, WRITE
'
PRINT "WAIT, ";
''WAIT &FF34,20
''WAIT &FF34,20,25
'
PRINT "WEND (and WHILE), ";
'
PRINT "WIDTH, ";
WIDTH 40
'
PRINT "WINDOW, ";
WINDOW 10,30,5,20
WINDOW #1,10,30,5,20 '#stream,left,right,top,bottom
'
PRINT "WINDOW SWAP, ";
WINDOW SWAP 1
WINDOW SWAP 1,0
'
PRINT
PRINT "WRITE: ";
''WRITE #2
'WRITE #2,
a$="d2":b=3:WRITE #2,a$,b
'
' XOR, XPOS
'
PRINT "XOR, ";
'
PRINT "XPOS, ";
'
PRINT "YPOS, ";
'
PRINT "ZONE";
'
PRINT
'
PRINT "RSX";
|A
|B
|BASIC
|CPM
a$="*.drw": |DIR,@a$
|DISC
|DISC.IN
|DISC.OUT
|DRIVE,0
'''1 |DRIVE,
'''1 |DRIVE,#1
|ERA,"file.bas"
|REN,"file1.bas","file2.bas"
|TAPE
|TAPE.IN
|TAPE.OUT
|USER,1
''|
'
PRINT "Completed."
PRINT
PRINT "The following compile warning messages are expected..."
END
'
10010 RETURN
10020 ERROR 33
RETURN
65535 c=1
`);
