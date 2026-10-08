/* Host-authoritative rules. Every function mutates the given state and returns
   messages that the host should deliver to specific players. */
import { pickImpostors, shuffle, randInt } from "../shared/random";
import { wordPool } from "../shared/pool";
import { BELL, RANGE, dist, spawnPoint, stations } from "./map";
import {
  defaultSettings, type FromHost, type HostState, type Look, type PlayerState, type Pos, type PublicState, type Role, type Secret
} from "./types";

export type Out = { to: string; msg: FromHost };
export type Positions = Record<string, Pos>;

export const REVEAL_MS = 7000;
export const RESULT_MS = 4500;
export const EJECT_MS = 6500;
export const START_COOLDOWN_MS = 12000;
export const EMERGENCY_GRACE_MS = 15000;

export function createState(code: string): HostState {
  return {
    code, phase: "lobby", settings: { ...defaultSettings }, players: [], bodies: [], entry: null,
    meeting: null, eject: null, winner: null, winReason: "", phaseEndsAt: 0, round: 0,
    prevImpostors: [], usedWords: [], log: []
  };
}

const P = (s: HostState, id: string) => s.players.find((p) => p.id === id);
const sanitizeName = (n: string) => String(n || "").replace(/\s+/g, " ").trim().slice(0, 14) || "Student";
const sanitizeLook = (l: Look): Look => ({ color: Math.max(0, Math.min(15, Number(l?.color) || 0)), hat: String(l?.hat || "none").slice(0, 20), face: String(l?.face || "none").slice(0, 20), extra: String(l?.extra || "none").slice(0, 20) });

export function hello(s: HostState, id: string, name: string, look: Look): Out[] {
  const p = P(s, id);
  if (p) {
    p.connected = true;
    if (s.phase === "lobby") { p.name = sanitizeName(name); p.look = sanitizeLook(look); }
    return [];
  }
  if (s.phase !== "lobby") {
    /* late joiners watch as ghosts until the next game */
    s.players.push(newPlayer(id, name, look, false));
    return [{ to: id, msg: { k: "toast", text: "late" } }];
  }
  if (s.players.length >= 20) return [{ to: id, msg: { k: "toast", text: "full" } }];
  s.players.push(newPlayer(id, name, look, true));
  return [];
}

function newPlayer(id: string, name: string, look: Look, alive: boolean): PlayerState {
  return { id, name: sanitizeName(name), look: sanitizeLook(look), connected: true, alive, role: "crew", tasks: [], done: [], emergencyLeft: 0, killReadyAt: 0, score: 0 };
}

export function setLook(s: HostState, id: string, name: string, look: Look) {
  const p = P(s, id);
  if (p && s.phase === "lobby") { p.name = sanitizeName(name); p.look = sanitizeLook(look); }
  return [];
}

export function disconnect(s: HostState, id: string) {
  const p = P(s, id);
  if (!p) return;
  p.connected = false;
  if (s.phase === "lobby") s.players = s.players.filter((x) => x.id !== id);
}

export function kick(s: HostState, id: string) {
  s.players = s.players.filter((x) => x.id !== id);
}

export function canStart(s: HostState) {
  return s.phase === "lobby" && s.players.filter((p) => p.connected).length >= 3;
}

export function startGame(s: HostState, now: number): Out[] {
  s.players = s.players.filter((p) => p.connected);
  const ids = s.players.map((p) => p.id);
  if (ids.length < 3) return [];
  const st = s.settings;
  const count = Math.max(1, Math.min(st.impostors, Math.floor((ids.length - 1) / 2)));
  const imps = pickImpostors(ids, count, s.prevImpostors);
  const pool = wordPool(st.lang, st.level, "All");
  let left = pool.filter((e) => s.usedWords.indexOf(e[0]) === -1);
  if (!left.length) { left = pool; s.usedWords = []; }
  s.entry = left[randInt(left.length)];
  s.usedWords.push(s.entry[0]);
  s.prevImpostors = imps;
  s.round += 1;
  s.bodies = [];
  s.meeting = null;
  s.eject = null;
  s.winner = null;
  s.winReason = "";
  s.log = [];
  const nTasks = Math.max(1, Math.min(stations.length, st.tasksPerPlayer));
  s.players.forEach((p) => {
    p.alive = true;
    p.role = imps.indexOf(p.id) !== -1 ? "impostor" : "crew";
    p.tasks = shuffle(stations.map((x) => x.id)).slice(0, nTasks);
    p.done = [];
    p.emergencyLeft = st.emergencies;
    p.killReadyAt = now + REVEAL_MS + START_COOLDOWN_MS;
  });
  s.phase = "reveal";
  s.phaseEndsAt = now + REVEAL_MS;
  return [...teleportAll(s), ...secrets(s, now)];
}

export function teleportAll(s: HostState): Out[] {
  return s.players.map((p, i) => ({ to: p.id, msg: { k: "teleport", ...spawnPoint(i, s.players.length) } as FromHost }));
}

export function secrets(s: HostState, now: number): Out[] {
  return s.players.map((p) => ({ to: p.id, msg: { k: "secret", s: secretFor(s, p.id, now) } as FromHost }));
}

export function secretFor(s: HostState, id: string, now: number): Secret {
  const p = P(s, id)!;
  const e = s.entry || ["", "", "", ""];
  const imp = p.role === "impostor";
  return {
    role: p.role,
    word: imp ? (s.settings.impostorSees === "decoy" ? e[1] : "?") : e[0],
    hint: imp && s.settings.impostorSees === "hint" ? e[2] : undefined,
    partners: imp ? s.players.filter((x) => x.role === "impostor" && x.id !== id).map((x) => x.id) : [],
    tasks: p.tasks,
    done: p.done,
    killMsLeft: Math.max(0, p.killReadyAt - now),
    emergencyLeft: p.emergencyLeft
  };
}

export function taskTotals(s: HostState) {
  const crew = s.players.filter((p) => p.role === "crew");
  return { done: crew.reduce((a, p) => a + p.done.length, 0), total: crew.reduce((a, p) => a + p.tasks.length, 0) };
}

export function kill(s: HostState, killerId: string, targetId: string, pos: Positions, now: number): Out[] {
  if (s.phase !== "play") return [];
  const k = P(s, killerId), t = P(s, targetId);
  if (!k || !t || !k.alive || !t.alive || k.role !== "impostor" || t.role === "impostor") return [];
  if (now < k.killReadyAt) return [];
  const kp = pos[killerId], tp = pos[targetId];
  if (!kp || !tp || dist(kp, tp) > RANGE.kill + 60) return [];
  t.alive = false;
  s.bodies.push({ id: t.id, x: Math.round(tp.x), y: Math.round(tp.y) });
  k.killReadyAt = now + s.settings.killCooldown * 1000;
  s.log.push(`${k.name} eliminated ${t.name}`);
  const out: Out[] = [{ to: t.id, msg: { k: "killed" } }, { to: k.id, msg: { k: "secret", s: secretFor(s, k.id, now) } }];
  checkWin(s, now);
  return out;
}

export function report(s: HostState, reporter: string, bodyId: string, pos: Positions, now: number): Out[] {
  if (s.phase !== "play") return [];
  const r = P(s, reporter), b = s.bodies.find((x) => x.id === bodyId);
  const rp = pos[reporter];
  if (!r || !r.alive || !b || !rp || dist(rp, b) > RANGE.report + 60) return [];
  return startMeeting(s, reporter, "report", now, bodyId);
}

export function emergency(s: HostState, caller: string, pos: Positions, now: number): Out[] {
  if (s.phase !== "play") return [];
  const c = P(s, caller), cp = pos[caller];
  if (!c || !c.alive || c.emergencyLeft <= 0 || !cp || dist(cp, BELL) > RANGE.bell + 60) return [];
  if (now < s.phaseEndsAt + EMERGENCY_GRACE_MS) return [{ to: caller, msg: { k: "toast", text: "bellCooldown" } }];
  c.emergencyLeft -= 1;
  return startMeeting(s, caller, "emergency", now);
}

export function teacherMeeting(s: HostState, now: number): Out[] {
  if (s.phase !== "play") return [];
  return startMeeting(s, "teacher", "teacher", now);
}

function startMeeting(s: HostState, caller: string, reason: "report" | "emergency" | "teacher", now: number, victim?: string): Out[] {
  s.phase = "meeting";
  s.bodies = [];
  s.meeting = { caller, reason, victim, stage: "clues", endsAt: now + s.settings.clueSecs * 1000, clues: {}, votes: {} };
  return teleportAll(s);
}

export function taskDone(s: HostState, id: string, station: string, now: number): Out[] {
  if (s.phase !== "play") return [];
  const p = P(s, id);
  if (!p || p.tasks.indexOf(station) === -1 || p.done.indexOf(station) !== -1) return [];
  p.done.push(station);
  const out: Out[] = [{ to: id, msg: { k: "secret", s: secretFor(s, id, now) } }];
  checkWin(s, now);
  return out;
}

const alive = (s: HostState) => s.players.filter((p) => p.alive);

export function clue(s: HostState, id: string, text: string, now: number) {
  const p = P(s, id), m = s.meeting;
  if (!p || !p.alive || !m || m.stage !== "clues") return [];
  const t = String(text || "").replace(/\s+/g, " ").trim().slice(0, 24);
  if (!t) return [];
  m.clues[id] = t;
  if (alive(s).filter((x) => x.connected).every((x) => m.clues[x.id])) toVote(s, now);
  return [];
}

function toVote(s: HostState, now: number) {
  if (!s.meeting) return;
  s.meeting.stage = "vote";
  s.meeting.endsAt = now + s.settings.voteSecs * 1000;
}

export function vote(s: HostState, id: string, target: string, now: number) {
  const p = P(s, id), m = s.meeting;
  if (!p || !p.alive || !m || m.stage !== "vote" || m.votes[id]) return [];
  if (target !== "skip" && !alive(s).some((x) => x.id === target)) return [];
  m.votes[id] = target;
  if (alive(s).filter((x) => x.connected).every((x) => m.votes[x.id])) toResult(s, now);
  return [];
}

export function tally(s: HostState) {
  const t: Record<string, number> = {};
  Object.values(s.meeting?.votes || {}).forEach((v) => { t[v] = (t[v] || 0) + 1; });
  let best: string | null = null, bestN = 0, tie = false;
  Object.keys(t).forEach((k) => {
    if (t[k] > bestN) { best = k; bestN = t[k]; tie = false; } else if (t[k] === bestN) tie = true;
  });
  const id = tie || best === "skip" ? null : best;
  return { id, tie, tally: t };
}

function toResult(s: HostState, now: number) {
  if (!s.meeting) return;
  s.meeting.stage = "result";
  s.meeting.endsAt = now + RESULT_MS;
}

function doEject(s: HostState, now: number): Out[] {
  const r = tally(s);
  const ej = r.id ? P(s, r.id) : undefined;
  if (ej) { ej.alive = false; s.log.push(`${ej.name} was ejected`); }
  /* one point for every vote that pointed at a real impostor */
  Object.entries(s.meeting?.votes || {}).forEach(([voter, target]) => {
    const t = P(s, target), v = P(s, voter);
    if (t && v && t.role === "impostor" && v.role === "crew") v.score += 1;
  });
  s.eject = { id: ej ? ej.id : null, wasImpostor: !!ej && ej.role === "impostor", tie: r.tie, tally: r.tally };
  s.phase = "eject";
  s.phaseEndsAt = now + EJECT_MS;
  return ej ? [{ to: ej.id, msg: { k: "killed" } }] : [];
}

export function checkWin(s: HostState, now: number) {
  if (s.phase === "lobby" || s.phase === "end") return;
  const a = alive(s);
  const imps = a.filter((p) => p.role === "impostor").length;
  const crew = a.length - imps;
  const tt = taskTotals(s);
  let w: Role | null = null, why = "";
  if (imps === 0) { w = "crew"; why = "impostorsOut"; }
  else if (imps >= crew) { w = "impostor"; why = "outnumber"; }
  else if (tt.total > 0 && tt.done >= tt.total) { w = "crew"; why = "tasks"; }
  if (!w) return;
  s.winner = w;
  s.winReason = why;
  s.phase = "end";
  s.phaseEndsAt = now;
  s.meeting = null;
  s.players.forEach((p) => {
    if (w === "crew" && p.role === "crew") p.score += 2;
    if (w === "impostor" && p.role === "impostor") p.score += 3;
  });
}

/* advance timed phases; returns messages to send */
export function tick(s: HostState, now: number): Out[] {
  if (s.phase === "reveal" && now >= s.phaseEndsAt) {
    s.phase = "play";
    s.phaseEndsAt = now;
    return secrets(s, now);
  }
  if (s.phase === "meeting" && s.meeting && now >= s.meeting.endsAt) {
    if (s.meeting.stage === "clues") { toVote(s, now); return []; }
    if (s.meeting.stage === "vote") { toResult(s, now); return []; }
    return doEject(s, now);
  }
  if (s.phase === "eject" && now >= s.phaseEndsAt) {
    s.meeting = null;
    checkWin(s, now);
    if (s.phase === "eject") {
      s.phase = "play";
      s.phaseEndsAt = now;
      s.players.forEach((p) => { if (p.role === "impostor") p.killReadyAt = now + s.settings.killCooldown * 1000; });
      return [...teleportAll(s), ...secrets(s, now)];
    }
  }
  return [];
}

export function skipStage(s: HostState, now: number): Out[] {
  if (s.phase === "meeting" && s.meeting) { s.meeting.endsAt = now; return tick(s, now); }
  if (s.phase === "reveal" || s.phase === "eject") { s.phaseEndsAt = now; return tick(s, now); }
  return [];
}

export function backToLobby(s: HostState) {
  s.phase = "lobby";
  s.meeting = null;
  s.eject = null;
  s.bodies = [];
  s.winner = null;
  s.players = s.players.filter((p) => p.connected);
  s.players.forEach((p) => { p.alive = true; p.role = "crew"; p.tasks = []; p.done = []; });
}

export function endGame(s: HostState, now: number) {
  if (s.phase === "lobby") return;
  s.winner = null;
  s.winReason = "teacher";
  s.phase = "end";
  s.phaseEndsAt = now;
  s.meeting = null;
}

export function publicState(s: HostState, now: number): PublicState {
  const showRoles = s.phase === "end";
  const tt = taskTotals(s);
  const m = s.meeting;
  return {
    code: s.code,
    phase: s.phase,
    settings: s.settings,
    players: s.players.map((p) => ({
      id: p.id, name: p.name, look: p.look, alive: p.alive, connected: p.connected, score: p.score,
      role: showRoles || (s.eject && s.eject.id === p.id && s.phase === "eject") ? p.role : undefined
    })),
    bodies: s.bodies,
    tasksDone: tt.done,
    tasksTotal: tt.total,
    meeting: m ? {
      caller: m.caller, reason: m.reason, victim: m.victim, stage: m.stage, clues: m.clues,
      msLeft: Math.max(0, m.endsAt - now), voted: Object.keys(m.votes),
      votes: m.stage === "result" ? m.votes : undefined
    } : null,
    eject: s.eject,
    winner: s.winner,
    winReason: s.winReason,
    msLeft: Math.max(0, s.phaseEndsAt - now),
    round: s.round,
    word: showRoles && s.entry ? s.entry[0] : undefined,
    decoy: showRoles && s.entry ? s.entry[1] : undefined
  };
}
