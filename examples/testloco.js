/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM testloco - LocoBasic syntax test
REM Select syntax=loco11 to see warnings for BASIC 2.0 syntax.
REM This checks syntax only, not runtime compatibility.
MODE 1
PRINT "Multi-line IF / ELSE / END IF"
value=7
IF value>5 THEN
  PRINT "Value is greater than 5"
ELSE
  PRINT "Value is 5 or less"
END IF
IF value=7 THEN
  PRINT "The second condition is true"
END IF
FUNCTION pow2(x)
  scratch=x*x
  pow2=scratch
END FUNCTION
lastSquare=0
SUB showSquare(n)
  SHARED lastSquare
  scratch=pow2(n)
  lastSquare=scratch
  PRINT "Square is";lastSquare
END SUB
CALL showSquare(value)
PRINT "Nested multi-line IF in a function"
FUNCTION classify(x)
  IF x>=0 THEN
    IF x>0 THEN
      classify=1
    ELSE
      classify=0
    END IF
  ELSE
    classify=-1
  END IF
END FUNCTION
PRINT "Signs:";classify(-5);classify(0);classify(5)
PRINT "Shared array in a SUB"
DIM vec(3)
SUB setvec()
  SHARED vec[]
  vec(0)=1
  vec(1)=2
  vec(2)=3
  IF vec(0)=1 THEN
    IF vec(2)=3 THEN
      PRINT "Shared vector is correct"
    ELSE
      PRINT "Unexpected vector end"
    END IF
  ELSE
    PRINT "Unexpected vector start"
  END IF
END SUB
CALL setvec()
PRINT "Vector:";vec(0);vec(1);vec(2)
END
`);