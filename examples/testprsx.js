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
PRINT "|DATE ";d$;", ";
t$=SPACE$(8)
|TIME,@t$: 'get current time from RTC ("HH MM SS")
PRINT "|TIME ";t$
'
PRINT "Completed."
END
`);
