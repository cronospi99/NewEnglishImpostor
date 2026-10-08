import { describe, expect, it } from "vitest";
import * as E from "./engine";
import { BELL, RANGE, WORLD, dist, spawnPoint, stations, walkable } from "./map";
import type { HostState, Look } from "./types";

const look: Look = { color: 0, hat: "none", face: "none", extra: "none" };

function game(n = 5): HostState {
  const s = E.createState("ABCD");
  for (let i = 0; i < n; i++) E.hello(s, "p" + i, "Student " + i, look);
  E.startGame(s, 1000);
  E.tick(s, 1000 + E.REVEAL_MS);
  return s;
}
const near = (s: HostState) => Object.fromEntries(s.players.map((p) => [p.id, { x: 500, y: 620, dir: 1, moving: false }]));

describe("engine", () => {
  it("starts with one impostor, tasks and a secret word", () => {
    const s = game();
    expect(s.phase).toBe("play");
    expect(s.players.filter((p) => p.role === "impostor")).toHaveLength(1);
    expect(s.players.every((p) => p.tasks.length === s.settings.tasksPerPlayer)).toBe(true);
    const crew = s.players.find((p) => p.role === "crew")!;
    const imp = s.players.find((p) => p.role === "impostor")!;
    expect(E.secretFor(s, crew.id, 0).word).toBe(s.entry![0]);
    expect(E.secretFor(s, imp.id, 0).word).toBe(s.entry![1]);
  });

  it("never picks the same impostor in back-to-back games", () => {
    for (let k = 0; k < 30; k++) {
      const s = game(4);
      const first = s.players.find((p) => p.role === "impostor")!.id;
      E.backToLobby(s);
      E.startGame(s, 5000);
      expect(s.players.find((p) => p.role === "impostor")!.id).not.toBe(first);
    }
  });

  it("respects kill cooldown and range, then a report opens a meeting", () => {
    const s = game(5);
    const imp = s.players.find((p) => p.role === "impostor")!;
    const victim = s.players.find((p) => p.role === "crew")!;
    const pos = near(s);
    expect(E.kill(s, imp.id, victim.id, pos, 1000 + E.REVEAL_MS + 10)).toHaveLength(0);
    const later = imp.killReadyAt + 1;
    pos[victim.id] = { x: 2000, y: 620, dir: 1, moving: false };
    expect(E.kill(s, imp.id, victim.id, pos, later)).toHaveLength(0);
    pos[victim.id] = { x: 540, y: 620, dir: 1, moving: false };
    E.kill(s, imp.id, victim.id, pos, later);
    expect(victim.alive).toBe(false);
    expect(s.bodies).toHaveLength(1);
    const reporter = s.players.find((p) => p.alive && p.role === "crew")!;
    E.report(s, reporter.id, victim.id, pos, later + 10);
    expect(s.phase).toBe("meeting");
    expect(s.bodies).toHaveLength(0);
  });

  it("ejects the most voted player and crew wins when the impostor is out", () => {
    const s = game(5);
    const imp = s.players.find((p) => p.role === "impostor")!;
    E.teacherMeeting(s, 50000);
    s.players.forEach((p) => E.clue(s, p.id, "word", 50001));
    expect(s.meeting!.stage).toBe("vote");
    s.players.forEach((p) => E.vote(s, p.id, imp.id, 50002));
    expect(s.meeting!.stage).toBe("result");
    E.tick(s, 50002 + E.RESULT_MS);
    expect(s.phase).toBe("eject");
    expect(s.eject!.wasImpostor).toBe(true);
    E.tick(s, 50002 + E.RESULT_MS + E.EJECT_MS);
    expect(s.phase).toBe("end");
    expect(s.winner).toBe("crew");
  });

  it("a tie ejects nobody", () => {
    const s = game(4);
    E.teacherMeeting(s, 50000);
    E.skipStage(s, 50001);
    const [a, b, c, d] = s.players;
    E.vote(s, a.id, b.id, 50002); E.vote(s, b.id, a.id, 50002);
    E.vote(s, c.id, "skip", 50002); E.vote(s, d.id, "skip", 50002);
    E.tick(s, 60000 + E.RESULT_MS);
    expect(s.eject!.id).toBeNull();
  });

  it("crew wins by finishing every task", () => {
    const s = game(4);
    s.players.filter((p) => p.role === "crew").forEach((p) => p.tasks.forEach((t) => E.taskDone(s, p.id, t, 9000)));
    expect(s.winner).toBe("crew");
    expect(s.winReason).toBe("tasks");
  });

  it("emergency bell needs proximity and respects the grace period", () => {
    const s = game(4);
    const c = s.players[0];
    const pos = { [c.id]: { x: BELL.x, y: BELL.y + 90, dir: 1, moving: false } };
    E.emergency(s, c.id, pos, s.phaseEndsAt + 100);
    expect(s.phase).toBe("play");
    E.emergency(s, c.id, pos, s.phaseEndsAt + E.EMERGENCY_GRACE_MS + 1);
    expect(s.phase).toBe("meeting");
  });

  it("does not leak roles in the public state", () => {
    const s = game(5);
    const pub = E.publicState(s, 0);
    expect(pub.players.every((p) => p.role === undefined)).toBe(true);
    expect(pub.word).toBeUndefined();
  });
});

describe("map", () => {
  /* flood fill on a 10-unit grid from the spawn ring */
  const step = 10;
  const W = Math.ceil(WORLD.w / step), H = Math.ceil(WORLD.h / step);
  const seen = new Uint8Array(W * H);
  const start = spawnPoint(0, 8);
  const q: number[] = [];
  const sx = Math.round(start.x / step), sy = Math.round(start.y / step);
  seen[sy * W + sx] = 1; q.push(sx, sy);
  while (q.length) {
    const y = q.pop()!, x = q.pop()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H || seen[ny * W + nx]) continue;
      if (!walkable(nx * step, ny * step)) continue;
      seen[ny * W + nx] = 1; q.push(nx, ny);
    }
  }
  const reachableNear = (p: { x: number; y: number }, r: number) => {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (seen[y * W + x] && dist({ x: x * step, y: y * step }, p) < r) return true;
    return false;
  };

  it("all spawn points are walkable", () => {
    for (let n = 3; n <= 20; n++) for (let i = 0; i < n; i++) {
      const p = spawnPoint(i, n);
      expect(walkable(p.x, p.y), `${i}/${n} ${p.x},${p.y}`).toBe(true);
    }
  });

  it.each(stations.map((s) => [s.id, s] as const))("station %s is reachable", (_id, st) => {
    expect(reachableNear(st, RANGE.use - 15)).toBe(true);
  });

  it("emergency bell is reachable", () => {
    expect(reachableNear(BELL, RANGE.bell - 15)).toBe(true);
  });
});
