/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM draworg - Draw Organ
REM (c) Wolfgang Volz, Laemmerstieg 58, 2400 Luebeck 1
REM taken from bach; Orgel im Strassburger Muenster; Wohl mir,dass ich Jesum habe (J. S. Bach)
REM
MODE 1
INK 0,0:INK 1,26:INK 2,14:INK 3,6:PAPER 0
'PRINT"Johann Sebastian Bach" 
'
'Organ case
'
FOR kz=1 TO 2
  READ kc,kd
  PLOT kc,kd,1
  FOR kn=1 TO 35
    READ ka,kb
    DRAWR ka,kb
  NEXT kn
NEXT kz
'
DATA 100,50,0,200,100,0,0,10,-86,0,-14,-10,100,0,0,-200,54,-10,104,0,54,10,100,0,0,200,-14,10,-86,0,0,-10,100,0,-100,0,0,30,-54,50,0,40,-104,0,0,-40,-54,-50,0,-100,54,10,104,0,54,-10,0,70,0,-200,-54,-10,0,330,-104,0,0,-330,-54,10,-100,0
DATA 98,48,0,204,104,0,0,10,-88,0,-16,-12,104,0,0,-202,54,-10,102,0,54,10,102,0,0,200,-16,10,-86,0,0,-6,98,0,-100,0,0,32,-54,50,0,36,-100,0,0,-36,-54,-50,0,-102,54,10,100,0,54,-10,0,70,0,-202,-54,-10,0,328,-100,0,0,-328,-54,8,-102,0
'
FOR ke=0 TO 10 STEP 2
  PLOT 98+ke,252+ke
  DRAW 200,252+ke
NEXT  
FOR kf=0 TO 10 STEP 2
  PLOT 514-kf,250+kf
  DRAW 410,250+kf
NEXT
'
'Organ pipes
'
FOR pf=1 TO 29
  READ wdth,px,py,height,yfu
  FOR a=px TO px+wdth
    PLOT a,py,2
    DRAWR 0,height
    PLOT px+wdth/2,yfu
    DRAW a,py,2
    PLOT a,py,3
    DRAWR 0,10,3
    PLOT a,py+5,0
  NEXT a
NEXT pf
'
DATA 8,104,80,90,54,8,118,75,110,54,8,132,70,130,54,8,146,65,150,54,8,160,70,130,54,8,174,75,110,54,8,188,80,90,54,6,208,70,190,54,6,220,65,210,52,6,232,61,230,50,6,244,59,248,48,8,260,70,250,44,8,274,65,270,44,8,288,60,290,44,8,302,55,310,44
DATA 8,316,60,290,44,8,330,65,270,44,8,344,70,250,44,6,362,59,248,48,6,374,61,230,50,6,386,65,210,52,6,398,70,190,54,8,416,80,90,54,8,430,75,110,54,8,444,70,130,54,8,458,65,150,54,8,472,70,130,54,8,486,75,110,54,8,500,80,90,54
'
END
`);
