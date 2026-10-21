/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM tetris - Tetris
REM
REM Cursor keys or: A/D move, W rotates, S soft-drops, Space hard-drops
MODE 1:INK 0,0:INK 1,26:INK 2,6:INK 3,18
DIM b(9,19),p(6,3)
FOR s=0 TO 6:FOR r=0 TO 3:READ p(s,r):NEXT r:NEXT s
s=INT(RND(1)*7):ns=INT(RND(1)*7):r=0:px=3:py=0:l=0
GOSUB 9000
k$="adw s":GOSUB 9700: 'LocoBasic keys
dt=TIME+150
100 k$=""
WHILE k$<>"q"
 k$=LOWER$(INKEY$)
 ok2=0
 IF k$="a" OR k$=CHR$(242) THEN nx=px-1:ny=py:nr=r:GOSUB 5000:IF ok THEN px=nx
 IF k$="d" OR k$=CHR$(243) THEN nx=px+1:ny=py:nr=r:GOSUB 5000:IF ok THEN px=nx
 IF k$="w" OR k$=CHR$(240) THEN nx=px:ny=py:nr=(r+1) MOD 4:GOSUB 5000:IF ok THEN r=nr
 IF k$="s" OR k$=CHR$(241) THEN nx=px:ny=py+1:nr=r:GOSUB 5000:IF ok THEN py=ny ELSE GOSUB 6000
 IF k$=" " THEN GOSUB 7000
 IF TIME>=dt THEN dt=TIME+150:nx=px:ny=py+1:nr=r:GOSUB 5000:IF ok THEN py=ny ELSE GOSUB 6000
 IF ok2 THEN GOSUB 9000
WEND
PRINT "GAME OVER"
END
'
' test candidate NX,NY,NR against walls, floor, and settled board cells; return result in OK
5000 ok=1:mu=p(s,nr):IF mu<0 THEN mu=mu+65536
FOR yy=0 TO 3
 FOR xx=0 TO 3
  q=UNT(INT(mu/2^(15-yy*4-xx))) MOD 2
  IF q<>0 THEN bx=nx+xx:by=ny+yy:IF bx<0 OR bx>9 OR by>=20 THEN ok=0
  IF q<>0 AND bx>=0 AND bx<=9 AND by>=0 AND by<20 THEN IF b(bx,by)<>0 THEN ok=0
 NEXT xx
NEXT yy
ok2=ok2+ok
RETURN
'
' lock the active piece, clear full rows, then promote NS and spawn the next preview piece
6000 mu=p(s,r):IF mu<0 THEN mu=mu+65536
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
 IF full=1 THEN FOR yy=y TO 1 STEP -1:FOR x=0 TO 9:b(x,yy)=b(x,yy-1):NEXT x: NEXT yy:FOR x=0 TO 9:b(x,0)=0:NEXT x:l=l+1 ELSE y=y-1
WEND
s=ns:ns=INT(RND(1)*7):r=0:px=3:py=0
nx=px:ny=py:nr=r:GOSUB 5000:IF ok=0 THEN k$="q"
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
' redraw the board, active piece, next preview, line count, and controls
9000 CLS
PRINT "+--------------------+"
mu=p(s,r):IF mu<0 THEN mu=mu+65536
FOR y=0 TO 19
 row$="|"
 FOR x=0 TO 9
  v=b(x,y):cx=x-px:cy=y-py
  IF cx>=0 AND cx<4 AND cy>=0 AND cy<4 THEN q=UNT(INT(mu/2^(15-cy*4-cx))) MOD 2:IF q<>0 THEN v=s+1
  IF v=0 THEN row$=row$+"  " ELSE row$=row$+"[]"
 NEXT x
 row$=row$+"|"
 IF y=0 THEN mu2=p(ns,0)
 IF y=0 AND mu2<0 THEN mu2=mu2+65536
 IF y<4 THEN GOSUB 9200
PRINT row$
NEXT y
PRINT "+--------------------+"
PRINT "A/D move, W rotate"
PRINT "SPACE/S hard/soft drop"
PRINT "Lines";l
RETURN
'
' draw one preview row, printing spaces for empty cells so old blocks are erased
9200 FOR x=0 TO 3
 q=UNT(INT(mu2/2^(15-y*4-x))) MOD 2
 IF q=0 THEN row$=row$+"  " ELSE row$=row$+"[]"
NEXT x
RETURN
'
' define user keys for LocoBasic UI
9700 FOR i=1 TO LEN(k$)
  KEY DEF 78,1,ASC(MID$(k$,i,1))
NEXT i
RETURN
'
' four 16-bit 4x4 masks per piece, ordered I,T,O,S,Z,J,L; bit 15 is top-left
10000 DATA &0F00,&2222,&00F0,&4444
DATA &0E40,&4C40,&4E00,&4640
DATA &0660,&0660,&0660,&0660
DATA &06C0,&8C40,&6C00,&4620
DATA &0C60,&4C80,&C600,&2640
DATA &44C0,&8E00,&6440,&0E20
DATA &4460,&0E80,&C440,&2E00
`);
