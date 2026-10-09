import { describe, expect, it } from "vitest";
import * as E from "./engine";
import { ALARM_PANELS, BATH_DOOR, BELL, BOOK_SPOTS, FUSE, GUARD, RANGE, WORLD, dist, lineOfSight, offices, setBlocked, spawnPoint, stations, vents, walkable } from "./map";
import type { HostState, Look, Pos } from "./types";

const look: Look = { color: 0, hat: "none", face: "none", extra: "none" };

function game(n = 5): HostState {
  const s = E.createState("ABCD");
  for (let i = 0; i < n; i++) E.hello(s, "p" + i, "Student " + i, look);
  E.startGame(s, 1000);
  E.tick(s, 1000 + E.REVEAL_MS);
  return s;
}
const near = (s: HostState): Record<string, Pos> => Object.fromEntries(s.players.map((p) => [p.id, { x: 500, y: 620, dir: 1, moving: false }]));

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

  it("killer snaps onto the victim and the victim learns who did it", () => {
    const s = game(5);
    const imp = s.players.find((p) => p.role === "impostor")!;
    const victim = s.players.find((p) => p.role === "crew")!;
    const pos = near(s);
    pos[victim.id] = { x: 560, y: 620, dir: 1, moving: false };
    const t = imp.killReadyAt + 1;
    const outs = E.kill(s, imp.id, victim.id, pos, t);
    expect(outs.find((o) => o.to === imp.id && o.msg.k === "teleport")).toMatchObject({ msg: { x: 560, y: 620 } });
    expect(outs.find((o) => o.to === victim.id)).toMatchObject({ msg: { k: "killed", by: imp.id } });
    expect(E.publicState(s, t + 100).lastKill).toBeTruthy();
  });

  it("cannot kill from inside a vent", () => {
    const s = game(5);
    const imp = s.players.find((p) => p.role === "impostor")!;
    const victim = s.players.find((p) => p.role === "crew")!;
    const pos = near(s);
    pos[imp.id] = { ...pos[imp.id], vent: "v-kids" };
    expect(E.kill(s, imp.id, victim.id, pos, imp.killReadyAt + 1)).toHaveLength(0);
    expect(victim.alive).toBe(true);
  });

  it("lights sabotage is fixed at the fuse box and blocks the bell", () => {
    const s = game(5);
    const imp = s.players.find((p) => p.role === "impostor")!;
    const crew = s.players.find((p) => p.role === "crew")!;
    E.sabotage(s, imp.id, "lights", s.sabotageReadyAt - 1);
    expect(s.sabotage).toBeNull();
    E.sabotage(s, crew.id, "lights", s.sabotageReadyAt + 1);
    expect(s.sabotage).toBeNull();
    const t = s.sabotageReadyAt + 1;
    E.sabotage(s, imp.id, "lights", t);
    expect(s.sabotage?.kind).toBe("lights");
    const bellPos = { [crew.id]: { x: BELL.x, y: BELL.y + 90, dir: 1, moving: false } };
    E.emergency(s, crew.id, bellPos, t + E.EMERGENCY_GRACE_MS + 60000);
    expect(s.phase).toBe("play");
    E.fixLights(s, crew.id, { [crew.id]: { x: 300, y: 300, dir: 1, moving: false } }, t + 10);
    expect(s.sabotage).not.toBeNull();
    E.fixLights(s, crew.id, { [crew.id]: { x: FUSE.x, y: FUSE.y, dir: 1, moving: false } }, t + 20);
    expect(s.sabotage).toBeNull();
    expect(s.sabotageReadyAt).toBe(t + 20 + E.SABOTAGE_COOLDOWN_MS);
  });

  it("fire alarm needs both panels held at once, otherwise impostors win", () => {
    const s = game(5);
    const imp = s.players.find((p) => p.role === "impostor")!;
    const [a, b] = s.players.filter((p) => p.role === "crew");
    const t = s.sabotageReadyAt + 1;
    E.sabotage(s, imp.id, "alarm", t);
    const pos = { [a.id]: { x: ALARM_PANELS[0].x, y: ALARM_PANELS[0].y, dir: 1, moving: false }, [b.id]: { x: ALARM_PANELS[1].x, y: ALARM_PANELS[1].y, dir: 1, moving: false } };
    E.hold(s, a.id, "A", true, pos, t + 5);
    expect(s.sabotage).not.toBeNull();
    E.hold(s, a.id, "A", false, pos, t + 6);
    E.hold(s, b.id, "B", true, pos, t + 7);
    expect(s.sabotage).not.toBeNull();
    E.hold(s, a.id, "A", true, pos, t + 8);
    expect(s.sabotage).toBeNull();

    const s2 = game(5);
    const imp2 = s2.players.find((p) => p.role === "impostor")!;
    const t2 = s2.sabotageReadyAt + 1;
    E.sabotage(s2, imp2.id, "alarm", t2);
    E.tick(s2, t2 + E.ALARM_MS + 1, {});
    expect(s2.phase).toBe("end");
    expect(s2.winner).toBe("impostor");
    expect(s2.winReason).toBe("alarm");
  });

  it("meetings clear sabotage and collect chat from living players only", () => {
    const s = game(5);
    const imp = s.players.find((p) => p.role === "impostor")!;
    E.sabotage(s, imp.id, "lights", s.sabotageReadyAt + 1);
    E.teacherMeeting(s, s.sabotageReadyAt + 2);
    expect(s.sabotage).toBeNull();
    const [a, b] = s.players;
    b.alive = false;
    E.chat(s, a.id, "I suspect   Luis.", 1);
    E.chat(s, a.id, "spam", 2);
    E.chat(s, b.id, "boo", 3);
    expect(s.meeting!.chat.map((c) => c.text)).toEqual(["I suspect Luis."]);
  });

  it("awards points through the game and sends one reward per player at the end", () => {
    const s = game(4);
    const crew = s.players.filter((p) => p.role === "crew");
    crew.forEach((p) => p.tasks.forEach((t) => E.taskDone(s, p.id, t, 9000)));
    expect(s.phase).toBe("end");
    const outs = E.endRewards(s);
    expect(outs).toHaveLength(4);
    const c = outs.find((o) => o.to === crew[0].id)!.msg as { k: string; points: number; items: Record<string, number> };
    expect(c.k).toBe("reward");
    expect(c.items.mission).toBe(crew[0].tasks.length);
    expect(c.items.win).toBe(E.POINTS.crewWin);
    expect(c.items.survive).toBe(1);
    expect(c.points).toBe(crew[0].tasks.length + E.POINTS.crewWin + 1);
  });

  it("locks the bathrooms in roughly one game out of five and never assigns the bathroom mission then", () => {
    let locked = 0;
    for (let k = 0; k < 400; k++) {
      const s = game(5);
      if (s.bathLocked) {
        locked++;
        expect(s.players.some((p) => p.tasks.includes("s-bath"))).toBe(false);
      }
      expect(E.publicState(s, 0).bathLocked).toBe(s.bathLocked);
    }
    expect(locked).toBeGreaterThan(40);
    expect(locked).toBeLessThan(130);
  });

  it("teacher can join as a regular player", () => {
    const s = E.createState("ABCD");
    E.hello(s, "t1", "Teacher", look, true);
    for (let i = 0; i < 3; i++) E.hello(s, "p" + i, "S" + i, look);
    E.startGame(s, 0);
    expect(s.players.find((p) => p.id === "t1")!.teacher).toBe(true);
    expect(E.publicState(s, 0).players.find((p) => p.id === "t1")!.teacher).toBe(true);
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

  it.each(vents.map((v) => [v.id, v] as const))("vent %s sits on walkable floor and links both ways", (_id, v) => {
    expect(walkable(v.x, v.y + 2), v.id).toBe(true);
    v.links.forEach((l) => expect(vents.find((x) => x.id === l)!.links).toContain(v.id));
  });

  it("sabotage repair points are reachable", () => {
    expect(reachableNear(FUSE, RANGE.fix - 15)).toBe(true);
    ALARM_PANELS.forEach((a) => expect(reachableNear(a, RANGE.fix - 15)).toBe(true));
  });

  it("walls block line of sight but doors don't", () => {
    expect(lineOfSight({ x: 350, y: 300 }, { x: 350, y: 620 })).toBe(true);
    expect(lineOfSight({ x: 200, y: 300 }, { x: 200, y: 620 })).toBe(false);
  });

  it.each(BOOK_SPOTS.map((b, i) => [i, b] as const))("book spot %i is reachable", (_i, b) => {
    expect(reachableNear(b, 50)).toBe(true);
  });

  it("every sales office can be entered from the lobby", () => {
    offices.forEach((o) => expect(reachableNear({ x: o.r.x + o.r.w / 2, y: o.r.y + o.r.h / 2 }, 40), o.id).toBe(true));
  });

  it("the watchman can be reached and a locked bathroom door blocks the way", () => {
    expect(reachableNear(GUARD, RANGE.use - 20)).toBe(true);
    const mid = { x: BATH_DOOR.x + BATH_DOOR.w / 2, y: BATH_DOOR.y + BATH_DOOR.h / 2 };
    expect(walkable(mid.x, mid.y)).toBe(true);
    setBlocked([BATH_DOOR]);
    expect(walkable(mid.x, mid.y)).toBe(false);
    setBlocked([]);
  });

  it("emergency bell is reachable", () => {
    expect(reachableNear(BELL, RANGE.bell - 15)).toBe(true);
  });
});
