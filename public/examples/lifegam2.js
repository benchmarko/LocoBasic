/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM lifegam2 - Game of Life 2 (loco20)
REM Uses BASIC 2 Plus routines
maxlp=10
cols=30:rows=20
DIM grid(cols+1,rows),newg(cols+1,rows),smc(rows)
'
FUNCTION neighbourCount(c,r)
  SHARED grid[]
  neighbourCount=grid(c-1,r-1)+grid(c-1,r)+grid(c-1,r+1)+grid(c,r-1)+grid(c,r+1)+grid(c+1,r-1)+grid(c+1,r)+grid(c+1,r+1)
END FUNCTION
'
SUB drawGrid()
  SHARED grid[],smc[],rows
  FOR r=1 TO rows-1
    FOR c=1 TO smc(r)
      IF grid(c,r)=0 THEN
        PRINT " ";
      ELSE
        PRINT "*";
      END IF
    NEXT c
    PRINT
  NEXT r
END SUB
'
SUB computeGeneration()
  SHARED grid[],newg[],smc[],cols,rows
  FOR r=1 TO rows-1
    lastColumn=0
    FOR c=1 TO cols
      neighbours=neighbourCount(c,r)
      IF neighbours=3 THEN
        alive=1
      ELSE
        IF neighbours=2 THEN
          alive=grid(c,r)
        ELSE
          alive=0
        END IF
      END IF
      newg(c,r)=alive
      IF alive>0 THEN lastColumn=c
    NEXT c
    smc(r)=lastColumn
  NEXT r
END SUB
'
SUB copyGeneration()
  SHARED grid[],newg[],cols,rows,changed
  changed=0
  FOR r=1 TO rows-1
    FOR c=1 TO cols
      IF grid(c,r)<>newg(c,r) THEN
        grid(c,r)=newg(c,r)
        changed=-1
      END IF
    NEXT c
  NEXT r
END SUB
'
SUB seedGrid()
  SHARED grid[],smc[],cols,rows
  FOR seed=1 TO 50
    c=INT(cols*RND(1)+1)
    r=INT(rows*RND(1)+1)
    grid(c,r)=1
    IF c>smc(r) THEN smc(r)=c
  NEXT seed
END SUB
'
SUB loadPattern(c1,r1)
  SHARED grid[],smc[]
  READ n
  FOR r=1 TO n
    READ pat$
    FOR c=1 TO LEN(pat$)
      IF MID$(pat$,c,1)="1" THEN grid(c1+c,r1+r)=1
    NEXT c
    IF c1+LEN(pat$)>smc(r1+r) THEN smc(r1+r)=c1+LEN(pat$)
  NEXT r
END SUB
'
MODE 1
CALL seedGrid()
RESTORE 1210:CALL loadPattern(5,7)
RESTORE 1210:CALL loadPattern(5,10)
RESTORE 1310:CALL loadPattern(10,5)
'
lp=1:changed=1
WHILE lp<=maxlp AND changed<>0
  t=TIME+200
  CLS
  PRINT "L I F E G A M E"
  CALL drawGrid()
  CALL computeGeneration()
  CALL copyGeneration()
  WHILE TIME<t:FRAME:WEND
  lp=lp+1
WEND
PRINT
PRINT "Stop after";lp;"generations"
IF changed=0 THEN PRINT " No change any more"
END
'
' https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life#Examples_of_patterns
' block
1110 DATA 2
DATA "11"
DATA "11"
' beehive
1120 DATA 3
DATA "0110"
DATA "1001"
DATA "0110"
' loaf
1130 DATA 4
DATA "0110"
DATA "1001"
DATA "0101"
DATA "0010"
' boat
1140 DATA 3
DATA "110"
DATA "101"
DATA "010"
' tub
1150 DATA 3
DATA "010"
DATA "101"
DATA "010"
' blinker
1210 DATA 1
DATA "111"
' toad
1220 DATA 2
DATA "0111"
DATA "1110"
' beacon
1230 DATA 4
DATA "1100"
DATA "1100"
DATA "0011"
DATA "0011"
' glider
1310 DATA 3
DATA "001"
DATA "101"
DATA "011"
`);