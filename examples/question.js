/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", `
REM question - Funny Questions and Answers
MODE 2
GOSUB 2000
PRINT "Funny Questions and Answers"
PRINT
PRINT "What do you do when..."
PRINT
DIM a(n)
GOSUB 1000 ' Shuffle the indices
'
FOR i = 1 TO n
  j = a(i)
  PRINT i;
  PRINT question$(i); "? -- ";
  PRINT answer$(j); "."
  PRINT
NEXT i
END
'
' Shuffle subroutine
1000 FOR i = 1 TO n
  j = INT(RND * i + 1) :'1 ≤ j ≤ i
  a(i) = i: 'a[i] ← source[i]: a[i] ← a[j]: a[j] ← source[i]
  a(i) = a(j)
  a(j) = i 
NEXT i
RETURN
'
' Read questions and answers
2000 READ n
DIM question$(n), answer$(n)
FOR i = 1 TO n
  READ question$(i), answer$(i)
NEXT i
READ endMarker$: IF endMarker$<>"end" THEN PRINT "Error in data: End not found": STOP
RETURN
'
DATA 75
DATA "You find a corpse", "Dig a grave"
DATA "You have a million in debt", "Hang myself"
DATA "A nuclear war breaks out", "Emigrate to Australia"
DATA "You're faced with doubt", "Decide on the right thing"
DATA "The police are after you", "Go underground"
DATA "You oversleep", "Faint"
DATA "You sink into a bog", "Scream as loud as I can"
DATA "You get visitors", "Flee"
DATA "Your bed collapses", "Keep sleeping"
DATA "You feel sad", "Start crying"
DATA "A horse kicks you", "Start singing"
DATA "You hear a joke", "Laugh myself to pieces"
DATA "You don't have time", "Take my time"
DATA "It rains", "Get my umbrella"
DATA "You're thirsty", "Get drunk"
DATA "You're imprisoned", "Free myself from all evil"
DATA "Your God abandons you", "Become a pastor"
DATA "The devil wants to take you", "Endure it all"
DATA "You miss the bus", "Ride my bike"
'
DATA "You get lost in a forest", "Climb the tallest tree"
DATA "Your computer crashes", "Meditate for wisdom"
DATA "You meet an alien", "Offer it a coffee"
DATA "You're attacked by zombies", "Teach them to dance"
DATA "You win the lottery", "Start a llama farm"
DATA "Your phone battery dies", "Write letters by hand"
DATA "Your car breaks down", "Push it to the nearest bakery"
DATA "You spill coffee on your shirt", "Call it a new trend"
DATA "You forget someone's name", "Call everyone 'friend'"
DATA "A lion escapes from the zoo", "Challenge it to a staring contest"
DATA "Your neighbor throws a loud party", "Join with a karaoke machine"
DATA "A time traveler visits you", "Ask for next week's lottery numbers"
DATA "Your houseplants start talking", "Ask for gardening advice"
DATA "You lose your wallet", "Check the fridge"
DATA "A robot malfunctions in your house", "Teach it how to bake cookies"
DATA "You drop your ice cream", "Turn it into abstract art"
DATA "A ghost appears in your room", "Play cards with it"
DATA "Your favorite show gets canceled", "Write your own episodes"
DATA "You run out of toothpaste", "Use peanut butter instead"
DATA "A penguin knocks on your door", "Offer it a warm scarf"
DATA "You step on a Lego", "Build a castle with the rest"
DATA "Your umbrella blows away", "Turn it into a kite"
DATA "You wake up as a cat", "Take a nap immediately"
DATA "You find a secret tunnel", "Throw a surprise party in it"
DATA "Your shadow starts moving on its own", "Start a dance duet"
DATA "A dragon lands in your backyard", "Teach it to barbecue"
'
DATA "You discover a hidden treasure chest", "Donate it to a squirrel"
DATA "A talking dog approaches you", "Ask it for stock market advice"
DATA "You wake up invisible", "Start a street mime act"
DATA "Your dinner burns", "Serve it as 'charcoal cuisine'"
DATA "Your mirror breaks", "Compliment your reflection anyway"
DATA "You find a magic lamp", "Wish for infinite socks"
DATA "Your shoes disappear", "Walk on your hands"
DATA "The sun stops shining", "Start a flashlight collection"
DATA "Your favorite food is banned", "Smuggle it in like a spy"
DATA "Your alarm clock doesn't go off", "Blame time itself"
DATA "You grow wings overnight", "Start delivering pizzas"
DATA "You shrink to the size of an ant", "Build a leaf canoe"
DATA "You accidentally clone yourself", "Send your clone to work"
DATA "Your refrigerator starts talking", "Negotiate over who eats the last slice of cake"
DATA "A giant spider knocks on your window", "Teach it to knit webs"
DATA "You lose all your clothes in the wind", "Wrap yourself in newspapers"
DATA "Your toaster starts launching bread", "Call it breakfast artillery"
DATA "Your house floats into the sky", "Use it to spot new coffee shops"
DATA "A vampire invites you to dinner", "Bring garlic as a side dish"
DATA "You find a door to another dimension", "Open a tourist agency for it"
DATA "Your goldfish grows ten times its size", "Ride it to work"
DATA "The moon falls out of the sky", "Use it as a disco ball"
DATA "You're cursed to always speak in rhyme", "Become a professional poet"
DATA "You gain the ability to control weather", "Use it to schedule picnics"
DATA "You're transported to the Middle Ages", "Open a fast-food chain"
DATA "Your car turns into a pumpkin", "Start a pumpkin pie business"
DATA "You find out gravity doesn't affect you", "Take up juggling for fun"
DATA "You're suddenly fluent in every language", "Argue with birds"
DATA "A genie gives you one wish", "Wish for unlimited bubble wrap"
DATA "You get trapped in a video game", "Make it a speedrun"
DATA "end"
`);
