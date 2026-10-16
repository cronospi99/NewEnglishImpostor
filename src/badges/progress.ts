/* Badge collection, stored on the student's own device. */
import { load, save } from "../shared/storage";
import { randInt } from "../shared/random";
import { POINTS_PER_CARD, SPECIAL_AFTER, TEACHERS } from "./teachers";

const KEY = "impostor.badges.v1";

export interface Progress {
  points: number;
  owned: string[];
  /* reward ids already counted, so a reconnect never pays twice */
  rewarded: string[];
  /* most recent unlock first */
  history: { id: string; at: number }[];
}

export function loadProgress(): Progress {
  const p = load<Progress | null>(KEY, null);
  return {
    points: Math.max(0, Number(p?.points) || 0),
    owned: Array.isArray(p?.owned) ? p!.owned.filter((id) => TEACHERS.some((t) => t.id === id)) : [],
    rewarded: Array.isArray(p?.rewarded) ? p!.rewarded.slice(-50) : [],
    history: Array.isArray(p?.history) ? p!.history.slice(0, 50) : []
  };
}

export function saveProgress(p: Progress) {
  save(KEY, p);
  mirror(p);
}

/* ---- keeping the collection safe on this device ----
   localStorage is the main copy; IndexedDB keeps a mirror so the badges come back if
   localStorage gets wiped, and we ask the browser to treat the site's storage as persistent. */
const DB = "impostor-badges", STORE = "kv";
function idb(): Promise<IDBDatabase | null> {
  return new Promise((res) => {
    try {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE);
      r.onsuccess = () => res(r.result);
      r.onerror = () => res(null);
    } catch { res(null); }
  });
}
function mirror(p: Progress) {
  idb().then((db) => {
    if (!db) return;
    try { db.transaction(STORE, "readwrite").objectStore(STORE).put(JSON.stringify(p), KEY); } catch { /* ignore */ }
  });
}
/* call once at start-up: restores from the mirror when the main copy is missing or behind */
export async function protectProgress(): Promise<void> {
  try { await navigator.storage?.persist?.(); } catch { /* ignore */ }
  const db = await idb();
  if (!db) return;
  const raw = await new Promise<string | null>((res) => {
    try {
      const r = db.transaction(STORE, "readonly").objectStore(STORE).get(KEY);
      r.onsuccess = () => res(typeof r.result === "string" ? r.result : null);
      r.onerror = () => res(null);
    } catch { res(null); }
  });
  const cur = loadProgress();
  let backup: Progress | null = null;
  try { backup = raw ? JSON.parse(raw) : null; } catch { backup = null; }
  if (backup && (Number(backup.points) || 0) > cur.points) save(KEY, backup);
  else if (cur.points > 0 || cur.owned.length) mirror(cur);
}

/* ---- backup code: short, typeable, survives a new phone ----
   format  PPP-OOOOOO-CC  (points, owned cards as a bitmask, checksum; base 36) */
const sum = (s: string) => { let h = 7; for (const c of s) h = (h * 131 + c.charCodeAt(0)) % 1296; return h; };
export function backupCode(p: Progress = loadProgress()): string {
  let mask = 0;
  p.owned.forEach((id) => { const i = TEACHERS.findIndex((t) => t.id === id); if (i >= 0) mask += 2 ** i; });
  const body = `${p.points.toString(36)}-${mask.toString(36)}`.toUpperCase();
  return `${body}-${sum(body).toString(36).toUpperCase().padStart(2, "0")}`;
}
/* merges a backup code into this device's collection; null when the code is invalid */
export function restoreCode(code: string): Progress | null {
  const m = code.trim().toUpperCase().replace(/\s+/g, "").match(/^([0-9A-Z]+)-([0-9A-Z]+)-([0-9A-Z]{2})$/);
  if (!m) return null;
  const body = `${m[1]}-${m[2]}`;
  if (sum(body).toString(36).toUpperCase().padStart(2, "0") !== m[3]) return null;
  const points = parseInt(m[1], 36), mask = parseInt(m[2], 36);
  if (!Number.isFinite(points) || !Number.isFinite(mask) || points > 100000) return null;
  const p = loadProgress();
  p.points = Math.max(p.points, points);
  TEACHERS.forEach((t, i) => {
    if (Math.floor(mask / 2 ** i) % 2 === 1 && !p.owned.includes(t.id)) { p.owned.push(t.id); p.history.unshift({ id: t.id, at: Date.now() }); }
  });
  saveProgress(p);
  return p;
}

export function cardsEarned(points: number) {
  return Math.min(TEACHERS.length, Math.floor(points / POINTS_PER_CARD));
}

export function nextCardAt(p: Progress) {
  return p.owned.length >= TEACHERS.length ? null : (p.owned.length + 1) * POINTS_PER_CARD;
}

/* adds points and returns the ids of newly unlocked teacher cards */
export function addPoints(rewardId: string, points: number): { progress: Progress; unlocked: string[]; duplicate: boolean } {
  const p = loadProgress();
  if (p.rewarded.includes(rewardId)) return { progress: p, unlocked: [], duplicate: true };
  p.rewarded.push(rewardId);
  p.points += Math.max(0, Math.round(points));
  const unlocked: string[] = [];
  while (p.owned.length < cardsEarned(p.points)) {
    const pool = TEACHERS.filter((t) => !p.owned.includes(t.id) && (!t.special || p.owned.length >= SPECIAL_AFTER));
    if (!pool.length) break;
    const pick = pool[randInt(pool.length)];
    p.owned.push(pick.id);
    p.history.unshift({ id: pick.id, at: Date.now() });
    unlocked.push(pick.id);
  }
  saveProgress(p);
  return { progress: p, unlocked, duplicate: false };
}
