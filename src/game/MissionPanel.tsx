import { useEffect, useMemo, useRef, useState } from "react";
import { pick, shuffle } from "../shared/random";
import type { Lang } from "../shared/proximity";
import { mcqBank, missionDefs, orderBank, sortBank, spotBank, tierFor, type MCQ } from "./missions";
import { rooms, type Station } from "./map";
import { sfx } from "./sfx";

type Props = { station: Station; level: string; lang: Lang; fake: boolean; onDone: () => void; onClose: () => void };

export function MissionPanel({ station, level, lang, fake, onDone, onClose }: Props) {
  const def = missionDefs[station.mission];
  const room = rooms.find((r) => r.id === station.room)!;
  const tiers = tierFor(level);
  const [round, setRound] = useState(0);
  const [complete, setComplete] = useState(false);
  const [shake, setShake] = useState(0);

  const win = () => {
    if (round + 1 >= def.rounds) {
      setComplete(true);
      sfx.task();
      if (!fake) onDone();
    } else { setRound((r) => r + 1); sfx.step(); }
  };
  const miss = () => { setShake((n) => n + 1); sfx.wrong(); };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(14,17,19,0.78)", display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      <div style={{ width: "min(560px,100%)", maxHeight: "100%", overflow: "auto", border: "4px solid #0e1113", borderRadius: 8, background: "linear-gradient(#3b4349,#2b3236)", boxShadow: "0 8px 0 #0e1113", animation: shake ? (shake % 2 ? "shake .25s 2" : "shakeB .25s 2") : "popIn .25s" }}>
        <div style={{ height: 10, backgroundImage: `repeating-linear-gradient(45deg,${room.accent} 0 12px,#0e1113 12px 24px)` }} />
        <div style={{ padding: "14px 16px 18px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div className="lbl" style={{ color: room.accent }}>{room.en} · {room.es}</div>
              <div style={{ font: "400 22px 'Archivo Black',sans-serif", textTransform: "uppercase", textShadow: "2px 2px 0 #0e1113", marginTop: 4 }}>{lang === "es" ? def.es : def.en}</div>
              <div style={{ fontSize: 14, color: "rgba(242,239,230,0.7)", marginTop: 4 }}>{lang === "es" ? def.howEs : def.howEn}</div>
            </div>
            <button type="button" className="sq btn-s" style={{ flex: "none" }} onClick={onClose} aria-label="Close">✕</button>
          </div>
          <div style={{ display: "flex", gap: 6, margin: "12px 0 14px" }}>
            {Array.from({ length: def.rounds }, (_, i) => (
              <span key={i} style={{ flex: 1, height: 10, border: "2px solid #0e1113", borderRadius: 3, background: i < round || complete ? "#7bbf5a" : i === round ? "#f5c518" : "#1b2023" }} />
            ))}
          </div>

          {complete ? (
            <div style={{ position: "relative", textAlign: "center", padding: "10px 0 4px", animation: "popIn .3s" }}>
              <Confetti />
              <div style={{ font: "400 26px 'Archivo Black',sans-serif", color: fake ? "#f07a1a" : "#7bbf5a", textTransform: "uppercase" }}>{fake ? (lang === "es" ? "Misión fingida" : "Mission faked") : lang === "es" ? "¡Misión completa!" : "Mission complete!"}</div>
              <div style={{ margin: "12px auto 16px", maxWidth: "36ch", fontSize: 16, lineHeight: 1.5 }}>
                <b style={{ color: room.accent }}>{room.en}</b> — {room.about}
              </div>
              <button type="button" className="btn btn-y" onClick={onClose}>OK</button>
            </div>
          ) : def.kind === "mcq" ? (
            <McqTask key={round} id={station.mission} tiers={tiers} onWin={win} onMiss={miss} lang={lang} />
          ) : def.kind === "sort" ? (
            <SortTask tiers={tiers} onWin={win} onMiss={miss} />
          ) : def.kind === "order" ? (
            <OrderTask key={round} id={station.mission as "unscramble" | "levels"} tiers={tiers} onWin={win} onMiss={miss} />
          ) : (
            <SpotTask key={round} tiers={tiers} onWin={win} onMiss={miss} />
          )}
        </div>
      </div>
    </div>
  );
}

type TaskProps = { tiers: ("easy" | "hard")[]; onWin: () => void; onMiss: () => void };

function speak(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-GB";
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

function McqTask({ id, tiers, onWin, onMiss, lang }: TaskProps & { id: string; lang: Lang }) {
  const [q, setQ] = useState<MCQ>(() => pick(tiers.flatMap((t) => mcqBank[id][t])));
  const opts = useMemo(() => shuffle(q.options.map((o, i) => ({ o, ok: i === q.a }))), [q]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [heard, setHeard] = useState(false);
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
  const emoji = /\p{Extended_Pictographic}/u.test(q.q) && q.q.length <= 6;

  const choose = (o: { o: string; ok: boolean }) => {
    if (o.ok) onWin();
    else {
      setWrong((w) => w.concat(o.o));
      onMiss();
      if (wrong.length >= 1) { setQ(pick(tiers.flatMap((t) => mcqBank[id][t]))); setWrong([]); }
    }
  };

  return (
    <div>
      {q.say ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <button type="button" className="btn btn-o" onClick={() => { speak(q.say!); setHeard(true); }}>▶ {lang === "es" ? "Escuchar" : "Play"}</button>
          {(!canSpeak || heard) && <span style={{ fontSize: 13, color: "rgba(242,239,230,0.55)" }}>{canSpeak ? (lang === "es" ? "Puedes repetirlo." : "You can play it again.") : `“${q.say}”`}</span>}
        </div>
      ) : (
        <div style={{ textAlign: "center", margin: "4px 0 16px", font: emoji ? "400 64px sans-serif" : "700 19px Archivo,sans-serif", lineHeight: 1.3 }}>{q.q}</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: opts.every((o) => o.o.length < 14) ? "1fr 1fr" : "1fr", gap: 8 }}>
        {opts.map((o) => (
          <button key={o.o} type="button" className="btn btn-s" disabled={wrong.indexOf(o.o) !== -1}
            style={{ whiteSpace: "normal", textTransform: "none", letterSpacing: 0, fontSize: /\p{Extended_Pictographic}/u.test(o.o) ? 30 : 16, padding: "12px 12px", textAlign: "center" }}
            onClick={() => choose(o)}>{o.o}</button>
        ))}
      </div>
    </div>
  );
}

function SortTask({ tiers, onWin, onMiss }: TaskProps) {
  const set = useRef(pick(tiers.flatMap((t) => sortBank[t]))).current;
  const [items, setItems] = useState(() => shuffle(set.items));
  const [sel, setSel] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<number, string[]>>({});

  const drop = (bin: number) => {
    if (!sel) return;
    const it = items.find((x) => x[0] === sel)!;
    if (it[1] !== bin) { onMiss(); setSel(null); return; }
    const rest = items.filter((x) => x[0] !== sel);
    setPlaced((p) => ({ ...p, [bin]: (p[bin] || []).concat(sel) }));
    setItems(rest);
    setSel(null);
    if (!rest.length) setTimeout(onWin, 250);
  };

  return (
    <div>
      <div className="row" style={{ justifyContent: "center", minHeight: 50, marginBottom: 14 }}>
        {items.map(([w]) => (
          <button key={w} type="button" className={"opt " + (sel === w ? "on" : "off")} style={{ textTransform: "none", letterSpacing: 0 }} onClick={() => setSel(w)}>{w}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${set.bins.length},1fr)`, gap: 8 }}>
        {set.bins.map((b, i) => (
          <button key={b} type="button" onClick={() => drop(i)}
            style={{ minHeight: 120, border: "3px solid #0e1113", borderRadius: 5, background: sel ? "#4a3a24" : "#5a3d26", backgroundImage: "repeating-linear-gradient(0deg,transparent 0 36px,#0e1113 36px 40px)", color: "#f2efe6", cursor: "pointer", padding: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span className="lbl" style={{ color: "#f5c518" }}>{b}</span>
            {(placed[i] || []).map((w) => <span key={w} style={{ fontSize: 13, fontWeight: 700 }}>{w}</span>)}
          </button>
        ))}
      </div>
    </div>
  );
}

function OrderTask({ id, tiers, onWin, onMiss }: TaskProps & { id: "unscramble" | "levels" }) {
  const target = useRef(pick(tiers.flatMap((t) => orderBank[id][t]))).current;
  const [tiles] = useState(() => {
    let s = shuffle(target.map((w, i) => ({ w, i })));
    if (s.every((t, k) => t.w === target[k])) s = s.slice(1).concat(s[0]);
    return s;
  });
  const [used, setUsed] = useState<number[]>([]);
  const built = used.map((i) => tiles.find((t) => t.i === i)!.w);

  const tap = (t: { w: string; i: number }) => {
    if (t.w !== target[built.length]) { onMiss(); return; }
    const next = used.concat(t.i);
    setUsed(next);
    if (next.length === target.length) setTimeout(onWin, 300);
  };

  return (
    <div>
      <div className="well" style={{ minHeight: 56, padding: "10px 12px", marginBottom: 14, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        {built.length ? built.map((w, k) => (
          <span key={k} style={{ padding: id === "levels" ? "8px 10px" : "4px 8px", border: "2px solid #0e1113", borderRadius: 3, background: id === "levels" ? "#f2efe6" : "#f5c518", color: "#0e1113", fontWeight: 800 }}>{id === "levels" ? "📜 " + w : w}</span>
        )) : <span style={{ color: "rgba(242,239,230,0.4)", fontSize: 14 }}>…</span>}
      </div>
      <div className="row" style={{ justifyContent: "center" }}>
        {tiles.map((t) => used.indexOf(t.i) === -1 && (
          <button key={t.i} type="button" className="opt off" style={{ textTransform: "none", letterSpacing: 0, fontSize: 16 }} onClick={() => tap(t)}>{id === "levels" ? "📜 " + t.w : t.w}</button>
        ))}
      </div>
    </div>
  );
}

function SpotTask({ tiers, onWin, onMiss }: TaskProps) {
  const item = useRef(pick(tiers.flatMap((t) => spotBank[t]))).current;
  const [found, setFound] = useState(false);
  const winRef = useRef(onWin);
  winRef.current = onWin;
  useEffect(() => { if (found) { const t = setTimeout(() => winRef.current(), 900); return () => clearTimeout(t); } }, [found]);
  return (
    <div style={{ background: "#f2efe6", color: "#0e1113", border: "3px solid #0e1113", borderRadius: 4, padding: "18px 14px", backgroundImage: "repeating-linear-gradient(0deg,transparent 0 30px,rgba(58,91,199,0.25) 30px 32px)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", fontSize: 21, fontFamily: "'Space Mono',monospace" }}>
        {item.words.map((w, i) => (
          <button key={i} type="button" onClick={() => (i === item.wrong ? setFound(true) : onMiss())}
            style={{ border: 0, background: found && i === item.wrong ? "rgba(226,61,79,0.2)" : "transparent", font: "inherit", color: "#0e1113", cursor: "pointer", padding: "2px 4px", textDecoration: found && i === item.wrong ? "line-through red 3px" : "none" }}>
            {w}
          </button>
        ))}
      </div>
      {found && <div style={{ textAlign: "center", marginTop: 10, color: "#b4441f", fontWeight: 800, fontSize: 18 }}>✓ {item.fix}</div>}
    </div>
  );
}

function Confetti() {
  const bits = useRef(Array.from({ length: 26 }, (_, i) => ({
    x: Math.random() * 100, d: 0.6 + Math.random() * 0.9, r: Math.random() * 360, c: ["#f5c518", "#7bbf5a", "#f07a1a", "#3fa7d6", "#e98fc0"][i % 5], delay: Math.random() * 0.2
  }))).current;
  return (
    <div style={{ position: "absolute", inset: "-20px 0 0", pointerEvents: "none", overflow: "hidden" }}>
      {bits.map((b, i) => (
        <span key={i} style={{ position: "absolute", left: b.x + "%", top: -10, width: 8, height: 12, background: b.c, border: "1.5px solid #0e1113", transform: `rotate(${b.r}deg)`, animation: `confetti ${b.d}s ease-in ${b.delay}s both` }} />
      ))}
    </div>
  );
}
