/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM funcspec - Functional Spectrum
REM
m = 2
xd = 2 ^ (2 - MIN(m, 2))
yd = ((m = 3) + 2)
cols = 80 / xd - 1
rows = 50 / yd
MODE m
xoff = 0
yoff = 0
'
k = 6: GOSUB 260: FRAME
'
REM Get user choice
k = 0
INPUT "Functional Spectrum choice (1-16)"; k
IF k < 1 OR k > 16 THEN STOP
'
REM Animate spectrum
FOR xoff = 0 TO -30 STEP -10
  GOSUB 260
NEXT
FOR xoff = -30 TO 30 STEP 10
  GOSUB 260
NEXT
FOR xoff = 30 TO 0 STEP -10
  GOSUB 260
NEXT
END
'
'AnimateSpectrum
260 CLS
fchar = 65 + 32
xh = cols \\ 2 + xoff
yh = (rows \\ 2 + 1) + yoff
FOR z = 1 TO rows
  FOR s = 1 TO cols
    x = s - xh
    y = z - yh
    ON k GOSUB 410,420,430,440,450,460,470,480,490,500,510,520,530,540,550,560
    qu = ROUND(ABS((p MOD 16)))
    PEN qu
    PRINT CHR$(fchar + qu);
  NEXT s
  PRINT
NEXT z
t = TIME + 40: WHILE TIME < t: FRAME: WEND
RETURN
'
REM Calculations
410 p = 15 * (EXP(x) + EXP(-x)) / 2 + LOG(y + SQR(y * y + 1))
RETURN
420 p = 15 * EXP(-(x * z + y * s) / 200)
RETURN
430 p = 15 * EXP(-(SIN(x) + COS(y)) / 150)
RETURN
440 p = 15 * EXP(-(x * x + COS(y * 2)) / 100)
RETURN
450 p = 15 * EXP(-(COS(x * x + y * y)) / 150)
RETURN
460 p = 15 * EXP(-(x * x + y * y) / 150)
RETURN
470 p = 3 * (ATN(x) + ATN(y))
RETURN
480 p = 15 * 3 * ((x * x + y * y) > 18) * ATN(x / 2 + y / 2)
RETURN
490 p = 3 * ((x * x + y * y) > 18) * ATN(x / 2 + y / 2)
RETURN
500 p = 3 * (x * x * x - y * y) * SIN((x + y) / 20) / (x * x + y * y + 0.3)
RETURN
510 p = (SIN(x) - SIN(y)) ^ 3
RETURN
520 p = SIN(x - y) + SQR(ABS(x * y))
RETURN
530 p = 7 * (SIN(x / 5) + COS(y))
RETURN
540 p = (COS(2 * x) + 1) * (COS(2 * y) + 1)
RETURN
550 p = 3 * x ^ 2 + 5 * x + y
RETURN
560 p = 15 * SQR(ABS(y)) * COS(x)
RETURN
`);
