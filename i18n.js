/* Star Nav — English translation.
   The game is written in French; this file maps each French sentence to its English version.
   - levels: texts of each level, in the same order as LEVELS in game.js
   - msgs:   "French sentence" -> "English sentence" (messages, labels, buttons…)
   A French sentence missing from msgs is shown in French and reported in the console
   ("[i18n] à traduire") when the game runs in English. */
window.STARNAV_EN = {
  levels: [
    /* 1 */ {
      title: 'The big jump', short: 'Set the power', part: 'Part 1 — The basics',
      mission: "Send the capsule straight up. It must <b class=g>stop rising inside the green zone</b>: that's where the station can catch it.",
      discover: "The harder you push, the higher the capsule goes. But the Earth always pulls it back down: that's <b>gravity</b>. It slows down, stops… and falls back.<br><br>Did you try pushing <b>really hard</b>? Above a certain speed, the Earth can't hold it any more: the capsule escapes forever!",
    },
    /* 2 */ {
      title: 'A heavier capsule', short: 'Weight changes everything',
      mission: "Same mission, but this time the capsule carries <b class=o>supply crates</b>. It's heavier!",
      discover: "With the same push, a heavy object moves more slowly than a light one. To go just as high, the loaded capsule needs <b>more power</b>.<br><br>That's why real rockets are so huge: carrying weight takes a lot of force.",
    },
    /* 3 */ {
      title: 'Around the Earth', short: 'Put a satellite in orbit',
      mission: "From the top of the mountain, launch the satellite <b class=s>sideways</b>. It must go <b class=g>all the way around</b> the Earth without falling back.",
      discover: "A satellite doesn't float: it is <b>falling all the time</b>! But it moves sideways so fast that the round Earth \"curves away\" beneath it. It falls… around the Earth, without ever touching it.<br><br>Too slow: it falls back. Too fast: it flies away. In between, it goes round and round — sometimes in a circle, sometimes in an oval.",
    },
    /* 4 */ {
      title: 'Meet the Moon', short: 'Leave at the right moment',
      mission: "The rocket has just the right power to reach the Moon's orbit. But the Moon <b class=s>moves</b>! Choose the <b class=g>right moment</b> to lift off and meet it.",
      hint: "💡 Look at the <b>ghost Moon</b>: that's where the Moon was when your rocket reached the top.",
      discover: "While your rocket travels, the Moon keeps moving. Don't aim where the Moon <b>is</b>, aim where it <b>will be</b> when you get there.<br><br>It's like throwing a ball to a friend who is running: you throw ahead of them!",
    },
    /* 5 */ {
      title: 'The slingshot effect', short: 'Get thrown by a planet',
      mission: "The far station is <b class=o>too far</b> for your rocket! But a giant planet is passing by… Lift off at the right moment so that it <b class=g>carries you</b> to the station.",
      hint: "💡 Try to pass just <b>behind</b> the planet (on the side it comes from), very close, but without touching it. The 🐢 Slow-mo button can help!",
      discover: "By passing just behind a moving planet, your rocket gets \"pulled\" and <b>carried along</b>: it gains speed without using any fuel!<br><br>Real space probes use this trick to travel very far across the solar system. But careful: passing in front of the planet slows you down.",
    },
    /* 6 */ {
      title: 'Back to Earth', short: 'Brake at the right moment', part: 'Part 2 — Moving around in space',
      mission: "Your capsule is going around the Earth. To come home, you must <b class=o>brake</b>! Choose the moment so that it lands in the <b class=g>green zone</b>, out at sea.",
      timingText: "⏱️ Your capsule is going around the Earth. Press <b>BRAKE</b> at the right moment!",
      hint: "💡 Look at the <b>orange dot</b> (where you braked) and where you landed: the capsule hits the sea <b>far after</b> the point where you brake.",
      discover: "To come down, you don't dive towards the Earth: you <b>brake</b>! Going slower, the capsule no longer \"falls past\" the Earth: it falls onto it.<br><br>But it keeps moving forward while falling: it hits the sea <b>much further on</b> than where it braked. So you have to brake well in advance — that's what engineers calculate to splash capsules down in the right place.",
    },
    /* 7 */ {
      title: 'Catch the station', short: 'The chase paradox',
      mission: "The <b class=s>station</b> is on the same orbit as you, but <b>ahead</b>. Fire the engine <b>just once</b> to catch it within one lap. Speed up? Slow down? You decide…",
      hint: "💡 What if, instead of speeding up, you tried to <b>brake</b>? (slider to the left)",
      discover: "Surprise: in orbit, to catch someone ahead of you… you have to <b>brake</b>!<br><br>Braking drops you onto a <b>smaller</b> loop, and a small loop is quicker to go round: you catch up. Speeding up lifts you onto a <b>bigger</b> loop that takes longer: you fall behind. Astronauts joining a space station have to think backwards like this!",
    },
    /* 8 */ {
      title: 'Go up a level', short: 'Two engine burns',
      mission: "Take your rocket up to the <b class=g>green orbit</b>, and stay there! You have <b>two engine burns</b>: the 1st whenever you like… the 2nd at the right moment.",
      timingText: "⏱️ 1st burn: whenever you like. 2nd burn: at the <b>right moment</b>!",
      hint: "💡 Do the 2nd burn right <b>at the top of the oval</b>, when the rocket stops moving away from the Earth.",
      discover: "To move up a level, you need <b>two engine burns</b>: the first sends the rocket onto a big oval, and the second, done right at the top, stops it from coming back down.<br><br>A burn at one place mostly changes the orbit <b>on the other side</b> of the Earth. That's how satellites are placed very high up.",
    },
    /* 9 */ {
      title: 'Soft landing', short: 'Brake against gravity',
      mission: "Land the rocket on the Moon <b class=g>very gently</b>. Hold down the <b class=o>ENGINE</b> button to slow the fall… but watch your fuel!",
      hint: "💡 First let the rocket fall for a while, then fire the engine <b>well before</b> the ground and keep it on. You can also give short bursts.",
      discover: "A rocket doesn't stop instantly: it keeps going because of its <b>momentum</b>. To land gently, you have to start braking <b>well before</b> the ground.<br><br>When the engine pushes harder than gravity, the fall slows down. When it switches off, gravity takes over again and the rocket speeds up towards the ground.",
    },
    /* 10 */ {
      title: 'Next stop: Mars', short: 'The launch window',
      mission: "The Earth and Mars both go around the <b class=o>Sun</b>. Lift off at the <b class=g>right moment</b> so that your rocket finds Mars at the end of its journey.",
      timingText: "⏱️ The rocket rides along with the Earth. Press LAUNCH at the <b>right moment</b>!",
      hint: "💡 The trip is long: leave when Mars is <b>a little ahead</b> of the Earth… but not too much. And if you miss it, you have to wait for the Earth to catch up with Mars!",
      discover: "The Earth goes around the Sun faster than Mars. The right moment to leave — the <b>launch window</b> — only comes back every now and then. Miss it, and you must wait for the Earth to go almost all the way round again!<br><br>For real missions to Mars, the launch window only opens about <b>every two years</b>.",
    },
    /* 11 */ {
      title: 'Drawing the journey', short: 'Read a graph', part: 'Part 3 — Reading graphs',
      mission: "During the flight, the <b class=s>graph</b> draws the journey: the <b>higher</b> the line, the <b>further</b> the capsule is from the Earth. Time moves to the <b>right</b>. Make the top of the curve touch the <b class=g>green band</b>!",
      discover: "A graph is a <b>drawing of the journey through time</b>. You read it from left to right, like a book: at each moment, the height of the line shows where the capsule was.<br><br>The little coloured beads are the same in space and on the graph: the blue bead is the start, the pink bead the end. The top of the \"hill\" is the moment the capsule stops rising.",
    },
    /* 12 */ {
      title: 'The orbit wave', short: 'An orbit draws a wave',
      mission: "Launch the satellite around the Earth. This time, the target can <b>only be seen on the graph</b>: the top of your <b class=s>wave</b> must touch the <b class=g>green band</b>.",
      hint: "💡 On the graph, the top of the wave is when the satellite is <b>furthest</b> from the Earth. For a higher wave… launch harder!",
      discover: "When a satellite travels on an oval, it moves away from the Earth and then comes back, again and again. Drawn over time, it makes a <b>wave</b> that repeats every lap!<br><br>The longer the oval, the higher the wave. And a perfectly round orbit? The satellite always stays at the same height: the wave becomes a <b>flat line</b>.",
    },
    /* 13 */ {
      title: 'The track on the map', short: 'The wave on space maps',
      mission: "The satellite goes around the Earth on a <b class=s>tilted</b> orbit. On the map, it draws a <b>wave</b>! Tilt the orbit so that the top of the wave reaches the height of the <b class=o>city ★</b>.",
      s1: { title: '📐 Orbit tilt', l: 'flat', r: 'very tilted', words: ['flat', 'a bit tilted', 'tilted', 'quite tilted', 'very tilted'] },
      hint: "💡 The more the orbit is tilted, the higher the wave on the map climbs to the north (and the lower it dips to the south).",
      discover: "A tilted orbit, seen on a flat map, draws a <b>wave</b>: the satellite flies over the northern half of the Earth, then the southern half, then up again… That's the wave you see on space mission maps!<br><br>The more tilted the orbit, the higher the wave. And because the Earth turns underneath, each new wave is <b>shifted</b>: lap after lap, the satellite ends up flying over almost the whole planet.",
    },
    /* 14 */ {
      title: 'Fill her up', short: 'Fuel is heavy!', part: 'Part 4 — Several settings',
      mission: "From the Moon base, choose <b class=o>how much fuel</b> to take to reach the <b class=g>green zone</b>. More fuel pushes for longer… but it's also heavier!",
      s1: { title: '⛽ Fuel', l: 'empty tank', r: 'full tank', words: ['almost none', 'a little', 'half', 'a lot', 'full to the brim'] },
      hint: "💡 If the rocket doesn't lift off at all with lots of fuel, it has become <b>too heavy</b> for its engine.",
      discover: "Fuel makes the rocket go… but it also has to be lifted! Every extra drop makes the rocket heavier at the start.<br><br>At first, adding fuel helps a lot. Then less and less. And in the end, the rocket gets so heavy its engine can't even lift it. Engineers are always looking for the <b>happy medium</b>.",
    },
    /* 15 */ {
      title: 'Astronauts on board', short: 'Two settings: force and time',
      mission: "This time there are <b class=s>astronauts</b> on board! A push that's too strong squashes them (look at their face). Set the engine <b>force</b> and the <b>length</b> of the push to reach the <b class=g>green zone</b> without hurting them.",
      s1: { title: '💪 Engine force', l: 'gentle', r: 'very strong', words: ['very gentle', 'gentle', 'medium', 'strong', 'very strong'] },
      s2: { title: '⏱️ Push duration', l: 'very short', r: 'very long', words: ['very short', 'short', 'medium', 'long', 'very long'] },
      hint: "💡 Start by choosing a force that doesn't make the astronauts pull a face. Then only change the <b>duration</b>. The logbook shows you what you've already tried.",
      discover: "You can reach the same height with a <b>short, very strong</b> push, or a <b>gentle, long</b> one. Rockets with nobody on board (cargo ships, probes) can push very hard. But with humans aboard, you have to push more gently, for longer.<br><br>Did you notice the <b>logbook</b>? Each dot is one try: a \"forbidden\" area appears (too strong for the astronauts) and a band where it works. Reading this kind of drawing is exactly what engineers do!",
    },
    /* 16 */ {
      title: 'Fly over the city', short: 'Tilt + choose the moment', part: 'Part 5 — New challenges',
      mission: "This time the satellite must pass <b>right over</b> the <b class=o>city ★</b>. Two settings: the orbit <b>tilt</b>… and the <b>moment</b> you launch, because the Earth is turning!",
      s1: { title: '📐 Orbit tilt', l: 'flat', r: 'very tilted', words: ['flat', 'a bit tilted', 'tilted', 'quite tilted', 'very tilted'] },
      hint: "💡 First, tilt the orbit so that the wave climbs <b>at least</b> as high as the city. Then, if the track misses it, only change the <b>moment</b> you launch to shift the wave.",
      discover: "To fly over one exact place, you need <b>two settings</b>: the orbit tilt (how high the wave climbs) and the launch moment (where the wave lands on the map).<br><br>Because the Earth turns under the satellite, waiting a little <b>shifts</b> the whole wave. That's how the launch time of Earth-watching satellites is chosen.",
    },
    /* 17 */ {
      title: 'The disturbed slingshot', short: 'A second planet passes by…',
      mission: "The same slingshot as before… but a <b class=s>small blue planet</b> also crosses the path! Its pull can <b>knock you off course</b>. Pick your moment well: the giant must carry you, and the blue one must not get in the way.",
      hint: "💡 The right moment for the giant comes back regularly. Also watch where the <b>blue planet</b> will be when your rocket crosses its path: wait for a pass where it's far away.",
      discover: "In space, <b>everything pulls on everything</b>: each planet tugs at your rocket, even from far away. The more bodies there are, the harder the path is to predict.<br><br>Engineers must take every planet into account at once. Sometimes a planet gets in the way… and sometimes it helps!",
    },
    /* 18 */ {
      title: 'The balance point', short: 'The gravity tug of war', part: 'Part 6 — Towards the three-body problem',
      mission: "The Earth and the Moon both pull on the ship, like a <b>tug of war</b>. Place it where the two pulls are <b class=g>equal</b>: when you let go, it must <b>stay still</b>.",
      s1: { title: '↔ Ship position', l: '⬅ towards Earth', r: 'towards Moon ➡', words: ['right next to Earth', 'Earth side', 'in the middle', 'Moon side', 'right next to the Moon'] },
      hint: "💡 Look at the two <b>arrows</b>: the blue one shows the Earth's pull, the grey one the Moon's. Find the spot where they are <b>the same length</b>.",
      discover: "Between two bodies, there's a point where their pulls balance. Because the Moon is smaller, this point is <b>quite close to the Moon</b>!<br><br>But the balance is fragile: the tiniest nudge, and one of them wins. These points really exist: they're called <b>Lagrange points</b>, and space telescopes are parked there.",
    },
    /* 19 */ {
      title: 'The figure of eight', short: 'Around the Moon and back',
      mission: "Launch the rocket so that it <b>loops around the Moon</b> and <b class=g>comes back to the Earth</b> on its own, without firing the engine again. Its path will draw a big <b>8</b>!",
      hint: "💡 To turn back, the rocket must pass <b>behind</b> the Moon, close enough to be pulled hard… without crashing into it.",
      discover: "The Moon can give you a <b>free U-turn</b>! Passing behind it, the rocket is pulled and sent back towards the Earth, without any fuel.<br><br>This is the \"free return\", the figure-of-eight path chosen for trips to the Moon: if the engine breaks down, the crew still gets home. And did you see? With just a little more power, the rocket starts looping between the Earth and the Moon in very complicated ways…",
    },
    /* 20 */ {
      title: 'Two suns', short: 'The three-body problem',
      mission: "Two suns are circling each other. Launch your ship so that it makes <b class=g>one full lap</b> of the system without crashing or being thrown out. A <b class=s>twin ship</b> (purple) leaves at the same time, just a tiny bit faster…",
      hint: "💡 Close to the two suns, everything becomes unpredictable. Far from them, they pull almost like <b>one</b> big sun…",
      discover: "With two bodies (a planet and a sun), the path is simple and repeats. With <b>three bodies</b>, it often becomes <b>unpredictable</b>: look at the twin, which left almost the same way and ended up somewhere completely different! This is the famous <b>three-body problem</b>.<br><br>But far from the two suns, they pull almost like a single one: the orbit becomes calm again. Engineers can't solve this problem with one formula: like you, they calculate step by step, try after try.",
    },
    /* 21 */ {
      title: 'Bouncing off the air', short: 'The angle of return', part: 'Part 7 — Special missions',
      mission: "The capsule is coming back from the Moon, <b>very fast</b>! Choose the <b>angle</b> it arrives at: it must go through the <b class=s>air</b> to slow down, without <b class=o>getting too hot</b>, and land on Earth.",
      s1: { title: '📐 Arrival angle', l: 'flat', r: 'very steep', words: ['really flat', 'flat', 'gentle slope', 'steep', 'very steep'] },
      hint: "💡 Bouncing off means the angle is <b>too flat</b>. Flames mean it's <b>too steep</b>. Look for the <b>corridor</b> in between, moving the slider a little at a time.",
      discover: "To come back from space, a capsule uses the <b>air</b> as a brake: going through it slows the capsule down… and heats it up enormously.<br><br>You have to arrive at the right angle. Too flat, and the capsule <b>bounces</b> off the air like a stone skipping on water and heads back into space. Too steep, and it brakes too hard all at once and <b>burns</b>. In between there is a narrow <b>corridor</b>: that's what the astronauts coming back from the Moon aimed for.",
    },
    /* 22 */ {
      title: 'The satellite that stands still', short: 'Turning with the Earth',
      mission: "Place the TV satellite so that it stays <b>always above</b> the <b class=o>city ★</b> while the Earth turns. Choose its <b>height</b>.",
      s1: { title: '⬆️ Satellite height', l: 'very low', r: 'very high', words: ['very low', 'low', 'medium', 'high', 'very high'] },
      hint: "💡 Watch who wins the race: if the satellite gets <b>ahead</b> of the city, place it <b>higher</b>. If the city <b>overtakes</b> it, place it <b>lower</b>.",
      discover: "The <b>higher</b> a satellite is, the longer it takes to go around the Earth. Very close, one lap takes an hour and a half. Very far, like the Moon, a month!<br><br>In between there is a magic height where the satellite goes around in <b>one day</b>, exactly as fast as the Earth spins. Seen from the ground, it seems to <b>stand still</b> in the sky: that's why a TV dish can be pointed at it once and for all.",
    },
    /* 23 */ {
      title: 'The multi-stage rocket', short: 'Dropping useless weight',
      mission: "Your rocket has a <b class=o>big tank</b> (orange) and a small one. During the flight, press <b>DROP</b> to get rid of the big tank. Reach the <b class=g>green zone</b>!",
      timingText: "⏱️ Press LAUNCH, then <b>DROP</b> at the right moment to let go of the big tank!",
      hint: "💡 Watch the <b>big tank</b> gauge: drop it <b>just as it becomes empty</b>. Before that, you throw fuel away; after that, you drag dead weight along.",
      discover: "An empty tank is no use anymore… but it's still heavy! The engine has to keep pushing it: it's <b>dead weight</b>.<br><br>By dropping it as soon as it's empty, the rocket gets lighter and the same engine makes it go faster. That's why real rockets are made of several <b>stages</b> that come off one after another on the way up.",
    },
    /* 24 */ {
      title: 'The backwards slingshot', short: 'A planet as a brake',
      mission: "The <b class=g>station</b> is up on the left, but your rocket can only go straight up, and fast. Use the giant planet to make you <b class=o>slow down</b> and <b>turn</b> towards the station. Choose the right moment to launch!",
      hint: "💡 Remember level 5: passing <b>behind</b> the planet speeds you up. To slow down, you have to do… <b>the opposite</b>!",
      discover: "The same planet can be an <b>accelerator</b> or a <b>brake</b>! Behind it, it carries you along and you gain speed. In front of it, it pulls you back and you lose speed.<br><br>Probes going to Mercury, very close to the Sun, travel far too fast to stop there: they pass in front of planets several times to slow down, without using any fuel.",
    },
    /* 25 */ {
      title: 'Push the asteroid aside', short: 'A small push, but early',
      mission: "An <b class=o>asteroid</b> is heading straight for the Earth! Your rocket is attached to it. Set the <b>force</b> of the push, then press <b>PUSH</b> at the right moment to move it aside.",
      s1: { title: '💪 Push force', l: 'tiny', r: 'huge', words: ['tiny', 'small', 'medium', 'big', 'huge'] },
      hint: "💡 The <b>earlier</b> you push, the more time the asteroid has to drift aside. Push <b>right at the start</b>, then look for the smallest force that works.",
      discover: "A tiny push given <b>early</b> is enough to make an asteroid miss the Earth: it has plenty of time to drift aside, little by little. The longer you wait, the harder you have to push… until it becomes impossible. Look at your logbook: the limit <b>rises</b> towards the right!<br><br>In 2022, NASA's <b>DART</b> probe crashed on purpose into a small asteroid to push it. It worked: its path changed. That's why we watch the sky: spotting an asteroid early means we can push it aside gently.",
    },
  ],

  msgs: {
    /* --- page --- */
    'Niveaux': 'Levels',
    'Choisir un niveau': 'Choose a level',
    'Partager': 'Share',
    'Copier le lien direct vers ce niveau': 'Copy the direct link to this level',
    'Écrasement des astronautes': 'Astronaut squash',
    'Vitesse de chute': 'Falling speed',
    'Carburant': 'Fuel',
    '🐢 Ralenti': '🐢 Slow-mo',
    'Ralenti': 'Slow motion',
    '🎯 Vue': '🎯 View',
    'Recentrer la vue': 'Reset the view',
    "Ici, pas de calcul : tu <b>essaies</b>, tu <b>regardes</b> ce qui se passe, et tu <b>ajustes</b>. Ta trajectoire ratée reste dessinée en pointillés fantômes pour t'aider à corriger la suivante.":
      "No maths here: you <b>try</b>, you <b>watch</b> what happens, and you <b>adjust</b>. Your missed path stays drawn as a ghost line to help you fix the next one.",
    "Astuce : fais glisser l'écran pour tourner autour de la scène, molette pour zoomer. Barre d'espace = LANCER.":
      'Tip: drag the screen to turn around the scene, scroll to zoom. Space bar = LAUNCH.',
    '🎉 Bravo !': '🎉 Well done!',
    'Ce que tu viens de découvrir': 'What you just discovered',
    '↺ Rejouer': '↺ Play again',
    'Niveau suivant ➜': 'Next level ➜',
    'Niveau': 'Level',
    'Essai n°': 'Try #',
    '🔗 Lien copié ! Colle-le pour partager directement ce niveau.': '🔗 Link copied! Paste it to share this level directly.',
    'Copie ce lien :': 'Copy this link:',
    'Partie 1 — Les bases': 'Part 1 — The basics',

    /* --- buttons and sliders --- */
    '🚀 LANCER': '🚀 LAUNCH',
    '🔥 FREINER': '🔥 BRAKE',
    '🔥 ALLUMER': '🔥 FIRE',
    '🔥 ALLUMER (1er coup)': '🔥 FIRE (1st burn)',
    '🔥 ALLUMER (2e coup)': '🔥 FIRE (2nd burn)',
    '🔥 MOTEUR (appuie)': '🔥 ENGINE (hold)',
    '▶ DESCENDRE': '▶ START DESCENT',
    '✋ LÂCHER': '✋ LET GO',
    '🔥 Puissance': '🔥 Power',
    '↔ Coup de moteur': '↔ Engine burn',
    'doux': 'gentle', 'très fort': 'very strong',
    '⬅ freiner': '⬅ brake', 'accélérer ➡': 'speed up ➡',
    'tout doux': 'very gentle', 'moyen': 'medium', 'fort': 'strong', 'énorme !': 'huge!',
    'freiner fort': 'brake hard', 'freiner': 'brake', 'freiner un peu': 'brake a little', 'rien': 'nothing',
    'accélérer un peu': 'speed up a little', 'accélérer': 'speed up', 'accélérer fort': 'speed up a lot',
    "⏱️ Choisis le <b>bon moment</b> : appuie sur LANCER quand tu penses que c'est le moment !":
      "⏱️ Choose the <b>right moment</b>: press LAUNCH when you think it's time!",

    /* --- labels in space --- */
    'Terre': 'Earth', 'Lune': 'Moon', 'Soleil': 'Sun', 'Mars': 'Mars', 'Station': 'Station',
    'Base lunaire': 'Moon base', 'pôle Nord': 'North Pole', 'ville ★': 'city ★',
    "zone d'amerrissage": 'splashdown zone', "zone d'atterrissage": 'landing zone',
    'orbite verte': 'green orbit', 'zone verte': 'green zone', 'Montagne': 'Mountain',
    'Station lointaine': 'Far station', 'Planète géante': 'Giant planet', 'Départ': 'Start',
    'Planète bleue': 'Blue planet', 'force de la Terre': "Earth's pull", 'force de la Lune': "Moon's pull",
    'limite du système': 'edge of the system',
    'la planète au départ': 'the planet at launch', 'la Lune était là': 'the Moon was here', 'Mars était là': 'Mars was here',

    /* --- graphs --- */
    '📈 Le graphique du voyage': '📈 The journey graph',
    '🗺️ La carte : où passe le satellite ?': '🗺️ The map: where does the satellite fly?',
    '📒 Le carnet de bord': '📒 The logbook',
    "Le trait monte quand la fusée s'éloigne de la Terre, et descend quand elle se rapproche. Les <b>perles de couleur</b> marquent les mêmes moments dans l'espace et sur le graphique.":
      'The line goes up when the rocket moves away from the Earth, and down when it comes closer. The <b>coloured beads</b> mark the same moments in space and on the graph.',
    'La Terre « déroulée » à plat. Le trait montre les endroits survolés par le satellite. <b>En haut</b> = vers le pôle Nord, <b>en bas</b> = vers le pôle Sud.':
      'The Earth "unrolled" flat. The line shows the places the satellite flies over. <b>Top</b> = towards the North Pole, <b>bottom</b> = towards the South Pole.',
    "Chaque point est un essai : <b style='color:#5ee08a'>vert</b> = réussi, <b style='color:#ff8a7a'>rouge</b> = trop bas, <b style='color:#ffb347'>orange</b> = trop haut, <b style='color:#c78bff'>violet</b> = astronautes écrasés. Le petit cercle blanc = tes réglages actuels.":
      "Each dot is one try: <b style='color:#5ee08a'>green</b> = success, <b style='color:#ff8a7a'>red</b> = too low, <b style='color:#ffb347'>orange</b> = too high, <b style='color:#c78bff'>purple</b> = astronauts squashed. The small white circle = your current settings.",
    'bande verte': 'green band', 'loin de la Terre ↑': 'far from Earth ↑', 'temps →': 'time →', 'sol': 'ground',
    'équateur': 'equator', '▲ Nord': '▲ North', '▼ Sud': '▼ South', 'ville': 'city',
    'trop fort pour': 'too strong for', 'les astronautes 😵': 'the astronauts 😵', 'durée ↑': 'duration ↑', 'force →': 'force →',

    /* --- win screen --- */
    ' — sauras-tu faire une orbite toute ronde ?': ' — can you make a perfectly round orbit?',
    ' — sauras-tu tourner encore plus rond ?': ' — can you go round even more smoothly?',
    ' — sauras-tu te poser encore plus doucement ?': ' — can you land even more gently?',

    /* --- levels 1, 2, 14, 15: going up --- */
    '🎯 Pile dans la zone verte ! La station a attrapé la capsule.': '🎯 Right in the green zone! The station caught the capsule.',
    'Elle a à peine décollé ! Il faut <b>beaucoup plus</b> de puissance.': 'It barely lifted off! You need <b>much more</b> power.',
    'Presque ! Elle est retombée <b>juste avant</b> la zone verte. Un tout petit peu plus fort.': 'Almost! It fell back <b>just below</b> the green zone. Just a tiny bit harder.',
    "Pas assez fort : elle est retombée <b>avant</b> d'atteindre la zone verte.": 'Not hard enough: it fell back <b>before</b> reaching the green zone.',
    'Presque ! Elle a dépassé la zone verte <b>de peu</b>, puis elle est retombée. Un tout petit peu moins fort.': 'Almost! It went <b>just past</b> the green zone, then fell back. Just a tiny bit softer.',
    'Trop fort : elle est montée <b>plus haut</b> que la zone verte, puis elle est retombée.': 'Too hard: it went <b>higher</b> than the green zone, then fell back.',
    "Beaucoup trop fort ! La capsule va si vite que la Terre <b>n'arrive plus à la retenir</b> : elle s'échappe et ne reviendra jamais !": "Way too hard! The capsule is going so fast that the Earth <b>can't hold it any more</b>: it escapes and will never come back!",
    "Beaucoup trop fort ! La capsule va si vite que la Lune <b>n'arrive plus à la retenir</b> : elle s'échappe et ne reviendra jamais !": "Way too hard! The capsule is going so fast that the Moon <b>can't hold it any more</b>: it escapes and will never come back!",
    "Beaucoup trop fort ! Elle est partie <b>si loin</b> qu'on ne la voit plus… la Terre finira par la faire retomber, mais dans très longtemps.": "Way too hard! It went <b>so far</b> we can't see it any more… the Earth will pull it back one day, but in a very long time.",
    "Beaucoup trop fort ! Elle est partie <b>si loin</b> qu'on ne la voit plus… la Lune finira par la faire retomber, mais dans très longtemps.": "Way too hard! It went <b>so far</b> we can't see it any more… the Moon will pull it back one day, but in a very long time.",
    'Trop lourde ! Avec autant de carburant, la fusée pèse plus que ce que son moteur peut soulever : elle <b>ne décolle même pas</b>.': "Too heavy! With that much fuel, the rocket weighs more than its engine can lift: it <b>doesn't even take off</b>.",
    '👩‍🚀 Pile dans la zone verte, et les astronautes vont bien !': '👩‍🚀 Right in the green zone, and the astronauts are fine!',
    'Tu as atteint la zone verte… mais la poussée était <b>trop forte</b> : les astronautes se sont évanouis 😵 ! Pousse <b>moins fort</b>, mais <b>plus longtemps</b>.': 'You reached the green zone… but the push was <b>too strong</b>: the astronauts fainted 😵! Push <b>more gently</b>, but <b>for longer</b>.',

    /* --- level 3 and 12: orbit --- */
    'Il est retombé tout de suite ! Lance-le <b>beaucoup plus fort</b>.': 'It fell straight back down! Launch it <b>much harder</b>.',
    'Il est allé loin… mais il est quand même retombé. <b>Plus fort !</b>': 'It went far… but it still fell back. <b>Harder!</b>',
    'Presque un tour complet ! Encore <b>un tout petit peu</b> plus fort.': 'Almost a full lap! Just <b>a tiny bit</b> harder.',
    '🛰️ Un tour complet, presque en <b>cercle parfait</b> !': '🛰️ A full lap, almost a <b>perfect circle</b>!',
    '🛰️ Un tour complet ! Ton orbite est un peu <b>ovale</b>.': '🛰️ A full lap! Your orbit is a bit <b>oval</b>.',
    '🛰️ Un tour complet ! Ton orbite est très <b>allongée</b> (un grand ovale).': '🛰️ A full lap! Your orbit is very <b>stretched</b> (a big oval).',
    "Trop fort : il va si vite qu'il <b>s'échappe</b> dans l'espace au lieu de tourner autour de la Terre.": "Too hard: it's going so fast that it <b>escapes</b> into space instead of circling the Earth.",
    "Un peu trop fort : il part sur un ovale <b>tellement grand</b> qu'il sort de l'écran. Il reviendrait… dans très longtemps !": "A bit too hard: it goes off on an oval <b>so big</b> it leaves the screen. It would come back… in a very long time!",
    '〰️ Le haut de ta vague touche la bande verte !': '〰️ The top of your wave touches the green band!',
    "Ta vague est <b>trop basse</b> : le satellite ne s'éloigne pas assez de la Terre. Lance-le <b>un peu plus fort</b>.": "Your wave is <b>too low</b>: the satellite doesn't get far enough from the Earth. Launch it <b>a bit harder</b>.",
    "Ta vague est <b>trop haute</b> : le satellite s'éloigne trop. Lance-le <b>un peu moins fort</b>.": 'Your wave is <b>too high</b>: the satellite goes too far. Launch it <b>a bit softer</b>.',

    /* --- level 4: Moon --- */
    '🌙 Alunissage réussi ! Tu as rejoint la Lune !': '🌙 Moon landing! You made it to the Moon!',
    "<b>Trop tôt !</b> Quand ta fusée est arrivée en haut, la Lune n'était <b>pas encore là</b>. Attends un peu plus avant de lancer.": "<b>Too early!</b> When your rocket reached the top, the Moon <b>wasn't there yet</b>. Wait a little longer before launching.",
    '<b>Trop tard !</b> Quand ta fusée est arrivée en haut, la Lune était <b>déjà passée</b>. Lance un peu plus tôt.': '<b>Too late!</b> When your rocket reached the top, the Moon had <b>already gone by</b>. Launch a bit earlier.',
    ' Ta fusée est retombée sur Terre.': ' Your rocket fell back to Earth.',

    /* --- level 5 and 17: slingshot --- */
    '🪐 Catapulte réussie ! La planète t\'a lancé jusqu\'à la station.': '🪐 Slingshot success! The planet threw you all the way to the station.',
    "Trop près ! Tu t'es écrasé sur la planète géante. Décolle <b>un tout petit peu plus tard</b>.": 'Too close! You crashed into the giant planet. Lift off <b>a tiny bit later</b>.',
    "<b>Trop tard !</b> La planète était déjà loin : elle ne t'a presque pas tiré. Décolle plus tôt.": '<b>Too late!</b> The planet was already far away: it barely pulled you. Lift off earlier.',
    "<b>Trop tôt !</b> Tu es passé <b>devant</b> la planète : elle t'a freiné et tiré en arrière. Décolle plus tard.": '<b>Too early!</b> You passed <b>in front of</b> the planet: it slowed you down and pulled you back. Lift off later.',
    "Bien, tu es passé <b>derrière</b> la planète ! Mais pas assez près : elle ne t'a pas assez emporté. Décolle <b>un peu plus tôt</b>.": "Good, you passed <b>behind</b> the planet! But not close enough: it didn't carry you far enough. Lift off <b>a little earlier</b>.",
    "La géante t'a bien lancé… mais la <b>planète bleue</b> est passée trop près et son attraction t'a <b>dévié</b> ! Choisis un passage où elle est loin.": 'The giant threw you well… but the <b>blue planet</b> came too close and its pull <b>knocked you off course</b>! Choose a pass when it is far away.',
    'Boum ! Tu as percuté la planète bleue. Choisis un moment où elle est plus loin.': 'Boom! You hit the blue planet. Choose a moment when it is further away.',

    /* --- level 6: re-entry --- */
    '🌊 Plouf ! Amerrissage pile dans la zone. Le bateau arrive pour te récupérer !': '🌊 Splash! Right in the zone. The boat is coming to pick you up!',
    'Presque ! ': 'Almost! ',
    '<b>Trop tôt !</b> Tu es tombé <b>avant</b> la zone verte. Freine un peu plus tard.': '<b>Too early!</b> You came down <b>before</b> the green zone. Brake a little later.',
    '<b>Trop tard !</b> Tu es tombé <b>après</b> la zone verte. Freine un peu plus tôt.': '<b>Too late!</b> You came down <b>after</b> the green zone. Brake a little earlier.',
    'Raté !': 'Missed!',

    /* --- level 7: chase --- */
    '🤝 Amarrage réussi ! Tu as rattrapé la station.': '🤝 Docking complete! You caught the station.',
    'Tu as accéléré… et surprise : tu es monté sur un <b>plus grand tour</b>, qui prend plus de temps. Tu as pris <b>encore plus de retard</b> !': 'You sped up… and surprise: you climbed onto a <b>bigger loop</b>, which takes longer. You fell <b>even further behind</b>!',
    "Tu n'as presque rien changé : la station reste toujours devant toi.": "You hardly changed anything: the station is still ahead of you.",
    'Bonne idée de <b>freiner</b> ! Mais pas assez : la station est encore devant toi.': 'Good idea to <b>brake</b>! But not enough: the station is still ahead of you.',
    "Trop freiné : cette fois, c'est <b>toi</b> qui es passé devant la station !": "Braked too much: this time <b>you</b> went past the station!",
    'Beaucoup trop freiné : tu es descendu si bas que tu es retombé sur la Terre !': 'Braked way too much: you dropped so low that you fell back to Earth!',

    /* --- level 8: two burns --- */
    "🪜 Parfait ! Tu tournes bien rond sur l'orbite verte.": '🪜 Perfect! You are going nicely round on the green orbit.',
    "🪜 Tu es resté sur l'orbite verte ! (un peu ovale)": '🪜 You stayed on the green orbit! (a bit oval)',
    'Presque ! Tu y étais presque : encore un tout petit peu plus près du sommet.': 'Almost! You were nearly there: just a tiny bit closer to the top.',
    "<b>Trop tôt !</b> Ta fusée <b>montait encore</b> quand tu as rallumé le moteur. Attends qu'elle soit tout en haut.": '<b>Too early!</b> Your rocket was <b>still climbing</b> when you fired again. Wait until it is right at the top.',
    '<b>Trop tard !</b> Ta fusée avait <b>déjà commencé à redescendre</b>. Rallume le moteur un peu plus tôt.': '<b>Too late!</b> Your rocket had <b>already started coming back down</b>. Fire the engine a little earlier.',
    'Tu as oublié le <b>2e coup de moteur</b> : la fusée est redescendue tout en bas de son ovale.': 'You forgot the <b>2nd burn</b>: the rocket came all the way back down its oval.',

    /* --- level 9: landing --- */
    '🛬 Posé comme une plume !': '🛬 Light as a feather!',
    '🛬 Atterrissage réussi ! (un peu secoué)': '🛬 Landed! (a bit bumpy)',
    'Plus de carburant… et la fusée est tombée trop vite ! Garde ton carburant pour <b>la fin</b> de la descente.': 'Out of fuel… and the rocket fell too fast! Save your fuel for <b>the end</b> of the descent.',
    "Boum ! Tu n'as pas allumé le moteur : la fusée a pris de plus en plus de vitesse en tombant.": "Boom! You didn't fire the engine: the rocket got faster and faster as it fell.",
    'Boum ! <b>Beaucoup trop vite</b>. Allume le moteur <b>plus tôt</b>, et garde-le allumé plus longtemps.': 'Boom! <b>Way too fast</b>. Fire the engine <b>earlier</b>, and keep it on for longer.',
    'Aïe, <b>un peu trop vite</b> ! Il fallait freiner encore un petit peu avant de toucher le sol.': 'Ouch, <b>a bit too fast</b>! You needed to brake a little more before touching the ground.',
    "Oups, tu <b>remontes</b> dans l'espace ! Le moteur pousse plus fort que la gravité : relâche-le de temps en temps.": "Oops, you're <b>going back up</b> into space! The engine pushes harder than gravity: let go of it now and then.",

    /* --- level 10: Mars --- */
    '🔴 Bienvenue sur Mars ! Tu as trouvé la fenêtre de tir.': '🔴 Welcome to Mars! You found the launch window.',
    "<b>Trop tard !</b> Quand ta fusée est arrivée, Mars n'était <b>pas encore là</b> : il fallait partir quand Mars avait <b>plus d'avance</b>. Comme la Terre rattrape Mars, il faut maintenant attendre la <b>prochaine fenêtre de tir</b>…": "<b>Too late!</b> When your rocket arrived, Mars <b>wasn't there yet</b>: you needed to leave when Mars was <b>further ahead</b>. Since the Earth is catching up with Mars, you now have to wait for the <b>next launch window</b>…",
    '<b>Trop tôt !</b> Quand ta fusée est arrivée, Mars était <b>déjà passée</b>. Attends un peu : la Terre va se rapprocher de Mars.': '<b>Too early!</b> When your rocket arrived, Mars had <b>already gone by</b>. Wait a little: the Earth will get closer to Mars.',
    'Tu es arrivé sur Mars… un peu trop vite !': 'You reached Mars… a bit too fast!',
    'Aïe, tu es tombé dans le Soleil !': 'Ouch, you fell into the Sun!',

    /* --- level 13 and 16: map --- */
    '🗺️ Le haut de ta vague passe pile à la hauteur de la ville !': '🗺️ The top of your wave is right at the height of the city!',
    "Presque ! Ta vague monte <b>un tout petit peu trop bas</b> : penche l'orbite un peu plus.": 'Almost! Your wave peaks <b>a tiny bit too low</b>: tilt the orbit a little more.',
    "Ta vague ne monte <b>pas assez haut</b> : elle reste au sud de la ville. <b>Penche plus</b> l'orbite.": "Your wave doesn't climb <b>high enough</b>: it stays south of the city. <b>Tilt the orbit more</b>.",
    "Presque ! Ta vague monte <b>un tout petit peu trop haut</b> : penche l'orbite un peu moins.": 'Almost! Your wave peaks <b>a tiny bit too high</b>: tilt the orbit a little less.',
    "Ta vague monte <b>trop haut</b>, elle passe au nord de la ville. <b>Penche moins</b> l'orbite.": 'Your wave climbs <b>too high</b>, it passes north of the city. <b>Tilt the orbit less</b>.',
    '📍 Survol réussi ! Le satellite est passé juste au-dessus de la ville.': '📍 Fly-over success! The satellite passed right over the city.',
    "Ta vague ne monte <b>pas assez haut</b> pour atteindre la ville : <b>penche plus</b> l'orbite.": "Your wave doesn't climb <b>high enough</b> to reach the city: <b>tilt the orbit more</b>.",
    'Ta trace passe <b>à droite</b> de la ville sur la carte. Change le <b>moment</b> du départ pour décaler la vague.': 'Your track passes <b>to the right</b> of the city on the map. Change the <b>moment</b> you launch to shift the wave.',
    'Ta trace passe <b>à gauche</b> de la ville sur la carte. Change le <b>moment</b> du départ pour décaler la vague.': 'Your track passes <b>to the left</b> of the city on the map. Change the <b>moment</b> you launch to shift the wave.',

    /* --- level 18: balance point --- */
    'La <b>Lune</b> a gagné le tir à la corde : elle tire plus fort ici. Place le vaisseau un peu plus <b>vers la Terre</b>.': 'The <b>Moon</b> won the tug of war: it pulls harder here. Move the ship a little <b>towards the Earth</b>.',
    'La <b>Terre</b> a gagné le tir à la corde : elle tire plus fort ici. Place le vaisseau un peu plus <b>vers la Lune</b>.': 'The <b>Earth</b> won the tug of war: it pulls harder here. Move the ship a little <b>towards the Moon</b>.',
    "⚖️ Il tient en équilibre ! Les deux forces sont égales… pour l'instant. Regarde bien ce qui va se passer.": "⚖️ It's balancing! The two pulls are equal… for now. Watch closely what happens next.",
    'Le vaisseau est tombé sur la Lune.': 'The ship fell onto the Moon.',
    'Le vaisseau est tombé sur la Terre.': 'The ship fell onto the Earth.',

    /* --- level 19: figure of eight --- */
    "♾️ Retour à la maison ! La Lune t'a fait faire demi-tour sans une goutte de carburant.": '♾️ Home again! The Moon turned you around without a single drop of fuel.',
    "Pas assez fort : la fusée n'est même pas allée jusqu'à la Lune avant de redescendre.": "Not hard enough: the rocket didn't even reach the Moon before coming back down.",
    'La fusée est passée <b>du mauvais côté</b> de la Lune et a fait des boucles bizarres… Lance <b>un peu plus fort</b>.': 'The rocket went round <b>the wrong side</b> of the Moon and made strange loops… Launch <b>a bit harder</b>.',
    "Presque ! La fusée est revenue, mais en passant <b>trop loin</b> de la Lune : elle n'a pas fait le grand 8. Lance <b>un tout petit peu moins fort</b>.": "Almost! The rocket came back, but passed <b>too far</b> from the Moon: it didn't draw the big 8. Launch <b>a tiny bit softer</b>.",
    "Trop fort : la fusée est passée loin de la Lune, qui ne l'a pas assez tirée pour la faire revenir. Elle file dans l'espace…": "Too hard: the rocket passed far from the Moon, which didn't pull it enough to bring it back. It's heading off into space…",
    'La fusée tourne entre la Terre et la Lune sans revenir… Quand deux astres tirent en même temps, les trajets peuvent devenir <b>très compliqués</b> ! Essaie un tout petit peu moins fort.': 'The rocket keeps looping between the Earth and the Moon without coming home… When two bodies pull at the same time, paths can get <b>very complicated</b>! Try a tiny bit softer.',
    'Écrasé sur la Lune ! Tu es passé trop près : lance <b>un tout petit peu plus fort</b>.': 'Crashed on the Moon! You passed too close: launch <b>a tiny bit harder</b>.',
    'La fusée est retombée sur Terre sans faire le tour de la Lune : lance <b>un peu plus fort</b>.': "The rocket fell back to Earth without going round the Moon: launch <b>a bit harder</b>.",

    /* --- level 20: two suns --- */
    "✨ Un tour complet autour des deux soleils ! Loin d'eux, l'orbite reste calme.": '✨ A full lap around the two suns! Far from them, the orbit stays calm.',
    'Éjecté ! Ton vaisseau est sorti du système.': 'Thrown out! Your ship left the system.',
    'Boum ! Ton vaisseau est tombé dans un des soleils.': 'Boom! Your ship fell into one of the suns.',
    "Et le <b>jumeau</b>, parti presque pareil, a fait <b>tout autre chose</b> ! C'est ça, le chaos.": 'And the <b>twin</b>, which left almost the same way, did <b>something completely different</b>! That is chaos.',

    /* --- niveaux 21 à 25 --- */
    "l'air": 'the air', 'Capsule': 'Capsule', 'au-dessus de la ville': 'above the city', 'Astéroïde': 'Asteroid', 'trajet prévu': 'expected path',
    '📡 PLACER': '📡 PLACE', '✂️ LARGUER': '✂️ DROP', '🔥 POUSSER': '🔥 PUSH',
    'Grand réservoir': 'Big tank', 'Petit réservoir': 'Small tank',
    'tôt': 'early', 'tard →': 'late →', 'force ↑': 'force ↑',
    "Chaque point est un essai : <b style='color:#5ee08a'>vert</b> = Terre sauvée, <b style='color:#ff8a7a'>rouge</b> = astéroïde tombé. Le cercle blanc avance pendant que l'astéroïde approche : c'est <b>maintenant</b>, avec la force choisie.": "Each dot is one try: <b style='color:#5ee08a'>green</b> = Earth saved, <b style='color:#ff8a7a'>red</b> = asteroid hit. The white circle moves while the asteroid comes closer: it shows <b>now</b>, with the chosen force.",
    ' — sauras-tu le sauver avec une poussée encore plus petite ?': ' — can you save it with an even smaller push?',
    "🪂 Bienvenue sur Terre ! La capsule a freiné dans l'air sans trop chauffer, et les parachutes se sont ouverts.": '🪂 Welcome back to Earth! The capsule slowed down in the air without getting too hot, and the parachutes opened.',
    "<b>Trop raide !</b> La capsule a plongé trop vite dans l'air : elle a freiné trop fort d'un coup et <b>trop chauffé</b> 🔥. Rends l'angle un peu plus <b>à plat</b>.": '<b>Too steep!</b> The capsule dived into the air too fast: it braked too hard all at once and <b>got too hot</b> 🔥. Make the angle a bit <b>flatter</b>.',
    "<b>Ricochet !</b> La capsule est arrivée <b>trop à plat</b> : elle a rebondi sur l'air et repart dans l'espace. Rends l'angle un peu plus <b>raide</b>.": '<b>Bounced off!</b> The capsule arrived <b>too flat</b>: it bounced off the air and is heading back into space. Make the angle a bit <b>steeper</b>.',
    "La capsule n'a même pas touché l'air : elle est passée à côté de la Terre ! Rends l'angle plus <b>raide</b>.": "The capsule didn't even touch the air: it went right past the Earth! Make the angle <b>steeper</b>.",
    "Le satellite tourne <b>plus vite</b> que la Terre : il part <b>devant</b> la ville. Place-le <b>plus haut</b>.": 'The satellite goes around <b>faster</b> than the Earth turns: it gets <b>ahead</b> of the city. Place it <b>higher</b>.',
    "La Terre tourne <b>plus vite</b> que le satellite : la ville le <b>dépasse</b>. Place-le <b>plus bas</b>.": 'The Earth turns <b>faster</b> than the satellite goes around: the city <b>overtakes</b> it. Place it <b>lower</b>.',
    "📡 Parfait ! Le satellite tourne exactement aussi vite que la Terre : il reste au-dessus de la ville.": '📡 Perfect! The satellite goes around exactly as fast as the Earth turns: it stays above the city.',
    'Le satellite est tombé sur la Terre !': 'The satellite fell onto the Earth!',
    "🧨 Bien joué ! Sans le réservoir vide, la fusée était plus légère : elle est montée jusqu'à la zone verte.": '🧨 Well done! Without the empty tank, the rocket was lighter: it climbed all the way to the green zone.',
    'Trop haut ! Tu as dépassé la zone verte.': 'Too high! You went past the green zone.',
    "Tu n'as pas largué le grand réservoir : la fusée a traîné ce <b>poids mort</b> jusqu'au bout. Appuie sur <b>LARGUER</b> pendant le vol !": "You didn't drop the big tank: the rocket dragged that <b>dead weight</b> all the way. Press <b>DROP</b> during the flight!",
    "<b>Trop tôt !</b> Il restait du carburant dans le grand réservoir quand tu l'as largué : tu as jeté de quoi pousser ! Attends qu'il soit <b>vide</b>.": "<b>Too early!</b> There was still fuel in the big tank when you dropped it: you threw away some push! Wait until it's <b>empty</b>.",
    "<b>Trop tard !</b> Le grand réservoir était vide depuis un moment : la fusée a traîné ce <b>poids mort</b> pour rien. Largue-le <b>dès qu'il est vide</b>.": '<b>Too late!</b> The big tank had been empty for a while: the rocket dragged that <b>dead weight</b> for nothing. Drop it <b>as soon as it is empty</b>.',
    "🛑 Freinage réussi ! En passant devant la planète, tu as ralenti : la station t'a attrapé.": '🛑 Braking done! Passing in front of the planet slowed you down: the station caught you.',
    "<b>Trop tôt !</b> La planète était encore loin : elle ne t'a presque pas tiré. Décolle plus tard.": "<b>Too early!</b> The planet was still far away: it hardly pulled you at all. Launch later.",
    "<b>Trop tard !</b> La planète était déjà passée : elle ne t'a presque pas tiré. Décolle plus tôt.": '<b>Too late!</b> The planet had already gone by: it hardly pulled you at all. Launch earlier.',
    "Tu es passé <b>derrière</b> la planète : elle t'a <b>accéléré</b> et emporté vers la droite ! Ici, il faut freiner. Décolle <b>plus tôt</b>.": 'You passed <b>behind</b> the planet: it <b>sped you up</b> and carried you off to the right! Here you need to slow down. Launch <b>earlier</b>.',
    "Bien, tu es passé <b>devant</b> la planète ! Mais trop loin : elle ne t'a pas assez freiné. Décolle <b>un peu plus tard</b>.": "Good, you passed <b>in front of</b> the planet! But too far away: it didn't slow you down enough. Launch <b>a little later</b>.",
    "Bien, tu es passé <b>devant</b> ! Mais trop près : elle t'a tellement tiré que tu es reparti vers le bas. Décolle <b>un tout petit peu plus tôt</b>.": 'Good, you passed <b>in front</b>! But too close: it pulled you so hard that you went back down. Launch <b>a tiny bit earlier</b>.',
    "Presque ! Tu es passé devant la planète, mais tu as raté la station de peu. Essaie un moment très légèrement différent.": 'Almost! You passed in front of the planet, but just missed the station. Try a very slightly different moment.',
    "Trop près ! Tu t'es écrasé sur la planète géante. Décolle <b>un peu plus tôt</b>.": 'Too close! You crashed into the giant planet. Launch <b>a little earlier</b>.',
    "Boum ! Tu n'as pas poussé l'astéroïde : il a foncé tout droit sur la Terre. Appuie sur <b>POUSSER</b> pendant qu'il arrive !": "Boom! You didn't push the asteroid: it went straight into the Earth. Press <b>PUSH</b> while it's coming!",
    "Boum ! Tu as poussé <b>trop tard</b> : même avec une grosse poussée, l'astéroïde n'avait plus le temps de s'écarter. Pousse <b>plus tôt</b> !": "Boom! You pushed <b>too late</b>: even with a big push, the asteroid didn't have time to move aside. Push <b>earlier</b>!",
    "Boum ! La poussée n'était <b>pas assez forte</b> pour l'écarter de la Terre. Pousse un peu plus fort… ou encore plus tôt !": "Boom! The push <b>wasn't strong enough</b> to move it away from the Earth. Push a bit harder… or even earlier!",
    "🌍 Sauvé ! Une <b>toute petite</b> poussée a suffi : l'astéroïde passe à côté de la Terre.": '🌍 Saved! A <b>tiny</b> push was enough: the asteroid goes past the Earth.',
    "🌍 Sauvé ! L'astéroïde passe à côté de la Terre.": '🌍 Saved! The asteroid goes past the Earth.',

    'Boum !': 'Boom!',
  },
};
