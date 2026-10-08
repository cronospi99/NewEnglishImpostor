import type { Lang } from "../shared/proximity";

const en = {
  academy: "Smart Academia de Idiomas",
  videogame: "Videogame mode",
  lobby: "Lobby", reveal: "Roles", play: "In play", meeting: "Meeting", eject: "Ejection", end: "Game over",
  scan: "Scan to join", orGo: "or go to", code: "Room code",
  waiting: "Waiting for students…", players: "players", start: "Start the shift", needThree: "Need at least 3 players",
  settings: "Settings", language: "Language", level: "Level", impostors: "Impostors", tasks: "Missions each",
  cooldown: "Elimination cooldown", clueTime: "Clue time", voteTime: "Vote time", sees: "Impostor sees", decoy: "Decoy word", hint: "Vague hint",
  kick: "Remove", teacherView: "Teacher view: show players", callMeeting: "Call meeting", endGame: "End game", skip: "Skip ▸",
  taskBar: "Missions completed", alive: "alive",
  yourName: "Your name", join: "Join the shift", customize: "Customize your Lingo", color: "Colour", hat: "Hat", face: "Face", extra: "Extra",
  connecting: "Connecting…", offline: "Connection lost — reconnecting…", replaced: "This player opened on another device.",
  ready: "You're in! Watch the big screen.", saveLook: "Save look",
  youAre: "You are", crew: "Crew", impostor: "Impostor", crewGoal: "Do your missions. Find the impostor.", impGoal: "Eliminate the crew. Don't get caught.",
  yourWord: "Your secret word", partner: "Your partner",
  use: "Use", report: "Report", kill: "Eliminate", bell: "Bell", map: "Map", missions: "Missions",
  ghost: "You are a ghost — keep doing missions!", killedYou: "You were eliminated!",
  bodyFound: "Body reported!", emergencyCalled: "Emergency meeting!", teacherCalled: "The teacher called a meeting",
  by: "by", victim: "Victim",
  clueStage: "One word about the secret word", clueStageImp: "Blend in: one word about the secret word",
  typeClue: "Type one word…", send: "Send", sent: "Sent ✓", voteStage: "Who is the impostor?", skipVote: "Skip vote", voted: "voted",
  waitVotes: "Waiting for votes…", result: "Votes", noEject: "No one was ejected", tie: "(tie)", skipped: "(skipped)",
  wasImp: "was the impostor!", wasNot: "was not the impostor.", impLeft: "impostor(s) remain",
  crewWins: "Crew wins!", impWins: "Impostors win!", teacherEnded: "The teacher ended the game",
  whyTasks: "All missions completed.", whyOut: "Every impostor was ejected.", whyOutnumber: "The impostors outnumber the crew.",
  word: "The word", theDecoy: "The decoy", playAgain: "Back to lobby", score: "Score",
  late: "The game already started — you'll join the next one.", full: "The room is full.", bellCooldown: "The bell isn't ready yet.",
  home: "Home", noRelay: "Can't reach the game server.",
  hostHelp: "Students scan the QR code with their phones. Everyone moves around the academy on their phone; this screen shows the shift.",
  moveHelp: "Drag anywhere to move · tap the buttons to act"
};

const es: typeof en = {
  academy: "Smart Academia de Idiomas",
  videogame: "Modo videojuego",
  lobby: "Sala", reveal: "Roles", play: "En juego", meeting: "Reunión", eject: "Expulsión", end: "Fin",
  scan: "Escanea para entrar", orGo: "o entra en", code: "Código",
  waiting: "Esperando estudiantes…", players: "jugadores", start: "Empezar el turno", needThree: "Se necesitan al menos 3",
  settings: "Ajustes", language: "Idioma", level: "Nivel", impostors: "Impostores", tasks: "Misiones por jugador",
  cooldown: "Espera entre eliminaciones", clueTime: "Tiempo de pistas", voteTime: "Tiempo de voto", sees: "El impostor ve", decoy: "Palabra señuelo", hint: "Pista vaga",
  kick: "Quitar", teacherView: "Vista profesor: ver jugadores", callMeeting: "Convocar reunión", endGame: "Terminar", skip: "Saltar ▸",
  taskBar: "Misiones completadas", alive: "vivos",
  yourName: "Tu nombre", join: "Entrar al turno", customize: "Personaliza tu Lingo", color: "Color", hat: "Sombrero", face: "Cara", extra: "Extra",
  connecting: "Conectando…", offline: "Conexión perdida — reconectando…", replaced: "Este jugador se abrió en otro dispositivo.",
  ready: "¡Ya estás dentro! Mira la pantalla grande.", saveLook: "Guardar",
  youAre: "Eres", crew: "Tripulación", impostor: "Impostor", crewGoal: "Haz tus misiones. Encuentra al impostor.", impGoal: "Elimina a la tripulación sin que te pillen.",
  yourWord: "Tu palabra secreta", partner: "Tu compañero",
  use: "Usar", report: "Avisar", kill: "Eliminar", bell: "Timbre", map: "Mapa", missions: "Misiones",
  ghost: "Eres un fantasma: ¡sigue con las misiones!", killedYou: "¡Te eliminaron!",
  bodyFound: "¡Cuerpo encontrado!", emergencyCalled: "¡Reunión de emergencia!", teacherCalled: "El profesor convocó una reunión",
  by: "por", victim: "Víctima",
  clueStage: "Una palabra sobre la palabra secreta", clueStageImp: "Disimula: una palabra sobre la palabra secreta",
  typeClue: "Escribe una palabra…", send: "Enviar", sent: "Enviado ✓", voteStage: "¿Quién es el impostor?", skipVote: "Saltar voto", voted: "votaron",
  waitVotes: "Esperando votos…", result: "Votos", noEject: "Nadie fue expulsado", tie: "(empate)", skipped: "(saltado)",
  wasImp: "¡era el impostor!", wasNot: "no era el impostor.", impLeft: "impostor(es) quedan",
  crewWins: "¡Gana la tripulación!", impWins: "¡Ganan los impostores!", teacherEnded: "El profesor terminó la partida",
  whyTasks: "Todas las misiones completadas.", whyOut: "Todos los impostores fueron expulsados.", whyOutnumber: "Los impostores superan a la tripulación.",
  word: "La palabra", theDecoy: "El señuelo", playAgain: "Volver a la sala", score: "Puntos",
  late: "La partida ya empezó: entrarás en la siguiente.", full: "La sala está llena.", bellCooldown: "El timbre aún no está listo.",
  home: "Inicio", noRelay: "No se puede conectar con el servidor del juego.",
  hostHelp: "Los estudiantes escanean el QR con el móvil. Cada uno se mueve por la academia en su móvil; esta pantalla muestra el turno.",
  moveHelp: "Arrastra para moverte · toca los botones para actuar"
};

export const G = { en, es };
export type GStrings = typeof en;
export const g = (lang: Lang) => G[lang] || en;
