/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM tetris - Tetris
REM
REM arrows/numpad or A/D move, Q/W rotate, S down, Space drops, X exits
REM CPCBasic-keys: ["a","\\u2190","d","\\u2192","q","\\u21ba","w","\\u21bb"]
REM CPCBasic-keys: [32,"\\u2913","s","\\u2193","x",""]
MODE 0:INK 0,0:INK 1,26:INK 2,20:INK 3,24:INK 4,18:INK 5,6:INK 6,2:INK 7,15
DIM b(9,19),p(6,3),bag(6)
FOR s=0 TO 6:FOR r=0 TO 3:READ p(s,r):NEXT r:NEXT s
keys$="a4"+CHR$(242)+"d6"+CHR$(243)+"q7,"+"w8"+CHR$(240)+"s2"+CHR$(241)+" 5"+CHR$(13)
bagleft=0:GOSUB 8000:s=pick:GOSUB 8000:ns=pick:r=0:px=3:py=0:l=0
score=0:level=1:delay=150
GOSUB 9000
dt=TIME+delay:k$=""
WHILE k$<>"x"
 IF TIME>=dt THEN dt=TIME+delay:k$="s" ELSE k$=LOWER$(INKEY$)
 i=0:IF k$<>"" THEN i=INSTR(keys$,k$):IF i THEN i=INT((i-1)/3)+1
 IF i>0 AND i<6 THEN GOSUB 4000
 IF i=6 THEN GOSUB 7000
 IF i>0 THEN GOSUB 9000
WEND
PRINT "GAME OVER"
END
'
4000 nx=px:ny=py:nr=r
IF i=1 THEN nx=nx-1
IF i=2 THEN nx=nx+1
IF i=3 THEN nr=(r+3) MOD 4
IF i=4 THEN nr=(r+1) MOD 4
IF i=5 THEN ny=ny+1
GOSUB 5000
IF ok THEN px=nx:py=ny:r=nr
IF i=5 AND ok=0 THEN GOSUB 6000
RETURN
'
' test candidate NX,NY,NR against walls, floor, and settled board cells; return result in OK
5000 ok=1:mu=p(s,nr):IF mu<0 THEN mu=mu+65536
FOR yy=0 TO 3
 FOR xx=0 TO 3
  q=UNT(INT(mu/2^(15-yy*4-xx))) MOD 2
  IF q<>0 THEN bx=nx+xx:by=ny+yy:IF bx<0 OR bx>9 OR by<0 OR by>=20 THEN ok=0
  IF q<>0 AND bx>=0 AND bx<=9 AND by>=0 AND by<20 THEN IF b(bx,by)<>0 THEN ok=0
 NEXT xx
NEXT yy
RETURN
'
' lock the active piece, clear full rows, then promote NS and spawn the next preview piece
6000 cleared=0:mu=p(s,r):IF mu<0 THEN mu=mu+65536
FOR yy=0 TO 3
 FOR xx=0 TO 3
  q=UNT(INT(mu/2^(15-yy*4-xx))) MOD 2
  IF q<>0 THEN bx=px+xx:by=py+yy:IF by>=0 THEN b(bx,by)=s+1
 NEXT xx
NEXT yy
y=19
WHILE y>=0
 full=1:FOR x=0 TO 9
 IF b(x,y)=0 THEN full=0
 NEXT x
 IF full=1 THEN FOR yy=y TO 1 STEP -1:FOR x=0 TO 9:b(x,yy)=b(x,yy-1):NEXT x: NEXT yy:FOR x=0 TO 9:b(x,0)=0:NEXT x:l=l+1:cleared=cleared+1 ELSE y=y-1
WEND
sf=0:IF cleared=1 THEN sf=100 ELSE IF cleared=2 THEN sf=300 ELSE IF cleared=3 THEN sf=500 ELSE IF cleared=4 THEN sf=800
score=score+sf*level:level=1+INT(l/10):delay=MAX(15,150-10*(level-1))
s=ns:GOSUB 8000:ns=pick:r=0:px=3:py=0
nx=px:ny=py:nr=r:GOSUB 5000:IF ok=0 THEN k$="x"
dt=TIME+delay
RETURN
'
' hard-drop the piece until the next step collides, then lock it
7000 ok=1
WHILE ok=1
 nx=px:ny=py+1:nr=r:GOSUB 5000
 IF ok THEN px=nx:py=ny
WEND
GOSUB 6000
RETURN
'
' Draw without replacement, refilling after seven pieces.
8000 IF bagleft=0 THEN FOR bagindex=0 TO 6:bag(bagindex)=bagindex:NEXT bagindex:bagleft=7
bagindex=INT(RND*bagleft):pick=bag(bagindex):bagleft=bagleft-1:bag(bagindex)=bag(bagleft)
RETURN
'
' redraw the board, active piece, next preview, line count, and controls
9000 CLS:PAPER 0:PEN 1
PRINT "+--------------------+"
mu=p(s,r):IF mu<0 THEN mu=mu+65536
FOR y=0 TO 19
 PEN 1:PRINT "|";
 FOR x=0 TO 9
  v=b(x,y):cx=x-px:cy=y-py
  IF cx>=0 AND cx<4 AND cy>=0 AND cy<4 THEN q=UNT(INT(mu/2^(15-cy*4-cx))) MOD 2:IF q<>0 THEN v=s+1
  PAPER v:PRINT "  ";
 NEXT x
 PAPER 0:PRINT "|";
 IF y=0 THEN mu2=p(ns,0)
 IF y=0 AND mu2<0 THEN mu2=mu2+65536
 IF y<4 THEN GOSUB 9200
 PRINT
NEXT y
PRINT "+--------------------+"
PRINT "A/D move;   Q/W rotate"
PRINT "SPACE/S h/s drop; eXit"
PRINT "Lines";l;" Level";level;" Score";score
RETURN
'
' draw one preview row, printing spaces for empty cells so old blocks are erased
9200 PRINT "  ";:FOR x=0 TO 3
 q=UNT(INT(mu2/2^(15-y*4-x))) MOD 2
 IF q=0 THEN PAPER 0 ELSE PAPER ns+1
 PRINT "  ";
NEXT x
PAPER 0:PEN 1
RETURN
'
' four 16-bit 4x4 masks per piece, ordered I,T,O,S,Z,J,L; bit 15 is top-left
DATA &0F00,&2222,&00F0,&4444
DATA &0E40,&4C40,&4E00,&4640
DATA &0660,&0660,&0660,&0660
DATA &06C0,&8C40,&6C00,&4620
DATA &0C60,&4C80,&C600,&2640
DATA &44C0,&8E00,&6440,&0E20
DATA &4460,&0E80,&C440,&2E00
`);
