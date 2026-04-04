/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM matrixra - Matrix digital rain
REM https://rosettacode.org/wiki/Matrix_digital_rain#Locomotive_Basic
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM modifications: collect output in scr$; ROUND;
MODE 1:'defint a-z:randomize time
INK 0,0:INK 1,26:INK 2,19:'BORDER 0
cols=40:rows=25
DIM scr$(cols,rows)
GOSUB 4000: 'init scr
DIM p(cols):mm=round(12*cols/80):DIM act(mm):FOR i=1 TO mm:act(i)=ROUND(RND*(cols-1)+1):NEXT
md=mm-2:DIM del(md):FOR i=1 TO md:del(i)=ROUND(RND*(cols-1)+1):NEXT
'
lp=0
WHILE lp<250 AND INKEY$=""
  lp=lp+1
  FOR i=1 TO mm:x=act(i):scr$(x,p(x)+1)=CHR$(ROUND(RND*55+64))+"1":'pen 1
    IF p(x)>0 THEN scr$(x,p(x))=CHR$(ROUND(RND*55+64)):'pen 2
    p(x)=p(x)+1:IF p(x)=rows THEN scr$(x,rows)=CHR$(ROUND(RND*55+64)):p(x)=0:act(i)=ROUND(RND*(cols-1)+1):'pen 2
  NEXT
  FOR i=1 TO md:x=del(i):scr$(x,p(x)+1)=" "
    p(x)=p(x)+1:IF p(x)=rows THEN p(x)=0:del(i)=ROUND(RND*(cols-1)+1)
  NEXT
  FRAME
  '
  'REM output scr
  CLS
  PAPER 0:PEN 2
  FOR r=1 TO rows
    FOR c=1 TO cols-1
      ch$=scr$(c,r)
      IF LEN(ch$)>1 THEN PEN 1:PRINT LEFT$(ch$,1);:PEN 2 ELSE PRINT ch$;
    NEXT c
    PRINT
  NEXT r
WEND
END
'
REM Initialize scr with spaces
4000 FOR r=1 TO rows
  FOR c=1 TO cols-1
    scr$(c,r)=" "
  NEXT c
NEXT r
RETURN
`);
