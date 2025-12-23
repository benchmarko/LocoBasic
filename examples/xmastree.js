/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM xmastree - Christmas tree
REM
mode 3:ink 0,0:ink 12,9
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
graphics pen 1
starY = height-(topY - 25)
|polygon, cx, starY, cx+7, starY-17, cx+24, starY-17, cx+10, starY-29, cx+15, starY-47, cx, starY-35, cx-15, starY-47, cx-10, starY-29, cx-24, starY-17, cx-7, starY-17, 1
'
' layers
graphics pen 12
for i = 0 to layers-1
  yTop = topY + i * layerHeight
  yBottom = yTop + layerHeight
  wTop = (i / layers) * maxWidth * 0.45
  wBottom = ((i + 1) / layers) * maxWidth
  'draw layer
  yTop2 = height - yTop
  yBottom2 = height - yBottom
  |polygon,cx - wTop,yTop2, cx + wTop,yTop2, cx + wBottom,yBottom2, cx - wBottom,yBottom2,12
  'ornaments
  for j = 0 to 4
    ox = cx + (rnd - 0.5) * wBottom * 1.6
    oy = yTop + layerHeight * (0.45 + rnd * 0.2)
    col = int(rnd*26)+1
    |circle,ox,399-oy, 5, col
  next
next
'
'trunk
graphics pen 9
|rect,cx - 16, height-bottomY, cx - 16+32, height-bottomY-45,9
'
`);
