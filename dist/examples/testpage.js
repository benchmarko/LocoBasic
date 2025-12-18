/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM testpage - Test Page
MODE 2
CLS
PRINT "Test Page"
'
PRINT "Numbers: ";
a=1
a=1.2
a=-1.2
a=+7.2
a=&0
a=&A7
a=-&A7
a=&7FFF
a=&8000
a=&FFFF
a=&E123
a=&X0
a=&X10100111
a=-&X111111111111111
a=255
a=-255
a=256
a=-256
a=32767
a=-32767
a=32768
a=-32768
a=65536
a=1.2E+9
a=-1.2E-3: IF a<>-0.0012 THEN ERROR 33
'''a=&x2
a=1: IF a<>1 THEN ERROR 33
a=1.2: IF a<>1.2 THEN ERROR 33
a=-1.2: IF a<>-1.2 THEN ERROR 33
a=1200: IF a<>1200 THEN ERROR 33
a=-7.2: IF a<>-7.2 THEN ERROR 33
a=ROUND(-7.2): IF a<>-7 THEN ERROR 33
a=+7.2: IF a<>7.2 THEN ERROR 33
a=0.2: IF a<>0.2 THEN ERROR 33
a=2: IF a<>2 THEN ERROR 33
a=10000: IF a<>10000 THEN ERROR 33
a=0.0001: IF a<>0.0001 THEN ERROR 33
a=1E+09-1: IF a<>1E+09-1 OR a<>999999999 THEN ERROR 33
'
PRINT "hex(&), ";
a=&A7: IF a<>167 THEN ERROR 33
a=-&A7: IF a<>-167 THEN ERROR 33
a=&7FFF: IF a<>32767 THEN ERROR 33
'
PRINT "bin(&x)"
a=&0: IF a<>0 THEN ERROR 33
a=&X10100111: IF a<>167 THEN ERROR 33
a=&X111111111111111: IF a<>32767 THEN ERROR 33
a=-&X111111111111111: IF a<>-32767 THEN ERROR 33
'
PRINT "Strings"
a$="a12": IF a$<>"a12" THEN ERROR 33
a$="7.1": IF a$<>"7.1" THEN ERROR 33
a$="NEXT i,j": IF a$<>"NEXT i,j" THEN ERROR 33
'''a$="\\"
'
PRINT "Variables: types: $, ";
a=1.4: IF a<>1.4 THEN ERROR 33
a$="1.4": IF a$<>"1.4" THEN ERROR 33
''a!=1.4
''a%=1.4
a$="1.4"
case=1: IF case<>1 THEN ERROR 33
cASE=2: IF cASE<>2 OR case<>2 OR cAsE<>2 THEN ERROR 33
cAsE=case
CaSe=cAsE
next1=2: IF next1<>2 THEN ERROR 33
'
insert.line=2
in.ser.t.lin.e=2
''a!(2)=1.4
''a%(2)=1.4
'''1 a$=a%
'''1 a$=a!
'''1 abc=DEF
newline=7
'
PRINT "Arrays"
DIM a(2), a$(2)
a(2)=1.4: IF a(2)<>1.4 THEN ERROR 33
a(2)=1.5: IF a(2)<>1.5 THEN ERROR 33
a$(2)="1.4": IF a$(2)<>"1.4" THEN ERROR 33
ERASE a,a$
DIM a$[2]:a$[2]="1.5": IF a$[2]<>"1.5" THEN ERROR 33
a$[2]="1.4"
ERASE a$
DIM a(9),b(1,2):b(1,2)=3:a(9)=b(1,2): IF a(9)<>3 THEN ERROR 33
ERASE a,b
DIM a[9],b[1,2]:b[1,2]=4:a[9]=b[1,2]: IF a(9)<>4 THEN ERROR 33
a[9]=b[1,2]
DIM a(10,10,10),b(10,9):a(10,10,10)=b(10,9)
ERASE a,b
DIM a(2),b(2,2,1)
b(2,2,1)=4:a(ROUND(1.4))=b(ROUND(1.5),ROUND(2.4),1): IF a(1)<>4 THEN ERROR 33
i=1:b(1,2,1)=5:a(i+1)=b(i,i*2,ROUND(i-0.5)): IF a(i+1)<>5 THEN ERROR 33
i=1:b(1,2,0)=6:a(i-1)=b(INT(i),i*2,(i-1+&C) MOD 2): IF a(i-1)<>6 THEN ERROR 33
ERASE a,b
'
PRINT "Expressions, Operators +-*..."
a=1+2+3: IF a<>6 THEN ERROR 33
a=3-2-1: IF a<>0 THEN ERROR 33
a=&A7+&X10100111-(123-27): IF a<>238 THEN ERROR 33
a=(3+2)*(3-7): IF a<>-20 THEN ERROR 33
a=-(10-7)-(-6-2): IF a<>5 THEN ERROR 33
a=20/2.5: IF a<>8 THEN ERROR 33
a=20\\3: IF a<>6 THEN ERROR 33
a=3^2: IF a<>9 THEN ERROR 33
a=&X1001 AND &X1110: IF a<>8 THEN ERROR 33
a=&X1001 OR &X110: IF a<>15 THEN ERROR 33
a=&X1001 XOR &X1010: IF a<>3 THEN ERROR 33
a=NOT &X1001: IF a<>-10 THEN ERROR 33
a=+-9:IF a<>-9 THEN ERROR 33
a=(1=0):IF a<>0 THEN ERROR 33
a=(1>0)*(0<1):IF a<>1 THEN ERROR 33
a=1=1=-1:IF a<>-1 THEN ERROR 33
''a=+++++++++---9
a=(1=0)
a=(1>0)*(0<1)
a=(b>=c)*(d<=i)
a=1=1=-1
a=1>=1>1
a=(29+1) MOD 10=0 AND 5=7 :' num num
a=(29+1) MOD 10=9 AND "5"+"6"="56" :' num str
a="5"+"6"="56" AND (29+1) MOD 10=9 :' str num
a="5"+"6"="56" AND SPACE$(1)=" " :' str str
a=(29+1) MOD 10=0 OR 5=7 :' num num
a=(29+1) MOD 10=9 OR "5"+"6"="56" :' num str
a="5"+"6"="56" OR (29+1) MOD 10=9 :' str num
a="5"+"6"="56" OR SPACE$(1)=" " :' str str
a=a$<>"a2" OR b$<>"2"
a=a<>2 OR b<>2 OR b$<>"5"
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
a=ABS(+67.98):IF a<>67.98 THEN ERROR 33
a=ABS(-67.98):IF a<>67.98 THEN ERROR 33
a=ABS(0):IF a<>0 THEN ERROR 33
a=ABS(2.3)
'
PRINT "AFTER, ";
AFTER 10 GOSUB 10010
a=REMAIN(0)
AFTER 10,1 GOSUB 10010
a=REMAIN(1)
'
PRINT "AND (and OR), ";
a=4 OR 7 AND 2:IF a<>6 THEN ERROR 33
a=b AND c
'
PRINT "ASC, ";
a=ASC("a"):IF a<>97 THEN ERROR 33
a=ASC("ab"):IF a<>97 THEN ERROR 33
a=ASC("A")
b$="B":a=ASC(b$) AND c
'
PRINT "ATN; ";
RAD
a=ATN(0):IF a<>0 THEN ERROR 33
a=INT(ATN(1)*100000000)/100000000:IF a<>0.78539816 THEN ERROR 33
a=ATN(2.3)
DEG
a=ATN(0):IF a<>0 THEN ERROR 33
a=ATN(1):IF ROUND(a,7)<>45 THEN ERROR 33
RAD
'
''AUTO
''AUTO 100
'
' BIN$, BORDER
'
PRINT "BIN$, ";
a$=BIN$(3)
a$=BIN$(3,8)
a$=BIN$(&X1001)
b$=BIN$(0):IF b$<>"0" THEN ERROR 33
b$=BIN$(255):IF b$<>"11111111" THEN ERROR 33
b$=BIN$(255,10):IF b$<>"0011111111" THEN ERROR 33
b$=BIN$(170,6):IF b$<>"10101010" THEN ERROR 33
b$=BIN$(32767,16):IF b$<>"0111111111111111" THEN ERROR 33
b$=BIN$(65535):IF b$<>"1111111111111111" THEN ERROR 33
'
''BORDER 5
''BORDER 5,a
'
' CALL, CAT, CHAIN, CHAIN MERGE, CHR$, CINT, CLG, CLOSEIN, CLOSEOUT, CLS, CONT, COPYCHR$, COS, CREAL, CURSOR
'
''CALL &A7BC
''CALL 4711,1,2,3,4
''CAT
''CHAIN "f1"
''CHAIN "f2" , 10
''CHAIN "f3" , 10+3
''CHAIN "f4" , 10+3, DELETE 100-200
''CHAIN "f5" , , DELETE 100-200
''CHAIN MERGE "f1"
''CHAIN MERGE "f2" , 10
''CHAIN MERGE "f3" , 10+3
''CHAIN MERGE "f4" , 10+3, DELETE 100-200
''CHAIN MERGE "f5" , , DELETE 100-200
'
PRINT "CHR$, ";
a$=CHR$(65): IF a$<>"A" THEN ERROR 33
'
PRINT "CINT, ";
a=CINT(2.3): IF a<>2 THEN ERROR 33
'
''CLEAR
PRINT "CLEAR INPUT, ";
CLEAR INPUT
''CLG
''CLG 15-1
''CLOSEIN
''CLOSEOUT
''CLS 'tested on top
''CLS #5
''CLS #a+7-2*b
''CONT
''a$=COPYCHR$(#0)
''a$=COPYCHR$(#a+1)
'
PRINT "COS, ";
RAD
a=COS(0): IF a<>1 THEN ERROR 33
a=COS(PI): IF ROUND(a,7)<>-1 THEN ERROR 33
a=COS(2.3)
DEG
a=COS(180): IF ROUND(a,7)<>-1 THEN ERROR 33
a=COS(180+360): IF ROUND(a,7)<>-1 THEN ERROR 33
a=COS(0): IF a<>1 THEN ERROR 33
RAD
'
PRINT "CREAL"
a=CREAL(2.3+a)
'
''CURSOR
''CURSOR 0
''CURSOR 1
''CURSOR 1,1
''CURSOR ,1
''CURSOR #2
''CURSOR #2,1
''CURSOR #2,1,1
''CURSOR #2,,1
'
' DATA, DEC$, DEF FN, DEFINT, DEFREAL, DEFSTR, DEG, DELETE, DERR, DI, DIM, DRAW, DRAWR
'
PRINT "DATA (and READ), ";
''DATA
''DATA ,
''DATA data 1,2,3
DATA "item1"," item2","item3 "
READ a$:IF a$<>"item1" THEN ERROR 33
READ a$:IF a$<>" item2" THEN ERROR 33
READ a$:IF a$<>"item3 " THEN ERROR 33
''DATA item1,item2,item3
DATA &a3,&x001,4,-7,"abc"
READ a,b:IF a<>&A3 THEN ERROR 33
IF b<>&X001 THEN ERROR 33
READ a,b:IF a<>4 THEN ERROR 33
IF b<>-7 THEN ERROR 33
READ a$:IF a$<>"abc" THEN ERROR 33
DATA " ","#$%&'()*+,"
READ a$:IF a$<>" " THEN ERROR 33
READ a$:IF a$<>"#$%&'()*+," THEN ERROR 33
''DATA "string in data with ... newline"
DATA &a7, &x10100111
READ a:IF a<>&A7 THEN ERROR 33
READ a:IF a<>&A7 THEN ERROR 33
'
PRINT "DEC$, ";
a$=DEC$(0,"##.##"): IF a$<>" 0.00" THEN ERROR 33
a$=DEC$(-1.2,"##.##"): IF a$<>"-1.20" THEN ERROR 33
''a$=DEC$(1.005,"##.##"): IF a$<>" 1.01" THEN ERROR 33
a$=DEC$(3,"###.##"): IF a$<>"  3.00" THEN ERROR 33
a$=DEC$(2.9949,"#.##"): IF a$<>"2.99" THEN ERROR 33
''a$=DEC$(8.575,"##.##"): IF a$<>" 8.58" THEN ERROR 33
a$=DEC$(8.595,"##.##"): IF a$<>" 8.60" THEN ERROR 33
a$=DEC$(15.355,"#.##"): IF a$<>"15.36" THEN ERROR 33
'
PRINT "DEF FN (and FN), ";
DEF FNclk=10
DEF FNclk(a)=a*10
DEF FNclk(a,b)=a*10+b
DEF FNclk$(a$,b$)=a$+b$
DEF FNcls1(x)=1
DEF FN clk=10
DEF FN clk(a)=a*10
DEF FN clk(a,b)=a*10+b
DEF FN clk$(a$,b$)=a$+b$
DEF FN cls1(x)=1
'''def fnCLS=1
'''def fncls1(x+1)=1
'''def fx=1
'''def fx y=1
DEF FNf1(b)=b*b
a=FNf1(2.5):IF a<>6.25 THEN ERROR 33
a=FN f1(2.5):IF a<>6.25 THEN ERROR 33
DEF FN f1$(b$)=b$+b$
a$=FNf1$("a"):IF a$<>"aa" THEN ERROR 33
a$=FN f1$("a"):IF a$<>"aa" THEN ERROR 33
DEF FNf2=2.5*2.5
a=FNf2:IF a<>6.25 THEN ERROR 33
'''a=FNf2(): 'this should not work
DEF FNf1(a,b,c)=a+b+c
a=FNf1(1,2,3):IF a<>6 THEN ERROR 33
DEF FNf1$(num)=MID$(STR$(num),2): DEF FNf2$(zl,cnt)=STRING$(cnt-LEN(FNf1$(zl)),"0")+FNf1$(zl)
a=67: a$=FNf2$(a, 4): IF a$<>"0067" THEN ERROR 33
'
PRINT "DEFINT, ";
DEFINT m
DEFINT m-o
DEFINT m,o
DEFINT m-n,o
'
''DEFINT a
''DEFINT a-t
''DEFINT a-T
''DEFINT a,b,c
''DEFINT a,b-c,v,x-y
''DEFINT a:b=a+c
''DEFINT a:a=a+1
''DEFINT a:a!=a!+a%:a$="7"
''DEFINT a:ab=ab+de[7]
''1 DEFINT z-a
''DEFREAL a
''DEFREAL a-t
''DEFREAL a-T
''DEFREAL a,b,c
''DEFREAL a,b-c,v,x-y
''DEFREAL a:b=a+c
''DEFREAL a:a=a+1
''DEFREAL a:a!=a!+a%:a$="7"
''DEFREAL a:ab=ab+de[7]
''1 DEFREAL z-a
''DEFSTR a
''DEFSTR a-t
''DEFSTR a-T
''DEFSTR a,b,c
''DEFSTR a,b-c,v,x-y
''DEFSTR a:b=a+c
''DEFSTR a:a=a+1
''DEFSTR a:a!=a!+a%:a$="7"
''DEFSTR a:ab=ab+de[7]
''1 DEFSTR z-a
''DEFSTR f:f(x)="w"
PRINT "DEG, ";
DEG
''DELETE
''DELETE -
''DELETE ,
''DELETE -,
''DELETE 10
''DELETE 1-
''DELETE -1
''DELETE 1-2
''1 DELETE 2-1
'''1 DELETE 1+2
'''1 DELETE a
''a=DERR
''DI
'
PRINT "DIM, ";
DIM a(1)
''DIM a!(1)
''DIM a%(1)
ERASE a
DIM a$(1)
DIM b(2,13)
ERASE a$,b
i=1:DIM a(2,13+7),b$(3),c(2*i,7)
ERASE a,b$,c
''DIM a[2,13)
''DIM a(4):FOR i=0 TO 4:a(i)=i:NEXT
''a=0:FOR i=0 TO 4:a=a+a(i):NEXT:IF a<>10 THEN ERROR 33
DIM a(4):FOR i=0 TO 4:a(i)=i:NEXT
b=0:FOR i=0 TO 4:b=b+a(i):NEXT:IF b<>10 THEN ERROR 33
ERASE a
'
''DRAW 10,20
''DRAW -10,-20,7
''DRAW 10,20,7,3
''DRAW 10,20,,3
''DRAW x,y,m,g1
''DRAWR 10,20
''DRAWR -10,-20,7
''DRAWR 10,20,7,3
''DRAWR 10,20,,3
''DRAWR x,y,m,g1
'
' EDIT, EI, ELSE, END, ENT, ENV, EOF, ERASE, ERL, ERR, ERROR, EVERY GOSUB, EXP
'
''EDIT 20
''EI
''ELSE
''ELSE 10
''ELSE a=7
' see below: END
''ENT 1
''ENT 1,2,a,4
''ENT num,steps,dist,ti,steps2,dist2,ti2
''ENT num,=period,ti,=period2,ti2
''ENV 1
''ENV 1,2,a,4
''ENV num,steps,dist,ti,steps2,dist2,ti2
''ENV num,=reg,period,=reg2,period2
''a=EOF
'
PRINT "ERASE, ";
DIM a(1):ERASE a
DIM a$(1):ERASE a$
DIM a(1),a$(1):ERASE a,a$
'''1 ERASE 5
'
''a=ERL
''a=ERR
''ERROR 7
''ERROR 5+a
'
PRINT "EVERY, ";
EVERY 10 GOSUB 10010
a=REMAIN(0)
EVERY 10,1 GOSUB 10010
a=REMAIN(1)
'
PRINT "EXP, ";
a=EXP(0): IF a<>1 THEN ERROR 33
a=EXP(2.3): IF ROUND(a,5)<>9.97418 THEN ERROR 33
'
' FILL, FIX, FN, FOR, FRAME, FRE
'
''FILL 7
'
PRINT "FIX, ";
a=FIX(0): IF a<>0 THEN ERROR 33
a=FIX(2.77): IF a<>2 THEN ERROR 33
a=FIX(-2.3): IF a<>-2 THEN ERROR 33
a=FIX(123.466): IF a<>123 THEN ERROR 33
'
PRINT "FN"
DEF FNclk=1: c=FNclk: c=FN clk
DEF FNclk(a)=a: c=FNclk(a): c=FN clk(a)
DEF FNclk(a,b)=a+b: c=FNclk(a,b): c=FN clk(a,b)
DEF FNclk$(a$,b$)=a$+b$: c$=FNclk$(a$,b$): c$=FN clk$(a$,b$)
'
PRINT "FOR, ";
FOR a=1 TO 10:NEXT
''FOR a%=1.5 TO 9.5: NEXT
''FOR a!=1.5 TO 9.5: NEXT
FOR a=1 TO 10 STEP 3:NEXT
b=1:FOR a=5+b TO -4 STEP -2.3:NEXT
b=1:c=5:d=2:FOR a=b TO c STEP d:NEXT
b=1:c=3:FOR a=b TO c:NEXT
FOR a=1 TO 1 STEP 0+1:NEXT
b=1:c=3:i=1:FOR a=b TO c STEP i:NEXT
FOR a=1 TO 2 STEP 0+1:NEXT
FOR a=-1 TO -2 STEP 0-1:NEXT
FOR a=&A000 TO &A00B STEP &X101:NEXT
FOR a=2 TO 1 STEP -&1:NEXT
FOR a=2 TO 1 STEP -&X1:NEXT
''1 FOR a$=1 TO 2: NEXT
FOR next1=1 TO 10 STEP 3:NEXT next1
''FOR a=b TO c STEP s:a=0:NEXT
'
PRINT "FRAME, ";
FRAME
'
''a=FRE(0)
''a=FRE("")
''a=FRE(b-2)
''a=FRE(a$)
'
' GOSUB, GOTO, GRAPHICS PAPER, GRAPHICS PEN
'
PRINT "GOSUB, ";
GOSUB 10010
'''1 GOSUB a
'
''10 GOTO 10010
'''1 GOTO a
''GRAPHICS PAPER 5
''GRAPHICS PAPER 2.3*a
''GRAPHICS PEN 5
''GRAPHICS PEN 5,1
''GRAPHICS PEN ,0
''GRAPHICS PEN 2.3*a,1+b
'
' HEX$, HIMEM
'
PRINT "HEX$, ";
a$=HEX$(0): IF a$<>"0" THEN ERROR 33
a$=HEX$(16,4): IF a$<>"0010" THEN ERROR 33
a$=HEX$(255): IF a$<>"FF" THEN ERROR 33
a$=HEX$(255,10): IF a$<>"00000000FF" THEN ERROR 33
a$=HEX$(256): IF a$<>"100" THEN ERROR 33
a$=HEX$(32767,16): IF a$<>"0000000000007FFF" THEN ERROR 33
a$=HEX$(65535): IF a$<>"FFFF" THEN ERROR 33
a$=HEX$(a,b)
'
''a=HIMEM
'
' IF, INK, INKEY, INKEY$, INP, INPUT, INSTR, INT
'
PRINT "IF, ";
IF a=1 THEN a=2
IF a=1 THEN a=2 ELSE a=1
''IF a=1 THEN
''IF a=1 THEN ELSE
''IF a=1 THEN a=2 ELSE
''IF a=1 THEN ELSE a=1
''IF a=1 THEN IF b=1 THEN ELSE ELSE a=1
IF a=1 THEN IF b=1 THEN a=2 ELSE a=3 ELSE b=2
''10 IF a=1 THEN GOTO 10010
''10 IF a=1 THEN 10010
''10 IF a=1 GOTO 10010
''10 IF a=1 THEN a=a+1:GOTO 10
IF a=1 THEN GOSUB 10010
''10 IF a=1 THEN 10:a=never1
''10 IF a=1 THEN 10 ELSE 20 '20 REM
''10 IF a=1 THEN 10 ELSE GOTO 20 '20 REM
''10 IF a=b+5*c THEN a=a+1: GOTO 10 ELSE a=a-1:GOTO 20
a=0: b=0: c=0: IF a=b+5*c THEN a=a+1:GOSUB 10010 ELSE a=a-1:GOSUB 10020
IF a<>3 THEN GOSUB 10010
IF a$<>"3" THEN GOSUB 10010
'
''INK 2,19
''INK 2,19,22
''INK a*2,b-1,c
''a=INKEY(0)
a$=INKEY$
''a=INP(&FF77)
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
a=INSTR("key","ey"): IF a<>2 THEN ERROR 33
a$="key": b$="y": a=INSTR(a$,b$): IF a<>3 THEN ERROR 33
''a=INSTR(start,a$,b$)
a=INSTR("Amstrad", "m"): IF a<>2 THEN ERROR 33
a=INSTR("Amstrad", "sr"): IF a<>0 THEN ERROR 33
a=INSTR(6,"amstrad", "a"): IF a<>6 THEN ERROR 33
''a=INSTR("", ""): IF a<>0 THEN ERROR 33
''a=INSTR(1, "", ""): IF a<>0 THEN ERROR 33
''a=INSTR(1, "ab", ""): IF a<>1 THEN ERROR 33
'
PRINT "INT, ";
a=INT(0): IF a<>0 THEN ERROR 33
a=INT(1): IF a<>1 THEN ERROR 33
a=INT(2.7): IF a<>2 THEN ERROR 33
a=INT(-2.3): IF a<>-3 THEN ERROR 33
b=1:a=INT(b+2.3): IF a<>3 THEN ERROR 33
'
' JOY
'
''a=JOY(0)
''a=JOY(b+1)
'
' KEY, KEY DEF
'
''KEY 11,"border 13:paper 0"
''KEY a,b$
''KEY DEF 68,1
''KEY DEF 68,1,159
''KEY DEF 68,1,159,160
''KEY DEF 68,1,159,160,161
''KEY DEF num,fire,normal,shift,ctrl
'
' LEFT$, LEN, LET, LINE INPUT, LIST, LOAD, LOCATE, LOG, LOG10, LOWER$
'
PRINT "LEFT$, ";
a$=LEFT$("abc",0):IF a$<>"" THEN ERROR 33
a$="abc":a$=LEFT$(a$,1):IF a$<>"a" THEN ERROR 33
a$="abc":a$=LEFT$(a$,2):IF a$<>"ab" THEN ERROR 33
a$="abc":a$=LEFT$(a$,4):IF a$<>"abc" THEN ERROR 33
'
PRINT "LEN, ";
a=LEN(""): IF a<>0 THEN ERROR 33
a=LEN("a"): IF a<>1 THEN ERROR 33
a$="abc":a=LEN(a$): IF a<>3 THEN ERROR 33
'
PRINT "LET, ";
LET a=a+1
'
''LINE INPUT a$
''LINE INPUT ;a$
''LINE INPUT "para",a$
''LINE INPUT "para";a$
''LINE INPUT ;"para noCRLF";a$
''LINE INPUT #2,;"para noCRLF";a$
''LINE INPUT #stream,;"string";a$
''LIST
''LIST -
''LIST ,
''LIST -,
''LIST 10
''LIST 1-
''LIST -1
''LIST 1-2
''LIST #3
''LIST ,#3
''LIST 10,#3
''LIST 1-,#3
''LIST -1,#3
''LIST 1-2,#3
'''LIST a
''LOAD "file"
''LOAD "file.scr",&C000
''LOAD f$,adr
''LOCATE 10,20
''LOCATE #2,10,20
''LOCATE #stream,x,y
'
PRINT "LOG, ";
a=LOG(1): IF a<>0 THEN ERROR 33
a=LOG(10): IF ROUND(a,4)<>2.3026 THEN ERROR 33
a=LOG(1000)/LOG(10): IF INT(a+1E-09)<>3 THEN ERROR 33
'
PRINT "LOG10, ";
a=LOG10(1): IF a<>0 THEN ERROR 33
a=LOG10(10): IF a<>1 THEN ERROR 33
a=LOG10(1000):IF a<>3 THEN ERROR 33
'
PRINT "LOWER$, ";
a$=LOWER$(""): IF a$<>"" THEN ERROR 33
a$=LOWER$("A"): IF a$<>"a" THEN ERROR 33
a$=LOWER$("ABCDEFGHKKLMNOPQRSTUVWXYZ"): IF a$<>"abcdefghkklmnopqrstuvwxyz" THEN ERROR 33
b$="AbC":a$=LOWER$(b$): IF a$<>"abc" THEN ERROR 33
a$=LOWER$("String"): IF a$<>"string" THEN ERROR 33
'
' MASK, MAX, MEMORY, MERGE, MID$, MIN, MOD, MODE, MOVE, MOVER
'
''MASK &X10101011
''MASK 2^(8-x),1
''MASK a,b
''MASK ,b
'
PRINT "MAX"
a=MAX(0): IF a<>0 THEN ERROR 33
a=MAX(0,4): IF a<>4 THEN ERROR 33
a=MAX(-3.2,3.1,2.3): IF a<>3.1 THEN ERROR 33
a=MAX(7): IF a<>7 THEN ERROR 33
a=MAX(1.5,2.1,2): IF a<>2.1 THEN ERROR 33
a=1:b=2:a=MAX(a,7,b): IF a<>7 THEN ERROR 33
''a$=MAX("abc")
''1 a$=MAX("abc","d")
''a$=MAX("abc"):IF a$<>"abc" THEN ERROR 33
'
''MEMORY &3FFF
''MEMORY adr
''MERGE "file"
''MERGE f$
'
PRINT "MID$, ";
a$=MID$("abc",2): IF a$<>"bc" THEN ERROR 33
a$=MID$("abc",1): IF a$<>"abc" THEN ERROR 33
a$=MID$("abc",255): IF a$<>"" THEN ERROR 33
a$=MID$("abc",2,0): IF a$<>"" THEN ERROR 33
a$=MID$("abc",2,1): IF a$<>"b" THEN ERROR 33
a$=MID$("abc",2,3): IF a$<>"bc" THEN ERROR 33
a$=MID$("string",3): IF a$<>"ring" THEN ERROR 33
a$=MID$("string",3,2): IF a$<>"ri" THEN ERROR 33
b$="abcd":a=2:a$=MID$(b$,a): IF a$<>"bcd" THEN ERROR 33
b$="abcd":a=2:b=2:a$=MID$(b$,a,b): IF a$<>"bc" THEN ERROR 33
''PRINT "MID$ as assign"
a$="abc":MID$(a$,2,2)="XY": IF a$<>"aXY" THEN ERROR 33
a$="abc":MID$(a$,2)="XY": IF a$<>"aXY" THEN ERROR 33
a$="abc":MID$(a$,2,1)="X": IF a$<>"aXc" THEN ERROR 33
a$="abc":MID$(a$,2,2)="X": IF a$<>"aXc" THEN ERROR 33
a$="abc":MID$(a$,2,1)="XY": IF a$<>"aXc" THEN ERROR 33
a$="abc":MID$(a$,1)="XY": IF a$<>"XYc" THEN ERROR 33
''MID$(a$,2)=b$
''MID$(a$,2,2)=b$
''MID$(a$,b%,c!)="string"
a$="abcd":b$="xyz":MID$(a$,2)=b$:IF a$<>"axyz" OR b$<>"xyz" THEN ERROR 33
a$="abcd":b$="xyz":MID$(a$,2,2)=b$:IF a$<>"axyd" THEN ERROR 33
'
PRINT "MIN, ";
a=MIN(0): IF a<>0 THEN ERROR 33
a=MIN(7): IF a<>7 THEN ERROR 33
a=MIN(0,4): IF a<>0 THEN ERROR 33
a=MIN(1,5): IF a<>1 THEN ERROR 33
a=MIN(-3.2,3.1,2.3): IF a<>-3.2 THEN ERROR 33
a=MIN(1.5,2.1,2): IF a<>1.5 THEN ERROR 33
a=MIN(b,c,d)
a=2:b=1:a=MIN(a,7,b): IF a<>1 THEN ERROR 33
''a$=MIN("abc")
''1 a$=MIN("abc","d")
''a$=MIN("abc"): IF a$<>"abc" THEN ERROR 33
'
PRINT "MOD, ";
a=10 MOD 3: IF a<>1 THEN ERROR 33
a=5:b=3:a=a MOD -b:IF a<>2 THEN ERROR 33
'
''MODE 0 'testet on top
''MODE n+1
''MOVE 10,20
''MOVE -10,-20,7
''MOVE 10,20,7,3
''MOVE 10,20,,3
''MOVE x,y,m,g1
''MOVER 10,20
''MOVER -10,-20,7
''MOVER 10,20,7,3
''MOVER 10,20,,3
''MOVER x,y,m,g1
'
' NEW, NEXT, NOT
'
''NEW
'
PRINT "NEXT, ";
FOR a=1 TO 2:NEXT: IF a<>3 THEN ERROR 33
FOR a=1 TO 2:NEXT a: IF a<>3 THEN ERROR 33
FOR a=1 TO 2:FOR b=3 TO 4:NEXT b:NEXT a: IF a<>3 OR b<>5 THEN ERROR 33
''NEXT b,a
'
PRINT "NOT, ";
a=NOT 2: IF a<>-3 THEN ERROR 33
b=-7:a=NOT -b: IF a<>-8 THEN ERROR 33
'
' ON BREAK ..., ON ERROR GOTO, ON GOSUB, ON GOTO, ON SQ GOSUB, OPENIN, OPENOUT, OR, ORIGIN, OUT
'
''ON BREAK CONT
''10 ON BREAK GOSUB 10010
''ON BREAK STOP
''10 ON ERROR GOTO 0
''10 ON ERROR GOTO 10
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
ON 1 GOSUB 10010
i=1:ON i GOSUB 10010,10020
i=2:ON i+1 GOSUB 10020,10020,10010
i=0:ON i GOSUB 10020: 'no match
i=2:ON i GOSUB 10020: 'no match
'
''10 ON 1 GOTO 10
''10 ON i GOTO 10,20 '20 REM
''10 ON i+1 GOTO 10,20,20 '20 REM
''10 ON SQ(1) GOSUB 10010
''10 ON SQ(channel) GOSUB 10010
''OPENIN "file"
''OPENIN f$
''OPENOUT "file"
''OPENOUT f$
'
PRINT "OR, ";
a=1 OR &1A0: IF a<>417 THEN ERROR 33
a=b OR c
'
''ORIGIN 10,20
''ORIGIN 10,20,5,200,50,15
''ORIGIN x,y,left,right,top,bottom
''OUT &BC12,&12
''OUT adr,by
'
' PAPER, PEEK, PEN, PI, PLOT, PLOTR, POKE, POS, PRINT
'
''PAPER 2
''PAPER #stream,p
''a=PEEK(&C000)
''a=PEEK(adr+5)
''PEN 2
''PEN 2,1
''PEN #3,2,1
''PEN #stream,p,trans
'
PRINT "PI, ";
a=PI: IF ROUND(a,8)<>3.14159265 THEN ERROR 33
'
''PLOT 10,20
''PLOT -10,-20,7
''PLOT 10,20,7,3
''PLOT 10,20,,3
''PLOT x,y,m,g1
''PLOTR 10,20
''PLOTR -10,-20,7
''PLOTR 10,20,7,3
''PLOTR 10,20,,3
''PLOTR x,y,m,g1
''POKE &C000,23
''POKE adr,by
PRINT "POS, ";
a=POS(#0): IF a<>51 THEN ERROR 33
''a=POS(#stream)
'
PRINT
PRINT "PRINT: ";
''PRINT #2
''PRINT #2,
PRINT "string";
PRINT 999999999;
PRINT 1E+09;
PRINT 2.5E+10;
PRINT 1.234567846;
a$="test":PRINT a$;
a$="test":b=2:PRINT a$;b;
''PRINT #2,a$,b
PRINT a=(29+1) MOD 10=0 AND 5=7; a$<>"a2" OR b$<>"2"
'
PRINT "PRINT USING: ";
''PRINT USING "####";ri;
PRINT USING "##.##";-1.2;
PRINT " / ";USING "###.###";-1.2;1.2
''PRINT USING "### ########";a,b
''PRINT USING "\\   \\";"n1";"n2";" xx3";
''PRINT USING "!";"a1";"a2";
''PRINT USING "&";"a1";"a2";
''PRINT #9,TAB(t);t$;i;"h1"
PRINT "PRINT comma:", "13","26 apples","39"; " (default zone 13)"
PRINT "PRINT SPC:"; SPC(3);"13";SPC(13-2);"26 apples" SPC(13-9);"39"
i=14: PRINT "PRINT TAB:"; TAB(14);"13";TAB(i*2-1);"26 apples";TAB(i*3-2);"39"
'
PRINT "?: ";
?;
a$="print test":?a$;b
''?#2,ti-t0!;SPC(5);
'
' RAD, RANDOMIZE, READ, RELEASE, REM, REMAIN, RENUM, RESTORE, RESUME, RETURN, RIGHT$, RND, ROUND, RUN
'
''RAD
''RANDOMIZE
''RANDOMIZE 123.456
'
PRINT "READ, ";
DATA "a1", 1, "a2"
DATA 2, "c1"
READ a$: IF a$<>"a1" THEN ERROR 33
READ b: IF b<>1 THEN ERROR 33
READ a$,b,b$: IF a$<>"a2" OR b<>2 OR b$<>"c1" THEN ERROR 33
'
''RELEASE 1
''RELEASE n+1
'
PRINT "REM, ";
REM
REM comment until EOL
REM '
'comment until EOL
a=1 'comment
'
PRINT "REMAIN, ";
a=REMAIN(0)
a=1:a=REMAIN(a)
'
''RENUM
''RENUM 100
''RENUM 100,50
''RENUM 100,50,2
'
PRINT "RESTORE, ";
RESTORE
RESTORE 10
'
''RESUME
''10 RESUME 10
''RESUME NEXT
''RETURN
'
PRINT "RIGHT$, ";
a$=RIGHT$("abc",0): IF a$<>"" THEN ERROR 33
a$=RIGHT$("abc",1): IF a$<>"c" THEN ERROR 33
a$=RIGHT$("abc",2): IF a$<>"bc" THEN ERROR 33
a$=RIGHT$("abc",4): IF a$<>"abc" THEN ERROR 33
b$="abcd":a=2:a$=RIGHT$(b$,a): IF a$<>"cd" THEN ERROR 33
a$=" 204":a$=RIGHT$(a$,LEN(a$)-1): IF a$<>"204" THEN ERROR 33
'
PRINT "RND, ";
a=RND: IF a<=0 OR a>=1 THEN ERROR 33
a=RND(0): IF a<=0 OR a>=1 THEN ERROR 33
b=2:a=RND(-1*b): IF a<=0 OR a>=1 THEN ERROR 33
'
PRINT "ROUND, ";
a=ROUND(2.49): IF a<>2 THEN ERROR 33
a=ROUND(2.5): IF a<>3 THEN ERROR 33
a=ROUND(0): IF a<>0 THEN ERROR 33
a=ROUND(-2.49): IF a<>-2 THEN ERROR 33
'a=ROUND(-2.50): IF a<>-3 THEN ERROR 33
'a=ROUND(8.575,2): IF a<>8.58 THEN ERROR 33
'a=ROUND(-8.575,2): IF a<>-8.58 THEN ERROR 33
'a=ROUND(1.005,2): IF a<>1.01 THEN ERROR 33
'a=ROUND(-1.005,2): IF a<>-1.01 THEN ERROR 33
a=ROUND(2.49,-39): IF a<>0 THEN ERROR 33
a=ROUND(2.49,39): IF a<>2.49 THEN ERROR 33
a=ROUND(1234.5678,-2): IF a<>1200 THEN ERROR 33
a=ROUND(2.335): IF a<>2 THEN ERROR 33
a=ROUND(2.335,2): IF a<>2.34 THEN ERROR 33
a=ROUND(PI): IF a<>3 THEN ERROR 33
a=ROUND(PI,0): IF a<>3 THEN ERROR 33
''a=ROUND(PI,0.4): IF a<>3 THEN ERROR 33
a=ROUND(PI,2): IF a<>3.14 THEN ERROR 33
''a=ROUND(PI,2.4): IF a<>3.14 THEN ERROR 33
a=ROUND(1234.5678,-2): IF a<>1200 THEN ERROR 33
''a=ROUND(8.575,2): IF a<>8.58 THEN ERROR 33
''a=ROUND(-8.575,2): IF a<>-8.58 THEN ERROR 33
''a=ROUND(1.005,2): IF a<>1.01 THEN ERROR 33
''a=ROUND(-1.005,2): IF a<>-1.01 THEN ERROR 33
'
''RUN
''10 RUN 10
''RUN "file"
''RUN f$
'
' SAVE, SGN, SIN, SOUND, SPACE$, SPEED INK, SPEED WRITE, SQ, STOP, STR$, STRING$, SYMBOL
'
''SAVE "file"
''SAVE "file",p
''SAVE "file",a
''SAVE "file.scr",b,&C000,&4000
''SAVE "file.bin",b,&8000,&100,&8010
''SAVE f$,b,adr,lg,entry
'
PRINT "SGN, ";
a=SGN(5): IF a<>1 THEN ERROR 33
a=SGN(0): IF a<>0 THEN ERROR 33
a=SGN(-5): IF a<>-1 THEN ERROR 33
'
PRINT "SIN, ";
RAD
a=SIN(0): IF a<>0 THEN ERROR 33
a=SIN(PI/2): IF ROUND(a,8)<>1 THEN ERROR 33
a=SIN(2.3)
DEG
a=SIN(0): IF a<>0 THEN ERROR 33
a=SIN(90): IF ROUND(a,8)<>1 THEN ERROR 33
RAD
'
''SOUND 1,100
''SOUND 1,100,400
''SOUND 1,100,400,15
''SOUND 1,100,400,15,1
''SOUND 1,100,400,15,1,1
''SOUND 1,100,400,15,1,1,4
''SOUND ch,period,duration,,,,noise
''SOUND ch,period,duration,vol,env1,ent1,noise
'
PRINT "SPACE$, ";
a$=SPACE$(9): IF a$<>"         " THEN ERROR 33
b=-2:a$=SPACE$(9+b): IF a$<>"       " THEN ERROR 33
''SPEED INK 10,5
''SPEED INK a,b
''SPEED KEY 10,5
''SPEED KEY a,b
''SPEED WRITE 1
''SPEED WRITE a-1
'''1 SPEED mode 2
''a=SQ(1)
''a=SQ(channel)
'
PRINT "SQR, ";
a=SQR(9): IF a<>3 THEN ERROR 33
'' 'below: STOP
'
PRINT "STR$, ";
a$=STR$(123): IF a$<>" 123" THEN ERROR 33
a$=STR$(a+b)
a=1: a$="": WHILE a<=5: a$=a$+STR$(a)+":": a=a+1: b=0: WHILE b<3: b=b+1: a$=a$+STR$(b): WEND: a$=a$+" ": WEND: a$=a$+"#"
IF a$<>" 1: 1 2 3  2: 1 2 3  3: 1 2 3  4: 1 2 3  5: 1 2 3 #" THEN ERROR 33
'
PRINT "STRING$"
a$=STRING$(13,"*"): IF a$<>"*************" THEN ERROR 33
a=7:b$="x":a$=STRING$(a,b$): IF a$<>"xxxxxxx" THEN ERROR 33
a$=STRING$(10,42): IF a$<>"**********" THEN ERROR 33
''SYMBOL 255,1,2,3,4,5,6,7,&X10110011
''SYMBOL 255,1
''SYMBOL AFTER 255
'
' TAG, TAGOFF, TAN, TEST, TESTR, TIME, TROFF, TRON
'
''TAG
''TAG #2
''TAG #stream
''TAGOFF
''TAGOFF #2
''TAGOFF #stream
'
PRINT "TAN, ";
RAD
a=TAN(0): IF a<>0 THEN ERROR 33
a=TAN(45 * PI/180): IF ROUND(a,8)<>1 THEN ERROR 33
a=INT(TAN(0.7853981635)*100000000)/100000000: IF a<>1 THEN ERROR 33
DEG
a=TAN(0): IF a<>0 THEN ERROR 33
a=TAN(45): IF ROUND(a,8)<>1 THEN ERROR 33
RAD
'
''a=TEST(10,20)
''a=TEST(x,y)
''a=TESTR(10,-20)
''a=TESTR(xm,ym)
'
PRINT "TIME, ";
a=TIME: IF a<=0 THEN ERROR 33
''TROFF
''TRON
'
' UNT, UPPER$
'
PRINT "UNT, ";
a=UNT(1234): IF a<>1234 THEN ERROR 33
''a=UNT(&FF66): IF a<>-154 THEN ERROR 33 'TTT: not supported
'
PRINT "UPPER$, ";
a$=UPPER$("String"): IF a$<>"STRING" THEN ERROR 33
b$="a text":a$=UPPER$(b$): IF a$<>"A TEXT" THEN ERROR 33
'
' VAL, VPOS
'
PRINT "VAL, ";
a=VAL("-2.3"): IF a<>-2.3 THEN ERROR 33
b$="2.3": a=VAL(b$): IF a<>2.3 THEN ERROR 33
a=VAL(""): IF a<>0 THEN ERROR 33
''a=VAL("4r"): IF a<>4 THEN ERROR 33 'TTT
a=VAL("&ff"): IF a<>&FF THEN ERROR 33
a=VAL("&7A00"): IF a<>31232 OR a<>&7A00 THEN ERROR 33
'
PRINT "VPOS, ";
a=VPOS(#0)
''a=VPOS(#stream)
'
' WAIT, WEND, WHILE, WIDTH, WINDOW, WINDOW SWAP, WRITE
'
''WAIT &FF34,20
''WAIT &FF34,20,25
'
PRINT "WEND (and WHILE)"
a=9:WHILE a=10:WEND: IF a<>9 THEN ERROR 33
a=3:WHILE a>0:a=a-1:WEND: IF a<>0 THEN ERROR 33
''WIDTH 40
''WINDOW 10,30,5,20
''WINDOW #1,10,30,5,20
''WINDOW #stream,left,right,top,bottom
''WINDOW SWAP 1
''WINDOW SWAP 1,0
'''1 WINDOW SWAP #1
'
PRINT "WRITE: ";
a$="def":WRITE "abc",a$,7,15; "abc";a$;7;15;1E+09
''WRITE
''WRITE #2
''WRITE #2,
''WRITE "string"
''WRITE 999999999
''WRITE 1E+09
''WRITE 2.5E+10
''WRITE 1.234567846
''WRITE a$
''WRITE a$,b
''WRITE #2,a$,b
''WRITE #2,a$;b
'''WRITE ,
'''WRITE ;
'
' XOR, XPOS
'
PRINT "XOR"
a=&X1001 XOR &X0110: IF a<>15 THEN ERROR 33
b=5:c=7:a=b XOR c: IF a<>2 THEN ERROR 33
'PRINT "XPOS, ";
'a=XPOS: IF a<>0 THEN ERROR 33
' ypos
'PRINT "YPOS, ";
'a=YPOS: IF a<>0 THEN ERROR 33
'
' zone
ZONE 9
PRINT "ZONE:","10","19","28"
ZONE 13
'
PRINT "Completed."
END
'
10010 RETURN
10020 ERROR 33
RETURN
65535 c=1
`);
