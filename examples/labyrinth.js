/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM labyrinth - Drawing Labyrinth
MODE 2
'
' Initialize arrays and variables
DIM directions(4), dx(4), dy(4)
dx(0) = 0: dy(0) = -1  ' Up
dx(1) = 1: dy(1) = 0   ' Right
dx(2) = 0: dy(2) = 1   ' Down
dx(3) = -1: dy(3) = 0  ' Left
'
' Set labyrinth size: cols (1-63), rows (1-49)
cols = 19
rows = 12
totalCells = cols * rows
cols = cols - 1
rows = rows - 1
DIM maze(cols, rows)
'
' Compute and output the labyrinth
GOSUB 200
GOSUB 610
END
'
' Compute the labyrinth
200 col = INT(RND * cols)
row = INT(RND * rows)
r = 1
WHILE r < totalCells
  q = 0
  IF row > 0 THEN IF maze(col, row - 1) = 0 THEN q = q + 1: directions(q) = 0
  IF col < cols THEN IF maze(col + 1, row) = 0 THEN q = q + 1: directions(q) = 1
  IF row < rows THEN IF maze(col, row + 1) = 0 THEN q = q + 1: directions(q) = 2
  IF col > 0 THEN IF maze(col - 1, row) = 0 THEN q = q + 1: directions(q) = 3
  IF q = 0 THEN GOSUB 565 ELSE GOSUB 580
  ' Add progress tracking
  'IF r MOD (totalCells / 10) = 0 THEN PRINT "Progress: "; (r / totalCells) * 100; "%"
WEND
maze(0, 0) = maze(0, 0) + 1
RETURN
'
' Find the next starting point
565 start = 1
WHILE start = 1 OR maze(col, row) = 0
  start = 0
  row = row + 1
  IF row > rows THEN row = 0: col = col + 1: IF col > cols THEN col = 0
WEND
RETURN
'
' Update the labyrinth
580 directionIndex = directions(INT(RND * q) + 1)
maze(col, row) = maze(col, row) + 2 ^ directionIndex
col = col + dx(directionIndex)
row = row + dy(directionIndex)
oppositeDirection = directionIndex - 2
IF oppositeDirection < 0 THEN oppositeDirection = oppositeDirection + 4
maze(col, row) = maze(col, row) + 2 ^ oppositeDirection
r = r + 1
RETURN
'
' Print textual maze
610 FOR row = 0 TO rows
  topPart$ = ""
  bottomPart$ = ""
  FOR col = 0 TO cols
    topPart$ = topPart$ + "#"
    IF maze(col, row) AND 1 THEN topPart$ = topPart$ + " " ELSE topPart$ = topPart$ + "#"
    IF maze(col, row) AND 8 THEN bottomPart$ = bottomPart$ + " " ELSE bottomPart$ = bottomPart$ + "#"
    bottomPart$ = bottomPart$ + " "
  NEXT
  PRINT topPart$ + "#"
  PRINT bottomPart$ + "#"
NEXT row
' Bottom border of the labyrinth
PRINT STRING$(cols * 2, "#") + "# #"
RETURN
`);
