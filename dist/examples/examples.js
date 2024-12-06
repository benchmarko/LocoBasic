/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
994 rem countries - Countries and Cities (Landen)
995 rem J van Noort
996 rem http://www.basicode.de/download/neue.zip
997 rem Modifications: only overview list
998 rem
999 rem
1000 cls
1009 rem
1010 N=178:REM N=AANTAL LANDEN+STEDEN
1020 GOSUB 5020
1030 STOP
1040 '
5000 REM +++LANDEN EN STEDEN+++
5020 PRINT "OVERZICHT LANDEN":PRINT 
5030 RESTORE :FOR I=1 TO N
5040 READ L$,H$,PO$,LI$,HI$
5050 A=38-LEN (L$+H$)
5060 W$=LEFT$("......................................",A)
5070 PRINT L$;W$;H$;" - ";PO$;" km2"
5072 A=48-LEN (LI$+HI$)
5073 W$=LEFT$("......................................",A)
5080 PRINT " 19";LI$;W$;" - 19";HI$
5100 NEXT I
5110 RETURN
5120 '
25000 REM +++DATA REGELS+++
25010 DATA "AFGANISTAN","KABOEL","647.000"
25020 DATA "83  17.222.000","82  1.036.407"
25030 DATA "ALBANIE","TIRANA","28.748"
25040 DATA "83  2.841.000","83  206.100"
25050 DATA "ALGERIJE","ALGIERS","2.381.741"
25060 DATA "83  20.500.000","83  1.721.610"
25070 DATA "ANDORRA","ANDORRA-LA-VELLA","453"
25080 DATA "83  34.000","83  16.200"
25090 DATA "ANGOLA","LUANDA","1.246.700"
25100 DATA "83  8.339.000","82  1.200.000"
25110 DATA "ANTIGUA & BARBUDA","ST.JOHN'S","442"
25120 DATA "83  78.000","83  36.000"
25130 DATA "ARGENTINIE","BUENOS AIRES","2.766.889"
25140 DATA "83  ruim 29 miljoen","80  9.927.404"
25150 DATA "AUSTRALIE","CANBERRA","7.686.848"
25160 DATA "83  15.369.000","83  256.000"
25170 DATA "BAHAMA-EILANDEN","NASSAU","13.939"
25180 DATA "83  222.000","82  135.000"
25190 DATA "BAHREIN","AL-MANAMAH","622"
25200 DATA "83  397.000","81  121.986"
25210 DATA "BANGLADESH","DACCA","144.000"
25220 DATA "83  94.651.000","81  3.458.600"
25230 DATA "BARBADOS","BRIDGETOWN","431"
25240 DATA "83  252.000","80  7517"
25250 DATA "BELGIE","BRUSSEL","30.518"
25260 DATA "83  9.856.000","86  996.182"
25270 DATA "BELIZE","BELMOPAN","22.965"
25280 DATA "83  156.000","80  2.932"
25290 DATA "BENIN","PORTO NOVA","112.622"
25300 DATA "83  3.720.000","80  123.000"
25310 DATA "BHUTAN","THIMBU","47.000"
25320 DATA "83  ruim 1,3 miljoen","82  ca 20.000"
25330 DATA "BOLIVIA","SUCRE","bijna 1,1 miljoen"
25340 DATA "82  6.082.000","82  79.900"
25350 DATA "BONDSREPUBLIEK DUITSLAND (BRD)","BONN"
25360 DATA "248.577","83  61.421.000","83  292.900"
25370 DATA "BOTSWANA","GABARONE","600.372"
25380 DATA "83  1.007.000","83  72.200"
25390 DATA "BOVENVOLTA","OUAGADOUGOU","274.200"
25400 DATA "83 meer dan 6,5 miljoen","80  247.900"
25410 DATA "BRAZILIE","BRASILIA","8.511.965"
25420 DATA "83  129 miljoen","80  411.300"
25430 DATA "BRUNEI","BANDER","5765"
25440 DATA "83  260.000","81  57.558"
25450 DATA "BULGARIJE","SOFIA","110.912"
25460 DATA "83  8.939.000","84  1.102.000"
25470 DATA "BURMA","RANGOON","676.552"
25480 DATA "83  37.553.000","83  2.459.000"
25490 DATA "BURUNDI","BUJUMBURA","27.834"
25500 DATA "83  4.421.000","79  172.200"
25510 DATA "CANADA","OTTAWA","9.976.139"
25520 DATA "83  24.907.000","83  737.600"
25530 DATA "CENTRAFRIKA","BANGUI","622.984"
25540 DATA "83  2.450.000","82  340.000"
25550 DATA "CHILI","SANTIAGO","756.945"
25560 DATA "83  11.682.000","84  4.225.300"
25570 DATA "CHINA","BEIJING (PEKING)","9.560.980"
25580 DATA "83  1.039.677.000","83  5.670.000"
25590 DATA "COLOMBIA","BOGOTA","1,1 miljoen"
25600 DATA "83  ca.27,5 miljoen","83  4.584.000"
25610 DATA "COMOREN","MORINI","2171"
25620 DATA "83  421.000","80  22.000"
25630 DATA "COSTA RICA","SAN-JOSE","50.700"
25640 DATA "83  2.435.000","84  277.800"
25650 DATA "CUBA","HAVANA","114.524"
25660 DATA "83  9.891.000","83  1.951.400"
25670 DATA "CYPRES","NICOSIA","9251"
25680 DATA "83  655.000","82  149.100"
25690 DATA "DENEMARKEN","KOPENHAGEN","43.069"
25700 DATA "83  5.114.000","83  1.372.019"
25710 DATA "DJIBOUTI","DJIBOUTI","22.000"
25720 DATA "83  330.000","82  230.000"
25730 DATA "DOMINICA","ROSEAU","751"
25740 DATA "83  76.000","81  8.346"
25750 DATA "DOMINICAANSE REPUBLIEK","SANTO DOMINGO"
25760 DATA "48.734","83  5.960.000","81  1.313.172"
25770 DATA "DUITSE DEM.REPUBLIEK (DDR)","BERLIJN"
25780 DATA "108.178","83  16.699.000","82  1.186.000"
25790 DATA "ECUADOR","QUITO","283.561"
25800 DATA "83  ca.9,2 miljoen","82  1.110.250"
25810 DATA "EGYPTE","CAIRO","1.001.449"
25820 DATA "83  44,5 miljoen","78  5.291.000"
25830 DATA "EL-SALVADOR","SAN-SALVADOR","21.041"
25840 DATA "83  5.232.000","83  445.100"
25850 DATA "EQUATORIAAL GUINEA","MALABO","28.051"
25860 DATA "83  375.000","73  37.000"
25870 DATA "ETIOPIE","ADDIS ABEBA","1.221.900"
25880 DATA "83  33.680.000","80  1.277.159"
25890 DATA "FAEROER","THORSHAVN","1399"
25900 DATA "83  45.000","83  13.175"
25910 DATA "FIJI","SUVA","18.274"
25920 DATA "83  670.000","82  71.255"
25930 DATA "FILIPIJNEN","MANILA","300.000"
25940 DATA "83  52 miljoen","80  5.150.000"
25950 DATA "FINLAND","HELSINKI","337.032"
25960 DATA "83  4.863.000","84  484.500"
25970 DATA "FRANKRIJK","PARIJS","547.026"
25980 DATA "83  54.652.000","82  2.188.918"
25990 DATA "FRANS GUYANA","CAYENNE","91.000"
26000 DATA "82  73.022","82  38.135"
26010 DATA "GABON","LIBREVILLE","267.667"
26020 DATA "83  1.127.000","82  350.000"
26030 DATA "GAMBIA","BANJUL","11.295"
26040 DATA "83  697.000","83  44.536"
26050 DATA "GHANA","ACCRA","238.537"
26060 DATA "83  12.700.000","80  1.176.000"
26070 DATA "GRENADA","ST.GEORGE'S","344"
26080 DATA "83  114.000","80  7500"
26090 DATA "GRIEKENLAND","ATHENE","131.944"
26100 DATA "83  9.840.000","81  885.737"
26110 DATA "GROENLAND","GODTHAB","2.175.600"
26120 DATA "84  52.347","84  10.468"
26130 DATA "GROOTBRITTANNIE","LONDEN","244.046"
26140 DATA "83  55.610.000","83  6.754.500"
26150 DATA "GUATEMALA","GUATEMALA","108.889"
26160 DATA "83  7.932.000","81  754.243"
26170 DATA "GUINEE","CONAKRY","245.857"
26180 DATA "83  5.177.000","80  763.000"
26190 DATA "GUINEE-BISSAU","BISSAU","36.125"
26200 DATA "83  863.000","79  109.486"
26210 DATA "GUYANA","GEORGETOWN","214.969"
26220 DATA "83  918.000","83  188.000"
26230 DATA "HAITI","PORT-AU-PRINCE","27.750"
26240 DATA "83  5,3 miljoen","83  719.000"
26250 DATA "HONDURAS","TEGUCIGALPA","112.088"
26260 DATA "83  4,092.000","83  532.500"
26270 DATA "HONGARIJE","BUDAPEST","93.030"
26280 DATA "83  10.690.000","85  2.071.484"
26290 DATA "HONGKONG","VICTORIA","1063"
26300 DATA "83  ca.5 miljoen","76  501.680"
26310 DATA "IERLAND","DUBLIN","70.283"
26320 DATA "83  3.508.000","81  915.115"
26330 DATA "INDIA","NEW-DELHI","3.287.590"
26340 DATA "83  ca.732 miljoen","81  301.801"
26350 DATA "INDONESIE","JAKARTA","1.904.569"
26360 DATA "83  ca.159,4 miljoen","83  7.636.000"
26370 DATA "IRAK","BAGDAD","434.924"
26380 DATA "83  14,6 miljoen","80  3.300.000"
26390 DATA "IRAN","TEHERAN","1.648.000"
26400 DATA "83  41.635.000","82  5.734.199"
26410 DATA "ISRAEL","JERUZALEM","20.770"
26420 DATA "83  4.097.000","83  428.668"
26430 DATA "ITALIE","ROME","301.225"
26440 DATA "83  56.559.000","83  2.834.094"
26450 DATA "IVOORKUST","YAMOUSSOUKRO","322.463"
26460 DATA "83  ca.9.1 miljoen","83  80.000"
26470 DATA "JAMAICA","KINGSTON","10.991"
26480 DATA "83  2.258.000","80  662.500"
26490 DATA "JAPAN","TOKIO","372.313"
26500 DATA "83   ruim 119 miljoen","83  11.728.000"
26510 DATA "JOEGOSLAVIE","BELGRADO","255.804"
26520 DATA "83  22.855.000","81  1.470.073"
26530 DATA "JORDANIE","AMMAN","97.740"
26540 DATA "83  3.247.000","83  744.000"
26550 DATA "KAAPVERDIE","PRAIA","4033"
26560 DATA "83  ca.313.000","80  39.794"
26570 DATA "KAMBODJA","PHNUM PENH","181.035"
26580 DATA "83  ca.6.888.000","83  600.000"
26590 DATA "KAMEROEN","YAOUNDE","475.442"
26600 DATA "83  ca.9.165.000","83  488.000"
26610 DATA "KATAR","DOHA","11.000"
26620 DATA "83  281.000","80  180.000"
26630 DATA "KENYA","NAIROBI","582.646"
26640 DATA "83  18.784.000","79  828.000"
26650 DATA "KIRIBATI","BAIRIKI","728"
26660 DATA "83  ca.61.000","80  22.148"
26670 DATA "KOEWEIT","KOEWEIT","17.818"
26680 DATA "83  1.672.000","80  182.300"
26690 DATA "KONGO","BRAZZAVILLE","342.000"
26700 DATA "83  1.651.000","85  480.544"
26710 DATA "LAOS","VIENTIANE","236.800"
26720 DATA "83  ca.4.209.000","81  210.000"
26730 DATA "LESOTHO","MASERU","30.355"
26740 DATA "83  ca.1.444.000","81  75.000"
26750 DATA "LIBANON","BEIROET","10.400"
26760 DATA "83  ca.2.635.000","71  702.000"
26770 DATA "LIBERIA","MONROVIA","111.369"
26780 DATA "81  ca.2.090.000","81  306.000"
26790 DATA "LIBIE","TRIPOLI","1.759.540"
26800 DATA "83  3.342.000","81  859.000"
26810 DATA "LIECHTENSTEIN","VADUZ","160"
26820 DATA "83  26.512","84  4872"
26830 DATA "LUXEMBURG","LUXEMBURG","2586"
26840 DATA "83  365.000","85  76.130"
26850 DATA "MADAGASKAR","ANTANANAROVI","587.041"
26860 DATA "83  ruim 9,4miljoen","82  700.000"
26870 DATA "MALAWI","LILONGWE","94.276"
26880 DATA "83  6.429.000","81  103.000"
26890 DATA "MALDIVEN","MALE","298"
26900 DATA "83  168.000","83  36.593"
26910 DATA "MALEISIE","KUALA LUMPUR","329.749"
26920 DATA "80  13.745.241","80  937.875"
26930 DATA "MALI","BAMAKO","1.240.000"
26940 DATA "83  ca.7.528.000","80  600.000"
26950 DATA "MALTA","VALLETTA","316"
26960 DATA "83  ca.377.000","83  14.040"
26970 DATA "MAROKKO","RABAT","446.550"
26980 DATA "83  22.109.000","81  841.800"
26990 DATA "MAURITANIE","NOUAKCHOTT","1.779.700"
27000 DATA "81  1.681.000","82  150.000"
27010 DATA "MAURITIUS","PORT LOUIS","2045"
27020 DATA "83  993.000","82  147.600"
27030 DATA "MEXICO","MEXICO-STAD","1.972.547"
27040 DATA "83  75.103.000","79  9.191.295"
27050 DATA "MONACO","MONACO","ca.1,81"
27060 DATA "83  27.000","83  27.000"
27070 DATA "MONGOLIE","ULAANBAATAR","1.565.000"
27080 DATA "83  1.803.000","84  470.500"
27090 DATA "MOZAMBIQUE","MAPUTO","801.590"
27100 DATA "83  13.311.000","80  850.000"
27110 DATA "NAMIBIE","WINDHOEK","824.292"
27120 DATA "83  ca.1.465.000","84  120.000"
27130 DATA "NAURU","YAREN","21"
27140 DATA "83  8042","83  8042"
27150 DATA "NEDERLAND","AMSTERDAM","41.473"
27160 DATA "83  14.339.551","85  675.579"
27170 DATA "NEDERLANDSE ANTILLEN","WILLEMSTAD","993"
27180 DATA "83  256.000","77  43.500"
27190 DATA "NEPAL","KATMANDU","140.797"
27200 DATA "83  ruim 15,7 miljoen","81  393.494"
27210 DATA "NICARAGUA","MANAQUA","130.000"
27220 DATA "83  3.058.000","79  608.000"
27230 DATA "NIEUWZEELAND","WELLINGTON","268.676"
27240 DATA "83  3.203.000","85  342.500"
27250 DATA "NIGER","NIAMEY","1.267.000"
27260 DATA "83  ca.5.772.000","83  399.100"
27270 DATA "NIGERIA","ABUJA","923.768"
27280 DATA "83  ruim 100 miljoen","83  ----"
27290 DATA "NOORDJEMEN","SANA","195.000"
27300 DATA "83  ca.6.232.000","81  277.820"
27310 DATA "NOORDKOREA","PYONGYANG","120.538"
27320 DATA "83  19.185.000","81  1.7 miljoen"
27330 DATA "NOORWEGEN","OSLO","324.219"
27340 DATA "83  ca.4.129.000","85  447.351"
27350 DATA "OMAN","MASQAT","212.457-300.000"
27360 DATA "83  1.131.000","78  ca.60.000"
27370 DATA "OOSTENRIJK","WENEN","83.849"
27380 DATA "83  7.549.000","81  1.531.346"
27390 DATA "PAKISTAN","ISLAMABAD","803.943"
27400 DATA "83  90 miljoen","81  201.000"
27410 DATA "PANAMA","PANAMA","77.082"
27420 DATA "83  2.089.000","80  388.600"
27430 DATA "PAPUA-NIEUWGUINEA","PORT MORESBY"
27440 DATA "461.691","83  ca.3.19 miljoen","84  144.300"
27450 DATA "PARAGUAY","ASUNCION","406.752"
27460 DATA "82  3.026.165","82  455.517"
27470 DATA "PERU","LIMA","1.285.216"
27480 DATA "83  ca.18,7 miljoen","85  5.008.400"
27490 DATA "POLEN","WARSCHAU","312.677"
27500 DATA "83  36.571.000","85  1.649.000"
27510 DATA "PORTUGAL","LISSABON","92.082"
27520 DATA "83  ca.10.099.000","81  807.167"
27530 DATA "PUERTO RICO","SAN-JUAN","8897"
27540 DATA "83  3.350.000","80  434.849"
27550 DATA "ROEMENIE","BOEKAREST","237.500"
27560 DATA "83  22.533.000","84  2.197.700"
27570 DATA "RWANDA","KIGALI","26.338"
27580 DATA "83  ca.5,7 miljoen","83  181.600"
27590 DATA "SAINT KITTS-NEVIS","BASSETERRE","261"
27600 DATA "83  53.000","80  14.725"
27610 DATA "SAN-MARINO","SAN-MARINO","61"
27620 DATA "83  ca.22.000","84  4516"
27630 DATA "SAO-TOME & PRINCIPE","SAO-TOME","964"
27640 DATA "83  103.000","78  25.000"
27650 DATA "SAUDIARABIE","RIYADH","ca.2,15 miljoen "
27660 DATA "83  10.421.000","80  1.000.000"
27670 DATA "SENEGAL","DAKAR","196.192"
27680 DATA "83  ca.6.316.000","79  979.000"
27690 DATA "SEYCHELLEN","VICTORIA","280"
27700 DATA "83  ca.65.000","77  23.334"
27710 DATA "SIERRA LEONE","FREETOWN","71.740"
27720 DATA "83  ca.3,5 miljoen","85  448.200"
27730 DATA "SINGAPORE","SINGAPORE","618"
27740 DATA "83  ca.2.502.000","74  1.327.500"
27750 DATA "SINT LUCIA","CASTRIES","616"
27760 DATA "83  ca.125.000","84  50.700"
27770 DATA "SINT VINCENT","KINGSTOWN","389"
27780 DATA "83  ca.102.000","82  33.694"
27790 DATA "SOLOMONEILANDEN","HONIARA","28.446"
27800 DATA "83  254.000","84  23.500"
27810 DATA "SOMALIA","MOGADISHO","637.657"
27820 DATA "83  ruim 5,2 miljoen","81  500.000"
27830 DATA "SOVJETUNIE","MOSKOU","22.402.200"
27840 DATA "83  ca.272.500.000","85  8.646.000"
27850 DATA "SPANJE","MADRID","504.782"
27860 DATA "83  38.228.000","81  3.188.297"
27870 DATA "SRI-LANKA","COLOMBO","65.610"
27880 DATA "83  15.416.000","83  623.000"
27890 DATA "SUDAN","KHARTOEM","2.505.813"
27900 DATA "83  ca.20.564.000","83  1.511.000"
27910 DATA "SURINAME","PARAMARIBO","163.265"
27920 DATA "83  ca.351.000","80  67.718"
27930 DATA "SWAZILAND","MBABANE","17.363"
27940 DATA "83  ca.605.000","82  38.636"
27950 DATA "SYRIE","DAMASKUS","185.180"
27960 DATA "83  ca.9,6 miljoen","81  1.112.200"
27970 DATA "TAIWAN","T'AIPEI","36.002"
27980 DATA "83  18.733.000","84  2.288.374"
27990 DATA "TANZANIA","DAR-ES-SALAAM","945.087"
28000 DATA "83  ca.20.378.000","78  757.000"
28010 DATA "THAILAND","BANGKOK","514,000"
28020 DATA "83  ca.49,5 miljoen","84  5.018.330"
28030 DATA "TOGO","LOME","56.785"
28040 DATA "83  ca.2,7 miljoen","80  240.000"
28050 DATA "TONGA","NUKUALOFA","699"
28060 DATA "82  68.746","84  27.740"
28070 DATA "TRINIDAD & TOBAGO","PORT OF SPAIN","5128"
28080 DATA "80  1.059.825","80  65.906"
28090 DATA "TSJAAD","NDJAMENA","1.284.000"
28100 DATA "83  ca.4,8 miljoen","79  303.000"
28110 DATA "TSJECHOSLOWAKIJE","PRAAG","127.896"
28120 DATA "83  15.400.000","84  1.186.250"
28130 DATA "TUNESIE","TUNIS","163.610"
28140 DATA "83  ca.6,89 miljoen","84  596.654"
28150 DATA "TURKIJE","ANKARA","780.576"
28160 DATA "83  47,3 miljoen","83  1.981.300"
28170 DATA "TUVALU","FUNAFUTI","26"
28180 DATA "79  7349","79  2191"
28190 DATA "UGANDA","KAMPALA","236.036"
28200 DATA "83  ca.14.625.000","82  460.000"
28210 DATA "URUGUAY","MONTEVIDEO","176.215"
28220 DATA "83  2,9 miljoen","83  1.362.002"
28230 DATA "VANUATU","VILA","14.763"
28240 DATA "83  ca.124.000","79  14.598"
28250 DATA "VATICAANSTAD","+++++","0,44"
28260 DATA "83  ca.1000","83  ----"
28270 DATA "VENEZUELA","CARACAS","912.050"
28280 DATA "83  17.257.000","84  4.000.000"
28290 DATA "VERENIGDE ARAB. EMIRATEN","ABU DHABY"
28300 DATA "83.600","83  ruim 1,2 miljoen","80  265.702"
28310 DATA "VERENIGDE STATEN","WASHINGTON (DC)"
28320 DATA "9.369.885","83  233.700.000","84  622.823"
28330 DATA "VIETNAM","HA-NOI","329.566"
28340 DATA "83  ca.57.181.000","84  2.674.400"
28350 DATA "WESTSAHARA","LAAYOUNE","266.000"
28360 DATA "81  ca.1000.000","70  28.500"
28370 DATA "WESTSAMOA","APIA","2842"
28380 DATA "83  ca.161.000","81  33.784"
28390 DATA "IJSLAND","REYKJAVIK","103.000"
28400 DATA "83  237.000","84  88.745"
28410 DATA "ZAIRE","KINSHASA","2.345.409"
28420 DATA "83  ruim 31 miljoen","80  3.700.000"
28430 DATA "ZAMBIA","LUSAKA","752.614"
28440 DATA "83  ca. 6.240.000","80  538.469"
28450 DATA "ZIMBABWE","HARARE","390.580"
28460 DATA "83  ca.7,7 miljoen","82  656.000"
28470 DATA "ZUIDAFRIKA","PRETORIA","1.221.037"
28480 DATA "83  ca.30,8 miljoen","80  453.335"
28490 DATA "ZUIDJEMEN","ADEN","332.968"
28500 DATA "83  ca.2.158.000","80  343.000"
28510 DATA "ZUIDKOREA","SEOEL","98.484"
28520 DATA "83  39.951.000","83  9.204.000"
28530 DATA "ZWEDEN","STOCKHOLM","449.964"
28540 DATA "83  8.329.000","85  653.455"
28550 DATA "ZWITSERLAND","BERN","41.288"
28560 DATA "83  6.505.000","85  300.505"
28570 DATA "","","","",""
30000 REM **************************
30010 REM *                        *
30020 REM * 178 LANDEN             *
30030 REM *          MET           *
30040 REM *            HOOFDSTEDEN *
30050 REM *                        *
30060 REM **************************
32000 REM
32010 REM ******** TROS ************
32020 REM *                        *
32030 REM *    J van NOORT         *
32040 REM *                        *
32050 REM      PEPPELSTRAAT 16.
32060 REM T                        T
32070 REM R    3203 VK             R
32080 REM O                        O
32090 REM S    SPIJKENISSE         S
32100 REM
32110 REM *    DECEMBER 1989       *
32120 REM *                        *
32130 REM *    MSX-2  BASICODE-3   *
32140 REM *                        *
32150 REM ******** TROS ************
32160 REM
32170 REM TROS-RADIO dd 900411
`);

cpcBasic.addItem("", `
REM cpcmhz - CPC MHz: Time measurement
PRINT "Measurement started."
DIM r(5)
ms=100/10:mxcpc=90/10
'
FOR i=0 TO 4
c=0:t1=INT(TIME*300/1000)
t=t1: WHILE t=t1:t=INT(TIME*300/1000):c=c+1:WEND
c=0:t1=t+ms
WHILE t<t1:t=INT(TIME*300/1000):c=c+1:WEND
r(i)=c
NEXT
PRINT "In";ms;"ms we can count to:";
mx=0
FOR i=0 TO 4
PRINT STR$(r(i));
mx=MAX(mx,r(i))
NEXT
mhz=mx/mxcpc*4
PRINT "":PRINT "=> max:";STR$(mx);", CPC";mhz;"MHz"
`);

cpcBasic.addItem("", `
REM euler - Compute e with 1000 digits
CLS
PRINT"Compute e with 1000 digits"
DIM a(202)
b=100000:a(0)=1
FOR n=450 TO 1 STEP -1
  if a(0)>0 then FOR i=0 TO 201: q=INT(a(i)/n):r=a(i)-q*n: a(i)=q:a(i+1)=a(i+1)+b*r: NEXT
  a(0)=a(0)+1
NEXT
'Round 
a(201)=a(201)+INT(a(202)/b+0.5)
FOR i=200 TO 1 STEP -1
  u=INT(a(i)/b):a(i)=a(i)-b*u
  a(i-1)=a(i-1)+u
NEXT
'rem
PRINT"e=";a(0);"."
FOR i=1 TO 200
  a$=STR$(a(i)):a$=RIGHT$(a$,LEN(a$)-1)
  PRINT RIGHT$("0000"+a$,5);" ";
NEXT
`);

cpcBasic.addItem("", `
10 rem inputest - Input Test
20 cls
30 ?"Name"
40 input n$
50 ? "Name is: ";n$
60 stop
`);

cpcBasic.addItem("", `
REM lifegame - Game of Life
ze=10:sp=10:DIM al(ze,sp+1):DIM ne(ze,sp+1)
PRINT"L I F E G A M E"
FOR w=1 TO 18
  x=INT(7*RND(1)+1):y=INT(7*RND(1)+1):IF al(x,y)<>1 THEN al(x,y)=1
NEXT w
al(5,4)=1:al(5,5)=1:al(5,6)=1
FOR i=1 TO ze-1:FOR j=1 TO sp
  IF al(i,j)=0 THEN PRINT " "; ELSE PRINT "*";
NEXT j: PRINT "": NEXT i
FOR i=1 TO ze-1:FOR j=1 TO sp:an=0:ne(i,j)=0
  an=al(i-1,j-1)+al(i-1,j)+al(i-1,j+1)+al(i,j-1)+al(i,j+1)+al(i+1,j-1)+al(i+1,j)+al(i+1,j+1)
  IF al(i,j)<>0 THEN IF an=2 THEN ne(i,j)=1
  IF an=3 THEN ne(i,j)=1
NEXT j:NEXT i
FOR i=1 TO ze-1:FOR j=1 TO sp:al(i,j)=ne(i,j):NEXT j:NEXT i
`);

cpcBasic.addItem("", `
100 REM ninedig - Das Raetsel
110 '21.5.1988 Kopf um Kopf
120 'ab*c=de  de+fg=hi   [dabei sind a-i verschiedene Ziffern 1-9!!]
130 'MODE 1
135 PRINT"Please wait ...  ( ca. 1 min 34 sec )"
140 'CLEAR:DEFINT a-y
150 '
155 z=TIME
160 FOR a=1 TO 9:FOR b=1 TO 9:FOR c=1 TO 9:FOR f=1 TO 9:FOR g=1 TO 9
165 cnd = -1
170 de=(a*10+b)*c
175 cnd = cnd AND NOT(de>99)
180 hi=de+(f*10+g)
185 cnd = cnd AND NOT(hi>99)
190 d=INT(de/10):e=de MOD 10:h=INT(hi/10):i=hi MOD 10
200 cnd = cnd AND NOT(a=b OR a=c OR a=d OR a=e OR a=f OR a=g OR a=h OR a=i)
210 cnd = cnd AND NOT(b=c OR b=d OR b=e OR b=f OR b=g OR b=h OR b=i)
220 cnd = cnd AND NOT(c=d OR c=e OR c=f OR c=g OR c=h OR c=i)
230 cnd = cnd AND NOT(d=e OR d=f OR d=g OR d=h OR d=i)
240 cnd = cnd AND NOT(e=f OR e=g OR e=h OR e=i)
250 cnd = cnd AND NOT(f=g OR f=h OR f=i)
260 cnd = cnd AND NOT(g=h OR g=i)
270 cnd = cnd AND NOT(h=i)
280 cnd = cnd AND NOT(i=0)
285 if cnd<> 0 then GOSUB 350: STOP
320 NEXT g,f,c,b,a
330 ?"No solution found!"
340 STOP
345 '
350 z=TIME-z
360 PRINT"The solution:":PRINT
370 PRINT a*10+b;"*";c;"=";de;" / ";de;"+";f*10+g;"=";hi
380 PRINT z,z/300
390 RETURN
400 '
`);

cpcBasic.addItem("", `
100 REM ninedig2 - Das Raetsel
110 '21.5.1988 Kopf um Kopf
120 'ab*c=de  de+fg=hi   [dabei sind a-i verschiedene Ziffern 1-9!!]
135 PRINT"Please wait ...  ( ca. 1 min 34 sec )"
150 '
155 z=TIME
160 FOR a=1 TO 9
161 FOR b=1 TO 9
162 FOR c=1 TO 9
163 FOR f=1 TO 9
164 FOR g=1 TO 9
165 cnd = -1
170 de=(a*10+b)*c
175 cnd = cnd AND NOT(de>99)
180 hi=de+(f*10+g)
185 cnd = cnd AND NOT(hi>99)
190 d=INT(de/10):e=de MOD 10:h=INT(hi/10):i=hi MOD 10
200 cnd = cnd AND NOT(a=b OR a=c OR a=d OR a=e OR a=f OR a=g OR a=h OR a=i)
210 cnd = cnd AND NOT(b=c OR b=d OR b=e OR b=f OR b=g OR b=h OR b=i)
220 cnd = cnd AND NOT(c=d OR c=e OR c=f OR c=g OR c=h OR c=i)
230 cnd = cnd AND NOT(d=e OR d=f OR d=g OR d=h OR d=i)
240 cnd = cnd AND NOT(e=f OR e=g OR e=h OR e=i)
250 cnd = cnd AND NOT(f=g OR f=h OR f=i)
260 cnd = cnd AND NOT(g=h OR g=i)
270 cnd = cnd AND NOT(h=i)
280 cnd = cnd AND NOT(i=0)
285 if cnd<> 0 then GOSUB 350: STOP
320 NEXT g
321 NEXT f
322 NEXT c
323 NEXT b
324 NEXT a
330 ?"No solution found!"
340 STOP
345 '
350 z=TIME-z
360 PRINT"The solution:":PRINT
370 PRINT a*10+b;"*";c;"=";de;" / ";de;"+";f*10+g;"=";hi
380 PRINT z,z/300
390 RETURN
400 '
`);

cpcBasic.addItem("", `
REM sieve - Sieve
n=1000000
DIM sieve1(n + 1)
nHalf = INT(n / 2)
REM initialize sieve
FOR i = 0 TO nHalf: sieve1(i) = 0: NEXT i
REM compute primes
i = 0
m = 3
x = 1
WHILE m * m <= n
  IF sieve1(i) = 0 THEN x = x + 1
  j = INT((m * m - 3) / 2)
  WHILE j < nHalf
    sieve1(j) = 1
    j = j + m
  WEND
  i = i + 1
  m = m + 2
WEND
REM count remaining primes
WHILE m <= n
  IF sieve1(i) = 0 THEN x = x + 1
  i = i + 1
  m = m + 2
WEND
PRINT "Number of primes below ";n;": ";x
`);

cpcBasic.addItem("", `
REM sievebe - Sieve Benchmark
CLS
loops=10
n=10000
DIM sieve1(INT(n / 2) + 1)
t=TIME
FOR l = 1 TO loops
  GOSUB 1000
NEXT
t=TIME-t
PRINT "Number of primes below ";n;": ";x
PRINT "Loops:";loops;"; Time:";t
STOP
'
1000 'compute number of primes below n
nHalf = INT(n / 2)
REM initialize sieve
FOR i = 0 TO nHalf: sieve1(i) = 0: NEXT i
REM compute primes
i = 0
m = 3
x = 1
WHILE m * m <= n
  IF sieve1(i) = 0 THEN x = x + 1
  j = INT((m * m - 3) / 2)
  WHILE j < nHalf
    sieve1(j) = 1
    j = j + m
  WEND
  i = i + 1
  m = m + 2
WEND
REM count remaining primes
WHILE m <= n
  IF sieve1(i) = 0 THEN x = x + 1
  i = i + 1
  m = m + 2
WEND
RETURN
'
`);

cpcBasic.addItem("", `
REM testsub - Test Subroutines
?"start"
'
100 ?"sub100"
return
'
200 ?"sub200"
  ?"inside sub200"
  gosub 100
return
'
gosub 200
?"in between"
'
300 ?"sub300"
  ?"inside sub300"
  'gosub 400
return
'
gosub 300
a=1
on a gosub 200, 300
?"at end"
`);

cpcBasic.addItem("", `
REM testpage - Test Page
cls
?"testpage"
' numbers
a=1
a=1.2
a=-1.2
a=+7.2
a=&0
a=&A7
a=-&A7
a=&7FFF
a=&8000
a=&FFff
a=&E123
a=&X0
a=&X10100111
a=-&x111111111111111
a=255
a=-255
a=256
a=-256
a=32767
a=-32767
a=32768
a=-32768
a=65536
''a=1.2e+9
''a=&x2
' strings
a$="a12"
''a$="\\"
2 newline=7
' variables
''a!=1.4
''a%=1.4
a$="1.4"
case=1
CASE=1
CaSe=cAsE
''insert.line=2
''in.ser.t.lin.e=2
''a!(2)=1.4
''a%(2)=1.4
dim a$(2): a$(2)="1.4"
''a$[2]="1.4"
dim a(9), b(1,2): a(9)=b(1,2)
''a[9]=b[1,2]
dim a(10,10,10), b(10,9): a(10,10,10)=b(10,9)
dim a(1), b(2,2,1): a(round(1.4))=b(round(1.5),round(2.4),1)
x=1:a(x+1)=b(x,x*2,round(x+1.5))
a(x+1)=b(int(x),x*2,x-1+&d)
''1 a$=a%
''1 a$=a!
''1 abc=def
' expressions
a=1+2+3
a=3-2-1
a=&A7+&X10100111-(123-27)
a=(3+2)*(3-7)
a=-(10-7)-(-6-2)
a=20/2.5
a=20\\3
a=3^2
a=&X1001 AND &X1110
a=&X1001 OR &X110
a=&X1001 XOR &X1010
a=NOT &X1001
''a=+++++++++---9
a=(1=0)
a=(1>0)*(0<1)
a=(b>=c)*(d<=e)
a=1=1=-1
a=1>=1>1
' Line numbers
0 c=1
65535 c=1
65536 c=1
2 c=1
1 c=1
' special
' abs, after gosub, and, asc, atn, auto
a=abs(2.3)
''10 after 2 gosub 10
''10 after 3,1 gosub 10
''1 after gosub 1
''1 after 1,2,3 gosub 1
a=b and c
a=asc("A")
a=asc(b$) and c
a=atn(2.3)
''auto
''auto 100
' bin$, border
a$=bin$(3)
a$=bin$(3,8)
a$=bin$(&x1001)
''border 5
''border 5,a
' call, cat, chain, chain merge, chr$, cint, clg, closein, closeout, cls, cont, copychr$, cos, creal, cursor
''call&a7bc
''call 4711,1,2,3,4
''cat
''chain"f1"
''chain"f2" , 10
''chain"f3" , 10+3
''chain "f4" , 10+3, delete 100-200
''chain "f5" , , delete 100-200
''chain merge "f1"
''chain merge "f2" , 10
''chain merge "f3" , 10+3
''chain merge "f4" , 10+3, delete 100-200
''chain merge "f5" , , delete 100-200
a$=chr$(65)
a=cint(2.3)
''clear
''clear input
''clg
''clg 15-1
''closein
''closeout
''cls 'tested on top
''cls #5
''cls #a+7-2*b
''cont
''a$=copychr$(#0)
''a$=copychr$(#a+1)
a=cos(2.3)
''a=creal(2.3+a)
''cursor
''cursor 0
''cursor 1
''cursor 1,1
''cursor ,1
''cursor #2
''cursor #2,1
''cursor #2,1,1
''cursor #2,,1
' data, dec$, def fn, defint, defreal, defstr, deg, delete, derr, di, dim, draw, drawr
''data
''data ,
''data \
data 1,2,3
data "item1"," item2","item3 "
''data item1,item2,item3
data &a3,4 '',abc,
data " " '',!"#$%&'()*+,","
''data "string in data with ... newline"
''a$=dec$(3,"##.##")
''def fnclk=10
''def fnclk(a)=a*10
''def fnclk(a,b)=a*10+b
''def fnclk$(a$,b$)=a$+b$
''def fn clk=10
''def fn clk(a)=a*10
''def fn clk(a,b)=a*10+b
''def fn clk$(a$,b$)=a$+b$
''def fncls=1
''def fncls1(x+1)=1
''def fx=1
''def fx y=1
''defint a
''defint a-t
''defint a-T
''defint a,b,c
''defint a,b-c,v,x-y
''defint a:b=a+c
''defint a:a=a+1
''defint a:a!=a!+a%:a$="7"
''defint a:ab=ab+de[7]
''1 defint z-a
''defreal a
''defreal a-t
''defreal a-T
''defreal a,b,c
''defreal a,b-c,v,x-y
''defreal a:b=a+c
''defreal a:a=a+1
''defreal a:a!=a!+a%:a$="7"
''defreal a:ab=ab+de[7]
''1 defreal z-a
''defstr a
''defstr a-t
''defstr a-T
''defstr a,b,c
''defstr a,b-c,v,x-y
''defstr a:b=a+c
''defstr a:a=a+1
''defstr a:a!=a!+a%:a$="7"
''defstr a:ab=ab+de[7]
''1 defstr z-a
''defstr f:f(x)="w"
''deg
''delete
''delete -
''delete ,
''delete -,
''delete 10
''delete 1-
''delete -1
''delete 1-2
''1 delete 2-1
''1 delete 1+2
''1 delete a
''a=derr
''di
dim a(1)
''dim a!(1)
''dim a%(1)
dim a$(1)
dim b(2,13)
x=1: dim a(2,13+7),b$(3),c(2*x,7)
''dim a[2,13)
''draw 10,20
''draw -10,-20,7
''draw 10,20,7,3
''draw 10,20,,3
''draw x,y,m,g1
''drawr 10,20
''drawr -10,-20,7
''drawr 10,20,7,3
''drawr 10,20,,3
''drawr x,y,m,g1
' edit, ei, else, end, ent, env, eof, erase, erl, err, error, every gosub, exp
''edit 20
''ei
''else
''else 10
''else a=7
' see below: end
''ent 1
''ent 1,2,a,4
''ent num,steps,dist,ti,steps2,dist2,ti2
''ent num,=period,ti,=period2,ti2
''env 1
''env 1,2,a,4
''env num,steps,dist,ti,steps2,dist2,ti2
''env num,=reg,period,=reg2,period2
''a=eof
dim e(1): erase e
dim e$(1): erase e$
dim e(1),e$(1): erase e,e$
''1 erase 5
''a=erl
''a=err
''error 7
''error 5+a
''10 every 50 gosub 10
''10 every 25.2,1 gosub 10
''10 every 10+a,b gosub 10
a=exp(2.3)
' fill, fix, fn, for, frame, fre
''fill 7
a=fix(2.3)
'' x=fnclk 'TODO?
'' x=fnclk(a) 'TODO?
'' x=fnclk(a,b) 'TODO?
'' x$=fnclk$(a$,b$) 'TODO?
''x=fn clk
''x=fn clk(a)
''x=fn clk(a,b)
''x$=fn clk$(a$,b$)
for a=1 to 10: next
''for a%=1.5 to 9.5: next
''for a!=1.5 to 9.5: next
for a=1 to 10 step 3: next
b=1: for a=5+b to -4 step -2.3: next
b=1:c=5:d=2: for a=b to c step d: next
b=1:c=3: for a=b to c: next
for a=1 to 1 step 0+1: next
b=1:c=3:s=1: for a=b to c step s: next
for a=1 to 2 step 0+1: next
for a=-1 to -2 step 0-1: next
for a=&a000 TO &a00b step &x101: next
for a=2 to 1 step -&1: next
for a=2 to 1 step -&x1: next
''1 for a$=1 to 2: next
for abc=1 to 10 step 3:next abc
''for a=b to c step s:a=0:next
''frame
''a=fre(0)
''a=fre("")
''a=fre(b-2)
''a=fre(a$)
' gosub, goto, graphics paper, graphics pen
5 gosub 10
''1 gosub a
''10 goto 10
''1 goto a
''graphics paper 5
''graphics paper 2.3*a
''graphics pen 5
''graphics pen 5,1
''graphics pen ,0
''graphics pen 2.3*a,1+b
' hex$, himem
a$=hex$(16)
a$=hex$(16,4)
a$=hex$(a,b)
''a=himem
' if, ink, inkey, inkey$, inp, input, instr, int
if a=1 then a=2
if a=1 then a=2 else a=1
''if a=1 then
''if a=1 then else
''if a=1 then a=2 else
''if a=1 then else a=1
''if a=1 then if b=1 then else else a=1
''10 if a=1 then goto 10
''10 if a=1 then 10
''10 if a=1 goto 10
''10 if a=1 then a=a+1:goto 10
10 if a=1 then gosub 10
''10 if a=1 then 10:a=never1
''10 if a=1 then 10 else 20 '20 rem
''10 if a=1 then 10 else goto 20 '20 rem
''10 if a=b+5*c then a=a+1: goto 10 else a=a-1:goto 20
10 if a=b+5*c then a=a+1: gosub 10 else a=a-1:gosub 20
20 rem
10 if a<>3 then gosub 10
10 if a$<>"3" then gosub 10
''ink 2,19
''ink 2,19,22
''ink a*2,b-1,c
''a=inkey(0)
''a$=inkey$
''a=inp(&ff77)
''input a$
''input a$,b
''input ;a$,b
''input "para",a$,b
''input "para";a$,b
''input ;"para noCRLF";a$,b
''input#2,;"para noCRLF";a$,b
''input#stream,;"string";a$,b
''a=instr("key","ey")
''a=instr(s$,find$)
''a=instr(start,s$,find$)
a=int(-2.3)
a=int(b+2.3)
' joy
''a=joy(0)
''a=joy(b+1)
' key, key def
''key 11,"border 13:paper 0"
''key a,b$
''key def 68,1
''key def 68,1,159
''key def 68,1,159,160
''key def 68,1,159,160,161
''key def num,fire,normal,shift,ctrl
' left$, len, let, line input, list, load, locate, log, log10, lower$
a$=left$(b$,n)
a=len(a$)
''let a=a+1
''line input a$
''line input ;a$
''line input "para",a$
''line input "para";a$
''line input ;"para noCRLF";a$
''line input#2,;"para noCRLF";a$
''line input#stream,;"string";a$
''list
''list -
''list ,
''list -,
''list 10
''list 1-
''list -1
''list 1-2
''list #3
''list ,#3
''list 10,#3
''list 1-,#3
''list -1,#3
''list 1-2,#3
''list a
''load "file"
''load "file.scr",&c000
''load f$,adr
''locate 10,20
''locate#2,10,20
''locate#stream,x,y
a=log(10)
a=log10(10)
b$="AbC": a$=lower$(b$)
a$=lower$("String")
' mask, max, memory, merge, mid$, min, mod, mode, move, mover
''mask &x10101011
''mask 2^(8-x),1
''mask a,b
''mask ,b
a=max(1)
a=max(1,5)
a=max(b,c,d)
''a$=max("abc")
''1 a$=max("abc","d")
''memory &3fff
''memory adr
''merge "file"
''merge f$
a$=mid$("string",3)
a$=mid$("string",3,2)
a$=mid$(b$,p)
a$=mid$(b$,p,lg)
''mid$(a$,2)=b$
''mid$(a$,2,2)=b$
''mid$(a$,b%,c!)="string"
a=min(1)
a=min(1,5)
a=min(b,c,d)
''a$=min("abc")
''1 a$=min("abc","d")
a=10 mod 3
a=b mod -c
''mode 0
''mode n+1
''move 10,20
''move -10,-20,7
''move 10,20,7,3
''move 10,20,,3
''move x,y,m,g1
''mover 10,20
''mover -10,-20,7
''mover 10,20,7,3
''mover 10,20,,3
''mover x,y,m,g1
' new, next, not
''new
for a=1 to 2: next
for i=1 to 2: next i
for j=1 to 2:for i=3 to 4: next i,j
a=not 2
a=not -b
' on break ..., on error goto, on gosub, on goto, on sq gosub, openin, openout, or, origin, out
''on break cont
''10 on break gosub 10
''on break stop
''10 on error goto 0
''10 on error goto 10
''1 on error goto 0:a=asc(0)
''1 on error goto 2:a=asc(0) '2 rem
''1 on error goto 0:?chr$("A")
''1 on error goto 2:?chr$("A") '2 rem
''1 on error goto 0:a$=dec$(b$,"\\    \\")
''1 on error goto 2:a$=dec$(b$,"\\    \\") '2 rem
''1 on error goto 0:mask ,
''1 on error goto 2:mask , '2 rem
10 on 1 gosub 10
10 on x gosub 10,20 '20 rem
10 on x+1 gosub 10,20,20 '20 rem
''10 on 1 goto 10
''10 on x goto 10,20 '20 rem
''10 on x+1 goto 10,20,20 '20 rem
''10 on sq(1) gosub 10
''10 on sq(channel) gosub 10
''openin "file"
''openin f$
''openout "file"
''openout f$
a=1 or &1a0
a=b or c
''origin 10,20
''origin 10,20,5,200,50,15
''origin x,y,left,right,top,bottom
''ut &bc12,&12
''out adr,by
' paper, peek, pen, pi, plot, plotr, poke, pos, print
''paper 2
''paper#stream,p
''a=peek(&c000)
''a=peek(adr+5)
''pen 2
''pen 2,1
''pen#3,2,1
''pen#stream,p,trans
a=pi
''plot 10,20
''plot -10,-20,7
''plot 10,20,7,3
''plot 10,20,,3
''plot x,y,m,g1
''plotr 10,20
''plotr -10,-20,7
''plotr 10,20,7,3
''plotr 10,20,,3
''plotr x,y,m,g1
''poke &c000,23
''poke adr,by
''a=pos(#0)
''a=pos(#stream)
print
''print ,
print ;
''print #2
''print #2,
print "string"
print 999999999;
''print 1e9;
''print 2.5e10;
print 1.234567846;
print a$
print a$,b
''print#2,a$,b
''print using"####";ri;
''print using "##.##";-1.2
''print using"### ########";a,b
''print using "\\   \\";"n1";"n2";" xx3";
''print using "!";"a1";"a2";
''print using "&";"a1";"a2";
''print#9,tab(t);t$;i;"h1"
?
''?#2,ti-t0!;spc(5);
' rad, randomize, read, release, rem, remain, renum, restore, resume, return, right$, rnd, round, run
''rad
''randomize
''randomize 123.456
read a$
read b
read a$,b,c$
''release 1
''release n+1
rem
rem comment until EOL
rem \
'
'comment until EOL
'\
a=1 'comment
''a=remain(0)
''a=remain(ti)
''renum
''renum 100
''renum 100,50
''renum 100,50,2
restore
10 restore 10
''resume
''10 resume 10
''resume next
return
a$=right$(b$,n)
''a=rnd
a=rnd(0)
a=rnd(-1*b)
a=round(2.335)
a=round(2.335,2)
''run
''10 run 10
''run "file"
''run f$
' save
''save "file"
''save "file",p
''save "file",a
''save "file.scr",b,&c000,&4000
''save "file.bin",b,&8000,&100,&8010
''save f$,b,adr,lg,entry
a=sgn(5)
a=sgn(0)
a=sgn(-5)
a=sin(2.3)
''sound 1,100
''sound 1,100,400
''sound 1,100,400,15
''sound 1,100,400,15,1
''sound 1,100,400,15,1,1
''sound 1,100,400,15,1,1,4
''sound ch,period,duration,,,,noise
''sound ch,period,duration,vol,env1,ent1,noise
a$=space$(9)
a$=space$(9+b)
''speed ink 10,5
''speed ink a,b
''speed key 10,5
''speed key a,b
''speed write 1
''speed write a-1
''1 speed mode 2
''a=sq(1)
''a=sq(channel)
a=sqr(9)
'' below: stop
a$=str$(123)
a$=str$(a+b)
a$=string$(40,"*")
''a$=string$(40,42)
a$=string$(lg,char$)
''symbol 255,1,2,3,4,5,6,7,&x10110011
''symbol 255,1
''symbol after 255
' tag, tagoff, tan, test, testr, time, troff, tron
''tag
''tag#2
''tag#stream
''tagoff
''tagoff#2
''tagoff#stream
a=tan(45)
''a=test(10,20)
''a=test(x,y)
''a=testr(10,-20)
''a=testr(xm,ym)
t=time
''troff
''tron
' unt, upper$
''a=unt(&ff66)
a$=upper$("String")
a$=upper$(b$)
' val, vpos
a=val("-2.3")
a=val(b$)
''a=vpos(#0)
''a=vpos(#stream)
' wait, wend, while, width, window, window swap, write
''wait &ff34,20
''wait &ff34,20,25
while a=10: wend
while a>0: wend
''width 40
''window 10,30,5,20
''window#1,10,30,5,20
''window#stream,left,right,top,bottom
''window swap 1
''window swap 1,0
''1 window swap #1
''write
''write #2
''write #2,
''write "string"
''write 999999999
''write 1e9
''write 2.5e10
''write 1.234567846
''write a$
''write a$,b
''write#2,a$,b
''write#2,a$;b
''write ,
''write ;
' xor, xpos
a=&x1001 xor &x0110
a=b xor c
''a=xpos
' ypos
''a=ypos
' zone
''zone 13+n
' rsx
''|a
''|b
''|basic
''|cpm
''a$="*.drw":|dir,@a$
''|disc
''|disc.in
''|disc.out
''|drive,0
''1 |drive,
''1 |drive,#1
''|era,"file.bas"
''|ren,"file1.bas","file2.bas"
''|tape
''|tape.in
''|tape.out
''|user,1
''|mode,3
''|renum,1,2,3,4
''|
' keepSpaces
' PRG
'
stop
end
10 return
20 return
`);
