/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM raytrac - Raytracing
REM
REM https://cpcwiki.de/forum/index.php/topic,1006.0.html
REM
' Screen init
'SCREEN 8,0:SET PAGE 1,1
MODE 0: FOR k=0 TO 15:INK k,ROUND(k*1.7):NEXT:INK 1,26:INK 15,1
'CLS
'_TURBO ON
' Initialize
DIM t(9),v(15),o(19,7),s(19,7),ri(3),gi(3),bi(3),z(3),y(3)
FOR i=0 TO 9:READ t(i):NEXT i
v(0)=t(0):v(1)=t(1):v(2)=t(2)
v(9)=t(0)-t(3):v(10)=t(1)-t(4):v(11)=t(2)-t(5)
v1=SQR(v(9)*v(9)+v(10)*v(10)+v(11)*v(11))
v(9)=v(9)/v1:v(10)=v(10)/v1:v(11)=v(11)/v1
v(6)=-v(9)*v(10):v(7)=1-v(10)*v(10):v(8)=-v(11)*v(10)
v(3)=-(v(10)*v(8)-v(11)*v(7)):v(4)=-(v(11)*v(6)-v(9)*v(8))
v(5)=-(v(9)*v(7)-v(10)*v(6)):v(15)=t(9)
v(12)=t(6):v(13)=t(7):v(14)=t(8)
READ mo:FOR i=0 TO mo-1:FOR j=0 TO 7:READ o(i,j):NEXT j:NEXT i
READ ms:FOR i=0 TO ms-1:FOR j=0 TO 7:READ s(i,j):NEXT j:NEXT i
ma=1000:mi=0.001:md=0:pt=4
FOR i=1 TO 4
v1=SQR(v(i*3+0)*v(i*3+0)+v(i*3+1)*v(i*3+1)+v(i*3+2)*v(i*3+2))
v(i*3+0)=v(i*3+0)/v1:v(i*3+1)=v(i*3+1)/v1:v(i*3+2)=v(i*3+2)/v1
NEXT i
' Trace
FOR sy=0 TO 200 STEP 4:FOR sx=0 TO 320 STEP 4:xd=0:yd=0
WHILE yd<4
cx=v(0):cy=v(1):cz=v(2)
vx=v(3)*(sx+xd-128)/99+v(6)*(106-sy-yd)/99-v(9)*v(15)
vy=v(4)*(sx+xd-128)/99+v(7)*(106-sy-yd)/99-v(10)*v(15)
vz=v(5)*(sx+xd-128)/99+v(8)*(106-sy-yd)/99-v(11)*v(15)
v1=SQR(vx*vx+vy*vy+vz*vz)
vx=vx/v1:vy=vy/v1:vz=vz/v1
cr=0:cg=0:cb=0:rn=0:rf=1
GOSUB 1760
IF cr>=1 THEN cr=0.99
IF cg>=1 THEN cg=0.99
IF cb>=1 THEN cb=0.99
ri(xd)=cr:gi(xd)=cg:bi(xd)=cb
xd=xd+1
IF xd>=4 THEN GOSUB 1470:xd=0:yd=yd+1
'TTT IF XD<4 THEN 1250
'GOSUB 1470:XD=0
'YD=YD+1:'IF YD<4 THEN 1250
WEND
IF strig(0) THEN STOP 'GOTO 1460
NEXT sx
NEXT sy
ti=TIME+300:WHILE TIME<ti AND INKEY$="":WEND
STOP 'GOTO 1460
1470 ' Draw
'MAKE RGB DATA FOR SCREEN8 AND WRITE IT ON THE SCREEN
FOR xd=0 TO 3
cc1=ROUND((ri(xd)+gi(xd)+bi(xd))/3*15):IF cc1=15 THEN cc1=1 ELSE IF cc1=1 THEN cc1=15
PLOT (sx+xd)*2,400-((sy+yd)*2),cc1
NEXT xd
RETURN
1760 ' Pixel
f=1
WHILE f=1
tt=ma
FOR n=0 TO mo-1
GOSUB 1870
IF tt>th AND th>mi THEN tt=th:tn=n:lx=nx:ly=ny:lz=nz
NEXT n
IF tt=ma THEN RETURN '1860
cx=cx+tt*vx:cy=cy+tt*vy:cz=cz+tt*vz:n=tn
GOSUB 2150
WEND 'IF F=1 THEN GOTO 1760
RETURN
1870 ' Cross
rx=cx-o(n,0):ry=cy-o(n,1):rz=cz-o(n,2)
a=o(n,3):b=o(n,4):c=o(n,5)
ON o(n,6)+1 GOSUB 1920,2030: RETURN 'GOTO 1920,2030
GOSUB 1920
RETURN 'GOTO 1920
1920 ' Box
IF vx=0 THEN t1=ma ELSE IF rx<0 THEN t1=-(rx+a)/vx ELSE t1=-(rx-a)/vx
IF vy=0 THEN t2=ma ELSE IF ry<0 THEN t2=-(ry+b)/vy ELSE t2=-(ry-b)/vy
IF vz=0 THEN t3=ma ELSE IF rz<0 THEN t3=-(rz+c)/vz ELSE t3=-(rz-c)/vz
IF ABS(ry+t1*vy)>b OR ABS(rz+t1*vz)>c THEN t1=ma
IF ABS(rz+t2*vz)>c OR ABS(rx+t2*vx)>a THEN t2=ma
IF ABS(rx+t3*vx)>a OR ABS(ry+t3*vy)>b THEN t3=ma
IF t1<=t2 AND t1<=t3 THEN th=t1:nx=-vx/ABS(vx):ny=0:nz=0
IF t2<=t3 AND t2<=t1 THEN th=t2:ny=-vy/ABS(vy):nz=0:nx=0
IF t3<=t1 AND t3<=t2 THEN th=t3:nz=-vz/ABS(vz):nx=0:ny=0
RETURN
2030 ' Ball
aa=vx*vx*a+vy*vy*b+vz*vz*c
bb=rx*vx*a+ry*vy*b+rz*vz*c
cc=rx*rx*a+ry*ry*b+rz*rz*c-1
dd=bb*bb-aa*cc
IF dd<0 THEN th=ma:RETURN 'GOTO 2140
t1=(-bb-SQR(dd))/aa:t2=(-bb+SQR(dd))/aa
IF t1<t2 THEN th=t1 ELSE th=t2
nx=a*(rx+th*vx):ny=b*(ry+th*vy):nz=c*(rz+th*vz)
m=SQR(nx*nx+ny*ny+nz*nz)
nx=nx/m:ny=ny/m:nz=nz/m
RETURN
2150 ' Shade
sh=o(n,7):REM 0=Silber,1=Stahl,2=Rotes Plastik, 3=Graues Plastik, 4=Blaues Plastik,5=Graues Plastik,6=Chrom
IF sh=-1 THEN px=INT(ABS(cx+100)/pt-(cx+100<0)) : py=INT(ABS(cy+100)/pt-(cy+100<0)) : pz=INT(ABS(cz+100)/pt-(cz+100<0)) : sh=(px+py+pz) MOD 2
2220 sr=s(sh,0):sg=s(sh,1):sb=s(sh,2)
sa=s(sh,3):sd=s(sh,4):sf=s(sh,5)
sp=s(sh,6):se=s(sh,7)
jx=v(12)-vx:jy=v(13)-vy:jz=v(14)-vz
jn=SQR(jx*jx+jy*jy+jz*jz)
sm=(lx*jx+ly*jy+lz*jz)/jn
IF sm<0 THEN sm=0
FOR p=1 TO se:sm=sm*sm:NEXT p
vn=-2*(lx*vx+ly*vy+lz*vz)
wx=vx+vn*lx:wy=vy+vn*ly:wz=vz+vn*lz
vx=v(12):vy=v(13):vz=v(14)
sn=lx*vx+ly*vy+lz*vz
IF sn<0 THEN sn=0
FOR n=0 TO mo-1
GOSUB 1870
IF ma>th AND th>mi THEN sn=0:sm=0
NEXT n
cr=cr+(sr*(sa+sd*sn)+sp*sm)*rf
cg=cg+(sg*(sa+sd*sn)+sp*sm)*rf
cb=cb+(sb*(sa+sd*sn)+sp*sm)*rf
IF sf=0 AND rn<4 THEN f=0:RETURN : 'GOTO 2450
f=1:rf=rf*sf:rn=rn+1
vx=wx:vy=wy:vz=wz
2450 RETURN
' Picture data
DATA   20,  40,  20
DATA    0,   0,   0
DATA   -8,   9,  -3
DATA    6
DATA    6
DATA    2,   0,   2
DATA   .2,  .2,  .2
DATA    1,   2:REM Shader lower ball
DATA   -2,   2,   2
DATA   .2,  .2,  .2
DATA    1,   3:REM Shader left grey ball
DATA   -6,   4,   2
DATA   .2,  .2,  .2
DATA    1,   4:REM Shader blue ball
DATA   -2,   2,  -2
DATA   .2,  .2,  .2
DATA    1,   5:REM Shader right grey ball
DATA   -6,   4,  -6
DATA   .2,  .2,  .2
DATA    1,   6
DATA    0,  -2,   0
DATA   20,   1,  20
DATA    0,  -1
DATA    7
DATA   .9,  .9,  .9
DATA   .5,  .4,  .6
DATA   .7,   6
DATA   .0,  .9,  .0
DATA   .5,  .4,  .6
DATA   .7,   6
DATA   .9,  .0,  .0
DATA   .3,  .6,   0
DATA    0,   0
DATA   .9,  .9,  .9
DATA   .3,  .6,   0
DATA   .6,   8
DATA   .0,  .0,  .9
DATA   .3,  .6,   0
DATA   .6,   8
DATA   .9,  .9,  .9
DATA   .3,  .6,   0
DATA   .6,   6
DATA   .0,  .0,  .0
DATA   .3,  .6,   1
DATA   .9,   8
`);
