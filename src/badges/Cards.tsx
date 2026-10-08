import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TEACHERS, POINTS_PER_CARD, type TeacherCard } from "./teachers";
import { TeacherToon } from "./TeacherToon";
import { useClock } from "../game/Character";
import { loadProgress, nextCardAt, type Progress } from "./progress";
import { sfx } from "../game/sfx";
import type { Lang } from "../shared/proximity";

const K = "#0e1113";

const L = {
  en: { album: "Teacher badges", points: "points", next: "Next badge at", all: "Collection complete!", locked: "Locked", earn: "Earn points in Videogame mode: missions, correct votes, reports, fixing sabotage, surviving and winning.", unlocked: "New badge unlocked!", tap: "Tap to continue", close: "Close", per: "points per badge" },
  es: { album: "Insignias de profes", points: "puntos", next: "Siguiente insignia a los", all: "¡Colección completa!", locked: "Bloqueada", earn: "Gana puntos en el modo videojuego: misiones, votos correctos, avisos, arreglar sabotajes, sobrevivir y ganar.", unlocked: "¡Nueva insignia!", tap: "Toca para continuar", close: "Cerrar", per: "puntos por insignia" }
};

export function TeacherCardView({ card, owned = true, width = 180, animate = true, index }: { card: TeacherCard; owned?: boolean; width?: number; animate?: boolean; index?: number }) {
  const t = useClock(animate && owned, 20);
  const gold = !!card.special;
  const num = (index ?? TEACHERS.findIndex((x) => x.id === card.id)) + 1;
  const frame = gold ? "linear-gradient(135deg,#f5c518,#fff2a8 40%,#c99d00 60%,#f5c518)" : "linear-gradient(#3b4349,#2b3236)";
  return (
    <div style={{ width, aspectRatio: "0.68", border: `4px solid ${K}`, borderRadius: 10, background: frame, boxShadow: `0 6px 0 ${K}`, padding: 6, display: "flex", flexDirection: "column", gap: 4, color: "#f2efe6", position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", font: `700 ${Math.max(8, width * 0.055)}px 'Space Mono',monospace`, letterSpacing: "0.08em", textTransform: "uppercase", color: gold ? K : "#f5c518" }}>
        <span>{owned ? card.role : "???"}</span>
        <span>#{String(num).padStart(2, "0")}</span>
      </div>
      <div style={{ flex: 1, border: `3px solid ${K}`, borderRadius: 6, background: owned ? (gold ? "radial-gradient(circle at 50% 40%,#fff6c8,#e9b949)" : "radial-gradient(circle at 50% 35%,#4f5c63,#1b2023)") : "#1b2023", overflow: "hidden", position: "relative" }}>
        <svg viewBox="-62 -178 124 184" style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="xMidYMax meet">
          <TeacherToon look={card.look} t={t} seed={num} silhouette={!owned} />
          {!owned && <text x={0} y={-80} textAnchor="middle" fontSize={56} fontFamily="'Archivo Black',sans-serif" fill="#f5c518" stroke={K} strokeWidth={4} paintOrder="stroke">?</text>}
        </svg>
      </div>
      <div style={{ font: `400 ${Math.max(12, width * 0.1)}px 'Archivo Black',sans-serif`, textTransform: "uppercase", lineHeight: 1.05, color: gold ? K : "#f2efe6", textShadow: gold ? "none" : `2px 2px 0 ${K}` }}>
        {owned ? card.name : "• • •"}
      </div>
      {width >= 160 && (
        <div style={{ fontSize: Math.max(9, width * 0.062), lineHeight: 1.3, color: gold ? "#3b2a00" : "rgba(242,239,230,0.8)", minHeight: "2.6em" }}>
          {owned ? card.about : ""}
        </div>
      )}
    </div>
  );
}

/* full-screen reveal for newly unlocked cards */
export function CardReveal({ ids, lang, onDone }: { ids: string[]; lang: Lang; onDone: () => void }) {
  const T = L[lang];
  const [i, setI] = useState(0);
  const card = TEACHERS.find((x) => x.id === ids[i]);
  useEffect(() => { if (card) sfx.win(); }, [card]);
  if (!card) return null;
  const next = () => (i + 1 < ids.length ? setI(i + 1) : onDone());
  return (
    <div onClick={next} style={{ position: "fixed", inset: 0, zIndex: 95, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, background: "radial-gradient(circle,#4a3a10,#0e1113 70%)", cursor: "pointer" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-conic-gradient(from 0deg, rgba(245,197,24,0.09) 0 8deg, transparent 8deg 16deg)", animation: "spin 18s linear infinite", pointerEvents: "none" }} />
      <div className="kicker" style={{ position: "relative", background: "#f5c518" }}>{T.unlocked}</div>
      <div key={card.id} style={{ position: "relative", animation: "cardFlip .9s cubic-bezier(.2,1.3,.4,1) both" }}>
        <TeacherCardView card={card} width={Math.min(300, window.innerWidth * 0.72, (window.innerHeight - 170) * 0.68)} />
      </div>
      <div style={{ position: "relative", font: "700 12px 'Space Mono',monospace", color: "rgba(242,239,230,0.6)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
        {ids.length > 1 ? `${i + 1} / ${ids.length} · ` : ""}{T.tap}
      </div>
    </div>
  );
}

export function BadgeAlbum({ lang, onClose, progress }: { lang: Lang; onClose?: () => void; progress?: Progress }) {
  const T = L[lang];
  const p = progress || loadProgress();
  const at = nextCardAt(p);
  const pct = at ? Math.round(((p.points - (at - POINTS_PER_CARD)) / POINTS_PER_CARD) * 100) : 100;
  const order = TEACHERS.map((c, i) => ({ c, i }));
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [zoom, setZoom] = useState<TeacherCard | null>(null);
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  /* choose the column count that gives the biggest cards for this screen */
  const gap = 10;
  const availW = Math.min(1200, vp.w) - 32, availH = Math.max(200, vp.h - (vp.w < 600 ? 230 : 200));
  let best = { cols: 5, w: 100 };
  for (let cols = 2; cols <= 13; cols++) {
    let w = (availW - (cols - 1) * gap) / cols;
    const rows = Math.ceil(TEACHERS.length / cols);
    const total = rows * (w / 0.68) + (rows - 1) * gap;
    if (total > availH) w *= availH / total;
    if (w > best.w) best = { cols, w };
  }
  const cardW = Math.floor(Math.min(200, best.w));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "14px 16px 16px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h2 className="h2" style={{ margin: 0 }}>🏅 {T.album}</h2>
        {onClose && <button type="button" className="btn btn-s btn-sm" onClick={onClose}>{T.close}</button>}
      </div>
      <div className="plate" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
        <div style={{ font: "400 40px 'Archivo Black',sans-serif", color: "#f5c518", textShadow: "3px 3px 0 #0e1113" }}>{p.points}</div>
        <div style={{ flex: "1 1 220px" }}>
          <div className="lbl" style={{ marginBottom: 6 }}>{T.points} · {p.owned.length}/{TEACHERS.length} · {at ? `${T.next} ${at}` : T.all}</div>
          <span className="bar" style={{ height: 20, border: "3px solid #0e1113", display: "block" }}><span className="fill-y" style={{ width: Math.max(0, Math.min(100, pct)) + "%" }} /></span>
          <div style={{ fontSize: 13, color: "rgba(242,239,230,0.6)", marginTop: 6 }}>{T.earn} ({POINTS_PER_CARD} {T.per})</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${best.cols}, ${cardW}px)`, gap, justifyContent: "center" }}>
        {order.map(({ c, i }) => (
          <div key={c.id} onClick={() => p.owned.includes(c.id) && setZoom(c)} style={{ cursor: p.owned.includes(c.id) ? "zoom-in" : "default" }}>
            <TeacherCardView card={c} owned={p.owned.includes(c.id)} width={cardW} index={i} animate={false} />
          </div>
        ))}
      </div>
      {zoom && createPortal(
        <div onClick={() => setZoom(null)} style={{ position: "fixed", inset: 0, zIndex: 96, background: "rgba(14,17,19,0.85)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}>
          <div style={{ animation: "popIn .25s" }}><TeacherCardView card={zoom} width={Math.min(320, vp.w * 0.8, (vp.h - 60) * 0.68)} /></div>
        </div>, document.body)}
    </div>
  );
}
