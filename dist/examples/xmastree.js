/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM xmastree - Christmas tree
REM
WHILE 1
  GOSUB 100
  t=TIME+300*6:WHILE TIME<t AND INKEY$="":WEND
WEND
END
'
100 MODE 3:INK 0,0:INK 12,9
width1 = 640
height = 400
cx = width1 / 2
topY = 50
bottomY = height - 70
layers = 6
layerHeight = (bottomY - topY) / layers
maxWidth = 200
'
' star
GRAPHICS PEN 1
starY = height-(topY - 25)
|POLYGON, cx, starY, cx+7, starY-17, cx+24, starY-17, cx+10, starY-29, cx+15, starY-47, cx, starY-35, cx-15, starY-47, cx-10, starY-29, cx-24, starY-17, cx-7, starY-17, 1
'
' layers
GRAPHICS PEN 12
FOR i = 0 TO layers-1
  yTop = topY + i * layerHeight
  yBottom = yTop + layerHeight
  wTop = (i / layers) * maxWidth * 0.45
  wBottom = ((i + 1) / layers) * maxWidth
  'draw layer
  yTop2 = height - yTop
  yBottom2 = height - yBottom
  |POLYGON,cx - wTop,yTop2, cx + wTop,yTop2, cx + wBottom,yBottom2, cx - wBottom,yBottom2,12
  'ornaments
  FOR j = 0 TO 4
    ox = cx + (RND - 0.5) * wBottom * 1.6
    oy = yTop + layerHeight * (0.45 + RND * 0.2)
    col = INT(RND*15)+1
    |CIRCLE,ox,399-oy, 5, col
  NEXT
NEXT
'
'trunk
GRAPHICS PEN 9
|RECT,cx - 16, height-bottomY, cx - 16+32, height-bottomY-45,9
RETURN
`);
