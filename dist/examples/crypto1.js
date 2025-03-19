/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM crypto1 - Cryptology 1
REM Kryptoanalyse - Kryptologie
REM Die geheime Nachricht, Umschau Verlag, S.63
REM 16.11.1988
'
DIM z(5,27): '6 languages with 28 data points: 26 letters + vowels/consonants
'Reading the frequency of letters
FOR j=0 TO 5:FOR i=0 TO 27:READ z(j,i):NEXT i,j
MODE 2
PRINT "Cryptanalysis - Cryptology - Letter frequency (%)"
padlen=12
DEF FNpad$(s$)=SPACE$(padlen-LEN(s$))+s$
PRINT "   ";FNpad$("German");FNpad$("English");FNpad$("French");FNpad$("Italian");FNpad$("Spanish");FNpad$("Portuguese")
FOR i=0 TO 27
  IF i<26 THEN PRINT CHR$(i+65)+"  "; ELSE IF i=26 THEN PRINT:PRINT "vow"; ELSE PRINT "con";
  FOR j=0 TO 5
    PRINT FNpad$(DEC$(z(j,i),"###.##"));
  NEXT j
  PRINT
NEXT i
'
'PRINT"sum";
'FOR j=0 TO 5:su=0:FOR i=0 TO 25:su=su+z(j,i):NEXT i:PRINT fnpad$(DEC$(su,"###.#"));:NEXT j
't=time+900:while time<t:frame:wend
PRINT "[vow= vowels, con=most frequent consonants L, N, R, S, T]"
PRINT
'
'
'Comparison table of the frequency of individual letters based on 100-word texts:
'Table: 1. Proportion of individual letters A-Z
'2. Proportion of vowels (1 number)
'2. Proportion of the most frequent consonants L, N, R, S, T (1 number)
'
'German
DATA 5,2.5,1.5,5,18.5,1.5,4,4,8,0,1,3,2.5,11.5,3.5,0.5,0,7,7,5,5,1,1.5,0,0,1.5
DATA 40,34
'English
DATA 7.81,1.28,2.93,4.11,13.05,2.88,1.39,5.85,6.77,0.23,0.42,3.6,2.62,7.28,8.21,2.15,0.14,6.64,6.46,9.02,2.77,1,1.49,0.3,1.51,0.09
DATA 40,33
'French
DATA 9.42,1.02,2.64,3.38,15.87,0.95,1.04,0.77,8.41,0.89,0,5.34,3.24,7.15,5.14,2.86,1.06,6.46,7.9,7.26,6.24,2.15,0,0.3,0.24,0.32
DATA 45,34
'Italian
DATA 11.74,0.92,4.5,3.73,11.79,0.95,1.64,1.54,11.28,0,0,6.51,2.51,6.88,9.83,3.05,0.61,6.37,4.98,5.62,3.01,2.1,0,0,0,0.49
DATA 48,30
'Spanish
DATA 12.69,1.41,3.93,5.58,13.15,0.46,1.12,1.24,6.25,0.56,0,5.94,2.65,6.95,9.49,2.43,1.16,6.25,7.6,3.91,4.63,1.07,0,0.13,1.06,0.35
DATA 47,31
'Portuguese
DATA 13.5,0.5,3.5,5,13,1,1,1,6,0.5,0,3.5,4.5,5.5,11.5,3,1.5,7.5,7.5,4.5,4,1.5,0,0.2,0,0.3
DATA 48,29
'
'
REM Kryptoanalyse - Kryptologie
'Die geheime Nachricht, Umschau Verlag, S.62
'16.11.1988
'
ma=25:mb=23:mc=6:md=15:me=14 :'count-1
DIM a$(ma),b$(mb),c$(mc),d$(md),e$(me) :'fields for letter groups (count-1)
'Read letter groups
FOR i=0 TO ma:READ a$(i):NEXT
FOR i=0 TO mb:READ b$(i):NEXT
FOR i=0 TO mc:READ c$(i):NEXT
FOR i=0 TO md:READ d$(i):NEXT
FOR i=0 TO me:READ e$(i):NEXT
'
'MODE 2
'PRINT "Kryptoanalyse - Kryptologie"
'print
PRINT "Order of frequencies for letters and letter groups in German"
FOR i=0 TO ma:PRINT a$(i);",";:NEXT:PRINT
FOR i=0 TO mb:PRINT b$(i);",";:NEXT:PRINT
FOR i=0 TO mc:PRINT c$(i);",";:NEXT:PRINT
FOR i=0 TO md:PRINT d$(i);",";:NEXT:PRINT
FOR i=0 TO me:PRINT e$(i);",";:NEXT:PRINT
'
'
'PRINT:FRAME:'TODO: wait key
END
'
'Order of frequencies for letters and letter groups in German
'
'Individual letters
DATA "E","N","R","I","S","T","U","D","A","H","G","L","O","C","M","B","Z","F","W","K","V","P","J","Q","X","Y"
'Two-letter groups
DATA "EN","ER","CH","DE","GE","EI","IE","IN","NE","BE","EL","TE","UN","ST","DI","ND","UE","SE","AU","RE","HE","IT","RI","TZ"
'Double letters
DATA "EE","TT","LL","SS","DD","MM","NN"
'Three-letter groups
DATA "EIN","ICH","DEN","DER","TEN","CHT","SCH","CHE","DIE","UNG","GEN","UND","NEN","DES","BEN","RCH"
'Four-letter groups
DATA "ICHT","KEIT","HEIT","CHON","CHEN","CHER","URCH","EICH","DERN","AUCH","SCHA","SCHE","SCHI","SCHO","SCHU"
`);
