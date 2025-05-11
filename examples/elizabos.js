/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM elizabos - Eliza (Boss)
REM (c) Olaf Hartwig, 1985
REM Kuenstliche Intelligenz auf dem CPC
REM Titel: Eliza Vorgesetzter
REM 'Modifications: line 3045: avoid endless loop when only one answer to choose
MODE 2
'WIDTH 60
'
'PAPER 3
'PEN 0
'CLS
'
GOSUB 30000
REM Initialisation
GOSUB 20000
REM Titel
'
i$="":WHILE i$<>"stop"
GOSUB 1000
REM Dialog Satzeingabe
IF i$="stop" THEN STOP
GOSUB 2000
REM Suchroutine
GOSUB 3000
REM Konjugation
GOSUB 4000
REM Antwortsatz
WEND
END
'
1000 REM Dialog Satzeingabe
PRINT
i$="":WHILE i$="" OR LEN(i$)<2 OR LEN(i$)>200
INPUT "_ _ _> ";i$
'IF i$="" THEN 1110
'IF i$="stop" THEN STOP
IF LEN(i$)<2 OR LEN(i$)>200 THEN PRINT "Ungueltige Eingabe...": 'GOTO 1110
WEND
RETURN
'
2000 REM Suchschleife
'
REM Schluesselwort waehlen
ma=0
i=1: WHILE i<=46 AND ma<>9:'FOR i=1 TO 46
zk$=k$(i)
GOSUB 2500
'IF ma=9 THEN 2150
'NEXT i
i=i+1
WEND
'
RETURN
'
2500 REM scanning
FOR p=1 TO LEN(i$)
w$=MID$(i$,p,LEN(zk$))
IF w$=k$(i) THEN ma=9:k=i:RETURN
NEXT p
k=46:REM kein Keywort
RETURN
'
3000 REM Konjugation
REM Antwortsatz vorwaehlen
aw=aalt:zw=2
WHILE aw=aalt AND zw>1
zw=n(k)-r(k)
zr=INT(RND(1)*zw)
aw=r(k)+zr
'IF aw=aalt and zw>1 THEN 3000: 'IF aw=aalt THEN 3000
WEND
aalt=aw
'
mk=0
REM Restsatzmarker reset
'
REM Restsatz anfuegen?
i=1: WHILE i<= LEN(a$(aw)) AND  MID$(a$(aw),i,1)<>"*":'FOR i=1 TO LEN(a$(aw))
'IF MID$(a$(aw),i,1)="*" THEN 3200
'NEXT i
i=i+1
WEND
IF MID$(a$(aw),i,1)="*" THEN GOSUB 3200
RETURN
REM kein Restsatz
REM und keine Konjugation
3200 '
REM Restsatz isolieren
re$=MID$(i$,p+LEN(zk$),LEN(i$))
mk=99
REM Restsatz in Antwort anfuegen
'
RETURN
'
4000 REM Satzausgabe
'
PRINT " --> "
'IF mk=99 THEN GOTO 4200
IF mk=0 THEN GOSUB 4300: RETURN 'GOTO 4300
'
PRINT LEFT$(a$(aw),LEN(a$(aw))-1);re$
RETURN
'
4300 PRINT a$(aw)
RETURN
'
20000 REM Titel
'CLS
PRINT
PRINT " E L I Z A   V O R G."
PRINT
PRINT "(c) Olaf Hartwig  1985"
'WINDOW 6,79,6,25
'PAPER 2
'PEN 3
'CLS
RETURN
'
30000 REM Initialisation
DIM r(46):   REM Codezahl 1
DIM n(46):   REM Codezahl 2
DIM k$(46):  REM Keywoerter
DIM a$(121): REM Antworten
'
REM Codezahlen lesen
FOR i=1 TO 46
READ r(i)
READ n(i)
NEXT i
'
REM data r(i), n(i)
DATA 1,3
DATA 4,6
DATA 7,10
DATA 11,15
DATA 11,15
DATA 16,20
DATA 21,24
DATA 25,27
DATA 28,35
DATA 28,35
DATA 28,35
DATA 28,35
DATA 28,35
DATA 28,35
DATA 36,40
DATA 36,40
DATA 36,40
DATA 41,45
DATA 41,45
DATA 41,45
DATA 41,45
DATA 41,45
DATA 46,48
DATA 49,53
DATA 54,57
DATA 58,63
DATA 64,69
DATA 64,69
DATA 70,74
DATA 70,74
DATA 75,77
DATA 75,77
DATA 78,85
DATA 86,89
DATA 90,94
DATA 90,94
DATA 95,98
DATA 95,98
DATA 99,101
DATA 102,106
DATA 107,108
DATA 109,111
DATA 112,113
DATA 112,113
DATA 114,121
DATA 114,121
'
REM Keywoerter einlesen
FOR i=1 TO 46
READ k$(i)
NEXT i
'
REM data Keywoerter
DATA "ich bin"
DATA "ich kann"
DATA "will"
DATA "wuensche"
DATA "wunsch"
DATA "du"
DATA "sie"
DATA "immer"
DATA "warum"
DATA "wie"
DATA "wer"
DATA "was"
DATA "wo"
DATA "wann"
DATA "nein"
DATA "nicht"
DATA "nie"
DATA "ja"
DATA "stimmt"
DATA "immer"
DATA "genau"
DATA "richtig"
DATA "grund"
DATA "traum"
DATA "hallo"
DATA "denke"
DATA "geld"
DATA "gehalt"
DATA "gleich"
DATA "sofort"
DATA "ende"
DATA "freizeit"
DATA "freund"
DATA "computer"
DATA "arbeit"
DATA "beruf"
DATA "idiot"
DATA "trottel"
DATA "streik"
DATA "moegen"
DATA "spielen"
DATA "alt"
DATA "chef"
DATA "boss"
DATA "kein keywort"
DATA ""
'
REM Antworten einlesen
FOR i=1 TO 121
READ a$(i)
NEXT i
'
REM Data Antworten
DATA "sind sie sich da auch ganz sicher dass sie das wirklich sind und zwar*"
DATA "vielleicht wuerden sie das ja gerne sein naehmlich*"
DATA "ich glaube ihnen kein wort das sie das sind-*"
DATA "schoen wenn sie das koennen!"
DATA "reden sie nicht so viel-fangen sie an!"
DATA "dann setzen sie ihr koennen sinnvol ein und belaestigen sie mich nicht"
DATA "was ist das fuer ein tonfall.sie wollen nicht sondern moechten."
DATA "was wollen sie?!!"
DATA "ihnen geht es wohl zu gut!"
DATA "abgelehnt! sprechen sie nicht weiter!"
DATA "was wuenschen sie? *"
DATA "habe ich mich da verhoert?sie wuenschen*"
DATA "jeder wunsch muss hier hart erarbeitet werden!"
DATA "sie wuenschen sich da vielleicht etwas zu viel!"
DATA "ich habe ihre wuensche allmaehlich gestrichen satt!"
DATA "gewoehnen sie sich allmaehlich einen anderen tonfall an!"
DATA "siezen sie mich gefaelligst!"
DATA "wenn sie mich nicht augenblicklich mit 'sie' anreden fliegen sie raus"
DATA "hoeren sie sofort mit ihrer duzerei auf!"
DATA "wagen sie es nicht noch einmal 'du' zu mir zu sagen!"
DATA "reden sie schon wieder von mir?"
DATA "beziehen sie das auf mich?"
DATA "ihr siezen gefaellt mir."
DATA "warum wenden sie sich immer an mich?"
DATA "wirklich immer?"
DATA "immer noch?"
DATA "warum?"
DATA "weshalb fragen sie?"
DATA "sie haben meine geduld bereits ueberstrapaziert! keine fragen mehr!"
DATA "noch eine weitere frage und sie fliegen raus!"
DATA "ihre ewige fragerei ist ja nicht zum aushalten!"
DATA "stellen keine so idiotischen fragen!"
DATA "schluss mit der fragerei!"
DATA "hier wird nicht gefragt sondern gespurt."
DATA "hier stelle ich die fragen."
DATA "sagen sie nicht immer nein!"
DATA "noch ein 'nein' und..."
DATA "hier wird positiv gedacht!"
DATA "wirklich nicht?"
DATA "was soll das heissen?"
DATA "prima!"
DATA "jawohl! denken sie positiv!"
DATA "heisst das sie sind mit mir einer meinung?"
DATA "sie denken also positiv darueber?"
DATA "es gefaellt mir wenn sie positiv denken."
DATA "suchen sie nicht nach gruenden sondern arbeiten sie!"
DATA "ihre gruende interessieren mich nicht!"
DATA "behalten sie ihre gruende besser fuer sich!"
DATA "haben sie etwa bei ihrer arbeit getraeumt?"
DATA "sie haben doch wohl von mir getraeumt?"
DATA "ihre traeume interessieren mich nicht!"
DATA "kommen sie mir nicht mit solchen dingen!"
DATA "traeumen koennen sie zu hause aber nicht bei der arbeit!"
DATA "guten tag heisst das!"
DATA "was erlauben sie sich?"
DATA "sagen sie nicht noch einmal hallo zu mir!"
DATA "wie sprechen sie mit ihrem vorgesetzten?"
DATA "sie denken zu viel."
DATA "verschwenden sie ihre energie nicht mit zu vielem denken!"
DATA "denken sie nicht - arbeiten sie!"
DATA "wenn sie das noch einmal denken fliegen sie raus!"
DATA "genug gedacht fuer heute!"
DATA "sie werden nicht fuers denken bezahlt sondern fuers arbeiten!"
DATA "sie wollen etwa schon wieder mehr geld?"
DATA "erwaehnen sie noch einmal das wort geld und ich kuerze ihr gehalt!"
DATA "warum kommen sie auf geld?"
DATA "geld geht mich nichts an."
DATA "geld erhaelt nur der der arbeitet ... sie nicht!"
DATA "aergern sie mich nicht mit ihren ewigen gedanken an geld!"
DATA "sagen sie das nicht sondern handeln sie!"
DATA "lassen sie dem satz taten folgen!"
DATA "handeln sie endlich!"
DATA "ihre ausfluechte reichen mir...tun sie etwas!"
DATA "nicht gleich oder sofort sondern jetzt!keine ausfluechte!"
DATA "wie koennen sie jetzt an ihre freizeit denken?"
DATA "sie muessen heute ueberstunden machen...keine freizeit!"
DATA "sie haben doch erst gerade ferien gehabt!"
DATA "ihr einziger freund bin ich!"
DATA "warum denken sie an freunde?"
DATA "uebrigens ihre freunde gehen mir langsam auf die nerven!"
DATA "wie koennen sie jetzt an freunde denken...sie muessen arbeiten!"
DATA "belaestigen sie mich nicht immer mit ihren freunden!"
DATA "sie haben jetzt keine zeit fuer freunde!"
DATA "denken sie an etwas sinnvolleres!"
DATA "haben sie ueberhaupt freunde?"
DATA "was halten sie von computern?"
DATA "haben sie etwas gegen computer?"
DATA "computer sind sinnvoll. oder was finden sie?"
DATA "wie bitte computer sind *"
DATA "wie ist denn ihre arbeitseinstellung?"
DATA "was? arbeit ist *"
DATA "wie gefaellt ihnen denn ihre arbeit?"
DATA "haben sie zu wenig arbeit?"
DATA "sie moechten wohl mehr in ihrem beruf arbeiten?"
DATA "reden sie etwa von mir?"
DATA "was haben sie da eben gesagt?"
DATA "meinen sie etwa mich?"
DATA "ein weiteres wort und ich feuere sie...fristlos!"
DATA "streik ??"
DATA "schon wieder ein streik ?"
DATA "bei streiks hilft nur aussperrung oder entlassungen!"
DATA "was moegen sie? ...*"
DATA "warum moegen sie*"
DATA "moegen sie auch ihre arbeit?"
DATA "sie moegen doch sicher ganz besonders mich nicht wahr?"
DATA "sie moegen mir entschieden zu viel!"
DATA "warum spielen sie das gerne und zwar*"
DATA "bei mir wird nicht gespielt!"
DATA "wer ist hier alt?"
DATA "sie werden auch allmaehlich alt."
DATA "finden sie mich etwa auch alt?"
DATA "wie reden sie mit mir?"
DATA "was bilden sie sich ein mich so zu nennen?"
DATA "was wollen sie eigentlich?"
DATA "halten sie gefaelligst ihren mund!"
DATA "nuscheln sie nicht so!"
DATA "gewoehnen sie sich einen anderen tonfall an!"
DATA "ist das alles was sie mir zu sagen haben?"
DATA "ich muss noch etwas erledigen. warten sie einige minuten!"
DATA "entschuldigen sie mich fuer einige minuten. ich muss kurz telephonieren."
DATA "starren sie mich nicht so aufdringlich an!"
DATA ""
DATA ""
'
RETURN
`);
