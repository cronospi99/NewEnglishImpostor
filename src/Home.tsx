import { useState } from "react";
import { Header } from "./shared/Header";
import { LingoBadge } from "./game/Character";
import type { Lang } from "./shared/proximity";

const S = {
  en: {
    kicker: "Smart Academia de Idiomas", h1a: "Find the", h1b: "impostor.",
    intro: "A word game for English classes. Play it on the projector, or let every student join from their phone and explore the academy.",
    classic: "Classic mode", classicP: "One screen, students speak out loud. The teacher deals secret words, logs the clues and runs the vote.",
    video: "Videogame mode", videoP: "Students scan a QR code, design their character and move around the academy completing English missions — while the impostor hunts them.",
    host: "Host a game", play: "Play classic", join: "Join a game", code: "Room code", go: "Join", language: "Language"
  },
  es: {
    kicker: "Smart Academia de Idiomas", h1a: "Encuentra al", h1b: "impostor.",
    intro: "Un juego de palabras para clases de idiomas. Juega en el proyector o deja que cada estudiante entre desde su móvil y explore la academia.",
    classic: "Modo clásico", classicP: "Una pantalla y los estudiantes hablan en voz alta. El profesor reparte palabras, anota las pistas y dirige la votación.",
    video: "Modo videojuego", videoP: "Los estudiantes escanean un QR, diseñan su personaje y recorren la academia haciendo misiones de inglés, mientras el impostor los caza.",
    host: "Crear partida", play: "Jugar clásico", join: "Unirse a una partida", code: "Código", go: "Entrar", language: "Idioma"
  }
};

const demo = [
  { color: 0, hat: "hardhat", face: "none", extra: "lanyard" },
  { color: 7, hat: "gradcap", face: "glasses", extra: "book" },
  { color: 3, hat: "headphones", face: "none", extra: "hello" },
  { color: 9, hat: "beret", face: "freckles", extra: "scarf" },
  { color: 5, hat: "crown", face: "shades", extra: "bowtie" }
];

export function Home({ lang, setLang, go }: { lang: Lang; setLang: (l: Lang) => void; go: (p: string) => void }) {
  const T = S[lang];
  const [code, setCode] = useState("");
  return (
    <div className="page">
      <Header phase="Menu" actions={[{ label: lang === "es" ? "English" : "Español", onClick: () => setLang(lang === "es" ? "en" : "es") }]} />
      <div className="pad-sm" style={{ flex: 1, padding: "34px 30px", display: "flex", flexDirection: "column", gap: 28, maxWidth: 1300 }}>
        <div>
          <div className="kicker" style={{ marginBottom: 16 }}>{T.kicker}</div>
          <h1 className="h1">{T.h1a}<br />{T.h1b}</h1>
          <p className="lead" style={{ maxWidth: "52ch" }}>{T.intro}</p>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {demo.map((l, i) => <div key={i} style={{ animation: `bob ${1.3 + i * 0.17}s ease-in-out infinite` }}><LingoBadge look={l} size={64} /></div>)}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(320px,100%),1fr))", gap: 22 }}>
          <div className="plate" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="lbl lbl-y">01</div>
            <div className="h2" style={{ margin: 0, fontSize: 30 }}>{T.classic}</div>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: "rgba(242,239,230,0.75)" }}>{T.classicP}</p>
            <div><button type="button" className="btn btn-y" onClick={() => go("/classic")}>{T.play}</button></div>
          </div>
          <div className="plate" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="lbl lbl-y">02</div>
            <div className="h2" style={{ margin: 0, fontSize: 30 }}>{T.video}</div>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: "rgba(242,239,230,0.75)" }}>{T.videoP}</p>
            <div><button type="button" className="btn btn-o" onClick={() => go("/host")}>{T.host}</button></div>
          </div>
          <div className="plate" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="lbl lbl-y">03</div>
            <div className="h2" style={{ margin: 0, fontSize: 30 }}>{T.join}</div>
            <form onSubmit={(e) => { e.preventDefault(); if (code.length >= 4) go("/join/" + code); }} style={{ display: "flex", gap: 8 }}>
              <input className="field" value={code} maxLength={6} placeholder={T.code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                style={{ font: "400 24px 'Archivo Black',sans-serif", letterSpacing: "0.2em", textTransform: "uppercase" }} />
              <button type="submit" className="btn btn-y" disabled={code.length < 4}>{T.go}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
