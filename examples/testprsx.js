/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM testprsx - Test Page RSX
MODE 1
PRINT "Test Page RSX"
'
PRINT "RSX"
'
''|A
''|B
''|BASIC
''|CPM
''a$="*.drw":|DIR,@a$
''|DISC
''|DISC.IN
''|DISC.OUT
''|DRIVE,0
'''1 |DRIVE,
'''1 |DRIVE,#1
''|ERA,"file.bas"
''|REN,"file1.bas","file2.bas"
''|TAPE
''|TAPE.IN
''|TAPE.OUT
''|USER,1
''|MODE,3
''|RENUM,1,2,3,4
''|
d$=SPACE$(11)
|DATE,@d$
PRINT "|DATE ";d$;" => ";MID$(d$,4,2);"/";MID$(d$,7,2);"/";RIGHT$(d$,2);" day: ";LEFT$(d$,2)
t$=SPACE$(8)
|TIME,@t$: 'get current time from RTC ("HH MM SS")
PRINT "|TIME ";t$;" => ";LEFT$(t$,2);":";MID$(t$,4,2);":";RIGHT$(t$,2)
'
FRAME
'
PRINT
lat=0:lon=0
'lat= 51.507351: lon=-0.127758 'test London
'lat=52.520007:lon=13.404954 'test Berlin: N 52° 31.200 E 13° 24.297
|GEOLOCATION,@lat,@lon
PRINT "|GEOLOCATION lat=";lat;", lon=";lon
IF lat>=0 THEN latNS$="N" ELSE latNS$="S"
IF lon>=0 THEN lonEW$="E" ELSE lonEW$="W"
PRINT latNS$+STR$(ABS(lat))+" "+lonEW$+STR$(ABS(lon))
'
latdeg=INT(ABS(lat))
latmin=(ABS(lat)-latdeg)*60
londeg=INT(ABS(lon))
lonmin=(ABS(lon)-londeg)*60
PRINT latNS$+" "+DEC$(latdeg,"##")+"° "+DEC$(latmin,"##.###")+" "+lonEW$+" "+DEC$(londeg,"##")+"° "+DEC$(lonmin,"##.###")
'
'
PRINT
PRINT "Completed."
END
`);
