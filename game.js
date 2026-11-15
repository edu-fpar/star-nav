/* Star Nav — petit jeu de navigation spatiale par essais / erreurs.
   La physique se fait dans un plan (x, y) ; l'affichage 3D place ce plan à l'horizontale :
   physique (x, y)  ->  Three.js (x, 0, -y).  */
(() => {
'use strict';
if (typeof THREE === 'undefined') { document.getElementById('loadError').classList.remove('hidden'); return; }

const $ = s => document.querySelector(s);
const TAU = Math.PI * 2;
const GM_EARTH = 40, R_EARTH = 2;
const KPOW = 0.075;          // puissance (0..100) -> vitesse au décollage pour une masse 1
const H = 0.002;             // pas de calcul de la physique

/* ------------------------------------------------------------------ langues (fr / en)
   Le français est écrit directement dans le code ; i18n.js fournit la traduction anglaise :
   - EN.msgs  : « phrase française » -> « English sentence » (traduit au moment de l'affichage)
   - EN.levels: textes des niveaux, dans le même ordre que LEVELS */
const EN = window.STARNAV_EN || { levels: [], msgs: {} };
function detectLang() {
  const u = location.hash + ' ' + location.search;
  if (/lang=en|level[-=_]?\d/i.test(u)) return 'en';
  if (/lang=fr|niveau[-=_]?\d/i.test(u)) return 'fr';
  try { const s = JSON.parse(localStorage.getItem('starnav.lang')); if (s === 'en' || s === 'fr') return s; } catch (e) { /* rien */ }
  return /^fr/i.test(navigator.language || 'fr') ? 'fr' : 'en';
}
let LANG = detectLang();
const missing = new Set();
function tr(s) {
  if (LANG !== 'en' || typeof s !== 'string' || !s) return s;
  const t = EN.msgs[s];
  if (t != null) return t;
  if (/[éèàùçêâîôûœ«]/.test(s) && !missing.has(s)) { missing.add(s); console.warn('[i18n] à traduire :', s); }
  return s;
}

/* ------------------------------------------------------------------ niveaux */
const LEVELS = [
  { kind: 'vertical', icon: '🚀', title: 'Le grand saut', short: 'Régler la puissance',
    mission: "Envoie la capsule vers le haut. Elle doit <b class=g>s'arrêter de monter dans la zone verte</b> : là, la station pourra l'attraper.",
    mass: 1, zone: [4.5, 6.5], speed: 1.4, cam: { c: [0, 3.2], d: 17, el: 0.9 },
    discover: "Plus tu pousses fort, plus la capsule monte haut. Mais la Terre la tire toujours vers le bas : c'est la <b>gravité</b>. Elle ralentit, s'arrête… et retombe.<br><br>Et as-tu essayé de pousser <b>vraiment très fort</b> ? À partir d'une certaine vitesse, la Terre n'arrive plus à la retenir : la capsule s'échappe pour toujours !" },
  { kind: 'vertical', icon: '📦', title: 'Une capsule plus lourde', short: 'Le poids change tout',
    mission: "Même mission, mais cette fois la capsule transporte des <b class=o>caisses de ravitaillement</b>. Elle est plus lourde !",
    mass: 1.3, zone: [4.5, 6.5], speed: 1.4, cam: { c: [0, 3.2], d: 17, el: 0.9 },
    discover: "Avec le même coup de pouce, un objet lourd bouge moins vite qu'un objet léger. Pour monter aussi haut, la capsule chargée a besoin de <b>plus de puissance</b>.<br><br>C'est pour ça que les vraies fusées sont énormes : il faut beaucoup de force pour emporter du poids." },
  { kind: 'orbit', icon: '🛰️', title: 'Faire le tour de la Terre', short: 'Mettre un satellite en orbite',
    mission: "Depuis le sommet de la montagne, lance le satellite <b class=s>de côté</b>. Il doit <b class=g>faire un tour complet</b> de la Terre sans retomber.",
    speed: 1.2, cam: { c: [0, 0.5], d: 19, el: 1.1 },
    discover: "Un satellite ne flotte pas : il <b>tombe tout le temps</b> ! Mais il file si vite de côté que la Terre, qui est ronde, « se dérobe » sous lui. Il tombe… autour de la Terre, sans jamais la toucher.<br><br>Pas assez vite : il retombe. Trop vite : il s'en va. Entre les deux, il tourne — parfois en rond, parfois en ovale." },
  { kind: 'moon', icon: '🌙', title: 'Rendez-vous avec la Lune', short: 'Partir au bon moment',
    mission: "La fusée a la bonne puissance pour monter jusqu'à l'orbite de la Lune. Mais la Lune <b class=s>bouge</b> ! Choisis le <b class=g>bon moment</b> pour décoller et la rejoindre.",
    speed: 1.2, cam: { c: [0, 1], d: 31, el: 1.15 }, timing: true,
    hint: "💡 Regarde la <b>Lune fantôme</b> : c'est là qu'était la Lune quand ta fusée est arrivée en haut.",
    discover: "Pendant que ta fusée voyage, la Lune continue d'avancer. Il ne faut pas viser l'endroit où <b>est</b> la Lune, mais l'endroit où elle <b>sera</b> quand tu arriveras.<br><br>C'est comme lancer un ballon à un ami qui court : tu lances devant lui !" },
  { kind: 'sling', icon: '🪐', title: "L'effet catapulte", short: 'Se faire lancer par une planète',
    mission: "La station lointaine est <b class=o>trop loin</b> pour ta fusée ! Mais une planète géante passe… Décolle au bon moment pour qu'elle t'<b class=g>emporte</b> jusqu'à la station.",
    speed: 0.8, cam: { c: [3, 9.5], d: 54, el: 1.2 }, timing: true,
    hint: "💡 Essaie de passer juste <b>derrière</b> la planète (du côté d'où elle vient), très près, mais sans la toucher. Le bouton 🐢 Ralenti peut t'aider !",
    discover: "En passant juste derrière une planète qui avance, ta fusée se fait « tirer » et <b>emporter</b> avec elle : elle gagne de la vitesse sans dépenser de carburant !<br><br>Les vraies sondes spatiales utilisent cette astuce pour aller très loin dans le système solaire. Mais attention : passer devant la planète, ça freine." },

  /* ---------- partie 2 : naviguer en orbite ---------- */
  { kind: 'reentry', icon: '🌊', title: 'Retour sur Terre', short: 'Freiner au bon moment', part: 'Partie 2 — Naviguer dans l\'espace',
    mission: "Ta capsule tourne autour de la Terre. Pour rentrer, il faut <b class=o>freiner</b> ! Choisis le moment pour qu'elle tombe dans la <b class=g>zone verte</b>, en pleine mer.",
    start: { r: 3.2, a: -Math.PI / 2 }, brake: 0.8, zoneA: Math.PI / 2, zoneW: 0.38,
    speed: 0.7, cam: { c: [0, 0], d: 15, el: 1.15 }, control: 'timing', btn: '🔥 FREINER', keepSim: false,
    timingText: "⏱️ Ta capsule fait le tour de la Terre. Appuie sur <b>FREINER</b> au bon moment !",
    hint: "💡 Regarde le <b>point orange</b> (là où tu as freiné) et l'endroit où tu es tombé : la capsule touche la mer <b>loin après</b> l'endroit où on freine.",
    discover: "Pour redescendre, on ne pique pas vers la Terre : on <b>freine</b> ! En allant moins vite, la capsule ne « tombe plus à côté » de la Terre : elle tombe dessus.<br><br>Mais elle continue d'avancer en tombant : elle touche la mer <b>bien plus loin</b> que l'endroit où on a freiné. Il faut donc freiner très en avance — c'est ce que calculent les ingénieurs pour faire amerrir les capsules au bon endroit." },
  { kind: 'chase', icon: '🏃', title: 'Rattraper la station', short: 'Le paradoxe de la poursuite',
    mission: "La <b class=s>station</b> tourne sur la même orbite que toi, mais <b>devant</b>. Donne <b>un seul</b> coup de moteur pour la rattraper en un tour. Accélérer ? Freiner ? À toi de voir…",
    start: { r: 4, a: -Math.PI / 2 }, lead: Math.PI / 2,
    speed: 1.2, cam: { c: [0, 0], d: 19, el: 1.15 }, control: 'push', btn: '🔥 ALLUMER', keepSim: true,
    hint: "💡 Et si, au lieu d'accélérer, tu essayais de <b>freiner</b> ? (curseur vers la gauche)",
    discover: "Surprise : en orbite, pour rattraper quelqu'un qui est devant… il faut <b>freiner</b> !<br><br>En freinant, tu descends sur un tour <b>plus petit</b>, et un petit tour se fait plus vite : tu gagnes du terrain. En accélérant, tu montes sur un <b>grand</b> tour, plus long : tu prends du retard. Les astronautes qui rejoignent une station spatiale doivent penser à l'envers comme ça !" },
  { kind: 'hohmann', icon: '🪜', title: "Monter d'un étage", short: 'Deux coups de moteur',
    mission: "Fais monter ta fusée jusqu'à l'<b class=g>orbite verte</b>, et reste-y ! Tu as <b>deux coups de moteur</b> : le 1er quand tu veux… le 2e au bon moment.",
    start: { r: 2.8, a: -Math.PI / 2 }, band: [6.0, 8.0], dv1: 0.738, dv2: 0.583, stars: true,
    speed: 1.2, cam: { c: [0, 0], d: 26, el: 1.15 }, control: 'timing', btn: '🔥 ALLUMER', keepSim: true,
    timingText: "⏱️ 1er coup de moteur : quand tu veux. 2e coup : au <b>bon moment</b> !",
    hint: "💡 Donne le 2e coup tout <b>en haut de l'ovale</b>, au moment où la fusée arrête de s'éloigner de la Terre.",
    discover: "Pour changer d'étage, il faut <b>deux coups de moteur</b> : le premier fait partir la fusée sur un grand ovale, et le second, donné tout en haut, l'empêche de redescendre.<br><br>Un coup de moteur donné à un endroit change surtout l'orbite <b>de l'autre côté</b> de la Terre. C'est ainsi qu'on place les satellites très haut." },
  { kind: 'lander', icon: '🛬', title: 'Atterrir en douceur', short: 'Freiner contre la gravité', stars: true,
    mission: "Pose la fusée sur la Lune <b class=g>tout doucement</b>. Garde le bouton <b class=o>MOTEUR</b> appuyé pour freiner la chute… mais attention au carburant !",
    speed: 0.85, cam: { c: [0, 3], d: 29, el: 1.38 }, control: 'hold',
    hint: "💡 Laisse d'abord tomber la fusée, puis allume le moteur <b>bien avant</b> le sol et garde-le allumé. Tu peux aussi donner des petits coups.",
    discover: "Une fusée ne s'arrête pas net : elle continue sur son <b>élan</b>. Pour se poser en douceur, il faut commencer à freiner <b>bien avant</b> le sol.<br><br>Quand le moteur pousse plus fort que la gravité, la chute ralentit. Quand il s'éteint, la gravité reprend le dessus et la fusée accélère à nouveau vers le sol." },
  { kind: 'mars', icon: '🔴', title: 'Cap sur Mars', short: 'La fenêtre de tir',
    mission: "La Terre et Mars tournent autour du <b class=o>Soleil</b>. Décolle au <b class=g>bon moment</b> pour que ta fusée retrouve Mars au bout de son voyage.",
    speed: 0.8, cam: { c: [0, 0], d: 27, el: 1.2 }, control: 'timing',
    timingText: "⏱️ La fusée suit la Terre. Appuie sur LANCER au <b>bon moment</b> !",
    hint: "💡 Le voyage est long : pars quand Mars est <b>un peu devant</b> la Terre… mais pas trop. Et si tu rates le moment, il faut attendre que la Terre rattrape Mars !",
    discover: "La Terre tourne plus vite que Mars autour du Soleil. Le bon moment pour partir — la <b>fenêtre de tir</b> — ne revient qu'une fois de temps en temps. Si on le rate, il faut attendre que la Terre refasse presque un tour !<br><br>Pour les vraies missions vers Mars, la fenêtre de tir ne s'ouvre qu'environ <b>tous les deux ans</b>." },

  /* ---------- partie 3 : lire les graphiques ---------- */
  { kind: 'vertical', icon: '📈', title: 'Dessiner le voyage', short: 'Lire un graphique', part: 'Partie 3 — Lire les graphiques',
    mission: "Pendant le vol, le <b class=s>graphique</b> dessine le voyage : plus le trait est <b>haut</b>, plus la capsule est <b>loin</b> de la Terre. Le temps avance vers la <b>droite</b>. Fais toucher la <b class=g>bande verte</b> au sommet de la courbe !",
    mass: 1, zone: [4.5, 6.5], speed: 1.0, cam: { c: [-2.5, 3.2], d: 17, el: 0.9 }, graph: 'height', beads: true,
    gx: 6, gy: 8,
    discover: "Un graphique, c'est un <b>dessin du voyage dans le temps</b>. On lit de gauche à droite, comme un livre : à chaque instant, la hauteur du trait montre où se trouvait la capsule.<br><br>Les petites perles de couleur sont les mêmes dans l'espace et sur le graphique : la perle bleue, c'est le début, la perle rose, la fin. Le sommet de la « colline », c'est le moment où la capsule s'arrête de monter." },
  { kind: 'orbit', icon: '〰️', title: "La vague de l'orbite", short: 'Une orbite dessine une vague',
    mission: "Lance le satellite autour de la Terre. Cette fois, la cible n'est visible <b>que sur le graphique</b> : le haut de ta <b class=s>vague</b> doit toucher la <b class=g>bande verte</b>.",
    speed: 1.2, cam: { c: [-1.5, 0.5], d: 21, el: 1.1 }, graph: 'height', beads: true, apoBand: [5.3, 6.7], vRange: [3.6, 5.2],
    gx: 20, gy: 10, keepSim: true,
    hint: "💡 Sur le graphique, le haut de la vague, c'est quand le satellite est le plus <b>loin</b> de la Terre. Pour une vague plus haute… lance plus fort !",
    discover: "Quand un satellite tourne sur un ovale, il s'éloigne puis se rapproche de la Terre, encore et encore. Dessiné dans le temps, ça fait une <b>vague</b> qui se répète à chaque tour !<br><br>Plus l'ovale est allongé, plus la vague est haute. Et une orbite toute ronde ? Le satellite reste toujours à la même hauteur : la vague devient une <b>ligne plate</b>." },
  { kind: 'track', icon: '🗺️', title: 'La trace sur la carte', short: 'La vague des cartes de l\'espace',
    mission: "Le satellite tourne autour de la Terre sur une orbite <b class=s>penchée</b>. Sur la carte, il dessine une <b>vague</b> ! Penche l'orbite pour que le haut de la vague passe à la hauteur de la <b class=o>ville ★</b>.",
    speed: 1.0, cam: { c: [0, 0], d: 11, el: 0.42, az: 0.5 }, graph: 'map', city: { lat: 50, u: 0.62 },
    s1: { title: "📐 Penche de l'orbite", l: 'à plat', r: 'très penchée', words: ['à plat', 'un peu penchée', 'penchée', 'bien penchée', 'très penchée'], def: 15 },
    hint: "💡 Plus l'orbite est penchée, plus la vague de la carte monte haut vers le nord (et descend bas vers le sud).",
    discover: "Une orbite penchée, vue sur une carte à plat, dessine une <b>vague</b> : le satellite passe au-dessus de l'hémisphère nord, puis de l'hémisphère sud, puis remonte… C'est cette vague qu'on voit sur les cartes des missions spatiales !<br><br>Plus l'orbite est penchée, plus la vague est haute. Et comme la Terre tourne en dessous, chaque nouvelle vague est <b>décalée</b> : au fil des tours, le satellite finit par survoler presque toute la planète." },

  /* ---------- partie 4 : plusieurs réglages ---------- */
  { kind: 'fuel', icon: '⛽', title: 'Le plein de carburant', short: 'Le carburant, ça pèse lourd !', part: 'Partie 4 — Plusieurs réglages',
    mission: "Depuis la base lunaire, choisis <b class=o>combien de carburant</b> emporter pour atteindre la <b class=g>zone verte</b>. Plus de carburant, ça pousse plus longtemps… mais ça pèse aussi plus lourd !",
    zone: [4.5, 6.5], gm: 8, speed: 1.2, cam: { c: [0, 3.2], d: 17, el: 0.9 }, F: 3.2, q: 0.5, fmax: 1.2,
    s1: { title: '⛽ Carburant', l: 'réservoir vide', r: 'réservoir plein', words: ['presque rien', 'un peu', 'la moitié', 'beaucoup', 'plein à ras bord'], def: 30 },
    hint: "💡 Si la fusée ne décolle pas du tout avec beaucoup de carburant, c'est qu'elle est devenue <b>trop lourde</b> pour son moteur.",
    discover: "Le carburant fait avancer la fusée… mais il faut aussi le soulever ! Chaque goutte en plus rend la fusée plus lourde au départ.<br><br>Au début, ajouter du carburant aide beaucoup. Puis de moins en moins. Et à la fin, la fusée devient si lourde que son moteur n'arrive même plus à la soulever. Les ingénieurs cherchent toujours le <b>juste milieu</b>." },
  { kind: 'crew', icon: '👩‍🚀', title: 'Des astronautes à bord', short: 'Deux réglages : force et durée',
    mission: "Cette fois, il y a des <b class=s>astronautes</b> ! Une poussée trop forte les écrase (regarde leur visage). Règle la <b>force</b> du moteur et la <b>durée</b> de la poussée pour atteindre la <b class=g>zone verte</b> sans les faire souffrir.",
    zone: [3.5, 5.0], gm: 8, speed: 1.2, cam: { c: [-2.5, 3.0], d: 16, el: 0.9 }, graph: 'log', gLimit: 3.6,
    s1: { title: '💪 Force du moteur', l: 'douce', r: 'très forte', words: ['très douce', 'douce', 'moyenne', 'forte', 'très forte'], def: 70 },
    s2: { title: '⏱️ Durée de la poussée', l: 'très courte', r: 'très longue', words: ['très courte', 'courte', 'moyenne', 'longue', 'très longue'], def: 20 },
    hint: "💡 Commence par choisir une force qui ne fait pas grimacer les astronautes. Ensuite, change seulement la <b>durée</b>. Le carnet de bord t'aide à voir ce que tu as déjà essayé.",
    discover: "On peut monter aussi haut avec une poussée <b>courte et très forte</b>, ou <b>douce et longue</b>. Les fusées sans personne à bord (cargos, sondes) peuvent pousser très fort. Mais avec des humains, il faut pousser plus doucement, plus longtemps.<br><br>Et as-tu remarqué le <b>carnet de bord</b> ? Chaque point est un essai : on voit apparaître une zone « interdite » (trop fort pour les astronautes) et une bande où ça marche. Lire ce genre de dessin, c'est exactement ce que font les ingénieurs !" },

  /* ---------- partie 5 : nouveaux défis ---------- */
  { kind: 'track', icon: '📍', title: 'Survoler la ville', short: 'Pencher + choisir le moment', part: 'Partie 5 — Nouveaux défis',
    mission: "Cette fois, le satellite doit passer <b>juste au-dessus</b> de la <b class=o>ville ★</b>. Deux réglages : la <b>penche</b> de l'orbite… et le <b>moment</b> du départ, car la Terre tourne !",
    speed: 1.0, cam: { c: [0, 0], d: 11, el: 0.42, az: 0.5 }, graph: 'map', city: { lat: 40, u: 0.62 }, overfly: true, laps: 1, overR: 3,
    s1: { title: "📐 Penche de l'orbite", l: 'à plat', r: 'très penchée', words: ['à plat', 'un peu penchée', 'penchée', 'bien penchée', 'très penchée'], def: 15 },
    hint: "💡 D'abord, penche l'orbite pour que la vague monte <b>au moins</b> jusqu'à la ville. Ensuite, si la trace passe à côté, change seulement le <b>moment</b> du départ pour décaler la vague.",
    discover: "Pour survoler un endroit précis, il faut <b>deux réglages</b> : la penche de l'orbite (jusqu'où la vague monte) et le moment du départ (où la vague tombe sur la carte).<br><br>Comme la Terre tourne sous le satellite, attendre un peu <b>décale</b> toute la vague. C'est ainsi qu'on choisit l'heure de lancement des satellites d'observation." },
  { kind: 'sling', icon: '☄️', title: 'La catapulte perturbée', short: 'Une deuxième planète passe…',
    mission: "Même catapulte qu'avant… mais une <b class=s>petite planète bleue</b> traverse aussi le chemin ! Son attraction peut te <b>dévier</b>. Choisis bien ton moment : la géante doit t'emporter, et la bleue ne doit pas te gêner.",
    speed: 0.8, cam: { c: [5, 11], d: 58, el: 1.2 }, timing: true, perturb: { y: 18, u: -76 / 36, gm: 16, r: 1.0, x0: 31, xmin: -30, xmax: 46 },
    hint: "💡 Le bon moment pour la géante revient régulièrement. Regarde aussi où sera la <b>planète bleue</b> quand ta fusée traversera sa route : attends un passage où elle est loin.",
    discover: "Dans l'espace, <b>tout attire tout</b> : chaque planète tire sur ta fusée, même de loin. Plus il y a d'astres, plus le chemin devient compliqué à prévoir.<br><br>Les ingénieurs doivent tenir compte de toutes les planètes à la fois. Parfois une planète gêne… et parfois, elle aide !" },

  /* ---------- partie 6 : vers le problème à trois corps ---------- */
  { kind: 'balance', icon: '⚖️', title: "Le point d'équilibre", short: 'Le tir à la corde de la gravité', part: 'Partie 6 — Vers le problème à trois corps',
    mission: "La Terre et la Lune tirent toutes les deux sur le vaisseau, comme au <b>tir à la corde</b>. Place-le à l'endroit où les deux forces sont <b class=g>égales</b> : quand tu le lâches, il doit <b>rester immobile</b>.",
    speed: 1.0, cam: { c: [5, 0], d: 17, el: 1.2 }, btn: '✋ LÂCHER', keepSim: true, moonX: 10, moonGM: 2.5, xRange: [5.5, 9.3], hold: 1.8,
    s1: { title: '↔ Position du vaisseau', l: '⬅ vers la Terre', r: 'vers la Lune ➡', words: ['tout près de la Terre', 'côté Terre', 'au milieu', 'côté Lune', 'tout près de la Lune'], def: 30 },
    hint: "💡 Regarde les deux <b>flèches</b> : la bleue montre la force de la Terre, la grise celle de la Lune. Cherche l'endroit où elles ont la <b>même longueur</b>.",
    discover: "Entre deux astres, il existe un point où leurs attractions s'équilibrent. Comme la Lune est plus petite, ce point est <b>tout près de la Lune</b> !<br><br>Mais l'équilibre est fragile : un tout petit écart, et un des deux gagne. Ces points existent vraiment : on les appelle les <b>points de Lagrange</b>, et on y installe des télescopes spatiaux." },
  { kind: 'free', icon: '♾️', title: 'Le grand huit', short: 'Faire le tour de la Lune et revenir', speed: 1.4,
    mission: "Lance la fusée pour qu'elle <b>contourne la Lune</b> et <b class=g>revienne vers la Terre</b> toute seule, sans rallumer le moteur. Sa trajectoire dessinera un grand <b>8</b> !",
    cam: { c: [4.5, 0], d: 25, el: 1.2 }, moonX: 10, moonGM: 2.5, vRange: [5.2, 5.8], def: 10,
    hint: "💡 Pour faire demi-tour, la fusée doit passer <b>derrière</b> la Lune, assez près pour être bien tirée… sans s'écraser dessus.",
    discover: "La Lune peut servir de <b>demi-tour gratuit</b> ! En passant derrière elle, la fusée est tirée et renvoyée vers la Terre, sans carburant.<br><br>C'est le « retour libre », la trajectoire en 8 qu'on choisit pour les voyages vers la Lune : si le moteur tombe en panne, l'équipage rentre quand même à la maison. Et as-tu vu ? Avec un tout petit peu plus de puissance, la fusée se met à tourner entre la Terre et la Lune de façon très compliquée…" },
  { kind: 'binary', icon: '✨', title: 'Deux soleils', short: 'Le problème à trois corps',
    mission: "Deux soleils tournent l'un autour de l'autre. Lance ton vaisseau pour qu'il fasse <b class=g>un tour complet</b> du système sans s'écraser ni être éjecté. Un <b class=s>vaisseau jumeau</b> (violet) part en même temps, à peine plus vite…",
    speed: 2.0, cam: { c: [0, 0], d: 34, el: 1.2 }, R0: 9, starA: 1.5, starGM: 20, vRange: [0.8, 3.2], keepSim: true, def: 10,
    hint: "💡 Près des deux soleils, tout devient imprévisible. Loin d'eux, ils tirent presque comme <b>un seul</b> gros soleil…",
    discover: "Avec deux corps (une planète et un soleil), le chemin est simple et se répète. Avec <b>trois corps</b>, il devient souvent <b>imprévisible</b> : regarde le jumeau, parti presque pareil, qui finit tout autrement ! C'est le célèbre <b>problème à trois corps</b>.<br><br>Mais loin des deux soleils, ils tirent presque comme un seul : l'orbite redevient calme. Les ingénieurs ne peuvent pas résoudre ce problème avec une formule : comme toi, ils calculent pas à pas, essai après essai." },

  /* ---------- partie 7 : missions spéciales ---------- */
  { kind: 'skip', icon: '🏓', title: "Le ricochet sur l'air", short: "L'angle du retour", part: 'Partie 7 — Missions spéciales',
    mission: "La capsule revient de la Lune, <b>très vite</b> ! Choisis l'<b>angle</b> de son arrivée : elle doit traverser l'<b class=s>air</b> pour freiner, sans <b class=o>trop chauffer</b>, et se poser sur Terre.",
    speed: 0.9, cam: { c: [-1.5, 1.5], d: 21, el: 1.2 }, r0: 9, v0: 3.2, a0: 2.2, atm: 3.0, Hs: 0.22, kd: 0.6, rpRange: [3.0, 1.4], heatMax: 8.5, keepSim: true,
    s1: { title: "📐 Angle d'arrivée", l: 'à plat', r: 'très raide', words: ['tout à plat', 'à plat', 'en pente douce', 'raide', 'très raide'], def: 15 },
    hint: "💡 Le ricochet, c'est quand l'angle est <b>trop à plat</b>. Les flammes, quand il est <b>trop raide</b>. Cherche le <b>couloir</b> entre les deux, en bougeant le curseur petit à petit.",
    discover: "Pour revenir de l'espace, une capsule utilise l'<b>air</b> comme un frein : en le traversant, elle ralentit… et elle chauffe énormément.<br><br>Il faut arriver avec le bon angle. Trop à plat, la capsule <b>rebondit</b> sur l'air comme un galet sur l'eau et repart dans l'espace. Trop raide, elle freine trop fort d'un coup et <b>brûle</b>. Entre les deux, il y a un <b>couloir</b> étroit : c'est celui que visaient les astronautes qui revenaient de la Lune." },
  { kind: 'geo', icon: '📡', title: 'Le satellite immobile', short: 'Tourner avec la Terre',
    mission: "Place le satellite de télévision pour qu'il reste <b>toujours au-dessus</b> de la <b class=o>ville ★</b>, pendant que la Terre tourne. Choisis sa <b>hauteur</b>.",
    speed: 1.6, cam: { c: [0, 0], d: 25, el: 1.25 }, rRange: [3, 10], wE: 0.43, tol: 0.26, btn: '📡 PLACER', keepSim: true,
    s1: { title: '⬆️ Hauteur du satellite', l: 'tout bas', r: 'très haut', words: ['tout bas', 'bas', 'moyen', 'haut', 'très haut'], def: 20 },
    hint: "💡 Regarde qui gagne la course : si le satellite part <b>devant</b> la ville, place-le plus <b>haut</b>. Si la ville le <b>dépasse</b>, place-le plus <b>bas</b>.",
    discover: "Plus un satellite est <b>haut</b>, plus il met de temps à faire le tour de la Terre. Tout près, un tour prend une heure et demie. Très loin, comme la Lune, un mois !<br><br>Entre les deux, il existe une hauteur magique où le satellite fait son tour en <b>une journée</b>, exactement comme la Terre tourne sur elle-même. Vu d'en bas, il semble <b>immobile</b> dans le ciel : c'est pour ça qu'on peut fixer une antenne de télévision vers lui une fois pour toutes." },
  { kind: 'stage', icon: '🧨', title: 'La fusée à étages', short: 'Larguer le poids inutile',
    mission: "Ta fusée a un <b class=o>grand réservoir</b> (orange) et un petit. Pendant le vol, appuie sur <b>LARGUER</b> pour te débarrasser du grand réservoir. Atteins la <b class=g>zone verte</b> !",
    zone: [4.9, 7.6], gm: 8, speed: 1.2, burnSpeed: 0.28, cam: { c: [0, 3.6], d: 18, el: 0.9 }, F: 7.19, q: 2.5, f1: 1, ms: 0.5, f2: 1, m0: 1, control: 'timing',
    timingText: "⏱️ Appuie sur LANCER, puis sur <b>LARGUER</b> au bon moment pour lâcher le grand réservoir !",
    hint: "💡 Regarde la jauge du <b>grand réservoir</b> : largue-le <b>juste quand il devient vide</b>. Avant, tu jettes du carburant ; après, tu traînes un poids mort.",
    discover: "Un réservoir vide ne sert plus à rien… mais il pèse toujours ! Le moteur doit continuer à le pousser : c'est un <b>poids mort</b>.<br><br>En le larguant dès qu'il est vide, la fusée devient plus légère et le même moteur la fait aller plus vite. C'est pour ça que les vraies fusées sont faites de plusieurs <b>étages</b> qui se détachent les uns après les autres pendant la montée." },
  { kind: 'sling', brake: true, icon: '🛑', title: "La catapulte à l'envers", short: 'Une planète pour freiner',
    mission: "La <b class=g>station</b> est en haut à gauche, mais ta fusée ne sait que monter tout droit, et vite. Utilise la planète géante pour te faire <b class=o>freiner</b> et <b>dévier</b> jusqu'à la station. Choisis le bon moment pour décoller !",
    speed: 0.8, cam: { c: [-4, 8.5], d: 50, el: 1.2 }, timing: true, target: { x: -10.5, y: 14.5, r: 3.2 },
    hint: "💡 Souviens-toi du niveau 5 : passer <b>derrière</b> la planète, ça accélère. Pour freiner, il faut faire… <b>le contraire</b> !",
    discover: "La même planète peut servir d'<b>accélérateur</b> ou de <b>frein</b> ! Derrière elle, elle t'emporte et tu gagnes de la vitesse. Devant elle, elle te tire en arrière et tu en perds.<br><br>Les sondes qui vont vers Mercure, tout près du Soleil, vont beaucoup trop vite pour s'y arrêter : elles passent plusieurs fois devant des planètes pour freiner, sans dépenser de carburant." },
  { kind: 'deflect', icon: '☄️', title: "Dévier l'astéroïde", short: 'Une petite poussée, mais tôt', stars: true,
    mission: "Un <b class=o>astéroïde</b> fonce vers la Terre ! Ta fusée est accrochée dessus. Règle la <b>force</b> de la poussée, puis appuie sur <b>POUSSER</b> au bon moment pour l'écarter.",
    speed: 1.0, cam: { c: [11, 5], d: 38, el: 1.2 }, D: 30, u: 3, a0: 0.5, kf: 2, graph: 'push', btn: '🔥 POUSSER', keepSim: true,
    s1: { title: '💪 Force de la poussée', l: 'toute petite', r: 'énorme', words: ['toute petite', 'petite', 'moyenne', 'grande', 'énorme'], def: 15 },
    hint: "💡 Plus tu pousses <b>tôt</b>, plus l'astéroïde a le temps de s'écarter. Pousse <b>dès le début</b>, puis cherche la plus petite force qui suffit.",
    discover: "Une toute petite poussée donnée <b>tôt</b> suffit à faire rater la Terre à un astéroïde : il a tout le temps de s'écarter, petit à petit. Plus on attend, plus il faut pousser fort… jusqu'à ce que ce soit impossible. Regarde ton carnet de bord : la limite <b>monte</b> vers la droite !<br><br>En 2022, la sonde <b>DART</b> de la NASA s'est écrasée exprès sur un petit astéroïde pour le pousser. Ça a marché : son chemin a changé. C'est pour ça qu'on surveille le ciel : repérer un astéroïde tôt, c'est pouvoir le dévier en douceur." },
];
LEVELS[0].part = 'Partie 1 — Les bases';
LEVELS.forEach(L => { if (!L.control) L.control = L.timing ? 'timing' : 'power'; });
LEVELS[2].keepSim = true; LEVELS[2].stars = true;
// texte d'un niveau dans la langue choisie (titre, mission, découverte, indice, curseurs…)
function lt(L, k) {
  if (LANG === 'en') { const e = EN.levels[LEVELS.indexOf(L)]; if (e && e[k] != null) return e[k]; }
  return L[k];
}

/* ------------------------------------------------------------------ outils */
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const P3 = (x, y, h = 0) => new THREE.Vector3(x, h, -y);
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem('starnav.' + k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem('starnav.' + k, JSON.stringify(v)); } catch (e) { /* rien */ } },
};

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
}
const TEX = {
  earth: () => canvasTex(512, 256, (g, w, h) => {
    const r = rng(7);
    const grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, '#1d4f9a'); grd.addColorStop(.5, '#2a78c9'); grd.addColorStop(1, '#1d4f9a');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) {               // continents
      const cx = r() * w, cy = h * .2 + r() * h * .6, n = 6 + r() * 10;
      g.fillStyle = r() < .7 ? '#3f9a4c' : '#8b7a45';
      for (let j = 0; j < n; j++) { g.beginPath(); g.arc(cx + (r() - .5) * 60, cy + (r() - .5) * 34, 6 + r() * 16, 0, TAU); g.fill(); }
    }
    g.fillStyle = '#eef6ff'; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 14, w, 14);
    g.globalAlpha = .45; g.fillStyle = '#fff';
    for (let i = 0; i < 70; i++) { g.beginPath(); g.ellipse(r() * w, r() * h, 10 + r() * 30, 3 + r() * 5, 0, 0, TAU); g.fill(); }
  }),
  moon: () => canvasTex(256, 128, (g, w, h) => {
    const r = rng(3); g.fillStyle = '#b9bcc4'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { const x = r() * w, y = r() * h, s = 2 + r() * 10; g.fillStyle = `rgba(80,84,96,${.25 + r() * .3})`; g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill(); }
  }),
  giant: () => canvasTex(256, 128, (g, w, h) => {
    const r = rng(11); const cols = ['#e9b878', '#d08a4c', '#f3dcae', '#b8693a', '#e4a868'];
    for (let y = 0; y < h; y += 4 + Math.floor(r() * 8)) { g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(0, y, w, 14); }
    g.fillStyle = 'rgba(170,60,30,.8)'; g.beginPath(); g.ellipse(170, 80, 18, 8, 0, 0, TAU); g.fill();
  }),
  glow: (color) => canvasTex(128, 128, (g, w) => {
    const grd = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    grd.addColorStop(0, color); grd.addColorStop(.35, color.replace(/[\d.]+\)$/, '0.35)')); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, w, w);
  }),
};

/* ------------------------------------------------------------------ scène 3D */
const canvas = $('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05060f);
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000);
scene.add(new THREE.AmbientLight(0xffffff, 0.42));
const sun = new THREE.DirectionalLight(0xfff4e0, 1.05); sun.position.set(-30, 40, 25); scene.add(sun);

(function stars() {
  const r = rng(42), n = 1800, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = r() * 2 - 1, a = r() * TAU, s = Math.sqrt(1 - u * u), R = 500 + r() * 200;
    pos[i * 3] = R * s * Math.cos(a); pos[i * 3 + 1] = R * u; pos[i * 3 + 2] = R * s * Math.sin(a);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false })));
})();

const GLOW_BLUE = TEX.glow('rgba(110,180,255,0.9)');
const GLOW_FIRE = TEX.glow('rgba(255,170,60,1)');
const GLOW_GREEN = TEX.glow('rgba(110,255,160,0.9)');
function sprite(tex, size, opacity = 1) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
  s.scale.set(size, size, 1); return s;
}
function circleLine(radius, color, opacity, cx = 0, cy = 0, dashed = false) {
  const pts = []; for (let i = 0; i <= 128; i++) { const a = i / 128 * TAU; pts.push(P3(cx + radius * Math.cos(a), cy + radius * Math.sin(a))); }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = dashed ? new THREE.LineDashedMaterial({ color, transparent: true, opacity, dashSize: .5, gapSize: .4 })
                     : new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  const l = new THREE.Line(geo, mat); if (dashed) l.computeLineDistances(); return l;
}

function makeRocket() {
  const g = new THREE.Group();
  const white = new THREE.MeshPhongMaterial({ color: 0xf2f4fa, shininess: 60 });
  const red = new THREE.MeshPhongMaterial({ color: 0xe8442e });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.36, 14), white); g.add(body);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.17, 14), red); nose.position.y = 0.265; g.add(nose);
  const win = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), new THREE.MeshPhongMaterial({ color: 0x5fd0ff, emissive: 0x114466 }));
  win.position.set(0, 0.07, 0.085); g.add(win);
  for (let i = 0; i < 3; i++) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.1), red);
    const a = i / 3 * TAU; f.position.set(Math.sin(a) * 0.11, -0.13, Math.cos(a) * 0.11); f.rotation.y = a; g.add(f);
  }
  const cargo = new THREE.Group();
  const crateMat = new THREE.MeshPhongMaterial({ color: 0xa8743a });
  [[-0.13, 0], [0.13, 0], [0, 0.13], [0, -0.13]].forEach(([x, z]) => {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), crateMat); c.position.set(x, -0.02, z); cargo.add(c);
  });
  cargo.visible = false; g.add(cargo);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.32, 12), new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: .9 }));
  flame.rotation.x = Math.PI; flame.position.y = -0.34; flame.visible = false; g.add(flame);
  const fGlow = sprite(GLOW_FIRE, 0.8, .9); fGlow.position.y = -0.38; flame.add(fGlow);
  const heat = sprite(GLOW_FIRE, 1.2, .85); heat.position.y = 0.3; heat.visible = false; g.add(heat);
  // réservoirs latéraux (niveau carburant) : leur taille montre la quantité emportée
  const tank = new THREE.Group(); const tankMat = new THREE.MeshPhongMaterial({ color: 0xff9a3a });
  [-1, 1].forEach(sd => { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 12), tankMat); t.position.set(sd * 0.16, 0.2, 0); t.geometry.translate(0, -0.2, 0); tank.add(t); });
  tank.position.y = -0.05; tank.visible = false; g.add(tank);
  return { group: g, flame, cargo, heat, tank, tankMat };
}

/* ------------------------------------------------------------------ traces */
class Trail {
  constructor(color, max = 7000) {
    this.max = max; this.n = 0; this.pos = new Float32Array(max * 3);
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.geo.setDrawRange(0, 0);
    this.line = new THREE.Line(this.geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 1 }));
    this.line.frustumCulled = false; this.dirty = false;
  }
  push(x, y) {
    if (this.n >= this.max) return;
    const i = this.n * 3; this.pos[i] = x; this.pos[i + 1] = 0.01; this.pos[i + 2] = -y; this.n++; this.dirty = true;
  }
  flush() { if (this.dirty) { this.geo.setDrawRange(0, this.n); this.geo.attributes.position.needsUpdate = true; this.dirty = false; } }
  dispose() { this.geo.dispose(); this.line.material.dispose(); }
}

/* ------------------------------------------------------------------ étiquettes */
const labels = [];
function addLabel(text, color, getPos) {
  const el = document.createElement('div'); el.className = 'lbl'; el.innerHTML = tr(text); el.style.color = color;
  $('#labels').appendChild(el); const L = { el, getPos }; labels.push(L); return L;
}
function clearLabels() { labels.forEach(l => l.el.remove()); labels.length = 0; }
const tmpV = new THREE.Vector3();
function updateLabels() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  for (const L of labels) {
    const p = L.getPos(); if (!p) { L.el.style.display = 'none'; continue; }
    tmpV.copy(p).project(camera);
    if (tmpV.z > 1) { L.el.style.display = 'none'; continue; }
    L.el.style.display = '';
    L.el.style.left = ((tmpV.x + 1) / 2 * w) + 'px'; L.el.style.top = ((1 - tmpV.y) / 2 * h) + 'px';
  }
}

/* ------------------------------------------------------------------ état du jeu */
const rocket = makeRocket(); scene.add(rocket.group);
let levelGroup = new THREE.Group(); scene.add(levelGroup);
let ghostGroup = new THREE.Group(); scene.add(ghostGroup);

const S = {
  li: 0, L: null, state: 'idle',           // idle | flying | ended | success
  ship: { x: 0, y: 0, vx: 0, vy: 0 }, flightT: 0, simT: 0, stepCount: 0,
  trail: null, ghosts: [], attempts: 0, fails: 0, slow: false,
  world: {}, chk: {}, flameT: 0, resetAt: 0, booms: [], lastPower: 0,
};
const earthMat = new THREE.MeshPhongMaterial({ map: TEX.earth(), shininess: 18, specular: 0x223355 });
let earthMesh = null;

function addEarth() {
  earthMesh = new THREE.Mesh(new THREE.SphereGeometry(R_EARTH, 48, 32), earthMat);
  earthMesh.rotation.z = 0.4; levelGroup.add(earthMesh);
  const at = sprite(GLOW_BLUE, R_EARTH * 3.1, .55); levelGroup.add(at);
  addLabel('Terre', '#9fd0ff', () => P3(0, -R_EARTH - 0.2, 0));
}

function bodies() {
  const W = S.world, L = S.L, out = [];
  if (L.kind === 'mars') {
    out.push({ x: 0, y: 0, gm: GM_EARTH, r: 0.9, id: 'sun' });
    out.push({ x: W.mR * Math.cos(W.mA), y: W.mR * Math.sin(W.mA), gm: 0.5, r: 0.3, id: 'mars' }); return out;
  }
  if (L.kind === 'binary') {
    const c = Math.cos(W.binA) * L.starA, sn = Math.sin(W.binA) * L.starA;
    out.push({ x: c, y: sn, gm: L.starGM, r: 0.5, id: 'star1' }, { x: -c, y: -sn, gm: L.starGM, r: 0.5, id: 'star2' });
    return out;
  }
  if (L.kind !== 'sling') out.push({ x: 0, y: 0, gm: L.gm || GM_EARTH, r: R_EARTH, id: 'earth' });
  if (L.kind === 'moon') out.push({ x: W.moonR * Math.cos(W.moonA), y: W.moonR * Math.sin(W.moonA), gm: 1.2, r: 0.6, id: 'moon' });
  if (L.moonX) out.push({ x: L.moonX, y: 0, gm: L.moonGM, r: 0.6, id: 'moon' });
  if (L.kind === 'sling') out.push({ x: W.gx, y: W.gy, gm: 30, r: 1.0, id: 'giant' });
  if (L.perturb) out.push({ x: W.px, y: L.perturb.y, gm: L.perturb.gm, r: L.perturb.r, id: 'blue' });
  return out;
}
function balanceX() { const L = S.L; return L.xRange[0] + (+$('#power').value) / 100 * (L.xRange[1] - L.xRange[0]); }
// ricochet : le curseur choisit le point le plus bas qu'atteindrait la capsule s'il n'y avait pas d'air
function skipStart() {
  const L = S.L, P = +$('#power').value, rp = L.rpRange[0] + P / 100 * (L.rpRange[1] - L.rpRange[0]);
  const vp = Math.sqrt(L.v0 * L.v0 + 2 * GM_EARTH * (1 / rp - 1 / L.r0));
  const g = Math.acos(Math.min(1, rp * vp / (L.r0 * L.v0)));
  const ca = Math.cos(L.a0), sa = Math.sin(L.a0);
  return { rp, x: L.r0 * ca, y: L.r0 * sa,
    vx: L.v0 * (-Math.cos(g) * sa - Math.sin(g) * ca), vy: L.v0 * (Math.cos(g) * ca - Math.sin(g) * sa) };
}
// satellite immobile : hauteur choisie au curseur
function geoR() { const L = S.L; return L.rRange[0] + (+$('#power').value) / 100 * (L.rRange[1] - L.rRange[0]); }
// astéroïde : position de départ, en route droit vers la Terre
function asteroidStart() {
  const L = S.L, c = Math.cos(L.a0), sn = Math.sin(L.a0);
  return { x: L.D * c, y: L.D * sn, vx: -L.u * c, vy: -L.u * sn };
}
function asteroidMoment() { const W = S.world; return Math.min(100, Math.max(0, W.age / W.T0 * 100)); }
// les niveaux où l'on part d'un mouvement déjà en cours (on ne peut pas relancer avant la fin)
const movingStart = L => !!L.start || L.kind === 'deflect';

/* point de départ et direction de la fusée pour chaque niveau */
function padPose() {
  switch (S.L.kind) {
    case 'vertical': return { x: 0, y: R_EARTH + 0.25, dx: 0, dy: 1 };
    case 'orbit': return { x: 0, y: 2.65, dx: 1, dy: 0 };
    case 'moon': return { x: 0, y: -(R_EARTH + 0.25), dx: 1, dy: 0 };
    case 'sling': return { x: 0, y: 0, dx: 0, dy: 1 };
    case 'lander': return { x: 0, y: 14, dx: 0, dy: 1 };
    case 'fuel': case 'crew': case 'stage': return { x: 0, y: R_EARTH + 0.25, dx: 0, dy: 1 };
    case 'skip': { const k = skipStart(); return { x: k.x, y: k.y, dx: k.vx, dy: k.vy }; }
    case 'geo': { const r = geoR(), a = S.world.cityA || 0; return { x: r * Math.cos(a), y: r * Math.sin(a), dx: -Math.sin(a), dy: Math.cos(a) }; }
    case 'track': return { x: 3, y: 0, dx: 0, dy: 1 };
    case 'balance': return { x: balanceX(), y: 0, dx: 0, dy: 1 };
    case 'free': return { x: -(R_EARTH + 0.25), y: 0, dx: 0, dy: -1 };
    case 'binary': return { x: 0, y: -S.L.R0, dx: 1, dy: 0 };
    case 'mars': { const W = S.world; return { x: W.eR * Math.cos(W.eA), y: W.eR * Math.sin(W.eA), dx: -Math.sin(W.eA), dy: Math.cos(W.eA) }; }
  }
}
const UP = new THREE.Vector3(0, 1, 0);
function orientRocket(dx, dy) {
  const d = new THREE.Vector3(dx, 0, -dy); if (d.lengthSq() < 1e-9) return; d.normalize();
  rocket.group.quaternion.setFromUnitVectors(UP, d);
}
/* remet la fusée au départ : sur son pas de tir, ou sur son orbite de départ */
function resetShip() {
  const L = S.L, W = S.world;
  rocket.group.visible = true; rocket.flame.visible = false; rocket.heat.visible = false;
  S.dead = false; S.thrust = false; S.fuel = 1;
  if (L.start) {
    const { r, a } = L.start, v = Math.sqrt(GM_EARTH / r);
    S.ship = { x: r * Math.cos(a), y: r * Math.sin(a), vx: -v * Math.sin(a), vy: v * Math.cos(a) };
    S.state = 'coast'; orientRocket(S.ship.vx, S.ship.vy);
  } else if (L.kind === 'deflect') {          // l'astéroïde arrive déjà : on le pousse en route
    S.ship = asteroidStart(); S.state = 'coast'; W.age = 0;
    if (W.astMesh) W.astMesh.visible = true;
  } else {
    const p = padPose(); S.ship = { x: p.x, y: p.y, vx: 0, vy: 0 };
    S.state = 'idle'; orientRocket(p.dx, p.dy);
  }
  if (L.kind === 'chase') W.stA = L.start.a + L.lead;
  if (L.kind === 'fuel') setTankLevel(+$('#power').value / 100);
  if (L.kind === 'stage') {
    S.st = { a1: L.f1, a2: L.f2, att: true, dropT: null, emptyT: null, dropFuel: 0 };
    rocket.tank.visible = true; setTankLevel(1); rocket.tankMat.color.setHex(0xff9a3a); updateStageGauges();
  }
  rocket.group.position.copy(P3(S.ship.x, S.ship.y));
}

/* ------------------------------------------------------------------ construction des niveaux */
function buildLevel(i) {
  S.li = i; S.L = LEVELS[i]; const L = S.L;
  scene.remove(levelGroup); scene.remove(ghostGroup);
  levelGroup = new THREE.Group(); ghostGroup = new THREE.Group(); scene.add(levelGroup); scene.add(ghostGroup);
  S.ghosts.forEach(g => g.dispose()); S.ghosts = [];
  if (S.trail) { S.trail.dispose(); S.trail = null; }
  clearLabels();
  S.run = (S.run || 0) + 1;
  S.state = 'idle'; S.attempts = 0; S.fails = 0; S.simT = 0; S.world = {}; S.chk = {}; S.booms.forEach(b => scene.remove(b)); S.booms = [];
  $('#ticks').innerHTML = '';
  rocket.cargo.visible = L.mass > 1;
  const sc = { sling: 2.2, moon: 1.4, orbit: 1.15, reentry: 1.1, chase: 1.15, hohmann: 1.3, lander: 2.4, mars: 1.4, track: 0.9, binary: 1.7, free: 1.3, balance: 1.3, skip: 1.1, geo: 1.3, deflect: 1.6 }[L.kind] || 1.35;
  rocket.group.scale.setScalar(sc);
  rocket.tank.visible = L.kind === 'fuel' || L.kind === 'stage';
  rocket.tank.scale.setScalar(L.kind === 'stage' ? 1.7 : 1); rocket.tankMat.color.setHex(0xff9a3a);
  S.curve = null; S.ghostCurves = []; S.log = [];

  if (!['sling', 'lander', 'mars', 'fuel', 'crew', 'track', 'binary', 'stage', 'geo'].includes(L.kind)) addEarth(); else earthMesh = null;

  if (L.kind === 'fuel' || L.kind === 'crew' || L.kind === 'stage') {      // base lunaire
    const moon = new THREE.Mesh(new THREE.SphereGeometry(R_EARTH, 48, 32), new THREE.MeshPhongMaterial({ map: TEX.moon() }));
    levelGroup.add(moon); earthMesh = moon;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 10, 0, TAU, 0, Math.PI / 2), new THREE.MeshPhongMaterial({ color: 0xcfd6e6 }));
    dome.position.copy(P3(0.7, R_EARTH - 0.12)); dome.rotation.x = -Math.PI / 2 + 0.35; levelGroup.add(dome);
    addLabel('Base lunaire', '#e6e9f2', () => P3(0, -R_EARTH - 0.2));
  }

  if (L.kind === 'track') {
    const W = S.world; W.rho = 0; W.u = 0; W.inc = 0; W.ws = 1.0; W.we = 0.14; W.Ro = 3;
    const e = new THREE.Mesh(new THREE.SphereGeometry(R_EARTH, 64, 40), earthMat); levelGroup.add(e); W.earth = e;
    levelGroup.add(sprite(GLOW_BLUE, R_EARTH * 3.1, .5));
    // la ville, posée sur le globe à la même place que sur la carte
    const th = (90 - L.city.lat) / 180 * Math.PI, ph = L.city.u * TAU;
    const city = new THREE.Mesh(new THREE.OctahedronGeometry(0.11), new THREE.MeshBasicMaterial({ color: 0xffd34a }));
    city.position.set(-Math.cos(ph) * Math.sin(th), Math.cos(th), Math.sin(ph) * Math.sin(th)).multiplyScalar(R_EARTH + 0.05);
    e.add(city); W.city = city;
    // l'orbite (un anneau qu'on penche)
    const ringPts = []; for (let k = 0; k <= 128; k++) { const a = k / 128 * TAU; ringPts.push(new THREE.Vector3(Math.cos(a) * W.Ro, 0, -Math.sin(a) * W.Ro)); }
    const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPts), new THREE.LineBasicMaterial({ color: 0x6fe3ff, transparent: true, opacity: .6 }));
    levelGroup.add(ring); W.ring = ring;
    const eq = circleLine(R_EARTH + 0.02, 0xffffff, .25); levelGroup.add(eq);
    const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 5.4, 6), new THREE.MeshBasicMaterial({ color: 0x9fb4ff, transparent: true, opacity: .5 }));
    levelGroup.add(axis);
    addLabel('pôle Nord', '#9fd0ff', () => new THREE.Vector3(0, 2.9, 0));
    addLabel('ville ★', '#ffd34a', () => city.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.35, 0)));
  }

  if (L.kind === 'reentry') {
    const a0 = L.zoneA - L.zoneW, len = 2 * L.zoneW;
    const arc = new THREE.Mesh(new THREE.RingGeometry(R_EARTH - 0.02, R_EARTH + 0.7, 32, 1, a0, len),
      new THREE.MeshBasicMaterial({ color: 0x46e07c, transparent: true, opacity: .45, side: THREE.DoubleSide, depthWrite: false }));
    arc.rotation.x = -Math.PI / 2; arc.position.y = 0.05; levelGroup.add(arc);
    const boat = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.12), new THREE.MeshPhongMaterial({ color: 0xffffff }));
    boat.position.copy(P3(R_EARTH * 1.18 * Math.cos(L.zoneA), R_EARTH * 1.18 * Math.sin(L.zoneA), 0.1)); boat.rotation.y = L.zoneA; levelGroup.add(boat);
    levelGroup.add(circleLine(L.start.r, 0x8899cc, .3, 0, 0, true));
    addLabel("zone d'amerrissage", '#7dffaa', () => P3(R_EARTH * 1.45 * Math.cos(L.zoneA), R_EARTH * 1.45 * Math.sin(L.zoneA) + 0.2));
  }

  if (L.kind === 'chase') {
    const W = S.world; W.stR = L.start.r; W.stW = Math.sqrt(GM_EARTH / Math.pow(W.stR, 3));
    const st = new THREE.Group();
    st.add(new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.08, 10, 24), new THREE.MeshPhongMaterial({ color: 0xdfe4ef })));
    const pan = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.25, 0.02), new THREE.MeshPhongMaterial({ color: 0x3355aa, emissive: 0x112244 }));
    st.add(pan); st.rotation.x = Math.PI / 2; st.add(sprite(GLOW_GREEN, 1.8, .3));
    levelGroup.add(st); W.stMesh = st;
    levelGroup.add(circleLine(W.stR, 0x8899cc, .3, 0, 0, true));
    addLabel('Station', '#7dffaa', () => st.position.clone().add(new THREE.Vector3(0, 0, -0.6)));
  }

  if (L.kind === 'hohmann') {
    const [a, b] = L.band;
    const ring = new THREE.Mesh(new THREE.RingGeometry(a, b, 96), new THREE.MeshBasicMaterial({ color: 0x46e07c, transparent: true, opacity: .16, side: THREE.DoubleSide, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; levelGroup.add(ring);
    levelGroup.add(circleLine((a + b) / 2, 0x6bff9e, .5, 0, 0, true));
    levelGroup.add(circleLine(L.start.r, 0x8899cc, .3, 0, 0, true));
    addLabel('orbite verte', '#7dffaa', () => P3(0, b + 0.4));
  }

  if (L.kind === 'lander') {
    const R = 30; S.world.R = R;
    const moon = new THREE.Mesh(new THREE.SphereGeometry(R, 96, 48), new THREE.MeshPhongMaterial({ map: TEX.moon() }));
    moon.position.copy(P3(0, -R)); levelGroup.add(moon);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.08, 32), new THREE.MeshBasicMaterial({ color: 0x46e07c, transparent: true, opacity: .6 }));
    pad.position.copy(P3(0, 0.02)); pad.rotation.x = Math.PI / 2; levelGroup.add(pad);
    addLabel("zone d'atterrissage", '#7dffaa', () => P3(2.6, 0.6));
    addLabel('Lune', '#e6e9f2', () => P3(-6, -1.5));
  }

  if (L.kind === 'mars') {
    const W = S.world; W.eR = 5; W.mR = 8.5;
    W.eW = Math.sqrt(GM_EARTH / Math.pow(W.eR, 3)); W.mW = Math.sqrt(GM_EARTH / Math.pow(W.mR, 3));
    const a = (W.eR + W.mR) / 2; W.vT = Math.sqrt(GM_EARTH * (2 / W.eR - 1 / a)); W.tT = Math.PI * Math.sqrt(a * a * a / GM_EARTH);
    W.d0 = Math.PI - W.mW * W.tT;              // avance idéale de Mars sur la Terre au départ
    W.eA = -Math.PI / 2; W.mA = W.eA + 2.45;
    const sunM = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 20), new THREE.MeshBasicMaterial({ color: 0xffd36b }));
    sunM.add(sprite(GLOW_FIRE, 6, .8)); levelGroup.add(sunM);
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.35, 24, 16), earthMat); levelGroup.add(e); W.eMesh = e;
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 16), new THREE.MeshPhongMaterial({ color: 0xd2603a }));
    m.add(sprite(GLOW_GREEN, 2.1, .35)); levelGroup.add(m); W.mMesh = m;
    levelGroup.add(circleLine(W.eR, 0x6fa8ff, .3, 0, 0, true)); levelGroup.add(circleLine(W.mR, 0xff9a7a, .3, 0, 0, true));
    addLabel('Soleil', '#ffd36b', () => P3(0, -1.6));
    addLabel('Terre', '#9fd0ff', () => e.position.clone().add(new THREE.Vector3(0, 0, 0.9)));
    addLabel('Mars', '#ffb39a', () => m.position.clone().add(new THREE.Vector3(0, 0, -0.8)));
  }

  if (L.zone) {
    const [a, b] = L.zone;
    const ring = new THREE.Mesh(new THREE.RingGeometry(a, b, 64, 1, Math.PI / 2 - 0.55, 1.1),
      new THREE.MeshBasicMaterial({ color: 0x46e07c, transparent: true, opacity: .28, side: THREE.DoubleSide, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; levelGroup.add(ring);
    [a, b].forEach(r => { const l = circleLine(r, 0x6bff9e, .55); levelGroup.add(l); l.visible = false; });
    // station : un petit anneau qui flotte à droite de la zone
    const st = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.08, 10, 24), new THREE.MeshPhongMaterial({ color: 0xd8dde8 }));
    st.position.copy(P3(1.2, (a + b) / 2, 0)); st.rotation.x = Math.PI / 2; levelGroup.add(st);
    const pan = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.02, 0.25), new THREE.MeshPhongMaterial({ color: 0x3355aa, emissive: 0x112244 }));
    pan.position.copy(P3(1.2, (a + b) / 2, 0)); levelGroup.add(pan); S.world.station = st;
    addLabel('zone verte', '#7dffaa', () => P3(-1.9, b + 0.2));
    addLabel('Station', '#dfe6ff', () => P3(1.2, (a + b) / 2 + 0.55));
  }

  if (L.kind === 'orbit') {
    const m = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.75, 16), new THREE.MeshPhongMaterial({ color: 0x8a7558, flatShading: true }));
    m.position.copy(P3(0, R_EARTH + 0.25)); m.rotation.x = -Math.PI / 2; levelGroup.add(m);
    const snow = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.2, 16), new THREE.MeshPhongMaterial({ color: 0xffffff }));
    snow.position.copy(P3(0, R_EARTH + 0.52)); snow.rotation.x = -Math.PI / 2; levelGroup.add(snow);
    addLabel('Montagne', '#e8d6b8', () => P3(-0.9, R_EARTH + 0.7));
  }

  if (L.kind === 'moon') {
    S.world.moonR = 10; S.world.moonW = Math.sqrt(GM_EARTH / 1000); S.world.moonA = 2.4;
    const moon = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 20), new THREE.MeshPhongMaterial({ map: TEX.moon() }));
    levelGroup.add(moon); S.world.moonMesh = moon;
    const halo = sprite(GLOW_GREEN, 2.4, .35); moon.add(halo);
    levelGroup.add(circleLine(10, 0x8899cc, .35, 0, 0, true));
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.3), new THREE.MeshPhongMaterial({ color: 0x777788 }));
    pad.position.copy(P3(0, -R_EARTH - 0.05)); levelGroup.add(pad);
    addLabel('Lune', '#e6e9f2', () => moon.position.clone().add(new THREE.Vector3(0, 0, -0.8)));
  }

  if (L.kind === 'sling') {
    const W = S.world; W.gx = -22; W.gy = 8; W.gu = 3; W.target = L.target || { x: 24, y: 26, r: 4.5 };
    const giant = new THREE.Mesh(new THREE.SphereGeometry(1.0, 32, 20), new THREE.MeshPhongMaterial({ map: TEX.giant() }));
    const ringM = new THREE.Mesh(new THREE.RingGeometry(1.35, 2.0, 48), new THREE.MeshBasicMaterial({ color: 0xd9c18e, transparent: true, opacity: .5, side: THREE.DoubleSide }));
    ringM.rotation.x = -1.2; giant.add(ringM); giant.add(sprite(GLOW_FIRE, 4.5, .25));
    levelGroup.add(giant); W.giantMesh = giant;
    // trajet de la planète
    const path = new THREE.BufferGeometry().setFromPoints([P3(-24, 8), P3(30, 8)]);
    const pl = new THREE.Line(path, new THREE.LineDashedMaterial({ color: 0xd9a066, dashSize: .8, gapSize: .6, transparent: true, opacity: .35 }));
    pl.computeLineDistances(); levelGroup.add(pl);
    const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1, 3), new THREE.MeshBasicMaterial({ color: 0xd9a066, transparent: true, opacity: .5 }));
    arrow.position.copy(P3(28, 8)); arrow.rotation.z = -Math.PI / 2; levelGroup.add(arrow);
    // base de départ
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 0), new THREE.MeshPhongMaterial({ color: 0x777066, flatShading: true }));
    rock.position.copy(P3(0, -1.2)); levelGroup.add(rock);
    // station lointaine
    const T = W.target;
    const st = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.22, 12, 32), new THREE.MeshPhongMaterial({ color: 0xdfe4ef }));
    st.position.copy(P3(T.x, T.y)); st.rotation.x = Math.PI / 2; levelGroup.add(st); W.stMesh = st;
    const zone = new THREE.Mesh(new THREE.CircleGeometry(T.r, 48), new THREE.MeshBasicMaterial({ color: 0x46e07c, transparent: true, opacity: .16, depthWrite: false }));
    zone.position.copy(P3(T.x, T.y, -0.02)); zone.rotation.x = -Math.PI / 2; levelGroup.add(zone);
    levelGroup.add(circleLine(T.r, 0x6bff9e, .6, T.x, T.y));
    addLabel(L.brake ? 'Station' : 'Station lointaine', '#7dffaa', () => P3(T.x, T.y + T.r + 0.5));
    addLabel('Planète géante', '#ffd09a', () => P3(W.gx, W.gy + 2.4));
    addLabel('Départ', '#d8d8d8', () => P3(0, -2.6));
  }

  if (L.perturb) {                               // la petite planète bleue qui traverse
    const W = S.world, Pp = L.perturb; W.px = Pp.x0;
    const blue = new THREE.Mesh(new THREE.SphereGeometry(Pp.r, 28, 18), new THREE.MeshPhongMaterial({ color: 0x4f9dff, emissive: 0x0a2244 }));
    blue.add(sprite(GLOW_BLUE, Pp.r * 5, .5)); levelGroup.add(blue); W.blueMesh = blue;
    const path = new THREE.BufferGeometry().setFromPoints([P3(Pp.xmin, Pp.y), P3(Pp.xmax, Pp.y)]);
    const pl = new THREE.Line(path, new THREE.LineDashedMaterial({ color: 0x6fa8ff, dashSize: .8, gapSize: .6, transparent: true, opacity: .35 }));
    pl.computeLineDistances(); levelGroup.add(pl);
    addLabel('Planète bleue', '#9fc8ff', () => P3(W.px, Pp.y + 1.6));
  }

  if (L.moonX) {                                  // Lune immobile (niveaux équilibre et grand huit)
    const moon = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 20), new THREE.MeshPhongMaterial({ map: TEX.moon() }));
    moon.position.copy(P3(L.moonX, 0)); levelGroup.add(moon);
    addLabel('Lune', '#e6e9f2', () => P3(L.moonX, -1.1));
  }

  if (L.kind === 'balance') {
    const mk = (color) => { const a = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, color, 0.35, 0.25); a.position.y = 0.05; levelGroup.add(a); return a; };
    S.world.arrE = mk(0x6fb8ff); S.world.arrM = mk(0xd8dbe6);
    addLabel('force de la Terre', '#8fc8ff', () => S.state === 'idle' ? P3(S.ship.x - 2.3, 0.6) : null);
    addLabel('force de la Lune', '#e6e9f2', () => S.state === 'idle' ? P3(S.ship.x + 2.3, -0.4) : null);
  }

  if (L.kind === 'free') {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 0.5), new THREE.MeshPhongMaterial({ color: 0x777788 }));
    pad.position.copy(P3(-R_EARTH - 0.05, 0)); levelGroup.add(pad);
  }

  if (L.kind === 'binary') {
    const W = S.world; W.binA = 0; W.binW = Math.sqrt(2 * L.starGM / Math.pow(2 * L.starA, 3));
    const mkStar = (col, glow) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16), new THREE.MeshBasicMaterial({ color: col })); m.add(sprite(glow, 3.2, .8)); levelGroup.add(m); return m; };
    W.s1 = mkStar(0xffd36b, GLOW_FIRE); W.s2 = mkStar(0xffb0a0, TEX.glow('rgba(255,140,120,1)'));
    levelGroup.add(circleLine(L.R0, 0x8899cc, .25, 0, 0, true));
    levelGroup.add(circleLine(16, 0xff7a7a, .25, 0, 0, true));
    const st = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.1, 10, 24), new THREE.MeshPhongMaterial({ color: 0xdfe4ef }));
    st.position.copy(P3(0, -L.R0 - 0.7)); st.rotation.x = Math.PI / 2; levelGroup.add(st);
    addLabel('Station', '#dfe4ef', () => P3(0, -L.R0 - 1.6));
    addLabel('limite du système', '#ff9a9a', () => P3(0, -16.6));
    W.twin = null;
  }

  if (L.kind === 'skip') {                        // la couche d'air autour de la Terre
    const air = new THREE.Mesh(new THREE.RingGeometry(R_EARTH, L.atm, 96), new THREE.MeshBasicMaterial({ color: 0x5aa8ff, transparent: true, opacity: .18, side: THREE.DoubleSide, depthWrite: false }));
    air.rotation.x = -Math.PI / 2; air.position.y = -0.02; levelGroup.add(air);
    levelGroup.add(circleLine(L.atm, 0x8fc8ff, .55, 0, 0, true));
    const arr = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 2.6, 0xffd36b, 0.5, 0.32);
    arr.position.y = 0.05; levelGroup.add(arr); S.world.aimArrow = arr;
    addLabel("l'air", '#8fc8ff', () => P3(0.6, -L.atm - 0.45));
    addLabel('Capsule', '#ffd36b', () => S.state === 'idle' ? P3(S.ship.x, S.ship.y + 1.0) : null);
  }

  if (L.kind === 'geo') {                         // Terre sans inclinaison, ville sur l'équateur
    const W = S.world; W.cityA = 0.6;
    const e = new THREE.Mesh(new THREE.SphereGeometry(R_EARTH, 48, 32), earthMat); levelGroup.add(e); W.geoEarth = e;
    levelGroup.add(sprite(GLOW_BLUE, R_EARTH * 3.1, .5));
    const city = new THREE.Mesh(new THREE.OctahedronGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0xffd34a }));
    city.position.set(R_EARTH + 0.08, 0.05, 0); e.add(city); W.city = city;
    // la ligne « au-dessus de la ville » qui tourne avec la Terre
    const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(R_EARTH, 0.03, 0), new THREE.Vector3(12, 0.03, 0)]),
      new THREE.LineDashedMaterial({ color: 0xffd34a, dashSize: .45, gapSize: .35, transparent: true, opacity: .55 }));
    ln.computeLineDistances(); e.add(ln);
    const ring = circleLine(1, 0x6fe3ff, .5, 0, 0, true); levelGroup.add(ring); W.geoRing = ring;
    addLabel('Terre', '#9fd0ff', () => P3(0, -R_EARTH - 0.6));
    addLabel('ville ★', '#ffd34a', () => city.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.4, 0)));
    addLabel('au-dessus de la ville', '#e8cf7a', () => P3(9.5 * Math.cos(W.cityA), 9.5 * Math.sin(W.cityA), 0.2));
  }

  if (L.kind === 'deflect') {
    const W = S.world, a = asteroidStart();
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.75, 1), new THREE.MeshPhongMaterial({ color: 0x8a7f74, flatShading: true }));
    rock.scale.set(1, 0.8, 1.15); levelGroup.add(rock); W.astMesh = rock;
    // trajet prévu sans poussée
    const path = new THREE.Line(new THREE.BufferGeometry().setFromPoints([P3(a.x, a.y), P3(0, 0)]),
      new THREE.LineDashedMaterial({ color: 0xff7a7a, dashSize: .7, gapSize: .5, transparent: true, opacity: .45 }));
    path.computeLineDistances(); levelGroup.add(path);
    addLabel('Astéroïde', '#d8c8b8', () => !S.dead ? P3(S.ship.x, S.ship.y + 1.4) : null);
    addLabel('trajet prévu', '#ff9a9a', () => P3(a.x * 0.55, a.y * 0.55 + 1.2));
    // temps qu'il mettrait à toucher la Terre sans poussée
    let x = a.x, y = a.y, vx = a.vx, vy = a.vy, t = 0;
    while (Math.hypot(x, y) > R_EARTH && t < 60) { const r = Math.hypot(x, y), k = GM_EARTH / (r * r * r); vx -= k * x * H; vy -= k * y * H; x += vx * H; y += vy * H; t += H; }
    W.T0 = t; W.age = 0;
  }

  resetShip();
  resetCamera();
  $('#levelName').textContent = `${L.icon}  ${tr('Niveau')} ${i + 1} — ${lt(L, 'title')}`;
  $('#missionTitle').textContent = lt(L, 'title');
  $('#missionText').innerHTML = lt(L, 'mission');
  const c = L.control, push = c === 'push';
  $('#powerBox').classList.toggle('hidden', c !== 'power' && !push);
  $('#timingBox').classList.toggle('hidden', c !== 'timing');
  $('#landerBox').classList.toggle('hidden', c !== 'hold');
  $('#timingText').innerHTML = lt(L, 'timingText') || tr("⏱️ Choisis le <b>bon moment</b> : appuie sur LANCER quand tu penses que c'est le moment !");
  $('#power').classList.toggle('push', push); $('#centerMark').classList.toggle('hidden', !push);
  const s1 = lt(L, 's1'), s2 = lt(L, 's2');
  $('#powerTitle').textContent = s1 ? s1.title : tr(push ? '↔ Coup de moteur' : '🔥 Puissance');
  $('#endL').textContent = s1 ? s1.l : tr(push ? '⬅ freiner' : 'doux');
  $('#endR').textContent = s1 ? s1.r : tr(push ? 'accélérer ➡' : 'très fort');
  $('#power').value = L.s1 ? L.s1.def : L.def != null ? L.def : push ? 50 : 40;   // jamais déjà sur la bonne réponse
  $('#power2Box').classList.toggle('hidden', !L.s2);
  if (s2) { $('#power2Title').textContent = s2.title; $('#end2L').textContent = s2.l; $('#end2R').textContent = s2.r; $('#power2').value = L.s2.def; }
  $('#crewBox').classList.toggle('hidden', L.kind !== 'crew');
  $('#stageBox').classList.toggle('hidden', L.kind !== 'stage');
  $('#crewSafe').style.width = L.gLimit ? (100 * (L.gLimit - 2.0) / 6) + '%' : '0';
  updatePowerWord();
  document.body.classList.toggle('hasGraph', !!L.graph);
  $('#graphBox').classList.toggle('hidden', !L.graph);
  GRAPH.setup();
  hideToast(); updateAttempts(); updateLaunchBtn();
  store.set('level', i);
  setLevelLink(i);
}

/* ------------------------------------------------------------------ liens directs */
function setLevelLink(i) {
  try { history.replaceState(null, '', location.pathname + (LANG === 'en' ? '#level-' : '#niveau-') + (i + 1)); } catch (e) { /* file:// ou bac à sable */ }
}
function levelFromUrl() {
  const m = (location.hash + ' ' + location.search).match(/(?:niveau|level)[-=_]?(\d+)/i);
  if (!m) return null;
  const n = parseInt(m[1], 10) - 1;
  return n >= 0 && n < LEVELS.length ? n : null;
}
function shareLink() {
  const url = location.href.split('#')[0].split('?')[0] + (LANG === 'en' ? '#level-' : '#niveau-') + (S.li + 1);
  const done = () => showToast(tr('🔗 Lien copié ! Colle-le pour partager directement ce niveau.') + `<span class="hint" style="color:var(--muted);word-break:break-all">${url}</span>`, 'good');
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, () => window.prompt(tr('Copie ce lien :'), url));
  else window.prompt(tr('Copie ce lien :'), url);
}

/* textes fixes de la page (éléments marqués data-i) et changement de langue */
const norm = s => s.replace(/\s+/g, ' ').trim();
function applyStaticLang() {
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i]').forEach(el => { if (el.dataset.fr == null) el.dataset.fr = norm(el.innerHTML); el.innerHTML = tr(el.dataset.fr); });
  document.querySelectorAll('[data-i-title]').forEach(el => { if (el.dataset.frTitle == null) el.dataset.frTitle = el.title; el.title = tr(el.dataset.frTitle); });
  $('#btnLang').textContent = LANG === 'fr' ? '🌐 EN' : '🌐 FR';
}
function setLang(l) {
  LANG = l; store.set('lang', l);
  applyStaticLang(); buildMenu();
  $('#win').classList.add('hidden');
  buildLevel(S.li);
}

/* force du moteur (niveau astronautes) */
function crewA() { return 2.0 + (+$('#power').value) * 0.06; }
function crewT() { return 0.3 + (+$('#power2').value) * 0.02; }
function updateCrew() {
  if (S.L.kind !== 'crew') return;
  const A = crewA(), r = (A - 2.0) / 6;
  $('#gCrew').style.width = (r * 100) + '%';
  const ok = A <= S.L.gLimit;
  $('#gCrew').style.background = A <= S.L.gLimit - 0.8 ? '#5ee08a' : ok ? '#ffc65c' : '#ff4a4a';
  $('#crewFace').textContent = A <= S.L.gLimit - 0.8 ? '😀' : ok ? '🙂' : A < S.L.gLimit + 1.6 ? '😣' : '😵';
}

/* ------------------------------------------------------------------ lancement */
function launch() {
  const L = S.L;
  if (L.kind === 'hohmann' && S.state === 'flying' && S.chk.burns === 1) return burn2();
  if (L.kind === 'stage' && S.state === 'flying' && S.st.att) return dropStage();
  if (S.state === 'flying' || S.state === 'success') return;
  if (S.state === 'ended') { if (movingStart(L)) return; resetShip(); }
  let burnDv = 0;
  if (L.kind === 'deflect') {           // poussée sur le côté de l'astéroïde
    const s = S.ship, v = Math.hypot(s.vx, s.vy), P = +$('#power').value, dv = Math.max(0.02, P / 100) * L.kf;
    S.lastPower = P;
    const nx = -s.vy / v, ny = s.vx / v;
    s.vx += nx * dv; s.vy += ny * dv; S.pushN = { x: nx, y: ny };
  } else if (L.start) {                        // coup de moteur en orbite, dans le sens du mouvement
    if (L.kind === 'reentry') burnDv = Math.hypot(S.ship.vx, S.ship.vy) * (L.brake - 1);
    else if (L.kind === 'chase') { const P = +$('#power').value; S.lastPower = P; burnDv = (P - 50) / 50 * 0.8; }
    else if (L.kind === 'hohmann') burnDv = L.dv1;
    applyBurn(burnDv);
  } else if (L.kind === 'lander' || L.kind === 'fuel' || L.kind === 'crew' || L.kind === 'track' || L.kind === 'balance' || L.kind === 'stage') {
    S.ship.vx = S.ship.vy = 0;
    S.lastPower = +$('#power').value;
    if (L.kind === 'fuel') { S.fuelLeft = S.lastPower / 100 * L.fmax; S.fuel0 = S.fuelLeft; }
    if (L.kind === 'crew') { S.burnA = crewA(); S.burnT = crewT(); S.lastPower2 = +$('#power2').value; }
    if (L.kind === 'track') { const W = S.world; W.u = 0; W.inc = S.lastPower / 100 * 90 * Math.PI / 180; }
  } else {
    const p = padPose();
    let v;
    if (L.kind === 'moon') v = 5.40;
    else if (L.kind === 'sling') v = 3;
    else if (L.kind === 'mars') v = S.world.vT;
    else if (L.kind === 'geo') { S.lastPower = +$('#power').value; v = Math.sqrt(GM_EARTH / geoR()); }
    else if (L.kind === 'skip') { S.lastPower = +$('#power').value; v = 1; }
    else { const P = +$('#power').value; S.lastPower = P; v = L.vRange ? L.vRange[0] + P / 100 * (L.vRange[1] - L.vRange[0]) : P * KPOW / (L.mass || 1); }
    S.ship.vx = p.dx * v; S.ship.vy = p.dy * v;
  }

  // la trace précédente devient un « fantôme »
  if (S.trail) { S.ghosts.push(S.trail); if (S.ghosts.length > 4) { const g = S.ghosts.shift(); ghostGroup.remove(g.line); g.dispose(); } }
  S.ghosts.forEach((g, k) => { g.line.material.opacity = 0.18 + 0.12 * (k + 5 - S.ghosts.length) / 4; });
  // on enlève les marqueurs « fantômes » ponctuels de l'essai d'avant (Lune / planète)
  ghostGroup.children.filter(o => o.userData.oneShot).forEach(o => ghostGroup.remove(o));
  labels.filter(l => l.oneShot).forEach(l => l.el.remove());
  for (let k = labels.length - 1; k >= 0; k--) if (labels[k].oneShot) labels.splice(k, 1);

  S.trail = new Trail(0x6fe3ff); ghostGroup.add(S.trail.line); S.trail.push(S.ship.x, S.ship.y);
  S.state = 'flying'; S.flightT = 0; S.stepCount = 0; S.flameT = 0.45; S.attempts++;
  S.chk = { apex: false, swept: 0, lastAng: Math.atan2(S.ship.y, S.ship.x), rmin: 1e9, rmax: 0, minD: 1e9, ahead: false, dv: burnDv, burns: 1 };
  if (movingStart(L)) addBurnMark(S.ship.x, S.ship.y);
  if (L.kind === 'skip') { S.chk.rp = skipStart().rp; S.chk.peak = 0; S.chk.inAtm = false; }
  if (L.kind === 'stage') S.flameT = 0;
  if (L.kind === 'deflect') S.chk.moment = asteroidMoment();
  if (L.kind === 'geo') S.chk.drift = 0;
  if (L.kind === 'lander') S.flameT = 0;
  if (L.kind === 'moon') S.chk.launchMoonA = S.world.moonA;
  if (L.kind === 'mars') { const W = S.world; S.chk.delta = Math.atan2(Math.sin(W.mA - W.eA), Math.cos(W.mA - W.eA)); }
  if (L.kind === 'sling') {
    S.chk.gx0 = S.world.gx;
    addGhostBody(S.world.gx, S.world.gy, 1.0, 0xd9a066, 'la planète au départ');
  }
  if (L.kind === 'fuel') {
    S.flameT = 0;
    const g0 = L.gm / Math.pow(R_EARTH + 0.25, 2);
    S.chk.heavy = S.fuelLeft <= 0 || L.F / (1 + S.fuelLeft) <= g0;
  }
  if (L.kind === 'crew') S.flameT = 0;
  if (L.kind === 'track') S.trail.n = 0;
  if (L.kind === 'balance') { S.chk.x0 = S.ship.x; S.flameT = 0; }
  if (L.kind === 'binary') startTwin();
  S.chk.nextBead = 0;
  GRAPH.begin();
  hideToast(); updateAttempts(); updateLaunchBtn();
}

/* poussée continue (niveaux carburant et astronautes), vers le haut */
function thrustAcc(h) {
  const L = S.L, s = S.ship, r = Math.hypot(s.x, s.y);
  if (L.kind === 'fuel' && S.fuelLeft > 0 && !S.chk.heavy) {
    const a = L.F / (1 + S.fuelLeft); S.fuelLeft = Math.max(0, S.fuelLeft - L.q * h);
    return a / r;
  }
  if (L.kind === 'crew' && S.flightT < S.burnT) return S.burnA / r;
  if (L.kind === 'stage') {                 // un seul moteur : d'abord le grand réservoir, puis le petit
    const st = S.st; let tank = null;
    if (st.att && st.a1 > 0) tank = 'a1'; else if (st.a2 > 0) tank = 'a2';
    if (!tank) return 0;
    const m = L.m0 + st.a2 + (st.att ? L.ms + st.a1 : 0);
    st[tank] = Math.max(0, st[tank] - L.q * h);
    if (tank === 'a1' && st.a1 === 0 && st.emptyT == null) { st.emptyT = S.flightT; rocket.tankMat.color.setHex(0x777a85); }
    return L.F / m / r;
  }
  return 0;
}
// on lâche le grand réservoir : il retombe tout seul
function dropStage() {
  const st = S.st, s = S.ship; st.att = false; st.dropT = S.flightT; st.dropFuel = st.a1 / S.L.f1;
  rocket.tank.visible = false;
  const g = rocket.tank.clone(); g.visible = true;
  const wrap = new THREE.Group(); wrap.add(g); wrap.scale.copy(rocket.group.scale); wrap.position.copy(rocket.group.position);
  wrap.quaternion.copy(rocket.group.quaternion); g.position.copy(rocket.tank.position); g.scale.copy(rocket.tank.scale);
  ghostGroup.add(wrap); wrap.userData.oneShot = true;
  S.world.debris = { x: s.x, y: s.y, vx: s.vx * 0.9, vy: s.vy * 0.9, mesh: wrap, spin: 0 };
  updateLaunchBtn();
}
function updateStageGauges() {
  const L = S.L, st = S.st; if (!st) return;
  const t1 = $('#gTank1'), t2 = $('#gTank2');
  t1.style.width = (st.att ? st.a1 / L.f1 * 100 : 0) + '%'; t1.style.background = '#ff9a3a';
  t1.parentElement.style.opacity = st.att ? 1 : .35;
  t2.style.width = (st.a2 / L.f2 * 100) + '%'; t2.style.background = '#6fe3ff';
}
function burning() {
  const L = S.L;
  return S.state === 'flying' && ((L.kind === 'fuel' && S.fuelLeft > 0 && !S.chk.heavy) || (L.kind === 'crew' && S.flightT < S.burnT)
    || (L.kind === 'stage' && ((S.st.att && S.st.a1 > 0) || S.st.a2 > 0)));
}

function addGhostBody(x, y, r, color, text) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .25, wireframe: true }));
  m.position.copy(P3(x, y)); m.userData.oneShot = true; ghostGroup.add(m);
  const L = addLabel(text, '#c9c9e8', () => P3(x, y - r - 0.9)); L.oneShot = true; L.el.style.opacity = .8;
}

function applyBurn(dv) {
  const s = S.ship, v = Math.hypot(s.vx, s.vy);
  s.vx += s.vx / v * dv; s.vy += s.vy / v * dv;
}
function addBurnMark(x, y) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffa040 }));
  m.position.copy(P3(x, y, 0.03)); ghostGroup.add(m);
  const marks = ghostGroup.children.filter(o => o.userData.burn); m.userData.burn = true;
  if (marks.length >= 6) ghostGroup.remove(marks[0]);
}
// forme de l'orbite actuelle autour de la Terre : point le plus bas / le plus haut
function orbitShape() {
  const s = S.ship, r = Math.hypot(s.x, s.y), v2 = s.vx * s.vx + s.vy * s.vy;
  const E = v2 / 2 - GM_EARTH / r; if (E >= 0) return { escape: true };
  const a = -GM_EARTH / (2 * E), hh = s.x * s.vy - s.y * s.vx;
  const e = Math.sqrt(Math.max(0, 1 + 2 * E * hh * hh / (GM_EARTH * GM_EARTH)));
  return { rp: a * (1 - e), ra: a * (1 + e) };
}
function burn2() {
  const L = S.L, s = S.ship, C = S.chk, r = Math.hypot(s.x, s.y), vr = (s.x * s.vx + s.y * s.vy) / r;
  applyBurn(L.dv2); C.burns = 2; S.flameT = 0.45; addBurnMark(s.x, s.y);
  const o = orbitShape(), [a, b] = L.band;
  if (!o.escape && o.rp > a && o.ra < b) {
    const k = o.ra / o.rp; S.stars = k < 1.06 ? 3 : k < 1.14 ? 2 : 1;
    return endAttempt(true, S.stars === 3 ? "🪜 Parfait ! Tu tournes bien rond sur l'orbite verte." : "🪜 Tu es resté sur l'orbite verte ! (un peu ovale)");
  }
  if (Math.abs(vr) < 0.25) return endAttempt(false, "Presque ! Tu y étais presque : encore un tout petit peu plus près du sommet.", 'warn');
  endAttempt(false, vr > 0 ? "<b>Trop tôt !</b> Ta fusée <b>montait encore</b> quand tu as rallumé le moteur. Attends qu'elle soit tout en haut."
                            : "<b>Trop tard !</b> Ta fusée avait <b>déjà commencé à redescendre</b>. Rallume le moteur un peu plus tôt.");
}

function endAttempt(ok, msg, tone, color) {
  const hex = color != null ? color : (ok ? 0x5ee08a : 0xff8a7a);
  if (S.trail) { S.trail.line.material.color.setHex(hex); }
  GRAPH.endCurve('#' + hex.toString(16).padStart(6, '0'));
  if (ok) {
    S.state = 'success';
    showToast(tr(msg), 'good');
    const done = store.get('done') || {}; done[S.li] = Math.max(done[S.li] || 0, S.stars || 1); store.set('done', done);
    const run = S.run;
    setTimeout(() => { if (S.run === run && S.state === 'success') showWin(); }, 1500);
  } else {
    S.state = 'ended'; S.fails++;
    let full = tr(msg);
    if (S.L.hint && S.fails >= 3) full += `<span class="hint">${lt(S.L, 'hint')}</span>`;
    showToast(full, tone || 'bad');
    S.resetAt = clock * 1000 + (S.L.kind === 'track' ? 5500 : S.L.keepSim && !S.dead ? 2800 : 1600);
    S.thrust = false;
  }
  updateLaunchBtn();
}

function boom(x, y, size = 1.2) {
  const s = sprite(GLOW_FIRE, 0.1, 1); s.position.copy(P3(x, y, 0.1)); s.userData = { t: 0, size }; scene.add(s); S.booms.push(s);
  rocket.group.visible = false; S.dead = true;
}

/* ------------------------------------------------------------------ physique */
function worldStep(h) {
  const W = S.world, L = S.L;
  if (L.kind === 'moon') W.moonA = (W.moonA + W.moonW * h) % TAU;
  if (L.kind === 'sling') { W.gx += W.gu * h; if (W.gx > 30 && S.state !== 'flying') W.gx = -24; }
  if (L.kind === 'chase' && !(S.state === 'ended' && S.dead)) W.stA += W.stW * h;
  if (L.kind === 'mars') { W.eA += W.eW * h; W.mA += W.mW * h; }
  if (L.kind === 'binary') W.binA += W.binW * h;
  if (L.perturb) { W.px += L.perturb.u * h; if (W.px < L.perturb.xmin) W.px = L.perturb.xmax; }
  if (L.kind === 'geo') W.cityA += L.wE * h;
  if (L.kind === 'deflect' && S.state === 'coast') W.age += h;
  const d = W.debris;                     // réservoir largué qui retombe
  if (d && d.mesh.visible) {
    const r = Math.hypot(d.x, d.y), k = L.gm / (r * r * r);
    d.vx -= k * d.x * h; d.vy -= k * d.y * h; d.x += d.vx * h; d.y += d.vy * h; d.spin += h * 3;
    if (r < R_EARTH) d.mesh.visible = false;
  }
}

/* vol libre sans vérification (avant le coup de moteur, ou après la fin de l'essai) */
function coastStep(h, record) {
  if (S.dead) return;
  const s = S.ship; let ax = 0, ay = 0;
  for (const b of bodies()) {
    const dx = b.x - s.x, dy = b.y - s.y, d2 = dx * dx + dy * dy, d = Math.sqrt(d2);
    if (d < b.r) {
      boom(s.x, s.y, 1.4);
      if (S.L.kind === 'deflect' && S.state === 'coast') { S.world.astMesh.visible = false; endAttempt(false, "Boum ! Tu n'as pas poussé l'astéroïde : il a foncé tout droit sur la Terre. Appuie sur <b>POUSSER</b> pendant qu'il arrive !"); }
      return;
    }
    const a = b.gm / (d2 * d); ax += a * dx; ay += a * dy;
  }
  s.vx += ax * h; s.vy += ay * h; s.x += s.vx * h; s.y += s.vy * h;
  S.stepCount++;
  if (record && S.trail && S.stepCount % 3 === 0) S.trail.push(s.x, s.y);
  if (record) { S.flightT += h; GRAPH.sample(S.flightT); }
}

/* atterrissage : chute verticale, gravité constante, moteur à maintenir */
const LANDER = { g: 1.0, thrust: 2.0, fuelTime: 8, safe: 1.2 };
function landerStep(h) {
  const s = S.ship, burning = S.thrust && S.fuel > 0;
  if (burning) S.fuel = Math.max(0, S.fuel - h / LANDER.fuelTime);
  s.vy += ((burning ? LANDER.thrust : 0) - LANDER.g) * h; s.y += s.vy * h;
  S.flightT += h; S.chk.usedFuel = S.fuel < 1;
  const ground = 0.62;
  if (s.y <= ground) {
    s.y = ground; const v = -s.vy; s.vy = 0;
    if (v <= LANDER.safe) {
      S.stars = v < 0.4 ? 3 : v < 0.8 ? 2 : 1;
      return endAttempt(true, S.stars === 3 ? "🛬 Posé comme une plume !" : "🛬 Atterrissage réussi ! (un peu secoué)");
    }
    boom(s.x, s.y, 3);
    if (S.fuel <= 0) return endAttempt(false, "Plus de carburant… et la fusée est tombée trop vite ! Garde ton carburant pour <b>la fin</b> de la descente.");
    if (!S.chk.usedFuel) return endAttempt(false, "Boum ! Tu n'as pas allumé le moteur : la fusée a pris de plus en plus de vitesse en tombant.");
    if (v > 2.5) return endAttempt(false, "Boum ! <b>Beaucoup trop vite</b>. Allume le moteur <b>plus tôt</b>, et garde-le allumé plus longtemps.");
    return endAttempt(false, "Aïe, <b>un peu trop vite</b> ! Il fallait freiner encore un petit peu avant de toucher le sol.", 'warn');
  }
  if (s.y > 24) return endAttempt(false, "Oups, tu <b>remontes</b> dans l'espace ! Le moteur pousse plus fort que la gravité : relâche-le de temps en temps.", 'warn');
}

function shipStep(h) {
  const s = S.ship; let ax = 0, ay = 0;
  if (S.chk.heavy) {                       // trop lourde : elle tremble sur place
    S.flightT += h;
    if (S.flightT > 1.3) { addTick(S.lastPower, '#c78bff'); endAttempt(false, "Trop lourde ! Avec autant de carburant, la fusée pèse plus que ce que son moteur peut soulever : elle <b>ne décolle même pas</b>.", 'bad', 0xc78bff); }
    return;
  }
  const k = thrustAcc(h); ax += k * s.x; ay += k * s.y;
  if (S.L.kind === 'skip') {
    const L = S.L, r = Math.hypot(s.x, s.y), v = Math.hypot(s.vx, s.vy);
    S.chk.drag = 0;
    if (r < L.atm) { const dr = L.kd * Math.exp(-(r - R_EARTH) / L.Hs) * v * v; S.chk.drag = dr; S.chk.inAtm = true; S.chk.peak = Math.max(S.chk.peak, dr); ax -= dr * s.vx / v; ay -= dr * s.vy / v; }
  }
  const B = bodies();
  for (const b of B) {
    const dx = b.x - s.x, dy = b.y - s.y, d2 = dx * dx + dy * dy, d = Math.sqrt(d2);
    if (d < b.r) { return collide(b); }
    const a = b.gm / (d2 * d); ax += a * dx; ay += a * dy;
  }
  s.vx += ax * h; s.vy += ay * h; s.x += s.vx * h; s.y += s.vy * h;
  S.flightT += h; S.stepCount++;
  if (S.stepCount % 3 === 0) S.trail.push(s.x, s.y);
  GRAPH.sample(S.flightT);
  if (S.L.kind === 'binary') twinStep(h);
  CHECKS[S.L.kind](B);
}

function collide(b) {
  const s = S.ship, L = S.L, C = S.chk;
  if (L.kind === 'reentry') {
    const a = Math.atan2(s.y, s.x); let d = a - L.zoneA; d = Math.atan2(Math.sin(d), Math.cos(d));
    rocket.heat.visible = false;
    if (Math.abs(d) <= L.zoneW) {
      s.vx = s.vy = 0; S.stars = 1;
      return endAttempt(true, "🌊 Plouf ! Amerrissage pile dans la zone. Le bateau arrive pour te récupérer !");
    }
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff7a7a }));
    m.position.copy(P3(s.x, s.y, 0.05)); ghostGroup.add(m);
    boom(s.x, s.y, 1.2);
    const near = Math.abs(d) < L.zoneW + 0.35 ? tr('Presque ! ') : '';
    return endAttempt(false, near + tr(d < 0 ? "<b>Trop tôt !</b> Tu es tombé <b>avant</b> la zone verte. Freine un peu plus tard."
                                             : "<b>Trop tard !</b> Tu es tombé <b>après</b> la zone verte. Freine un peu plus tôt."), near ? 'warn' : 'bad');
  }
  if (L.kind === 'skip') {                       // arrivée au sol : les parachutes ont fait le reste
    s.vx = s.vy = 0; rocket.heat.visible = false; S.stars = 1; addTick(S.lastPower, '#5ee08a');
    return endAttempt(true, "🪂 Bienvenue sur Terre ! La capsule a freiné dans l'air sans trop chauffer, et les parachutes se sont ouverts.");
  }
  boom(s.x, s.y, L.kind === 'sling' ? 3 : 1.4);
  if (L.kind === 'deflect') {
    S.world.astMesh.visible = false;
    addTick(0, '#ff8a7a');
    return endAttempt(false, S.chk.moment > 84
      ? "Boum ! Tu as poussé <b>trop tard</b> : même avec une grosse poussée, l'astéroïde n'avait plus le temps de s'écarter. Pousse <b>plus tôt</b> !"
      : "Boum ! La poussée n'était <b>pas assez forte</b> pour l'écarter de la Terre. Pousse un peu plus fort… ou encore plus tôt !");
  }
  if (L.kind === 'geo') return endAttempt(false, "Le satellite est tombé sur la Terre !");
  if (L.zone) {
    if (C.apexR == null) C.apexR = Math.hypot(s.x, s.y);
    if (C.apexR < R_EARTH + 0.6) return endAttempt(false, "Elle a à peine décollé ! Il faut <b>beaucoup plus</b> de puissance.");
    const [a, b2] = L.zone;
    if (C.apexR < a) return endAttempt(false, a - C.apexR < 0.8 ? "Presque ! Elle est retombée <b>juste avant</b> la zone verte. Un tout petit peu plus fort." : "Pas assez fort : elle est retombée <b>avant</b> d'atteindre la zone verte.", 'warn', 0xff8a7a);
    return endAttempt(false, C.apexR - b2 < 1 ? "Presque ! Elle a dépassé la zone verte <b>de peu</b>, puis elle est retombée. Un tout petit peu moins fort." : "Trop fort : elle est montée <b>plus haut</b> que la zone verte, puis elle est retombée.", 'warn', 0xffb347);
  }
  if (L.kind === 'orbit') {
    const sw = Math.abs(C.swept);
    if (sw < Math.PI / 2) return endAttempt(false, "Il est retombé tout de suite ! Lance-le <b>beaucoup plus fort</b>.");
    if (sw < Math.PI * 1.5) return endAttempt(false, "Il est allé loin… mais il est quand même retombé. <b>Plus fort !</b>", 'warn');
    return endAttempt(false, "Presque un tour complet ! Encore <b>un tout petit peu</b> plus fort.", 'warn');
  }
  if (L.kind === 'moon') {
    if (b.id === 'moon') return moonSuccess();
    return endAttempt(false, moonVerdict() + " Ta fusée est retombée sur Terre.");
  }
  if (L.kind === 'sling') {
    if (b.id === 'giant') return endAttempt(false, L.brake ? "Trop près ! Tu t'es écrasé sur la planète géante. Décolle <b>un peu plus tôt</b>." : "Trop près ! Tu t'es écrasé sur la planète géante. Décolle <b>un tout petit peu plus tard</b>.");
  }
  if (L.kind === 'chase') return endAttempt(false, "Beaucoup trop freiné : tu es descendu si bas que tu es retombé sur la Terre !");
  if (L.kind === 'binary') { C.fate = 'crash'; addTick(S.lastPower, '#ff8a7a'); return endAttempt(false, twinNote("Boum ! Ton vaisseau est tombé dans un des soleils.")); }
  if (L.kind === 'free') {
    addTick(S.lastPower, b.id === 'moon' ? '#ff8a7a' : '#ff8a7a');
    return endAttempt(false, b.id === 'moon' ? "Écrasé sur la Lune ! Tu es passé trop près : lance <b>un tout petit peu plus fort</b>."
                                             : "La fusée est retombée sur Terre sans faire le tour de la Lune : lance <b>un peu plus fort</b>.");
  }
  if (L.kind === 'balance') return endAttempt(false, b.id === 'moon' ? "Le vaisseau est tombé sur la Lune." : "Le vaisseau est tombé sur la Terre.");
  if (L.perturb && b.id === 'blue') return endAttempt(false, "Boum ! Tu as percuté la planète bleue. Choisis un moment où elle est plus loin.");
  if (L.kind === 'mars') return endAttempt(false, b.id === 'mars' ? "Tu es arrivé sur Mars… un peu trop vite !" : "Aïe, tu es tombé dans le Soleil !");
  endAttempt(false, 'Boum !');
}

function moonVerdict() {
  // la fusée met toujours le même temps pour monter : le bon départ est quand la Lune
  // est à peu près à droite de la Terre (angle 0). On compare donc la position de la Lune au décollage.
  const C = S.chk; let d = C.launchMoonA; d = Math.atan2(Math.sin(d), Math.cos(d));
  return d < 0 ? "<b>Trop tôt !</b> Quand ta fusée est arrivée en haut, la Lune n'était <b>pas encore là</b>. Attends un peu plus avant de lancer."
               : "<b>Trop tard !</b> Quand ta fusée est arrivée en haut, la Lune était <b>déjà passée</b>. Lance un peu plus tôt.";
}
function moonSuccess() {
  const W = S.world, s = S.ship;
  const mx = W.moonR * Math.cos(W.moonA), my = W.moonR * Math.sin(W.moonA);
  const a = Math.atan2(s.y - my, s.x - mx);
  S.chk.dock = { a, rel: W.moonA };
  S.stars = 1;
  endAttempt(true, "🌙 Alunissage réussi ! Tu as rejoint la Lune !");
}

// assez de vitesse pour ne jamais retomber vers la Terre ?
const HOME = () => (S.L.gm ? 'la Lune' : 'la Terre');
function escaping(r) { const s = S.ship; return (s.vx * s.vx + s.vy * s.vy) / 2 - (S.L.gm || GM_EARTH) / r >= 0; }

const CHECKS = {
  vertical() {
    const s = S.ship, C = S.chk, L = S.L, r = Math.hypot(s.x, s.y), vr = (s.x * s.vx + s.y * s.vy) / r;
    if (!C.apex && vr <= 0 && !burning()) {
      C.apex = true; C.apexR = r;
      const [a, b] = L.zone, inZone = r >= a && r <= b;
      const crushed = L.kind === 'crew' && S.burnA > L.gLimit;
      const ok = inZone && !crushed;
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), new THREE.MeshBasicMaterial({ color: ok ? 0x5ee08a : (r < a ? 0xff8a7a : 0xffb347) }));
      m.position.copy(P3(s.x, s.y, 0.02)); ghostGroup.add(m);
      addTick(S.lastPower, crushed ? '#c78bff' : ok ? '#5ee08a' : (r < a ? '#ff8a7a' : '#ffb347'));
      if (ok) {
        s.vx = s.vy = 0; S.stars = 1;
        return endAttempt(true, L.kind === 'crew' ? "👩‍🚀 Pile dans la zone verte, et les astronautes vont bien !" : "🎯 Pile dans la zone verte ! La station a attrapé la capsule.");
      }
      if (inZone && crushed) {
        s.vx = s.vy = 0;
        return endAttempt(false, "Tu as atteint la zone verte… mais la poussée était <b>trop forte</b> : les astronautes se sont évanouis 😵 ! Pousse <b>moins fort</b>, mais <b>plus longtemps</b>.", 'warn', 0xc78bff);
      }
    }
    if (r > 17 && vr > 0) {
      if (escaping(r)) {
        addTick(S.lastPower, '#c78bff');
        return endAttempt(false, S.L.gm ? "Beaucoup trop fort ! La capsule va si vite que la Lune <b>n'arrive plus à la retenir</b> : elle s'échappe et ne reviendra jamais !" : "Beaucoup trop fort ! La capsule va si vite que la Terre <b>n'arrive plus à la retenir</b> : elle s'échappe et ne reviendra jamais !", 'bad', 0xc78bff);
      }
      addTick(S.lastPower, '#ffb347');
      return endAttempt(false, S.L.gm ? "Beaucoup trop fort ! Elle est partie <b>si loin</b> qu'on ne la voit plus… la Lune finira par la faire retomber, mais dans très longtemps." : "Beaucoup trop fort ! Elle est partie <b>si loin</b> qu'on ne la voit plus… la Terre finira par la faire retomber, mais dans très longtemps.", 'bad', 0xffb347);
    }
  },
  orbit() {
    const s = S.ship, C = S.chk, r = Math.hypot(s.x, s.y);
    const a = Math.atan2(s.y, s.x); let d = a - C.lastAng; d = Math.atan2(Math.sin(d), Math.cos(d)); C.swept += d; C.lastAng = a;
    C.rmin = Math.min(C.rmin, r); C.rmax = Math.max(C.rmax, r);
    if (!C.done && Math.abs(C.swept) >= TAU && S.L.apoBand) {   // niveau « vague » : on juge la hauteur de la vague
      C.done = true;
      const [a, b] = S.L.apoBand;
      if (C.rmax >= a && C.rmax <= b) { addTick(S.lastPower, '#5ee08a'); S.stars = 1; return endAttempt(true, "〰️ Le haut de ta vague touche la bande verte !"); }
      addTick(S.lastPower, C.rmax < a ? '#ff8a7a' : '#ffb347');
      return endAttempt(false, C.rmax < a ? "Ta vague est <b>trop basse</b> : le satellite ne s'éloigne pas assez de la Terre. Lance-le <b>un peu plus fort</b>."
                                         : "Ta vague est <b>trop haute</b> : le satellite s'éloigne trop. Lance-le <b>un peu moins fort</b>.", 'warn');
    }
    if (!C.done && Math.abs(C.swept) >= TAU) {
      C.done = true;
      const k = C.rmax / C.rmin;
      S.stars = k < 1.15 ? 3 : k < 1.6 ? 2 : 1;
      addTick(S.lastPower, '#5ee08a');
      const msg = S.stars === 3 ? "🛰️ Un tour complet, presque en <b>cercle parfait</b> !" : S.stars === 2 ? "🛰️ Un tour complet ! Ton orbite est un peu <b>ovale</b>." : "🛰️ Un tour complet ! Ton orbite est très <b>allongée</b> (un grand ovale).";
      return endAttempt(true, msg);
    }
    if (r > 16 && !C.done) {
      if (escaping(r)) {
        addTick(S.lastPower, '#c78bff');
        return endAttempt(false, "Trop fort : il va si vite qu'il <b>s'échappe</b> dans l'espace au lieu de tourner autour de la Terre.", 'bad', 0xc78bff);
      }
      addTick(S.lastPower, '#ffb347');
      return endAttempt(false, "Un peu trop fort : il part sur un ovale <b>tellement grand</b> qu'il sort de l'écran. Il reviendrait… dans très longtemps !", 'warn', 0xffb347);
    }
  },
  moon() {
    const s = S.ship, C = S.chk, W = S.world, r = Math.hypot(s.x, s.y), vr = (s.x * s.vx + s.y * s.vy) / r;
    const mx = W.moonR * Math.cos(W.moonA), my = W.moonR * Math.sin(W.moonA);
    if (Math.hypot(s.x - mx, s.y - my) < 1.0) return moonSuccess();
    if (!C.apex && ((vr <= 0 && S.flightT > 0.5) || r >= 9.8)) {
      C.apex = true; C.apexT = S.flightT;
      addGhostBody(mx, my, 0.6, 0xbfc6e0, 'la Lune était là');
    }
    if ((C.apex && S.flightT - C.apexT > 1.6) || r > 25 || S.flightT > 11) return endAttempt(false, moonVerdict());
  },
  sling(B) {
    const s = S.ship, C = S.chk, W = S.world, T = W.target;
    const g = B[0], d = Math.hypot(s.x - g.x, s.y - g.y);
    if (d < C.minD) { C.minD = d; C.ahead = s.x > g.x; }
    if (S.L.perturb) { const bl = B[1]; C.minBlue = Math.min(C.minBlue || 1e9, Math.hypot(s.x - bl.x, s.y - bl.y)); }
    if (Math.hypot(s.x - T.x, s.y - T.y) < T.r) {
      s.vx = s.vy = 0; S.stars = 1;
      return endAttempt(true, S.L.brake ? "🛑 Freinage réussi ! En passant devant la planète, tu as ralenti : la station t'a attrapé."
                                        : "🪐 Catapulte réussie ! La planète t'a lancé jusqu'à la station.");
    }
    if (s.y > 46 || s.x > 46 || s.x < -36 || s.y < -14 || S.flightT > 10) {
      let msg;
      if (S.L.brake) {
        if (C.minD > 7) return endAttempt(false, C.ahead ? "<b>Trop tôt !</b> La planète était encore loin : elle ne t'a presque pas tiré. Décolle plus tard."
                                                         : "<b>Trop tard !</b> La planète était déjà passée : elle ne t'a presque pas tiré. Décolle plus tôt.");
        if (!C.ahead) return endAttempt(false, "Tu es passé <b>derrière</b> la planète : elle t'a <b>accéléré</b> et emporté vers la droite ! Ici, il faut freiner. Décolle <b>plus tôt</b>.");
        if (C.minD > 4.4) return endAttempt(false, "Bien, tu es passé <b>devant</b> la planète ! Mais trop loin : elle ne t'a pas assez freiné. Décolle <b>un peu plus tard</b>.", 'warn');
        if (C.minD < 3.4) return endAttempt(false, "Bien, tu es passé <b>devant</b> ! Mais trop près : elle t'a tellement tiré que tu es reparti vers le bas. Décolle <b>un tout petit peu plus tôt</b>.", 'warn');
        return endAttempt(false, "Presque ! Tu es passé devant la planète, mais tu as raté la station de peu. Essaie un moment très légèrement différent.", 'warn');
      }
      if (C.minBlue < 3.5 && C.minD < 3) return endAttempt(false, "La géante t'a bien lancé… mais la <b>planète bleue</b> est passée trop près et son attraction t'a <b>dévié</b> ! Choisis un passage où elle est loin.", 'warn', 0x6fa8ff);
      if (C.minD > 7) msg = "<b>Trop tard !</b> La planète était déjà loin : elle ne t'a presque pas tiré. Décolle plus tôt.";
      else if (C.ahead) msg = "<b>Trop tôt !</b> Tu es passé <b>devant</b> la planète : elle t'a freiné et tiré en arrière. Décolle plus tard.";
      else msg = "Bien, tu es passé <b>derrière</b> la planète ! Mais pas assez près : elle ne t'a pas assez emporté. Décolle <b>un peu plus tôt</b>.";
      return endAttempt(false, msg, C.ahead || C.minD > 7 ? 'bad' : 'warn');
    }
  },
  reentry() {
    const s = S.ship, r = Math.hypot(s.x, s.y);
    rocket.heat.visible = r < 2.75;                 // ça chauffe en entrant dans l'air !
    if (S.flightT > 15) return endAttempt(false, 'Raté !');
  },
  chase() {
    const s = S.ship, C = S.chk, W = S.world;
    const sx = W.stR * Math.cos(W.stA), sy = W.stR * Math.sin(W.stA);
    if (Math.hypot(s.x - sx, s.y - sy) < 0.9) {
      C.dock = true; S.stars = 1; addTick(S.lastPower, '#5ee08a');
      return endAttempt(true, "🤝 Amarrage réussi ! Tu as rattrapé la station.");
    }
    const a = Math.atan2(s.y, s.x); let d = a - C.lastAng; d = Math.atan2(Math.sin(d), Math.cos(d)); C.swept += d; C.lastAng = a;
    if (C.rel == null && C.swept >= TAU) { C.rel = Math.atan2(Math.sin(W.stA - a), Math.cos(W.stA - a)); }
    if (C.swept >= TAU + 0.5 || (C.dv > 0.02 && C.swept >= Math.PI)) {
      let msg, tone = 'bad', col = '#ff8a7a';
      if (C.dv > 0.02) msg = "Tu as accéléré… et surprise : tu es monté sur un <b>plus grand tour</b>, qui prend plus de temps. Tu as pris <b>encore plus de retard</b> !";
      else if (C.dv > -0.02) msg = "Tu n'as presque rien changé : la station reste toujours devant toi.";
      else if (C.rel > 0) { msg = "Bonne idée de <b>freiner</b> ! Mais pas assez : la station est encore devant toi."; tone = 'warn'; col = '#ffc65c'; }
      else { msg = "Trop freiné : cette fois, c'est <b>toi</b> qui es passé devant la station !"; tone = 'warn'; col = '#ffb347'; }
      addTick(S.lastPower, col);
      return endAttempt(false, msg, tone);
    }
  },
  hohmann() {
    const s = S.ship, C = S.chk;
    const a = Math.atan2(s.y, s.x); let d = a - C.lastAng; d = Math.atan2(Math.sin(d), Math.cos(d)); C.swept += d; C.lastAng = a;
    if (C.burns === 1 && C.swept > TAU * 0.92)
      return endAttempt(false, "Tu as oublié le <b>2e coup de moteur</b> : la fusée est redescendue tout en bas de son ovale.");
  },
  mars() {
    const s = S.ship, C = S.chk, W = S.world, r = Math.hypot(s.x, s.y);
    const mx = W.mR * Math.cos(W.mA), my = W.mR * Math.sin(W.mA);
    if (Math.hypot(s.x - mx, s.y - my) < 0.95) {
      C.dock = { a: Math.atan2(s.y - my, s.x - mx) - W.mA }; S.stars = 1;
      return endAttempt(true, "🔴 Bienvenue sur Mars ! Tu as trouvé la fenêtre de tir.");
    }
    if (!C.apex && r >= W.mR - 0.25) { C.apex = true; C.apexT = S.flightT; addGhostBody(mx, my, 0.3, 0xff9a7a, 'Mars était là'); }
    if ((C.apex && S.flightT - C.apexT > 1.8) || S.flightT > W.tT + 3 || r > 14) {
      // la Terre va plus vite que Mars : en attendant, l'avance de Mars sur la Terre diminue
      const late = Math.sin(C.delta - W.d0) < 0;
      return endAttempt(false, late
        ? "<b>Trop tard !</b> Quand ta fusée est arrivée, Mars n'était <b>pas encore là</b> : il fallait partir quand Mars avait <b>plus d'avance</b>. Comme la Terre rattrape Mars, il faut maintenant attendre la <b>prochaine fenêtre de tir</b>…"
        : "<b>Trop tôt !</b> Quand ta fusée est arrivée, Mars était <b>déjà passée</b>. Attends un peu : la Terre va se rapprocher de Mars.");
    }
  },
};
CHECKS.fuel = CHECKS.vertical;
CHECKS.crew = CHECKS.vertical;

/* ---- point d'équilibre : le vaisseau lâché sans vitesse doit rester sur place ---- */
CHECKS.balance = () => {
  const s = S.ship, C = S.chk, L = S.L;
  if (Math.abs(s.x - C.x0) > 0.5) {
    const toMoon = s.x > C.x0; addTick(S.lastPower, toMoon ? '#ffb347' : '#ff8a7a');
    return endAttempt(false, toMoon ? "La <b>Lune</b> a gagné le tir à la corde : elle tire plus fort ici. Place le vaisseau un peu plus <b>vers la Terre</b>."
                                    : "La <b>Terre</b> a gagné le tir à la corde : elle tire plus fort ici. Place le vaisseau un peu plus <b>vers la Lune</b>.", 'warn');
  }
  if (S.flightT >= L.hold) {
    addTick(S.lastPower, '#5ee08a'); S.stars = 1;
    return endAttempt(true, "⚖️ Il tient en équilibre ! Les deux forces sont égales… pour l'instant. Regarde bien ce qui va se passer.");
  }
};

/* ---- le grand huit : contourner la Lune et revenir vers la Terre ---- */
CHECKS.free = (B) => {
  const s = S.ship, C = S.chk, L = S.L, r = Math.hypot(s.x, s.y);
  const dx = s.x - L.moonX, dy = s.y, dm = Math.hypot(dx, dy);
  C.minD = Math.min(C.minD, dm);
  if (dm < 4) { const a = Math.atan2(dy, dx); if (C.lastM != null) { let d = a - C.lastM; d = Math.atan2(Math.sin(d), Math.cos(d)); C.swingM = (C.swingM || 0) + d; } C.lastM = a; } else C.lastM = null;
  C.maxR = Math.max(C.maxR || 0, r);
  if (r < 3.2 && S.flightT > 3) {
    const sw = C.swingM || 0;
    if (sw > 2.6 && sw < 6.5) {
      addTick(S.lastPower, '#5ee08a'); S.stars = 1; s.vx *= 0.2; s.vy *= 0.2;
      return endAttempt(true, "♾️ Retour à la maison ! La Lune t'a fait faire demi-tour sans une goutte de carburant.");
    }
    if (C.maxR < 7.5) { addTick(S.lastPower, '#ff8a7a'); return endAttempt(false, "Pas assez fort : la fusée n'est même pas allée jusqu'à la Lune avant de redescendre."); }
    if (sw <= 0) { addTick(S.lastPower, '#ff8a7a'); return endAttempt(false, "La fusée est passée <b>du mauvais côté</b> de la Lune et a fait des boucles bizarres… Lance <b>un peu plus fort</b>.", 'warn'); }
    addTick(S.lastPower, '#ffb347');
    return endAttempt(false, "Presque ! La fusée est revenue, mais en passant <b>trop loin</b> de la Lune : elle n'a pas fait le grand 8. Lance <b>un tout petit peu moins fort</b>.", 'warn');
  }
  if (r > 24) { addTick(S.lastPower, '#ffb347'); return endAttempt(false, "Trop fort : la fusée est passée loin de la Lune, qui ne l'a pas assez tirée pour la faire revenir. Elle file dans l'espace…", 'warn'); }
  if (S.flightT > 22) { addTick(S.lastPower, '#c78bff'); return endAttempt(false, "La fusée tourne entre la Terre et la Lune sans revenir… Quand deux astres tirent en même temps, les trajets peuvent devenir <b>très compliqués</b> ! Essaie un tout petit peu moins fort.", 'warn', 0xc78bff); }
};

/* ---- ricochet : traverser l'air sans rebondir ni trop chauffer ---- */
CHECKS.skip = () => {
  const s = S.ship, C = S.chk, L = S.L, r = Math.hypot(s.x, s.y), vr = (s.x * s.vx + s.y * s.vy) / r;
  if (C.drag > L.heatMax) {
    rocket.heat.visible = false; boom(s.x, s.y, 1.6); addTick(S.lastPower, '#ffb347');
    return endAttempt(false, (C.rp > 2.02 ? tr('Presque ! ') : '') + tr("<b>Trop raide !</b> La capsule a plongé trop vite dans l'air : elle a freiné trop fort d'un coup et <b>trop chauffé</b> 🔥. Rends l'angle un peu plus <b>à plat</b>."), C.rp > 2.02 ? 'warn' : 'bad', 0xffb347);
  }
  if (C.inAtm && r > L.atm + 0.3 && vr > 0) {
    addTick(S.lastPower, '#c78bff');
    return endAttempt(false, (C.rp < 2.56 ? tr('Presque ! ') : '') + tr("<b>Ricochet !</b> La capsule est arrivée <b>trop à plat</b> : elle a rebondi sur l'air et repart dans l'espace. Rends l'angle un peu plus <b>raide</b>."), C.rp < 2.56 ? 'warn' : 'bad', 0xc78bff);
  }
  if (!C.inAtm && (S.flightT > 12 || r > 14)) {
    addTick(S.lastPower, '#c78bff');
    return endAttempt(false, "La capsule n'a même pas touché l'air : elle est passée à côté de la Terre ! Rends l'angle plus <b>raide</b>.", 'bad', 0xc78bff);
  }
};

/* ---- satellite immobile : rester au-dessus de la ville pendant un demi-tour de la Terre ---- */
CHECKS.geo = () => {
  const s = S.ship, C = S.chk, L = S.L, W = S.world;
  const a = Math.atan2(s.y, s.x), d = Math.atan2(Math.sin(a - W.cityA), Math.cos(a - W.cityA));
  if (Math.abs(d) > L.tol) {
    const near = S.flightT > Math.PI / L.wE * 0.55;
    addTick(S.lastPower, d > 0 ? '#ff8a7a' : '#ffb347');
    return endAttempt(false, (near ? tr('Presque ! ') : '') + tr(d > 0
      ? "Le satellite tourne <b>plus vite</b> que la Terre : il part <b>devant</b> la ville. Place-le <b>plus haut</b>."
      : "La Terre tourne <b>plus vite</b> que le satellite : la ville le <b>dépasse</b>. Place-le <b>plus bas</b>."), near ? 'warn' : 'bad');
  }
  if (S.flightT >= Math.PI / L.wE) {
    addTick(S.lastPower, '#5ee08a'); S.stars = 1;
    return endAttempt(true, "📡 Parfait ! Le satellite tourne exactement aussi vite que la Terre : il reste au-dessus de la ville.");
  }
};

/* ---- fusée à étages : le sommet du vol dit si on a bien largué ---- */
CHECKS.stage = () => {
  const s = S.ship, C = S.chk, L = S.L, st = S.st, r = Math.hypot(s.x, s.y), vr = (s.x * s.vx + s.y * s.vy) / r;
  if (C.apex || vr > 0 || burning()) return;
  C.apex = true; C.apexR = r;
  const [a, b] = L.zone, ok = r >= a && r <= b;
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), new THREE.MeshBasicMaterial({ color: ok ? 0x5ee08a : 0xff8a7a }));
  m.position.copy(P3(s.x, s.y, 0.02)); ghostGroup.add(m);
  if (ok) { s.vx = s.vy = 0; S.stars = 1; return endAttempt(true, "🧨 Bien joué ! Sans le réservoir vide, la fusée était plus légère : elle est montée jusqu'à la zone verte."); }
  if (r > b) return endAttempt(false, "Trop haut ! Tu as dépassé la zone verte.", 'warn', 0xffb347);
  if (st.att) return endAttempt(false, "Tu n'as pas largué le grand réservoir : la fusée a traîné ce <b>poids mort</b> jusqu'au bout. Appuie sur <b>LARGUER</b> pendant le vol !");
  if (st.dropFuel > 0.02) return endAttempt(false, (st.dropFuel < 0.25 ? tr('Presque ! ') : '') + tr("<b>Trop tôt !</b> Il restait du carburant dans le grand réservoir quand tu l'as largué : tu as jeté de quoi pousser ! Attends qu'il soit <b>vide</b>."), st.dropFuel < 0.25 ? 'warn' : 'bad');
  const late = st.dropT - st.emptyT;
  return endAttempt(false, (late < 0.35 ? tr('Presque ! ') : '') + tr("<b>Trop tard !</b> Le grand réservoir était vide depuis un moment : la fusée a traîné ce <b>poids mort</b> pour rien. Largue-le <b>dès qu'il est vide</b>."), late < 0.35 ? 'warn' : 'bad');
};

/* ---- astéroïde : une fois poussé, passe-t-il à côté de la Terre ? ---- */
CHECKS.deflect = () => {
  const s = S.ship, C = S.chk, r = Math.hypot(s.x, s.y), vr = (s.x * s.vx + s.y * s.vy) / r;
  C.rmin = Math.min(C.rmin, r);
  if (vr > 0 && r > C.rmin + 1.5) {
    const P = S.lastPower; S.stars = P <= 35 ? 3 : P <= 60 ? 2 : 1;
    addTick(0, '#5ee08a');
    return endAttempt(true, S.stars === 3 ? "🌍 Sauvé ! Une <b>toute petite</b> poussée a suffi : l'astéroïde passe à côté de la Terre."
                                          : "🌍 Sauvé ! L'astéroïde passe à côté de la Terre.");
  }
};

/* ---- deux soleils : faire un tour complet du système ---- */
CHECKS.binary = () => {
  const s = S.ship, C = S.chk, r = Math.hypot(s.x, s.y);
  const a = Math.atan2(s.y, s.x); let d = a - C.lastAng; d = Math.atan2(Math.sin(d), Math.cos(d)); C.swept += d; C.lastAng = a;
  if (C.swept >= TAU) {
    addTick(S.lastPower, '#5ee08a'); S.stars = 1;
    return endAttempt(true, "✨ Un tour complet autour des deux soleils ! Loin d'eux, l'orbite reste calme.");
  }
  if (r > 16) { C.fate = 'out'; addTick(S.lastPower, '#ffb347'); return endAttempt(false, twinNote("Éjecté ! Ton vaisseau est sorti du système."), 'warn'); }
};
function twinNote(msg) {
  const T = S.world.twin; msg = tr(msg);
  if (!T || (T.fate || 'alive') === S.chk.fate) return msg;
  return msg + ' ' + tr("Et le <b>jumeau</b>, parti presque pareil, a fait <b>tout autre chose</b> ! C'est ça, le chaos.");
}
function startTwin() {
  const s = S.ship, W = S.world, k = 1.01;
  if (W.twin) { ghostGroup.remove(W.twin.mesh); }
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), new THREE.MeshBasicMaterial({ color: 0xc78bff }));
  const trail = new Trail(0xc78bff); trail.line.material.opacity = .75; ghostGroup.add(trail.line); ghostGroup.add(mesh);
  mesh.userData.oneShot = true; trail.line.userData.oneShot = true;
  W.twin = { x: s.x, y: s.y, vx: s.vx * k, vy: s.vy * k, alive: true, mesh, trail, fate: null, n: 0 };
}
function twinStep(h) {
  const T = S.world.twin; if (!T || !T.alive) return;
  let ax = 0, ay = 0;
  for (const b of bodies()) {
    const dx = b.x - T.x, dy = b.y - T.y, d2 = dx * dx + dy * dy, d = Math.sqrt(d2);
    if (d < b.r) { T.alive = false; T.fate = 'crash'; return; }
    const a = b.gm / (d2 * d); ax += a * dx; ay += a * dy;
  }
  T.vx += ax * h; T.vy += ay * h; T.x += T.vx * h; T.y += T.vy * h;
  if (Math.hypot(T.x, T.y) > 16) { T.alive = false; T.fate = 'out'; }
  if (++T.n % 3 === 0) T.trail.push(T.x, T.y);
}

/* ------------------------------------------------------------------ niveau « trace sur la carte » */
// Le satellite tourne sur un cercle penché ; on calcule où il se trouve au-dessus de la Terre (qui tourne).
function satPos(W) {
  const c = Math.cos(W.u), sn = Math.sin(W.u), i = W.inc;
  return new THREE.Vector3(c * W.Ro, sn * Math.sin(i) * W.Ro, -sn * Math.cos(i) * W.Ro);
}
function groundPoint(W, p) {   // -> coordonnées sur la carte (0..1, 0..1) et latitude en degrés
  const cr = Math.cos(W.rho), sr = Math.sin(W.rho);
  const x = p.x * cr - p.z * sr, z = p.x * sr + p.z * cr, y = p.y;
  let u = Math.atan2(z, -x) / TAU; u -= Math.floor(u);
  const th = Math.acos(y / p.length());
  return { u, v: th / Math.PI, lat: 90 - th * 180 / Math.PI };
}
function trackStep(h) {
  const W = S.world, L = S.L;
  W.rho += W.we * h;
  if (S.state === 'idle') return;
  if (W.u >= (L.laps || 2) * TAU) {
    if (L.overfly && S.state === 'flying') overflyVerdict();
    return;
  }
  W.u += W.ws * h; S.flightT += h;
  const gp = groundPoint(W, satPos(W));
  GRAPH.sampleTrack(gp);
  if (L.overfly) {
    if (S.state !== 'flying') return;
    const C = S.chk, ph = (90 - L.city.lat) * Math.PI / 180, cth = Math.PI * gp.v;
    // distance (en degrés) entre le point survolé et la ville, sur la sphère
    const dLon = (gp.u - L.city.u) * TAU;
    const cosd = Math.cos(cth) * Math.cos(ph) + Math.sin(cth) * Math.sin(ph) * Math.cos(dLon);
    const dist = Math.acos(Math.max(-1, Math.min(1, cosd))) * 180 / Math.PI;
    C.maxLat = Math.max(C.maxLat || -90, gp.lat);
    if (Math.abs(gp.lat - L.city.lat) < 6 && (C.bestD == null || dist < C.bestD)) { C.bestD = dist; C.bestDu = Math.atan2(Math.sin(dLon), Math.cos(dLon)); }
    if (dist < (L.overR || 7)) { S.stars = 1; addTick(S.lastPower, '#5ee08a'); return endAttempt(true, "📍 Survol réussi ! Le satellite est passé juste au-dessus de la ville."); }
    return;
  }
  if (!S.chk.judged && W.u >= Math.PI / 2) {
    S.chk.judged = true;
    const top = gp.lat, d = top - L.city.lat;
    if (Math.abs(d) <= 5) { S.stars = 1; addTick(S.lastPower, '#5ee08a'); return endAttempt(true, "🗺️ Le haut de ta vague passe pile à la hauteur de la ville !"); }
    addTick(S.lastPower, d < 0 ? '#ff8a7a' : '#ffb347');
    endAttempt(false, d < 0 ? (d > -12 ? "Presque ! Ta vague monte <b>un tout petit peu trop bas</b> : penche l'orbite un peu plus." : "Ta vague ne monte <b>pas assez haut</b> : elle reste au sud de la ville. <b>Penche plus</b> l'orbite.")
                            : (d < 12 ? "Presque ! Ta vague monte <b>un tout petit peu trop haut</b> : penche l'orbite un peu moins." : "Ta vague monte <b>trop haut</b>, elle passe au nord de la ville. <b>Penche moins</b> l'orbite."), d > -12 && d < 12 ? 'warn' : 'bad');
  }
}
function overflyVerdict() {
  const C = S.chk, L = S.L;
  if ((C.maxLat || 0) < L.city.lat - 4) { addTick(S.lastPower, '#ff8a7a'); return endAttempt(false, "Ta vague ne monte <b>pas assez haut</b> pour atteindre la ville : <b>penche plus</b> l'orbite."); }
  addTick(S.lastPower, '#ffb347');
  endAttempt(false, C.bestDu > 0 ? "Ta trace passe <b>à droite</b> de la ville sur la carte. Change le <b>moment</b> du départ pour décaler la vague."
                                  : "Ta trace passe <b>à gauche</b> de la ville sur la carte. Change le <b>moment</b> du départ pour décaler la vague.", 'warn');
}
function trackDisplay() {
  const W = S.world;
  W.earth.rotation.y = W.rho;
  const inc = S.state === 'idle' ? (+$('#power').value) / 100 * 90 * Math.PI / 180 : W.inc;
  if (S.state === 'idle') { W.inc = inc; W.u = 0; }
  W.ring.rotation.x = inc;
  const p = satPos(W);
  rocket.group.position.copy(p);
  const q = { u: W.u + 0.01, inc: W.inc, Ro: W.Ro }; const p2 = satPos(q);
  const d = p2.sub(p).normalize(); rocket.group.quaternion.setFromUnitVectors(UP, d);
}

/* ------------------------------------------------------------------ graphique */
const GRAPH = (() => {
  const cv = $('#graph'), g = cv.getContext('2d'), Wd = cv.width, Ht = cv.height;
  const P = { l: 40, r: 10, t: 12, b: 32 };
  let dirty = true, cursor = null;
  const pw = () => Wd - P.l - P.r, ph = () => Ht - P.t - P.b;
  const X = t => P.l + t / S.L.gx * pw();
  const Y = hgt => Ht - P.b - hgt / S.L.gy * ph();
  const beadColor = k => `hsl(${(195 + k * 32) % 360}, 90%, 62%)`;

  function setup() {
    const L = S.L; cursor = null; dirty = true;
    if (!L.graph) return;
    const T = { height: '📈 Le graphique du voyage', map: '🗺️ La carte : où passe le satellite ?', log: '📒 Le carnet de bord', push: '📒 Le carnet de bord' }[L.graph];
    const G = {
      height: "Le trait monte quand la fusée s'éloigne de la Terre, et descend quand elle se rapproche. Les <b>perles de couleur</b> marquent les mêmes moments dans l'espace et sur le graphique.",
      map: "La Terre « déroulée » à plat. Le trait montre les endroits survolés par le satellite. <b>En haut</b> = vers le pôle Nord, <b>en bas</b> = vers le pôle Sud.",
      log: "Chaque point est un essai : <b style='color:#5ee08a'>vert</b> = réussi, <b style='color:#ff8a7a'>rouge</b> = trop bas, <b style='color:#ffb347'>orange</b> = trop haut, <b style='color:#c78bff'>violet</b> = astronautes écrasés. Le petit cercle blanc = tes réglages actuels.",
      push: "Chaque point est un essai : <b style='color:#5ee08a'>vert</b> = Terre sauvée, <b style='color:#ff8a7a'>rouge</b> = astéroïde tombé. Le cercle blanc avance pendant que l'astéroïde approche : c'est <b>maintenant</b>, avec la force choisie.",
    }[L.graph];
    $('#graphTitle').textContent = tr(T); $('#graphLegend').innerHTML = tr(G);
    draw();
  }
  function begin() {
    const L = S.L; if (!L.graph) return;
    if (L.graph === 'map') { if (S.curve && S.curve.pts.length) { S.ghostCurves.push(S.curve); if (S.ghostCurves.length > 3) S.ghostCurves.shift(); } S.curve = { pts: [] }; }
    if (L.graph === 'height') {
      if (S.curve && S.curve.pts.length) { S.ghostCurves.push(S.curve); if (S.ghostCurves.length > 3) S.ghostCurves.shift(); }
      S.curve = { pts: [], beads: [] };
    }
    dirty = true;
  }
  function sample(t) {
    const L = S.L; if (L.graph !== 'height' || !S.curve || t > L.gx) return;
    const s = S.ship, hgt = Math.hypot(s.x, s.y) - R_EARTH, pts = S.curve.pts, last = pts[pts.length - 1];
    if (!last || t - last.t >= L.gx / 300) { pts.push({ t, h: hgt }); dirty = true; }
    if (L.beads && t >= S.chk.nextBead) {
      const k = S.curve.beads.length, col = beadColor(k);
      S.curve.beads.push({ t, h: hgt, col });
      const m = new THREE.Mesh(new THREE.SphereGeometry(L.kind === 'orbit' ? 0.13 : 0.11, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(col) }));
      m.position.copy(P3(s.x, s.y, 0.05)); m.userData.oneShot = true; ghostGroup.add(m);
      S.chk.nextBead += L.gx / 12;
    }
  }
  function sampleTrack(gp) { if (!S.curve) return; S.curve.pts.push(gp); dirty = true; }
  function setCursor(a, b) { cursor = { a, b }; dirty = true; }
  function endCurve(color) { if (S.curve) S.curve.color = color; dirty = true; }

  function frame() { if (dirty && S.L.graph) { draw(); dirty = false; } }

  function axes(labelY1, labelY0, labelX) {
    g.strokeStyle = 'rgba(160,180,255,.5)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(P.l, P.t); g.lineTo(P.l, Ht - P.b); g.lineTo(Wd - P.r, Ht - P.b); g.stroke();
    g.fillStyle = '#a9b4d8'; g.font = '600 17px Fredoka, sans-serif';
    g.save(); g.translate(16, P.t + ph() / 2); g.rotate(-Math.PI / 2); g.textAlign = 'center'; g.fillText(tr(labelY1), 0, 0); g.restore();
    g.textAlign = 'right'; g.fillText(tr(labelX), Wd - P.r, Ht - 10);
    if (labelY0) { g.textAlign = 'left'; g.fillText(labelY0, P.l + 6, Ht - 10); }
  }

  function drawHeight() {
    const L = S.L;
    const band = L.apoBand ? L.apoBand : L.zone;
    // bande verte
    const y1 = Y(band[1] - R_EARTH), y0 = Y(band[0] - R_EARTH);
    g.fillStyle = 'rgba(70,224,124,.22)'; g.fillRect(P.l, y1, pw(), y0 - y1);
    g.strokeStyle = 'rgba(107,255,158,.7)'; g.lineWidth = 1.5; g.setLineDash([6, 5]);
    g.beginPath(); g.moveTo(P.l, y1); g.lineTo(Wd - P.r, y1); g.moveTo(P.l, y0); g.lineTo(Wd - P.r, y0); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#7dffaa'; g.font = '600 15px Fredoka, sans-serif'; g.textAlign = 'right'; g.fillText(tr('bande verte'), Wd - P.r - 4, y1 - 6);
    // le sol
    g.strokeStyle = '#4f8fe0'; g.lineWidth = 4; g.beginPath(); g.moveTo(P.l, Y(0)); g.lineTo(Wd - P.r, Y(0)); g.stroke();
    axes('loin de la Terre ↑', '', 'temps →');
    g.fillStyle = '#9fd0ff'; g.textAlign = 'left'; g.font = '600 15px Fredoka, sans-serif'; g.fillText(tr('sol'), P.l + 6, Y(0) - 8);
    const line = (c, color, width) => {
      if (!c.pts.length) return;
      g.strokeStyle = color; g.lineWidth = width; g.lineJoin = 'round'; g.beginPath();
      c.pts.forEach((p, k) => { const x = X(p.t), y = Math.max(P.t, Y(p.h)); k ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
    };
    S.ghostCurves.forEach(c => line(c, c.color ? c.color + '66' : 'rgba(200,200,230,.3)', 2.5));
    if (S.curve) {
      line(S.curve, '#6fe3ff', 4);
      S.curve.beads.forEach(b => { g.fillStyle = b.col; g.beginPath(); g.arc(X(b.t), Math.max(P.t, Y(b.h)), 6, 0, TAU); g.fill(); });
      const lp = S.curve.pts[S.curve.pts.length - 1];
      if (lp) { g.fillStyle = '#fff'; g.beginPath(); g.arc(X(lp.t), Math.max(P.t, Y(lp.h)), 6, 0, TAU); g.fill(); }
    }
  }

  function drawMap() {
    const L = S.L, img = earthMat.map.image;
    const x0 = 6, w = Wd - 12, y0 = 6, h = Ht - 12;
    g.globalAlpha = .85; g.drawImage(img, x0, y0, w, h); g.globalAlpha = 1;
    const MX = u => x0 + u * w, MY = v => y0 + v * h;
    g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 1.5; g.setLineDash([6, 6]);
    g.beginPath(); g.moveTo(x0, MY(.5)); g.lineTo(x0 + w, MY(.5)); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#fff'; g.font = '600 15px Fredoka, sans-serif'; g.textAlign = 'left';
    g.fillText(tr('équateur'), x0 + 6, MY(.5) - 6); g.fillText(tr('▲ Nord'), x0 + 6, y0 + 18); g.fillText(tr('▼ Sud'), x0 + 6, y0 + h - 8);
    const track = (c, color, width) => {
      g.strokeStyle = color; g.lineWidth = width; g.beginPath(); let prev = null;
      c.pts.forEach(p => { const x = MX(p.u), y = MY(p.v); if (!prev || Math.abs(p.u - prev.u) > .5) g.moveTo(x, y); else g.lineTo(x, y); prev = p; });
      g.stroke();
    };
    S.ghostCurves.forEach(c => track(c, (c.color || '#c8c8e6') + '77', 2.5));
    if (S.curve) {
      track(S.curve, '#6fe3ff', 4);
      const lp = S.curve.pts[S.curve.pts.length - 1];
      if (lp) { g.fillStyle = '#fff'; g.beginPath(); g.arc(MX(lp.u), MY(lp.v), 6, 0, TAU); g.fill(); }
    }
    // la ville
    const cx = MX(L.city.u), cy = MY((90 - L.city.lat) / 180);
    g.fillStyle = '#ffd34a'; g.font = '700 26px sans-serif'; g.textAlign = 'center'; g.fillText('★', cx, cy + 9);
    g.font = '600 15px Fredoka, sans-serif'; g.fillText(tr('ville'), cx, cy - 14);
  }

  function drawLog() {
    const L = S.L;
    const XA = a => P.l + a / 100 * pw(), YB = b => Ht - P.b - b / 100 * ph();
    if (L.graph === 'push') {
      axes('force ↑', tr('tôt'), tr('tard →'));
      S.log.forEach(p => { g.fillStyle = p.color; g.beginPath(); g.arc(XA(p.a), YB(p.b), 6, 0, TAU); g.fill(); });
      if (cursor) { g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.beginPath(); g.arc(XA(cursor.a), YB(cursor.b), 9, 0, TAU); g.stroke(); }
      return;
    }
    const lim = (L.gLimit - 2.0) / 0.06;           // position du curseur « force » à la limite
    g.fillStyle = 'rgba(255,80,80,.16)'; g.fillRect(XA(lim), P.t, XA(100) - XA(lim), ph());
    g.strokeStyle = 'rgba(255,120,120,.7)'; g.setLineDash([6, 5]); g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(XA(lim), P.t); g.lineTo(XA(lim), Ht - P.b); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#ff9a9a'; g.font = '600 15px Fredoka, sans-serif'; g.textAlign = 'center';
    g.fillText(tr('trop fort pour'), (XA(lim) + XA(100)) / 2, P.t + 20); g.fillText(tr('les astronautes 😵'), (XA(lim) + XA(100)) / 2, P.t + 38);
    axes('durée ↑', '', 'force →');
    S.log.forEach(p => { g.fillStyle = p.color; g.beginPath(); g.arc(XA(p.a), YB(p.b), 6, 0, TAU); g.fill(); });
    if (cursor) { g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.beginPath(); g.arc(XA(cursor.a), YB(cursor.b), 9, 0, TAU); g.stroke(); }
  }

  function draw() {
    const L = S.L; if (!L || !L.graph) return;
    g.clearRect(0, 0, Wd, Ht); g.fillStyle = '#0b1130'; g.fillRect(0, 0, Wd, Ht);
    if (L.graph === 'height') drawHeight();
    if (L.graph === 'map') drawMap();
    if (L.graph === 'log' || L.graph === 'push') drawLog();
  }
  return { setup, begin, sample, sampleTrack, setCursor, endCurve, frame, draw, logPoint(a, b, color) { S.log.push({ a, b, color }); if (S.log.length > 40) S.log.shift(); dirty = true; } };
})();

/* ------------------------------------------------------------------ interface */
function addTick(p, color) {
  if (S.L.graph === 'log') { GRAPH.logPoint(S.lastPower, S.lastPower2, color); return; }
  if (S.L.graph === 'push') { GRAPH.logPoint(S.chk.moment, S.lastPower, color); return; }
  const box = $('#ticks'); box.querySelectorAll('.last').forEach(e => e.classList.remove('last'));
  const t = document.createElement('span'); t.style.left = p + '%'; t.style.background = color; t.style.color = color; t.className = 'last';
  box.appendChild(t); while (box.children.length > 8) box.firstChild.remove();
}
const POWER_WORDS = ['tout doux', 'doux', 'moyen', 'fort', 'très fort', 'énorme !'];
function updatePowerWord() {
  const p = +$('#power').value;
  if (S.L && S.L.control === 'push') {
    $('#powerWord').textContent = tr(p < 15 ? 'freiner fort' : p < 35 ? 'freiner' : p < 48 ? 'freiner un peu' : p <= 52 ? 'rien' : p < 65 ? 'accélérer un peu' : p < 85 ? 'accélérer' : 'accélérer fort');
    return;
  }
  const wl = S.L && S.L.s1 ? lt(S.L, 's1').words : POWER_WORDS.map(tr);
  $('#powerWord').textContent = wl[Math.min(wl.length - 1, Math.floor(p / (100.01 / wl.length)))];
  if (S.L && S.L.s2) { const w2 = lt(S.L, 's2').words, p2 = +$('#power2').value; $('#power2Word').textContent = w2[Math.min(w2.length - 1, Math.floor(p2 / (100.01 / w2.length)))]; }
  if (S.L && S.L.kind === 'crew') { updateCrew(); GRAPH.setCursor(p, +$('#power2').value); }
  if (S.L && S.L.kind === 'fuel' && S.state !== 'flying') setTankLevel(p / 100);
}
function setTankLevel(f) { rocket.tank.children.forEach(t => { t.scale.y = Math.max(0.02, f); }); }
function updateAttempts() { $('#attempts').textContent = `${tr('Essai n°')} ${S.attempts + (S.state === 'flying' || S.state === 'success' ? 0 : 1)}`; }
function updateLaunchBtn() {
  const L = S.L, b = $('#btnLaunch');
  let dis = S.state === 'flying' || S.state === 'success' || (S.state === 'ended' && movingStart(L));
  let txt = L.btn || '🚀 LANCER';
  if (L.kind === 'hohmann') {
    if (S.state === 'flying' && S.chk.burns === 1) { dis = false; txt = '🔥 ALLUMER (2e coup)'; } else txt = '🔥 ALLUMER (1er coup)';
  }
  if (L.kind === 'lander') {
    if (S.state === 'flying') { dis = false; txt = '🔥 MOTEUR (appuie)'; } else txt = '▶ DESCENDRE';
  }
  if (L.kind === 'stage' && S.state === 'flying' && S.st.att) { dis = false; txt = '✂️ LARGUER'; }
  b.disabled = dis; b.textContent = tr(txt);
}
let toastTimer = 0;
// Le message s'efface tout seul après un temps de lecture (plus long s'il est long ou s'il y a un indice),
// pour ne pas cacher la scène. Un clic dessus le fait disparaître tout de suite.
function showToast(html, tone) {
  const t = $('#toast'); t.className = tone || ''; t.innerHTML = html; clearTimeout(toastTimer);
  const len = t.textContent.length;
  const ms = Math.min(12000, Math.max(4500, 2500 + len * 55));
  toastTimer = setTimeout(fadeToast, ms);
}
function fadeToast() {
  const t = $('#toast'); if (t.classList.contains('hidden')) return;
  t.classList.add('fading'); clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 700);
}
function hideToast() { clearTimeout(toastTimer); $('#toast').className = 'hidden'; }
$('#toast').addEventListener('click', fadeToast);

function showWin() {
  const L = S.L;
  $('#winStars').textContent = L.stars ? '★'.repeat(S.stars) + '☆'.repeat(3 - S.stars) : '';
  const more = tr({ orbit: ' — sauras-tu faire une orbite toute ronde ?', hohmann: ' — sauras-tu tourner encore plus rond ?', lander: ' — sauras-tu te poser encore plus doucement ?', deflect: ' — sauras-tu le sauver avec une poussée encore plus petite ?' }[L.kind]);
  $('#winSub').textContent = (LANG === 'en' ? `Done in ${S.attempts} ${S.attempts > 1 ? 'tries' : 'try'}` : `Réussi en ${S.attempts} essai${S.attempts > 1 ? 's' : ''}`) + (L.stars && S.stars < 3 && more ? more : '');
  $('#winText').innerHTML = lt(L, 'discover');
  $('#btnNext').classList.toggle('hidden', S.li >= LEVELS.length - 1);
  $('#win').classList.remove('hidden');
}

function buildMenu() {
  const done = store.get('done') || {};
  $('#levelList').innerHTML = '';
  LEVELS.forEach((L, i) => {
    if (L.part) { const h = document.createElement('div'); h.className = 'menuPart'; h.textContent = lt(L, 'part'); $('#levelList').appendChild(h); }
    const b = document.createElement('button'); b.className = 'lvl';
    b.innerHTML = `<span class="ic">${L.icon}</span><span><div class="t">${i + 1}. ${lt(L, 'title')}</div><div class="d">${lt(L, 'short')}</div></span>` +
      (done[i] ? `<span class="done">✔</span>` : '');
    b.onclick = () => { $('#menu').classList.add('hidden'); buildLevel(i); };
    $('#levelList').appendChild(b);
  });
}

$('#btnLaunch').onclick = launch;
$('#btnMenu').onclick = () => { buildMenu(); $('#menu').classList.remove('hidden'); };
$('#btnReplay').onclick = () => { $('#win').classList.add('hidden'); buildLevel(S.li); };
$('#btnNext').onclick = () => { $('#win').classList.add('hidden'); buildLevel(Math.min(S.li + 1, LEVELS.length - 1)); };
$('#btnSlow').onclick = e => { S.slow = !S.slow; e.currentTarget.classList.toggle('on', S.slow); };
$('#btnCam').onclick = () => resetCamera();
$('#power').addEventListener('input', updatePowerWord);
$('#power2').addEventListener('input', updatePowerWord);
$('#btnShare').onclick = shareLink;
$('#btnLang').onclick = () => setLang(LANG === 'fr' ? 'en' : 'fr');
window.addEventListener('hashchange', () => {
  const n = levelFromUrl(); if (n == null) return;
  const want = /level[-=_]?\d/i.test(location.hash) ? 'en' : 'fr', langChanged = want !== LANG;
  if (langChanged) { LANG = want; store.set('lang', want); applyStaticLang(); buildMenu(); }
  if (n !== S.li || langChanged) { $('#menu').classList.add('hidden'); $('#win').classList.add('hidden'); buildLevel(n); }
});
const isLanderFlying = () => S.L.kind === 'lander' && S.state === 'flying';
window.addEventListener('keydown', e => {
  if (e.code !== 'Space' || !$('#menu').classList.contains('hidden') || !$('#win').classList.contains('hidden')) return;
  e.preventDefault();
  if (isLanderFlying()) { S.thrust = true; return; }
  if (!e.repeat) launch();
});
window.addEventListener('keyup', e => { if (e.code === 'Space') S.thrust = false; });
// moteur à maintenir (niveau atterrissage)
const btnL = $('#btnLaunch');
btnL.addEventListener('pointerdown', () => { if (isLanderFlying()) S.thrust = true; });
['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btnL.addEventListener(ev, () => { S.thrust = false; }));
btnL.addEventListener('contextmenu', e => e.preventDefault());

/* ------------------------------------------------------------------ caméra */
const cam = { c: new THREE.Vector3(), d: 20, el: 1, az: 0 };
function resetCamera() { const C = S.L.cam; cam.c.copy(P3(C.c[0], C.c[1])); cam.d = C.d; cam.el = C.el; cam.az = C.az || 0; }
function applyCamera() {
  const ce = Math.cos(cam.el);
  camera.position.set(cam.c.x + cam.d * ce * Math.sin(cam.az), cam.c.y + cam.d * Math.sin(cam.el), cam.c.z + cam.d * ce * Math.cos(cam.az));
  camera.lookAt(cam.c);
}
let drag = null; const pointers = new Map();
canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); drag = { x: e.clientX, y: e.clientY }; });
canvas.addEventListener('pointermove', e => {
  if (!pointers.has(e.pointerId)) return;
  if (pointers.size === 2) {           // pincer pour zoomer
    const [a, b] = [...pointers.values()]; const d0 = Math.hypot(a.x - b.x, a.y - b.y);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const [c, d] = [...pointers.values()]; const d1 = Math.hypot(c.x - d.x, c.y - d.y);
    if (d0 > 0) cam.d = Math.min(120, Math.max(6, cam.d * d0 / d1)); return;
  }
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (!drag) return;
  cam.az -= (e.clientX - drag.x) * 0.006; cam.el = Math.min(1.5, Math.max(0.2, cam.el + (e.clientY - drag.y) * 0.006));
  drag = { x: e.clientX, y: e.clientY };
});
const endPtr = e => { pointers.delete(e.pointerId); drag = pointers.size === 1 ? { ...[...pointers.values()][0] } : null; };
canvas.addEventListener('pointerup', endPtr); canvas.addEventListener('pointercancel', endPtr);
canvas.addEventListener('wheel', e => { e.preventDefault(); cam.d = Math.min(120, Math.max(6, cam.d * (1 + e.deltaY * 0.001))); }, { passive: false });

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h;
  camera.fov = w < h ? 70 : 50; camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

/* ------------------------------------------------------------------ boucle */
let last = performance.now(), clock = 0;
function frame(now) {
  const dtReal = Math.min(0.05, (now - last) / 1000); last = now;
  advance(dtReal);
  applyCamera(); renderer.render(scene, camera); updateLabels();
  requestAnimationFrame(frame);
}
function advance(dtReal) {
  clock += dtReal; const now = clock * 1000;
  const L = S.L;
  let simDt = dtReal * (L.burnSpeed && burning() ? L.burnSpeed : L.speed) * (S.slow ? 0.45 : 1);
  const n = Math.ceil(simDt / H), h = simDt / n;
  const docked = (S.state === 'success' && (L.kind === 'chase' || L.kind === 'mars' || L.kind === 'skip'));
  for (let i = 0; i < n; i++) {
    worldStep(h);
    if (L.kind === 'track') { trackStep(h); continue; }
    if (S.state === 'flying') { if (L.kind === 'lander') landerStep(h); else shipStep(h); }
    else if (S.state === 'coast') coastStep(h, false);
    else if (L.keepSim && !docked && (S.state === 'success' || S.state === 'ended')) coastStep(h, true);
  }
  S.simT += simDt;

  // vers le prochain essai
  if (S.state === 'ended' && now > S.resetAt) { resetShip(); updateAttempts(); updateLaunchBtn(); }

  // affichage
  const s = S.ship, W = S.world;
  if (L.kind === 'chase') {
    const sx = W.stR * Math.cos(W.stA), sy = W.stR * Math.sin(W.stA);
    W.stMesh.position.copy(P3(sx, sy)); W.stMesh.rotation.z = -W.stA;
    if (docked) { const b = W.stA - 0.16; s.x = W.stR * Math.cos(b); s.y = W.stR * Math.sin(b); s.vx = -Math.sin(b); s.vy = Math.cos(b); }
  }
  if (L.kind === 'mars') {
    const ex = W.eR * Math.cos(W.eA), ey = W.eR * Math.sin(W.eA), mx = W.mR * Math.cos(W.mA), my = W.mR * Math.sin(W.mA);
    W.eMesh.position.copy(P3(ex, ey)); W.eMesh.rotation.y += dtReal * 0.5; W.mMesh.position.copy(P3(mx, my));
    if (S.state === 'idle') { const p = padPose(); s.x = p.x; s.y = p.y; orientRocket(p.dx, p.dy); }
    if (docked) { const a = S.chk.dock.a + W.mA; s.x = mx + 0.45 * Math.cos(a); s.y = my + 0.45 * Math.sin(a); orientRocket(Math.cos(a), Math.sin(a)); }
  }
  if (L.kind === 'lander') {
    const v = Math.max(0, -s.vy), sp = $('#gSpeed'), fu = $('#gFuel');
    sp.style.width = Math.min(100, v / 4 * 100) + '%';
    sp.style.background = v <= LANDER.safe ? '#5ee08a' : v < 2.2 ? '#ff9a3a' : '#ff4a4a';
    fu.style.width = (S.fuel * 100) + '%'; fu.style.background = S.fuel > .25 ? '#6fe3ff' : '#ff7a7a';
  }
  if (L.kind === 'moon') {
    const mx = W.moonR * Math.cos(W.moonA), my = W.moonR * Math.sin(W.moonA);
    W.moonMesh.position.copy(P3(mx, my)); W.moonMesh.rotation.y = -W.moonA;
    if (S.state === 'success' && S.chk.dock) { // la fusée reste posée sur la Lune
      const a = S.chk.dock.a + (W.moonA - S.chk.dock.rel); s.x = mx + 0.78 * Math.cos(a); s.y = my + 0.78 * Math.sin(a);
      orientRocket(Math.cos(a), Math.sin(a));
    }
  }
  if (L.kind === 'sling') { W.giantMesh.position.copy(P3(W.gx, W.gy)); W.giantMesh.rotation.y += dtReal * 0.6; W.stMesh.rotation.z += dtReal * 0.4; }
  if (L.kind === 'vertical' && W.station) W.station.rotation.z += dtReal * 0.8;
  if (L.perturb) W.blueMesh.position.copy(P3(W.px, L.perturb.y));
  if (L.kind === 'binary') {
    const c = Math.cos(W.binA) * L.starA, sn = Math.sin(W.binA) * L.starA;
    W.s1.position.copy(P3(c, sn)); W.s2.position.copy(P3(-c, -sn));
    const T = W.twin; if (T) { T.mesh.position.copy(P3(T.x, T.y)); T.mesh.visible = T.alive; T.trail.flush(); }
  }
  if (L.kind === 'balance') {
    if (S.state === 'idle') { s.x = balanceX(); s.y = 0; }
    const show = S.state === 'idle';
    [['arrE', 0, GM_EARTH], ['arrM', L.moonX, L.moonGM]].forEach(([k, bx, gm]) => {
      const a = W[k], d = bx - s.x, F = gm / (d * d);
      a.visible = show; a.position.copy(P3(s.x, 0, 0.3));
      a.setDirection(new THREE.Vector3(Math.sign(d), 0, 0));
      const len = Math.max(0.3, Math.min(4.5, 1.6 * Math.sqrt(F / 0.625)));
      a.setLength(len, Math.min(0.4, len * 0.4), 0.25);
    });
  }
  if (earthMesh) earthMesh.rotation.y += dtReal * 0.12;
  if (L.kind === 'skip') {
    const show = S.state === 'idle', A = W.aimArrow; A.visible = show;
    if (show) { const k = skipStart(); s.x = k.x; s.y = k.y; s.vx = k.vx; s.vy = k.vy; A.position.copy(P3(k.x, k.y, 0.05)); A.setDirection(new THREE.Vector3(k.vx, 0, -k.vy).normalize()); orientRocket(k.vx, k.vy); }
  }
  if (L.kind === 'geo') {
    W.geoEarth.rotation.y = W.cityA;
    const r = S.state === 'idle' ? geoR() : Math.hypot(s.x, s.y);
    W.geoRing.scale.set(r, 1, r); W.geoRing.visible = S.state === 'idle';
    if (S.state === 'idle') { const p = padPose(); s.x = p.x; s.y = p.y; orientRocket(p.dx, p.dy); }
  }
  if (L.kind === 'stage') {
    updateStageGauges();
    if (S.st.att) setTankLevel(Math.max(0.04, S.st.a1 / L.f1));
    const d = W.debris; if (d) { d.mesh.position.copy(P3(d.x, d.y)); d.mesh.rotation.z = d.spin; }
  }
  if (L.kind === 'deflect') {
    W.astMesh.position.copy(P3(s.x, s.y)); W.astMesh.rotation.x += dtReal * 0.7; W.astMesh.rotation.y += dtReal * 0.4;
    if (S.state === 'coast') GRAPH.setCursor(asteroidMoment(), +$('#power').value);
  }

  if (L.kind === 'track') trackDisplay();
  else {
    rocket.group.position.copy(P3(s.x, s.y));
    const moving = S.state === 'flying' || S.state === 'coast' || (L.keepSim && (S.state === 'success' || S.state === 'ended'));
    if (L.kind !== 'lander' && moving && !(docked && L.kind === 'mars') && Math.hypot(s.vx, s.vy) > 0.05) orientRocket(s.vx, s.vy);
  }
  if (L.kind === 'deflect') {             // la fusée est posée sur le flanc de l'astéroïde et pousse sur le côté
    const v = Math.hypot(s.vx, s.vy) || 1, n = S.pushN && S.state !== 'coast' ? S.pushN : { x: -s.vy / v, y: s.vx / v };
    rocket.group.position.copy(P3(s.x - n.x * 1.1, s.y - n.y * 1.1)); orientRocket(n.x, n.y);
  }
  const shaking = S.state === 'flying' && S.chk.heavy;
  if (shaking) rocket.group.position.x += (Math.random() - .5) * 0.06;
  if (L.kind === 'fuel' && S.state === 'flying') setTankLevel(S.fuelLeft / L.fmax);
  S.flameT -= dtReal;
  rocket.flame.visible = (S.flameT > 0 && S.state === 'flying') || (isLanderFlying() && S.thrust && S.fuel > 0) || burning() || shaking;
  if (L.kind === 'skip' && S.state === 'flying') {
    const k = Math.min(1, (S.chk.drag || 0) / L.heatMax); rocket.heat.visible = k > 0.04;
    rocket.heat.material.opacity = 0.3 + 0.7 * k; rocket.heat.scale.setScalar(0.6 + 1.6 * k);
  } else if (L.kind !== 'reentry' || S.state !== 'flying') rocket.heat.visible = false;
  if (L.kind !== 'skip') { rocket.heat.material.opacity = .85; rocket.heat.scale.setScalar(1.2); }
  if (rocket.flame.visible) rocket.flame.scale.set(1, 0.8 + Math.random() * 0.5, 1);
  if (S.trail) S.trail.flush();
  GRAPH.frame();

  for (let i = S.booms.length - 1; i >= 0; i--) {
    const b = S.booms[i]; b.userData.t += dtReal; const t = b.userData.t / 0.7;
    const sz = b.userData.size * (0.3 + 1.7 * t); b.scale.set(sz, sz, 1); b.material.opacity = Math.max(0, 1 - t);
    if (t >= 1) { scene.remove(b); S.booms.splice(i, 1); }
  }
}

/* ------------------------------------------------------------------ démarrage */
resize(); applyStaticLang(); updatePowerWord(); buildMenu();
const fromUrl = levelFromUrl();
if (fromUrl != null) $('#menu').classList.add('hidden');
const startLevel = fromUrl != null ? fromUrl : Math.min(LEVELS.length - 1, Math.max(0, store.get('level') || 0));
buildLevel(startLevel);
requestAnimationFrame(frame);

// petit accès pour les tests : window.__starnav
window.__starnav = { S, LEVELS, buildLevel, launch,
  tick(sec) { for (let i = 0; i < sec * 60; i++) advance(1 / 60); applyCamera(); renderer.render(scene, camera); updateLabels(); } };
})();
