/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM tester - Tester
REM Marco Vieth
REM
MODE 2
PRINT "Universal Tester / Universeller Tester"
PRINT
PRINT "1) English (Englisch)"
PRINT "2) Deutsch (German)"
PRINT "1..2) ";
t$="":WHILE t$<"1" OR t$>"2":t$=INKEY$:WEND
lg=VAL(t$)
PRINT t$;" -> ";
ON lg GOSUB 1000,1500 'English or German help
PRINT "1..4) ";
t$="":WHILE t$<"1" OR t$>"5":t$=INKEY$:WEND
PRINT t$;" -> ";
IF t$="1" THEN IF lg=1 THEN RESTORE 2000 ELSE RESTORE 2500
IF t$="2" THEN IF lg=1 THEN RESTORE 3000 ELSE RESTORE 3500
IF t$="3" THEN IF lg=1 THEN RESTORE 4000 ELSE RESTORE 4500
IF t$="4" THEN IF lg=1 THEN RESTORE 5000 ELSE RESTORE 5500
IF t$="5" THEN IF lg=1 THEN RESTORE 6000 ELSE RESTORE 6500
READ t$
PRINT t$
PRINT
GOSUB 400: 'read data in q$(ng,ma), a$(ng,ma), na(ng)
GOSUB 600: 'random mapping in r(ta)
'?"DEBUG:";:FOR ri = 1 TO ta:?r(ri);:NEXT:?
ca=0: 'counter for correct answers
FOR ri = 1 TO ta
  r1=r(ri)
  GOSUB 700: 'Test question r1
  PRINT
  IF s=0 THEN GOSUB 300:STOP
NEXT
GOSUB 300
END
'
' End of test
300 ri=ri-1
t$="":IF ca<>1 THEN t$="s"
PRINT "You answered";ca;"question";t$;" correctly out of";STR$(ri);" (";ROUND(100*ca/MAX(ri, 1));"% )."
RETURN
'
' Read data (questions and answers)
400 ma=7: 'maximum number of answers
READ ng: 'number of groups
DIM q$(ng,ma),a$(ng,ma),na(ng)
ta=0: 'total number of answers
FOR g=1 TO ng
  READ na(g): 'number of answers
  ta=ta+na(g)
  FOR i = 1 TO na(g)
    READ q$(g,i),a$(g,i)
  NEXT
NEXT
READ t$: IF t$<>"end" THEN PRINT "Error in DATA: 'end' not found": STOP
RETURN
'
' Shuffle the indices
500 FOR i = 1 TO n
  j = INT(RND * i + 1)
  a(i) = i
  a(i) = a(j)
  a(j) = i 
NEXT i
RETURN
'
' Random mapping in r(ta)
600 n=ta
DIM a(n)
GOSUB 500: 'shuffle indices
DIM r(n)
FOR i = 1 TO n
  r(i) = a(i)
NEXT
ERASE a
RETURN
'
' Test
700 r2=r1
g = 1: 'group
n = na(g)
WHILE r2>n
  r2 = r2 - n
  g = g + 1
  n = na(g)
WEND
'?"DEBUG: r1 ="; r1; " g ="; g; " r2 ="; r2
'
DIM a(n)
GOSUB 500:' shuffle indices
PRINT "Question (";ri;"/";ta;"):"
PRINT
PRINT q$(g,r2)
FOR i = 1 TO n
  PRINT STR$(i);") "; a$(g,a(i))
NEXT
PRINT
mx$=RIGHT$(STR$(n),1)
PRINT "0..";mx$;")";
t$="":WHILE t$<"0" OR t$>mx$:t$=INKEY$:WEND
s=VAL(t$)
IF s=0 THEN a$(g,a(s))="End of test"
PRINT s;"- ";a$(g,a(s));" -> ";
IF s>0 THEN IF a(s)=r2 THEN PRINT "Correct":ca=ca+1 ELSE PRINT "Wrong" ELSE PRINT ""
ERASE a
RETURN
'
' English help
1000 PRINT "English"
RESTORE 2000
PRINT
PRINT "Universal Tester"
PRINT "This program tests your knowledge in various fields."
PRINT "You will be asked questions and you have to choose the correct answer."
PRINT "The questions are grouped into categories."
PRINT "You can stop the test at any time by pressing 0)."
PRINT "The program will then display the number of correct answers."
PRINT
'PRINT "Press any key to start."
PRINT "Knowledge area:"
PRINT "1) Biology"
PRINT "2) Chemistry"
PRINT "3) Geography"
PRINT "4) History"
PRINT "5) Inventions"
PRINT 
RETURN
'
' German help
1500 PRINT "German"
RESTORE 2500
PRINT
PRINT "Universeller Tester"
PRINT "Dieses Programm prueft Ihr Wissen in verschiedenen Bereichen."
PRINT "Es werden Ihnen Fragen gestellt, zu denen Sie die richtige Antwort waehlen muessen."
PRINT "Die Fragen sind in Gruppen unterteilt."
PRINT "Sie koennen den Test jederzeit mit der Taste 0) abbrechen."
PRINT "Das Programm zeigt Ihnen dann die Anzahl der richtigen Antworten an."
PRINT
'PRINT "Druecken Sie eine Taste, um zu beginnen."
PRINT "Wissensgebiet:"
PRINT "1) Biologie"
PRINT "2) Chemie"
PRINT "3) Geographie"
PRINT "4) Geschichte"
PRINT "5) Erfindungen"
PRINT
RETURN
'
' Biology questions
'
2000 DATA "Biology"
DATA 3
DATA 6
DATA "What is essential for human survival over a long period?", "Drinking"
DATA "What should a person do after a tiring day?", "Sleep"
DATA "Which habit is considered unhealthy?", "Smoking"
DATA "Which activity provides the body with calories (energy)?", "Eating"
DATA "What should you avoid doing with your mouth full?", "Speaking"
DATA "Which is a form of human movement?", "Walking"
DATA 6
DATA "What is a stallion?", "Male horse"
DATA "What is a mare?", "Female horse"
DATA "What is a foal?", "Young horse"
DATA "What color is a dun horse?", "Brown"
DATA "What color is a gray horse?", "White"
DATA "What color is a black horse?", "Black"
DATA 7
DATA "Which animal is an arthropod?", "Spider"
DATA "Which animal is a carnivore?", "Shrew"
DATA "Which animal is a small mammal with long ears?", "Rabbit"
DATA "Which animal is a ruminant?", "Cow"
DATA "Which animal is a fish?", "Eel"
DATA "Which animal is a reptile?", "Salamander"
DATA "Which animal is used for riding?", "Horse"
DATA "end"
'
2500 DATA "Biologie"
DATA 3
DATA 6
DATA "Worauf kann ein Mensch ueber laengere Zeit am wenigsten verzichten?", "Trinken"
DATA "Was sollte man nach einem anstrengenden Tag tun?", "Schlafen"
DATA "Welche Gewohnheit gilt als ungesund?", "Rauchen"
DATA "Welche Tätigkeit liefert dem Körper Kalorien (Energie)?", "Essen"
DATA "Was sollte man mit vollem Mund vermeiden?", "Sprechen"
DATA "Welche ist eine Form der menschlichen Fortbewegung?", "Gehen"
DATA 6
DATA "Was ist ein Hengst?", "maennliches Pferd"
DATA "Was ist eine Stute?", "weibliches Pferd"
DATA "Was ist ein Fohlen?", "junges Pferd"
DATA "Was ist ein Falbe?", "braunes Pferd"
DATA "Was ist ein Schimmel?", "weisses Pferd"
DATA "Was ist ein Rappe?", "schwarzes Pferd"
DATA 7
DATA "Welches Tier ist ein Gliederfuessler?", "Spinne"
DATA "Welches kleine Saeugetier ist ein Fleischfresser?", "Spitzmaus"
DATA "Welches kleine Saeugetier har lange Ohren?", "Kaninchen"
DATA "Welches Tier ist ein Wiederkaeuer?", "Kuh"
DATA "Welches Tier ist ein Fisch?", "Aal"
DATA "Welches Tier ist ein Reptil?", "Salamander"
DATA "Welches Tier wird zum Reiten benutzt?", "Pferd"
DATA "end"
'
' Chemistry questions
'
3000 DATA "Chemistry" 
DATA 2
DATA 6
DATA "What is mercury?", "a metal"
DATA "What is quacksalber?", "quackery"
DATA "What is brass?", "an alloy"
DATA "What is quartz?", "a mineral"
DATA "What is limewater?", "a solution"
DATA "What is (undistilled) water?", "a compound"
DATA 3
DATA "What is inflation?", "devaluation of money"
DATA "What is the opposite of inflation?", "revaluation of money"
DATA "What is infection?", "flu disease"
DATA "end"
'
3500 DATA "Chemie" 
DATA 2
DATA 6
DATA "Was ist Quecksilber?", "ein Metall"
DATA "Was ist Quacksalber?", "Scharlatanerie"
DATA "Was ist Messing?", "eine Legierung"
DATA "Was ist Quarz?", "ein Mineral"
DATA "Was ist Kalkwasser?", "eine Loesung"
DATA "Was ist (undestilliertes) Wasser?", "eine Verbildung"
DATA 3
DATA "Was ist Inflation?", "Geldentwertung"
DATA "Was ist das Gegenteil von Inflation?", "Geldaufwertung"
DATA "Was ist Infektion?", "Grippeerkrankung"
DATA "end"
'
' Geography questions
'
4000 DATA "Geography"
DATA 1
DATA 8
DATA "Which is the capital of Baden-Wuerttemberg?", "Stuttgart"
DATA "Which is the capital of Bayern?", "Muenchen"
DATA "Which is the capital of Hessen?", "Wiesbaden"
DATA "Which is the capital of Niedersachsen?", "Hannover"
DATA "Which is the capital of Nordrhein-Westfalen?", "Duesseldorf"
DATA "Which is the capital of Rheinland-Pfalz?", "Mainz"
DATA "Which is the capital of Saarland?", "Saarbruecken"
DATA "Which is the capital of Schleswig-Holstein?", "Kiel"
DATA "end"
'
4500 DATA "Geographie" 
DATA 1
DATA 8
DATA "Was ist die Hauptstadt von Baden-Wuerttemberg?", "Stuttgart"
DATA "Was ist die Hauptstadt von Bayern?", "Muenchen"
DATA "Was ist die Hauptstadt von Hessen?", "Wiesbaden"
DATA "Was ist die Hauptstadt von Niedersachsen?", "Hannover"
DATA "Was ist die Hauptstadt von Nordrhein-Westfalen?", "Duesseldorf"
DATA "Was ist die Hauptstadt von Rheinland-Pfalz?", "Mainz"
DATA "Was ist die Hauptstadt des Saarlandes?", "Saarbruecken"
DATA "Was ist die Hauptstadt von Schleswig-Holstein?", "Kiel"
DATA "end"
'
' History questions
'
5000 DATA "History" 
DATA 3
DATA 6
DATA "When did Napoleon live?", "1804"
DATA "When did Bismarck live?", "1871"
DATA "When did Hitler live?", "1933"
DATA "When did Frederick the Great live?", "1740"
DATA "When did Columbus live?", "1492"
DATA "When did Otto the Great live?", "936"
DATA 3
DATA "What happened in East Germany in 1953?", "Uprising in the GDR"
DATA "When was the Berlin Wall built?", "1961"
DATA "When did West Germany join NATO?", "1955"
DATA 3
DATA "Who was Chancellor and Foreign Minister during the Weimar Republic?", "Gustav Stresemann"
DATA "Who was the NSDAP's Reich Organization Leader?", "Gregor Strasser"
DATA "Who was a resistance fighter against Hitler?", "Otto Strasser"
DATA "end"
'
5500 DATA "Geschichte" 
DATA 3
DATA 6
DATA "Wann lebte Napoleon?", "1804"
DATA "Wann lebte Bismarck?", "1871"
DATA "Wann lebte Hitler?", "1933"
DATA "Wann lebte Friedrich der Große?", "1740"
DATA "Wann lebte Kolumbus?", "1492"
DATA "Wann lebte Otto der Große?", "936"
DATA 3
DATA "Was geschah 1953 in der DDR?", "Volksaufstand in der DDR"
DATA "Wann wurde die Berliner Mauer gebaut?", "1961"
DATA "Wann trat die BRD der NATO bei?", "1955"
DATA 3
DATA "Wer war Reichskanzler und Außenminister zur Zeit der Weimarer Republik?", "Gustav Stresemann"
DATA "Wer war Reichsorganisationsleiter der NSDAP?", "Gregor Strasser"
DATA "Wer war Widerstandskaempfer gegen Hitler?", "Otto Strasser"
DATA "end"
'
' Inventions questions
'
6000 DATA "Inventions" 
DATA 1
DATA 8
DATA "Who was Einstein?", "Inventor of the theory of relativity"
DATA "Who was Konrad Zuse?", "Inventor of the computer"
DATA "Who was Otto Hahn?", "Inventor of the atomic bomb"
DATA "Who was Galileo Galilei?", "Inventor of the telescope"
DATA "Who was James Watt?", "Inventor of the steam engine"
DATA "Who was Carl Benz?", "Inventor of the four-stroke engine"
DATA "Who was Benjamin Franklin?", "Inventor of the lightning rod"
DATA "Who was Edison?", "Inventor of the light bulb"
DATA "end"
'
6500 DATA "Erfindungen"
DATA 1
DATA 8
DATA "Wer war Einstein?", "Erfinder der Relativitätstheorie"
DATA "Wer war Konrad Zuse?", "Erfinder des Computers"
DATA "Wer war Otto Hahn?", "Erfinder der Atombombe"
DATA "Wer war Galileo Galilei?", "Erfinder des Fernrohrs"
DATA "Wer war James Watt?", "Erfinder der Dampfmaschine"
DATA "Wer war Carl Benz?", "Erfinder des Viertaktmotors"
DATA "Wer war Benjamin Franklin?", "Erfinder des Blitzableiters"
DATA "Wer war Edison?", "Erfinder der Glühbirne"
DATA "end"
`);
