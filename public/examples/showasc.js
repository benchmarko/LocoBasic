/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM showasc - Show ASCII table
REM https://rosettacode.org/wiki/Show_ASCII_table#Locomotive_Basic
REM we use: https://rosettacode.org/wiki/Show_ASCII_table#IS-BASIC
REM GNU FDL 1.2 (https://www.gnu.org/licenses/fdl-1.2.html)
REM modifications: replaced TEXT 80 by MODE 2
MODE 2
FOR r=0 TO 15
  FOR c=32+r TO 112+r STEP 16
    PRINT USING "###";c;:PRINT ": ";CHR$(c);" ";
  NEXT
  PRINT
NEXT
`);
