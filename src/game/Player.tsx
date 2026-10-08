import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Relay, makeId, type NetStatus } from "./net";
import type { FromHost, Look, PosMsg, PublicState, Secret, ToHost } from "./types";
import { g, type GStrings } from "./i18n";
import { COLORS, EXTRAS, FACES, HATS, LABELS, Lingo, LingoBadge, randomLook } from "./Character";
import { MapDefs, MapStatic } from "./MapView";
import { BELL, RANGE, SPEED, VISION, WORLD, dist, moveWithin, roomAt, rooms, spawnPoint, stations, type Station } from "./map";
import { MissionPanel } from "./MissionPanel";
import { Center, Countdown, EjectScene, EndScreen, MeetingBoard, TaskBar } from "./Host";
import { load, save } from "../shared/storage";
import type { Lang } from "../shared/proximity";

type Other = { x: number; y: number; dir: number; m: boolean; dx: number; dy: number; at: number };

export function Player({ code, onExit }: { code: string; onExit: () => void }) {
  const id = useMemo(() => {
    const k = "impostor.pid." + code;
    let v = load<string>(k, "");
    if (!v) { v = "p-" + makeId(); save(k, v); }
    return v;
  }, [code]);
  const saved = load<{ name: string; look: Look } | null>("impostor.profile", null);
  const [name, setName] = useState(saved?.name || "");
  const [look, setLook] = useState<Look>(saved?.look || randomLook());
  const [joined, setJoined] = useState(false);
  const [editing, setEditing] = useState(false);
  const [net, setNet] = useState<NetStatus>("connecting");
  const [pub, setPub] = useState<(PublicState & { at: number }) | null>(null);
  const [secret, setSecret] = useState<(Secret & { at: number }) | null>(null);
  const [toast, setToast] = useState("");
  const [flash, setFlash] = useState(false);
  const relay = useRef<Relay | null>(null);
  const others = useRef<Record<string, Other>>({});
  const mine = useRef({ x: spawnPoint(0, 1).x, y: spawnPoint(0, 1).y, dir: 1, m: false });
  if (import.meta.env.DEV) (window as any).__impostor = { mine, others };
  const profile = useRef({ name, look });
  profile.current = { name, look };
  const lang: Lang = pub?.settings.lang || (navigator.language?.startsWith("es") ? "es" : "en");
  const T = g(lang);

  const send = useCallback((m: ToHost) => relay.current?.send(m, "host"), []);

  useEffect(() => {
    if (!joined) return;
    const r = new Relay(code, id, "player");
    relay.current = r;
    const offS = r.onStatus((st) => {
      setNet(st);
      if (st === "open") r.send({ k: "hello", ...profile.current } satisfies ToHost, "host");
    });
    const off = r.on((env) => {
      if (env.f === "_sys") {
        if (env.d?.type === "peer-join" && env.d.role === "host") r.send({ k: "hello", ...profile.current } satisfies ToHost, "host");
        if (env.d?.type === "peer-leave") delete others.current[env.d.id];
        return;
      }
      const m = env.d as FromHost | PosMsg;
      if (!m) return;
      if (m.k === "pos") {
        const o = others.current[env.f];
        others.current[env.f] = { x: m.x, y: m.y, dir: m.dir, m: m.m, dx: o ? o.dx : m.x, dy: o ? o.dy : m.y, at: performance.now() };
        return;
      }
      const now = Date.now();
      if (m.k === "state") setPub({ ...m.s, at: now });
      if (m.k === "secret") setSecret({ ...m.s, at: now });
      if (m.k === "teleport") { mine.current.x = m.x; mine.current.y = m.y; }
      if (m.k === "killed") { setFlash(true); setTimeout(() => setFlash(false), 2600); }
      if (m.k === "toast") { setToast(m.text); setTimeout(() => setToast(""), 3500); }
    });
    return () => { off(); offS(); r.close(); };
  }, [joined, code, id]);

  const saveProfile = () => {
    save("impostor.profile", { name, look });
    if (joined) send({ k: "look", name, look });
    setJoined(true);
    setEditing(false);
  };

  if (!joined || editing) {
    return <Customize T={T} lang={lang} code={code} name={name} setName={setName} look={look} setLook={setLook} onSave={saveProfile} joined={joined} onExit={onExit} />;
  }

  const meP = pub?.players.find((p) => p.id === id);
  const toastText = toast ? (T as Record<string, string>)[toast] || toast : "";

  return (
    <div className="page" style={{ minHeight: "100dvh" }}>
      {net !== "open" && <Banner text={net === "closed" ? T.replaced : T.offline} />}
      {toastText && <Banner text={toastText} color="#f07a1a" />}
      {flash && (
        <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(180,68,31,0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, animation: "popIn .3s" }}>
          <LingoBadge look={look} dead size={110} />
          <div style={{ font: "400 34px 'Archivo Black',sans-serif", textTransform: "uppercase", textShadow: "3px 3px 0 #0e1113", textAlign: "center" }}>{T.killedYou}</div>
        </div>
      )}

      {!pub || pub.phase === "lobby" ? (
        <Center>
          <div className="kicker">{T.academy}</div>
          <div style={{ animation: "bob 1.6s ease-in-out infinite" }}><LingoBadge look={look} size={140} /></div>
          <div style={{ font: "400 30px 'Archivo Black',sans-serif", textTransform: "uppercase", textShadow: "3px 3px 0 #0e1113" }}>{name}</div>
          <p className="lead" style={{ textAlign: "center" }}>{pub ? T.ready : T.connecting}</p>
          {pub && <div className="tag" style={{ color: "#f5c518" }}>{pub.players.length} {T.players}</div>}
          <button type="button" className="btn btn-s" onClick={() => setEditing(true)}>{T.customize}</button>
        </Center>
      ) : pub.phase === "reveal" ? (
        <RoleCard T={T} secret={secret} pub={pub} />
      ) : pub.phase === "play" ? (
        <PlayView key={pub.round} T={T} lang={lang} me={id} pub={pub} secret={secret} relay={relay} others={others} mine={mine} send={send} alive={!!meP?.alive} />
      ) : pub.phase === "meeting" ? (
        <MeetingPhone T={T} lang={lang} me={id} pub={pub} secret={secret} send={send} />
      ) : pub.phase === "eject" ? (
        <Center><div style={{ width: "100%" }}><EjectScene pub={pub} lang={lang} /></div></Center>
      ) : (
        <EndScreen pub={pub} lang={lang} />
      )}
    </div>
  );
}

function Banner({ text, color = "#b4441f" }: { text: string; color?: string }) {
  return <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 90, padding: "8px 12px", background: color, color: "#0e1113", borderBottom: "3px solid #0e1113", font: "700 13px 'Space Mono',monospace", textAlign: "center" }}>{text}</div>;
}

function Customize({ T, lang, code, name, setName, look, setLook, onSave, joined, onExit }: { T: GStrings; lang: Lang; code: string; name: string; setName: (s: string) => void; look: Look; setLook: (l: Look) => void; onSave: () => void; joined: boolean; onExit: () => void }) {
  const chip = (key: "hat" | "face" | "extra", list: readonly string[]) => (
    <div className="row" style={{ gap: 6 }}>
      {list.map((v) => (
        <button key={v} type="button" className={"opt " + (look[key] === v ? "on" : "off")} style={{ padding: "7px 10px", fontSize: 12, letterSpacing: 0, textTransform: "none" }} onClick={() => setLook({ ...look, [key]: v })}>{LABELS[v]?.[lang] || v}</button>
      ))}
    </div>
  );
  return (
    <div className="page" style={{ minHeight: "100dvh" }}>
      <div className="hdr">
        <div className="hdr-row">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div className="hdr-logo">?</div><div className="hdr-title">Impostor</div></div>
          <span className="tag" style={{ color: "#f5c518" }}>{T.code} {code}</span>
        </div>
        <div className="hazard" />
      </div>
      <div style={{ padding: "18px 16px 28px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 560, width: "100%", margin: "0 auto" }}>
        <div className="lbl lbl-y">{T.customize}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div className="well" style={{ padding: 10, background: "radial-gradient(circle at 50% 70%,#3b4349,#1b2023)" }}><LingoBadge look={look} size={110} /></div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            <input className="field" value={name} maxLength={14} placeholder={T.yourName} onChange={(e) => setName(e.target.value)} autoFocus={!name} />
            <button type="button" className="btn btn-o btn-sm" onClick={() => setLook(randomLook())}>🎲 {lang === "es" ? "Aleatorio" : "Random"}</button>
          </div>
        </div>
        <div>
          <div className="lbl" style={{ marginBottom: 8 }}>{T.color}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 6 }}>
            {COLORS.map((c, i) => (
              <button key={c.name} type="button" title={c.name} onClick={() => setLook({ ...look, color: i })}
                style={{ aspectRatio: "1", border: "3px solid #0e1113", borderRadius: 6, background: c.c, cursor: "pointer", boxShadow: look.color === i ? "0 0 0 3px #f5c518" : "0 3px 0 #0e1113" }} />
            ))}
          </div>
        </div>
        <div><div className="lbl" style={{ marginBottom: 8 }}>{T.hat}</div>{chip("hat", HATS)}</div>
        <div><div className="lbl" style={{ marginBottom: 8 }}>{T.face}</div>{chip("face", FACES)}</div>
        <div><div className="lbl" style={{ marginBottom: 8 }}>{T.extra}</div>{chip("extra", EXTRAS)}</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" className="btn btn-y btn-big" disabled={!name.trim()} onClick={onSave}>{joined ? T.saveLook : T.join}</button>
          {!joined && <button type="button" className="btn btn-s" onClick={onExit}>{T.home}</button>}
        </div>
      </div>
    </div>
  );
}

function RoleCard({ T, secret, pub }: { T: GStrings; secret: Secret | null; pub: PublicState }) {
  if (!secret) return <Center><p className="lead">{T.connecting}</p></Center>;
  const imp = secret.role === "impostor";
  const partners = pub.players.filter((p) => secret.partners.indexOf(p.id) !== -1);
  return (
    <Center>
      <div style={{ width: "min(520px,100%)", border: "4px solid #0e1113", borderRadius: 8, background: imp ? "#7d2f16" : "#2b3236", boxShadow: "0 8px 0 #0e1113", overflow: "hidden", animation: "popIn .4s" }}>
        <div style={{ height: 12, backgroundImage: `repeating-linear-gradient(45deg,${imp ? "#f07a1a" : "#f5c518"} 0 11px,#0e1113 11px 22px)` }} />
        <div style={{ padding: "22px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div className="lbl" style={{ color: "#f2efe6" }}>{T.youAre}</div>
          <div style={{ font: "400 40px 'Archivo Black',sans-serif", textTransform: "uppercase", color: imp ? "#f07a1a" : "#7bbf5a", textShadow: "3px 3px 0 #0e1113" }}>{imp ? T.impostor : T.crew}</div>
          <div style={{ fontSize: 16, color: "rgba(242,239,230,0.8)" }}>{imp ? T.impGoal : T.crewGoal}</div>
          <div className="well" style={{ padding: "12px 18px", marginTop: 6 }}>
            <div className="lbl">{T.yourWord}</div>
            <div style={{ font: "400 32px 'Archivo Black',sans-serif", textTransform: "uppercase" }}>{secret.word}</div>
            {secret.hint && <div style={{ fontSize: 15, color: "rgba(242,239,230,0.75)" }}>{secret.hint}</div>}
          </div>
          {partners.length > 0 && <div style={{ fontSize: 15 }}>{T.partner}: <b>{partners.map((p) => p.name).join(", ")}</b></div>}
        </div>
      </div>
    </Center>
  );
}

function MeetingPhone({ T, lang, me, pub, secret, send }: { T: GStrings; lang: Lang; me: string; pub: PublicState & { at: number }; secret: Secret | null; send: (m: ToHost) => void }) {
  const m = pub.meeting!;
  const [clue, setClue] = useState("");
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const iv = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(iv); }, []);
  const alive = !!pub.players.find((p) => p.id === me)?.alive;
  const sent = m.clues[me];
  const myVote = m.voted.indexOf(me) !== -1 ? "x" : undefined;
  const [localVote, setLocalVote] = useState<string | undefined>();
  const msLeft = Math.max(0, m.msLeft - (now - pub.at));
  const imp = secret?.role === "impostor";
  return (
    <div style={{ padding: "16px 14px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div className="kicker" style={{ background: m.reason === "report" ? "#e23d4f" : "#f07a1a" }}>{m.reason === "report" ? T.bodyFound : m.reason === "emergency" ? T.emergencyCalled : T.teacherCalled}</div>
        <Countdown ms={msLeft} />
      </div>
      {secret && <div className="tag" style={{ color: imp ? "#f07a1a" : "#f5c518", alignSelf: "flex-start", fontSize: 12 }}>{T.yourWord}: {secret.word}</div>}
      <h2 className="h2" style={{ fontSize: 24, margin: 0 }}>{m.stage === "clues" ? (imp ? T.clueStageImp : T.clueStage) : m.stage === "vote" ? T.voteStage : T.result}</h2>
      {m.stage === "clues" && alive && (
        sent ? <div className="tag" style={{ color: "#7bbf5a", fontSize: 14, alignSelf: "flex-start" }}>{T.sent} “{sent}”</div> : (
          <form onSubmit={(e) => { e.preventDefault(); if (clue.trim()) send({ k: "clue", text: clue.trim() }); }} style={{ display: "flex", gap: 8 }}>
            <input className="field" value={clue} maxLength={24} placeholder={T.typeClue} onChange={(e) => setClue(e.target.value.replace(/\s+/g, " "))} autoFocus />
            <button type="submit" className="btn btn-y" disabled={!clue.trim()}>{T.send}</button>
          </form>
        )
      )}
      {!alive && <div className="tag" style={{ alignSelf: "flex-start" }}>{T.ghost}</div>}
      <MeetingBoard pub={pub} lang={lang} me={me} myVote={localVote || myVote} onVote={alive ? (t) => { setLocalVote(t); send({ k: "vote", target: t }); } : undefined} />
      {m.stage === "vote" && alive && !myVote && !localVote && (
        <button type="button" className="btn btn-s" onClick={() => { setLocalVote("skip"); send({ k: "vote", target: "skip" }); }}>{T.skipVote}</button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function PlayView({ T, lang, me, pub, secret, relay, others, mine, send, alive }: {
  T: GStrings; lang: Lang; me: string; pub: PublicState & { at: number }; secret: (Secret & { at: number }) | null;
  relay: React.MutableRefObject<Relay | null>; others: React.MutableRefObject<Record<string, Other>>;
  mine: React.MutableRefObject<{ x: number; y: number; dir: number; m: boolean }>; send: (m: ToHost) => void; alive: boolean;
}) {
  const [, setFrame] = useState(0);
  const [panel, setPanel] = useState<Station | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showList, setShowList] = useState(true);
  const [done, setDone] = useState<string[]>([]);
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const joy = useRef<{ ox: number; oy: number; x: number; y: number; id: number } | null>(null);
  const keys = useRef<Record<string, boolean>>({});
  const panelRef = useRef(false);
  panelRef.current = !!panel || showMap;
  const tRef = useRef(0);

  useEffect(() => {
    const onR = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    const kd = (e: KeyboardEvent) => { if ((e.target as HTMLElement)?.tagName === "INPUT") return; keys.current[e.key.toLowerCase()] = true; };
    const ku = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener("resize", onR);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    let lock: { release: () => Promise<void> } | null = null;
    (navigator as any).wakeLock?.request("screen").then((l: any) => { lock = l; }).catch(() => {});
    return () => { window.removeEventListener("resize", onR); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); lock?.release().catch(() => {}); };
  }, []);

  useEffect(() => {
    let raf = 0, last = performance.now(), lastSend = 0, wasMoving = false;
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      tRef.current = t / 1000;
      let vx = 0, vy = 0;
      if (!panelRef.current) {
        const k = keys.current;
        vx = (k["d"] || k["arrowright"] ? 1 : 0) - (k["a"] || k["arrowleft"] ? 1 : 0);
        vy = (k["s"] || k["arrowdown"] ? 1 : 0) - (k["w"] || k["arrowup"] ? 1 : 0);
        const j = joy.current;
        if (j) {
          const dx = j.x - j.ox, dy = j.y - j.oy, d = Math.hypot(dx, dy);
          if (d > 8) { const s = Math.min(1, d / 60); vx = (dx / d) * s; vy = (dy / d) * s; }
        }
      }
      const mag = Math.hypot(vx, vy);
      const p = mine.current;
      if (mag > 0.05) {
        const n = Math.min(1, mag);
        const nx = (vx / mag) * n * SPEED * dt, ny = (vy / mag) * n * SPEED * dt;
        const r = moveWithin(p.x, p.y, nx, ny);
        p.x = r.x; p.y = r.y;
        if (Math.abs(vx) > 0.1) p.dir = vx > 0 ? 1 : -1;
        p.m = true;
      } else p.m = false;
      if ((p.m && t - lastSend > 90) || (wasMoving && !p.m) || t - lastSend > 1000) {
        relay.current?.send({ k: "pos", x: Math.round(p.x), y: Math.round(p.y), dir: p.dir, m: p.m } satisfies PosMsg, undefined, true);
        lastSend = t;
      }
      wasMoving = p.m;
      const f = 1 - Math.exp(-dt * 12);
      Object.values(others.current).forEach((o) => { o.dx += (o.x - o.dx) * f; o.dy += (o.y - o.dy) * f; });
      setFrame((x) => (x + 1) % 1000000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mine, others, relay]);

  const p = mine.current;
  const ghost = !alive;
  const imp = secret?.role === "impostor";
  const vision = imp ? VISION.impostor : VISION.crew;
  const portrait = size.h >= size.w;
  const vw = portrait ? 760 : Math.min(1500, 700 * (size.w / size.h));
  const vh = portrait ? Math.min(1500, 760 * (size.h / size.w)) : 700;
  const nowMs = Date.now();
  const doneSet = new Set([...(secret?.done || []), ...done]);
  const myTasks = (secret?.tasks || []).map((sid) => stations.find((s) => s.id === sid)!).filter(Boolean);
  const todo = myTasks.filter((s) => !doneSet.has(s.id));
  const nearStation = todo.find((s) => dist(p, s) < RANGE.use);
  const nearBell = !ghost && (secret?.emergencyLeft || 0) > 0 && dist(p, BELL) < RANGE.bell;
  const bodies = pub.bodies.filter((b) => ghost || dist(p, b) < vision + 60);
  const nearBody = !ghost ? bodies.find((b) => dist(p, b) < RANGE.report) : undefined;
  const killMs = secret ? Math.max(0, secret.killMsLeft - (nowMs - secret.at)) : 0;
  const visible = pub.players.filter((q) => {
    if (q.id === me || !q.connected) return false;
    const o = others.current[q.id];
    if (!o) return false;
    if (!q.alive && !ghost) return false;
    return ghost || dist(p, { x: o.dx, y: o.dy }) < vision + 60;
  });
  const killTarget = imp && alive && killMs === 0
    ? visible.filter((q) => q.alive && secret!.partners.indexOf(q.id) === -1).map((q) => ({ q, d: dist(p, { x: others.current[q.id].dx, y: others.current[q.id].dy }) })).filter((x) => x.d < RANGE.kill).sort((a, b) => a.d - b.d)[0]?.q
    : undefined;
  const room = roomAt(p.x, p.y);

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    joy.current = { ox: e.clientX, oy: e.clientY, x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const onMove = (e: React.PointerEvent) => { const j = joy.current; if (j && j.id === e.pointerId) { j.x = e.clientX; j.y = e.clientY; } };
  const onUp = (e: React.PointerEvent) => { if (joy.current?.id === e.pointerId) joy.current = null; };

  const use = () => {
    if (nearStation) setPanel(nearStation);
    else if (nearBell) send({ k: "emergency" });
  };

  return (
    <div style={{ position: "fixed", inset: 0, touchAction: "none", userSelect: "none", WebkitUserSelect: "none", overflow: "hidden", background: "#141a1d" }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      <svg viewBox={`${p.x - vw / 2} ${p.y - vh / 2 - 40} ${vw} ${vh}`} preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }}>
        <MapDefs />
        <defs>
          <radialGradient id="fogGrad">
            <stop offset="0.72" stopColor="#000" />
            <stop offset="1" stopColor="#fff" />
          </radialGradient>
          <mask id="fog" maskUnits="userSpaceOnUse" x={p.x - 3000} y={p.y - 3000} width={6000} height={6000}>
            <rect x={p.x - 3000} y={p.y - 3000} width={6000} height={6000} fill="#fff" />
            <circle cx={p.x} cy={p.y - 40} r={vision} fill="url(#fogGrad)" />
          </mask>
        </defs>
        <MapStatic />
        {todo.map((s) => (
          <g key={s.id} transform={`translate(${s.x},${s.y})`}>
            <circle r={30} fill="none" stroke="#f5c518" strokeWidth={5} style={{ animation: "blink 1.2s infinite" }} />
            <text y={-36} textAnchor="middle" fontSize={34} fontFamily="'Archivo Black',sans-serif" fill="#f5c518" stroke="#0e1113" strokeWidth={5} paintOrder="stroke">!</text>
          </g>
        ))}
        {bodies.map((b) => {
          const who = pub.players.find((q) => q.id === b.id);
          return who ? <g key={b.id} transform={`translate(${b.x},${b.y})`}><Lingo look={who.look} dead /></g> : null;
        })}
        {[...visible.map((q) => ({ q, o: others.current[q.id] })), { q: pub.players.find((x) => x.id === me)!, o: null as Other | null }]
          .filter((x) => x.q)
          .sort((a, b) => (a.o ? a.o.dy : p.y) - (b.o ? b.o.dy : p.y))
          .map(({ q, o }) => {
            const x = o ? o.dx : p.x, y = o ? o.dy : p.y;
            const partner = imp && secret!.partners.indexOf(q.id) !== -1;
            return (
              <g key={q.id} transform={`translate(${x},${y})`}>
                <Lingo look={q.look} dir={o ? o.dir : p.dir} moving={o ? o.m : p.m} ghost={!q.alive} t={tRef.current} />
                <text y={-122} textAnchor="middle" fontSize={20} fontWeight={800} fill={partner ? "#f07a1a" : "#f2efe6"} stroke="#0e1113" strokeWidth={5} paintOrder="stroke">{q.name}</text>
                {killTarget?.id === q.id && <circle r={46} cy={-44} fill="none" stroke="#e23d4f" strokeWidth={4} strokeDasharray="8 6" />}
              </g>
            );
          })}
        {!ghost && <rect x={p.x - 3000} y={p.y - 3000} width={6000} height={6000} fill="#0b0e10" opacity={0.92} mask="url(#fog)" />}
      </svg>

      {/* HUD */}
      <div style={{ position: "absolute", top: 8, left: 8, right: 8, display: "flex", gap: 8, alignItems: "flex-start", pointerEvents: "none" }}>
        <div style={{ flex: 1, pointerEvents: "auto" }}>
          <TaskBar label={T.taskBar} done={pub.tasksDone} total={pub.tasksTotal} />
        </div>
        {room && <span className="tag" style={{ color: room.accent, background: "#1b2023ee", flex: "none" }}>{room.en}</span>}
      </div>
      <div style={{ position: "absolute", top: 62, left: 8, maxWidth: "62vw" }}>
        <button type="button" className="tag" onClick={() => setShowList((v) => !v)} style={{ color: imp ? "#f07a1a" : "#f5c518", cursor: "pointer" }}>
          {imp ? "☠ " + T.impostor : T.missions} {showList ? "▾" : "▸"}
        </button>
        {showList && (
          <div style={{ marginTop: 4, padding: "6px 8px", border: "2px solid #0e1113", borderRadius: 4, background: "#1b2023dd", fontSize: 12, lineHeight: 1.5 }}>
            {secret && <div style={{ font: "700 11px 'Space Mono',monospace", color: "rgba(242,239,230,0.6)" }}>{T.yourWord}: <b style={{ color: "#f2efe6" }}>{secret.word}</b></div>}
            {myTasks.map((s) => {
              const r = rooms.find((x) => x.id === s.room)!;
              const ok = doneSet.has(s.id);
              return <div key={s.id} style={{ color: ok ? "#7bbf5a" : "#f2efe6", textDecoration: ok ? "line-through" : "none" }}>{ok ? "✓" : "•"} {r.en}: {s.label}</div>;
            })}
            {ghost && <div style={{ color: "#f5c518", marginTop: 4 }}>{T.ghost}</div>}
          </div>
        )}
      </div>

      {joy.current && (
        <div style={{ position: "absolute", left: joy.current.ox - 60, top: joy.current.oy - 60, width: 120, height: 120, borderRadius: "50%", border: "3px solid rgba(242,239,230,0.35)", background: "rgba(14,17,19,0.25)", pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: 60 - 24 + clamp(joy.current.x - joy.current.ox, 60), top: 60 - 24 + clamp(joy.current.y - joy.current.oy, 60), width: 48, height: 48, borderRadius: "50%", background: "#f5c518", border: "3px solid #0e1113" }} />
        </div>
      )}

      <div style={{ position: "absolute", right: 10, bottom: "max(14px, env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
        {imp && alive && (
          <ActBtn label={killMs > 0 ? Math.ceil(killMs / 1000) + "s" : T.kill} color="#e23d4f" disabled={!killTarget} onClick={() => killTarget && send({ k: "kill", target: killTarget.id })} icon="⚡" />
        )}
        {!ghost && <ActBtn label={T.report} color="#f07a1a" disabled={!nearBody} onClick={() => nearBody && send({ k: "report", body: nearBody.id })} icon="📢" />}
        <ActBtn label={nearBell && !nearStation ? T.bell : T.use} color="#f5c518" disabled={!nearStation && !nearBell} onClick={use} icon={nearBell && !nearStation ? "🔔" : "✋"} />
      </div>
      <div style={{ position: "absolute", left: 10, bottom: "max(14px, env(safe-area-inset-bottom))", display: "flex", gap: 8 }}>
        <button type="button" className="btn btn-s btn-sm" onClick={() => setShowMap(true)}>🗺 {T.map}</button>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center", pointerEvents: "none", font: "700 10px 'Space Mono',monospace", color: "rgba(242,239,230,0.35)" }}>{T.moveHelp}</div>

      {showMap && <MiniMap onClose={() => setShowMap(false)} me={p} todo={todo} T={T} />}
      {panel && (
        <MissionPanel station={panel} level={pub.settings.level} lang={lang} fake={imp}
          onDone={() => { setDone((d) => d.concat(panel.id)); send({ k: "task", station: panel.id }); }}
          onClose={() => setPanel(null)} />
      )}
    </div>
  );
}

const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));

function ActBtn({ label, icon, color, disabled, onClick }: { label: string; icon: string; color: string; disabled: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      style={{ width: 84, height: 84, borderRadius: "50%", border: "4px solid #0e1113", background: color, color: "#0e1113", boxShadow: "0 5px 0 #0e1113", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, cursor: "pointer", font: "800 12px Archivo,sans-serif", textTransform: "uppercase", opacity: disabled ? 0.4 : 1 }}>
      <span style={{ fontSize: 26, lineHeight: 1 }}>{icon}</span>{label}
    </button>
  );
}

function MiniMap({ onClose, me, todo, T }: { onClose: () => void; me: { x: number; y: number }; todo: Station[]; T: GStrings }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(14,17,19,0.9)", display: "flex", flexDirection: "column", padding: 10, gap: 8 }} onPointerDown={(e) => e.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="lbl lbl-y">{T.map} — Smart Academia de Idiomas</span>
        <button type="button" className="sq btn-s" onClick={onClose}>✕</button>
      </div>
      <svg viewBox={`40 20 ${WORLD.w - 40} ${WORLD.h - 20}`} preserveAspectRatio="xMidYMid meet" style={{ flex: 1, width: "100%", border: "3px solid #0e1113", borderRadius: 6 }}>
        <MapDefs />
        <MapStatic />
        {todo.map((s) => <circle key={s.id} cx={s.x} cy={s.y} r={34} fill="#f5c518" stroke="#0e1113" strokeWidth={6} style={{ animation: "blink 1s infinite" }} />)}
        <circle cx={me.x} cy={me.y - 30} r={40} fill="#e23d4f" stroke="#fff" strokeWidth={8} />
      </svg>
    </div>
  );
}
