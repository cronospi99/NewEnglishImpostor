import type { Entry, Level } from "../shared/words";
import type { Lang } from "../shared/proximity";

export type Role = "crew" | "impostor";

export interface Look {
  color: number;
  hat: string;
  face: string;
  extra: string;
}

export interface Pos {
  x: number;
  y: number;
  /* facing: -1 left, 1 right */
  dir: number;
  moving: boolean;
}

export interface Settings {
  lang: Lang;
  level: Level | "Mixed";
  impostors: number;
  tasksPerPlayer: number;
  killCooldown: number; // seconds
  clueSecs: number;
  voteSecs: number;
  impostorSees: "decoy" | "hint";
  emergencies: number;
}

export const defaultSettings: Settings = {
  lang: "en",
  level: "A2",
  impostors: 1,
  tasksPerPlayer: 4,
  killCooldown: 30,
  clueSecs: 40,
  voteSecs: 40,
  impostorSees: "decoy",
  emergencies: 1
};

export interface PlayerState {
  id: string;
  name: string;
  look: Look;
  connected: boolean;
  alive: boolean;
  role: Role;
  tasks: string[]; // station ids
  done: string[];
  emergencyLeft: number;
  killReadyAt: number; // host clock ms
  score: number;
}

export interface Body {
  id: string; // victim id
  x: number;
  y: number;
}

export type Phase = "lobby" | "reveal" | "play" | "meeting" | "eject" | "end";

export interface Meeting {
  caller: string;
  reason: "report" | "emergency" | "teacher";
  victim?: string;
  stage: "clues" | "vote" | "result";
  endsAt: number;
  clues: Record<string, string>;
  votes: Record<string, string>; // voter -> target id | "skip"
}

export interface Eject {
  id: string | null;
  wasImpostor: boolean;
  tie: boolean;
  tally: Record<string, number>;
}

export interface HostState {
  code: string;
  phase: Phase;
  settings: Settings;
  players: PlayerState[];
  bodies: Body[];
  entry: Entry | null;
  meeting: Meeting | null;
  eject: Eject | null;
  winner: Role | null;
  winReason: string;
  phaseEndsAt: number;
  round: number;
  prevImpostors: string[];
  usedWords: string[];
  log: string[];
}

/* ---------- wire messages ---------- */

/* public snapshot every phone receives (no roles, no secret word) */
export interface PublicPlayer {
  id: string;
  name: string;
  look: Look;
  alive: boolean;
  connected: boolean;
  score: number;
  /* revealed only when the game has ended or the player was ejected */
  role?: Role;
}

export interface PublicState {
  code: string;
  phase: Phase;
  settings: Settings;
  players: PublicPlayer[];
  bodies: Body[];
  tasksDone: number;
  tasksTotal: number;
  meeting: (Omit<Meeting, "endsAt" | "votes"> & { msLeft: number; voted: string[]; votes?: Record<string, string> }) | null;
  eject: Eject | null;
  winner: Role | null;
  winReason: string;
  msLeft: number;
  round: number;
  word?: string;
  decoy?: string;
}

/* private message sent to one player */
export interface Secret {
  role: Role;
  word: string; // real word for crew, decoy (or "?") for impostors
  hint?: string;
  partners: string[];
  tasks: string[];
  done: string[];
  killMsLeft: number;
  emergencyLeft: number;
}

export type ToHost =
  | { k: "hello"; name: string; look: Look }
  | { k: "look"; name: string; look: Look }
  | { k: "kill"; target: string }
  | { k: "report"; body: string }
  | { k: "emergency" }
  | { k: "task"; station: string }
  | { k: "clue"; text: string }
  | { k: "vote"; target: string };

export type FromHost =
  | { k: "state"; s: PublicState }
  | { k: "secret"; s: Secret }
  | { k: "teleport"; x: number; y: number }
  | { k: "killed" }
  | { k: "toast"; text: string };

/* players broadcast their position straight to everyone (host included) */
export type PosMsg = { k: "pos"; x: number; y: number; dir: number; m: boolean };
