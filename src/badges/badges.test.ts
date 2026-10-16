import { beforeEach, describe, expect, it } from "vitest";
import { TEACHERS, POINTS_PER_CARD, SPECIAL_AFTER } from "./teachers";
import { addPoints, loadProgress } from "./progress";

const mem: Record<string, string> = {};
beforeEach(() => {
  for (const k of Object.keys(mem)) delete mem[k];
  (globalThis as any).window = { localStorage: { getItem: (k: string) => mem[k] ?? null, setItem: (k: string, v: string) => { mem[k] = v; } } };
});

describe("teacher badges", () => {
  it("has 25 unique cards with one special coordinator", () => {
    expect(TEACHERS).toHaveLength(25);
    expect(new Set(TEACHERS.map((t) => t.id)).size).toBe(25);
    expect(TEACHERS.filter((t) => t.special).map((t) => t.id)).toEqual(["jalbleidy"]);
  });

  it("unlocks one card per threshold and never pays the same reward twice", () => {
    const r1 = addPoints("ROOM-1", POINTS_PER_CARD * 2 + 1);
    expect(r1.unlocked).toHaveLength(2);
    const again = addPoints("ROOM-1", 50);
    expect(again.duplicate).toBe(true);
    expect(loadProgress().points).toBe(POINTS_PER_CARD * 2 + 1);
    const r2 = addPoints("ROOM-2", POINTS_PER_CARD - 1);
    expect(r2.unlocked).toHaveLength(1);
  });

  it("keeps the coordinator card for later and completes the album", () => {
    const early = addPoints("A", POINTS_PER_CARD * SPECIAL_AFTER);
    expect(early.unlocked).not.toContain("jalbleidy");
    addPoints("B", POINTS_PER_CARD * 100);
    expect(loadProgress().owned).toHaveLength(25);
  });
});

describe("backup code", () => {
  it("round-trips points and cards and rejects tampering", async () => {
    const { backupCode, restoreCode, saveProgress, loadProgress } = await import("./progress");
    saveProgress({ points: 37, owned: ["camila", "sander", "norvey"], rewarded: [], history: [] });
    const code = backupCode();
    expect(code).toMatch(/^[0-9A-Z]+-[0-9A-Z]+-[0-9A-Z]{2}$/);
    saveProgress({ points: 0, owned: [], rewarded: [], history: [] });
    expect(restoreCode(code.slice(0, -1) + (code.endsWith("A") ? "B" : "A"))).toBeNull();
    const r = restoreCode(code.toLowerCase())!;
    expect(r.points).toBe(37);
    expect(r.owned.sort()).toEqual(["camila", "norvey", "sander"]);
    expect(loadProgress().points).toBe(37);
  });
});
