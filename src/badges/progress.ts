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
