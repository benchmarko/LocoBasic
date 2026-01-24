/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM reftime - Reference Timings Test
REM
REM see also: https://benchmarko.github.io/CPCBasicTS/index.html?database=apps&example=test/reftime
MODE 2
PRINT "Reference Timing Test"
PRINT
PRINT "How fast is this system compared to a real CPC?"
PRINT "Based on CPC 6128 timings."
PRINT
PRINT "LpS=Loops per Second"
PRINT "LpsR=Reference Loops per Second (CPC 6128)"
PRINT "Fact=Speed Factor (LpS divided by LpsR)"
PRINT
PRINT "Running tests... please wait"
PRINT
'
m=1
PRINT "Test Run Ticks      Loops    Sec       LpS  LpsR     Fact  Description"
'
WHILE 1=1
READ d$:IF d$="#" THEN PRINT "end":STOP
READ lr,tr
lpsr=300*lr/tr 'loops per second
n=1:l=lr
'
lp=1
WHILE lp>0
FRAME:t=TIME
FOR c=1 TO l
ON m GOSUB 260,280,300,340
NEXT
t=TIME-t
IF t<1 THEN t=1
sec=t/300
lps=300*l/t
fac=lps/lpsr
f=300*2/t 'not 2 sec?
IF f>2 THEN l=INT(l*f):n=n+1 ELSE lp=0:'too fast, do it again
WEND
'PRINT USING "#### ### ##### ########## ##.### ####### ##### ########  &";m,n,t,l,sec,lps,lpsr,fac,d$
PRINT USING "####";m;
PRINT " ";USING "###";n;
PRINT " ";USING "#####";t;
PRINT " ";USING "##########";l;
PRINT " ";USING "##.###";sec;
PRINT " ";USING "#########";lps;
PRINT " ";USING "#####";lpsr;
PRINT " ";USING "########";fac;
PRINT "  ";d$
m=m+1
WEND
END
'
DATA "empty",1000,732
260 RETURN
'
DATA "GOSUB+RETURN",1000,888
280 GOSUB 260
RETURN
'
DATA "FOR i loop",1000,2723
300 FOR i=1 TO 10:NEXT
RETURN
'
' When renaming variable i to j, LocoBasic would be much faster because it could generate local variable
DATA "WHILE i loop",350,2986
340 i=0:WHILE i<10:i=i+1:WEND
RETURN
'
DATA "#",0,0
`);
