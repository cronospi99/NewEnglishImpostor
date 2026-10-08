/* "Lingo" — the game's original mascot. Drawn around the feet at (0,0),
   roughly 80 wide × 100 tall, heavy black outline (industrial cartoon). */
import type { Look } from "./types";

export const COLORS: { name: string; c: string; d: string }[] = [
  { name: "Hazard", c: "#f5c518", d: "#c99d00" },
  { name: "Rust", c: "#d0552a", d: "#97361a" },
  { name: "Orange", c: "#f07a1a", d: "#b8570c" },
  { name: "Cherry", c: "#e23d4f", d: "#a5232f" },
  { name: "Pink", c: "#ef8fc4", d: "#c4609a" },
  { name: "Grape", c: "#9b6bd3", d: "#6c45a0" },
  { name: "Navy", c: "#3a5bc7", d: "#253c8c" },
  { name: "Sky", c: "#4fb7e8", d: "#2a86b3" },
  { name: "Teal", c: "#2fb3a0", d: "#1d7d70" },
  { name: "Lime", c: "#8fd14f", d: "#5f9a2b" },
  { name: "Forest", c: "#3f8f4a", d: "#285f30" },
  { name: "Steel", c: "#8b969c", d: "#5b666d" },
  { name: "Snow", c: "#eeeae0", d: "#b9b4a6" },
  { name: "Coal", c: "#3b4349", d: "#22282c" },
  { name: "Cocoa", c: "#8a5a3b", d: "#5e3b25" },
  { name: "Sand", c: "#e3c58f", d: "#b39462" }
];

export const HATS = ["none", "hardhat", "gradcap", "beanie", "headphones", "cap", "crown", "beret", "tophat", "flower", "chef"] as const;
export const FACES = ["none", "glasses", "shades", "monocle", "freckles", "mustache", "stars", "sleepy"] as const;
export const EXTRAS = ["none", "hello", "lanyard", "scarf", "bowtie", "tie", "book", "pinEN", "pinES"] as const;

export const LABELS: Record<string, { en: string; es: string }> = {
  none: { en: "None", es: "Nada" }, hardhat: { en: "Hard hat", es: "Casco" }, gradcap: { en: "Grad cap", es: "Birrete" },
  beanie: { en: "Beanie", es: "Gorro" }, headphones: { en: "Headphones", es: "Cascos" }, cap: { en: "Cap", es: "Gorra" },
  crown: { en: "Crown", es: "Corona" }, beret: { en: "Beret", es: "Boina" }, tophat: { en: "Top hat", es: "Chistera" },
  flower: { en: "Flower", es: "Flor" }, chef: { en: "Chef", es: "Chef" },
  glasses: { en: "Glasses", es: "Gafas" }, shades: { en: "Shades", es: "Gafas de sol" }, monocle: { en: "Monocle", es: "Monóculo" },
  freckles: { en: "Freckles", es: "Pecas" }, mustache: { en: "Moustache", es: "Bigote" }, stars: { en: "Star eyes", es: "Ojos estrella" },
  sleepy: { en: "Sleepy", es: "Dormilón" },
  hello: { en: "Hi! badge", es: "Chapa Hi!" }, lanyard: { en: "ID card", es: "Credencial" }, scarf: { en: "Scarf", es: "Bufanda" },
  bowtie: { en: "Bow tie", es: "Pajarita" }, tie: { en: "Tie", es: "Corbata" }, book: { en: "Book", es: "Libro" },
  pinEN: { en: "EN pin", es: "Pin EN" }, pinES: { en: "ES pin", es: "Pin ES" }
};

export const randomLook = (seed = Math.random()): Look => ({
  color: Math.floor(seed * COLORS.length) % COLORS.length,
  hat: HATS[Math.floor(seed * 97) % HATS.length],
  face: "none",
  extra: EXTRAS[Math.floor(seed * 53) % EXTRAS.length]
});

const K = "#0e1113";
const SW = 4;

const BODY = "M -31 -10 C -35 -44 -29 -82 0 -83 C 29 -82 35 -44 31 -10 C 22 -3 -22 -3 -31 -10 Z";

function Eyes({ face, dir, dead }: { face: string; dir: number; dead?: boolean }) {
  const px = dir * 2.5;
  if (dead) {
    return (
      <g stroke={K} strokeWidth={3.5} strokeLinecap="round">
        <path d="M -17 -58 L -7 -48 M -7 -58 L -17 -48" />
        <path d="M 7 -58 L 17 -48 M 17 -58 L 7 -48" />
      </g>
    );
  }
  if (face === "stars") {
    const star = (cx: number) => `M ${cx} -62 L ${cx + 3} -55 L ${cx + 10} -54 L ${cx + 4.5} -49 L ${cx + 6} -42 L ${cx} -46 L ${cx - 6} -42 L ${cx - 4.5} -49 L ${cx - 10} -54 L ${cx - 3} -55 Z`;
    return <g fill="#f5c518" stroke={K} strokeWidth={2.5} strokeLinejoin="round"><path d={star(-12)} /><path d={star(12)} /></g>;
  }
  if (face === "sleepy") {
    return <g fill="none" stroke={K} strokeWidth={3.5} strokeLinecap="round"><path d="M -19 -52 Q -12 -46 -5 -52" /><path d="M 5 -52 Q 12 -46 19 -52" /></g>;
  }
  return (
    <g>
      <ellipse cx={-12} cy={-53} rx={8.5} ry={10.5} fill="#fff" stroke={K} strokeWidth={3} />
      <ellipse cx={12} cy={-53} rx={8.5} ry={10.5} fill="#fff" stroke={K} strokeWidth={3} />
      <circle cx={-12 + px} cy={-51} r={4.2} fill={K} />
      <circle cx={12 + px} cy={-51} r={4.2} fill={K} />
      <circle cx={-10.5 + px} cy={-53} r={1.4} fill="#fff" />
      <circle cx={13.5 + px} cy={-53} r={1.4} fill="#fff" />
    </g>
  );
}

function Face({ face }: { face: string }) {
  switch (face) {
    case "glasses":
      return <g fill="none" stroke={K} strokeWidth={3}><circle cx={-12} cy={-53} r={11.5} /><circle cx={12} cy={-53} r={11.5} /><path d="M -0.5 -54 L 0.5 -54 M -23 -55 L -30 -58 M 23 -55 L 30 -58" /></g>;
    case "shades":
      return <g stroke={K} strokeWidth={3}><path d="M -25 -60 L 25 -60 L 22 -47 Q 12 -42 3 -48 L 0 -52 L -3 -48 Q -12 -42 -22 -47 Z" fill="#141a1d" /><path d="M -18 -57 L -12 -57" stroke="#6d787e" strokeWidth={2} /></g>;
    case "monocle":
      return <g fill="none" stroke="#c9a227" strokeWidth={3}><circle cx={12} cy={-53} r={12} /><path d="M 22 -46 Q 26 -30 18 -20" strokeWidth={2} /></g>;
    case "freckles":
      return <g fill="#9a4a2a">{[[-20, -40], [-15, -37], [-22, -35], [20, -40], [15, -37], [22, -35]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.6} />)}</g>;
    case "mustache":
      return <path d="M -15 -33 Q -8 -40 0 -35 Q 8 -40 15 -33 Q 8 -30 0 -32 Q -8 -30 -15 -33 Z" fill="#3a2a1e" stroke={K} strokeWidth={2} />;
    default:
      return null;
  }
}

function Hat({ hat }: { hat: string }) {
  switch (hat) {
    case "hardhat":
      return <g stroke={K} strokeWidth={SW} strokeLinejoin="round"><path d="M -30 -74 Q -30 -102 0 -103 Q 30 -102 30 -74 Z" fill="#f5c518" /><path d="M -37 -74 L 37 -74 L 37 -68 L -37 -68 Z" fill="#f5c518" /><path d="M -6 -102 L -6 -76 M 6 -102 L 6 -76" strokeWidth={2.5} /></g>;
    case "gradcap":
      return <g stroke={K} strokeWidth={SW} strokeLinejoin="round"><path d="M -20 -84 L -20 -74 Q 0 -66 20 -74 L 20 -84 Z" fill="#1b2023" /><path d="M -40 -88 L 0 -102 L 40 -88 L 0 -76 Z" fill="#22282c" /><path d="M 0 -89 L 30 -84 L 30 -66" fill="none" stroke="#f5c518" strokeWidth={2.5} /><circle cx={30} cy={-64} r={3.5} fill="#f5c518" strokeWidth={2} /></g>;
    case "beanie":
      return <g stroke={K} strokeWidth={SW}><path d="M -29 -72 Q -30 -104 0 -104 Q 30 -104 29 -72 Z" fill="#e23d4f" /><rect x={-31} y={-78} width={62} height={10} rx={4} fill="#eeeae0" /><circle cx={0} cy={-108} r={7} fill="#eeeae0" /></g>;
    case "headphones":
      return <g stroke={K} strokeWidth={SW}><path d="M -32 -58 Q -36 -98 0 -98 Q 36 -98 32 -58" fill="none" strokeWidth={6} /><rect x={-41} y={-66} width={14} height={22} rx={5} fill="#3fa7d6" /><rect x={27} y={-66} width={14} height={22} rx={5} fill="#3fa7d6" /></g>;
    case "cap":
      return <g stroke={K} strokeWidth={SW} strokeLinejoin="round"><path d="M -28 -74 Q -28 -100 0 -100 Q 28 -100 28 -74 Z" fill="#3a5bc7" /><path d="M 2 -76 L 46 -76 Q 44 -68 26 -69 L 2 -70 Z" fill="#3a5bc7" /><circle cx={0} cy={-100} r={3} fill={K} /></g>;
    case "crown":
      return <g stroke={K} strokeWidth={SW} strokeLinejoin="round"><path d="M -22 -76 L -26 -104 L -12 -90 L 0 -108 L 12 -90 L 26 -104 L 22 -76 Z" fill="#f5c518" /><circle cx={0} cy={-84} r={3.5} fill="#e23d4f" strokeWidth={2} /></g>;
    case "beret":
      return <g stroke={K} strokeWidth={SW}><ellipse cx={-4} cy={-82} rx={34} ry={12} fill="#b4441f" /><path d="M -2 -94 L 0 -101" strokeWidth={3} /></g>;
    case "tophat":
      return <g stroke={K} strokeWidth={SW} strokeLinejoin="round"><rect x={-19} y={-118} width={38} height={40} fill="#1b2023" /><rect x={-19} y={-90} width={38} height={7} fill="#b4441f" /><rect x={-32} y={-82} width={64} height={8} rx={3} fill="#1b2023" /></g>;
    case "flower":
      return <g stroke={K} strokeWidth={2.5}>{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={18} cy={-84} rx={6} ry={9} fill="#ef8fc4" transform={`rotate(${a} 18 -78)`} />)}<circle cx={18} cy={-78} r={5} fill="#f5c518" /></g>;
    case "chef":
      return <g stroke={K} strokeWidth={SW} strokeLinejoin="round"><path d="M -22 -76 L -22 -92 Q -36 -96 -28 -108 Q -20 -118 -8 -110 Q 0 -122 10 -110 Q 24 -118 30 -106 Q 36 -96 22 -92 L 22 -76 Z" fill="#fff" /><path d="M -22 -82 L 22 -82" strokeWidth={2.5} /></g>;
    default:
      /* default hair tuft */
      return <path d="M -4 -82 Q -6 -96 6 -98 Q 0 -92 4 -84" fill="none" stroke={K} strokeWidth={3.5} strokeLinecap="round" />;
  }
}

function Extra({ extra }: { extra: string }) {
  switch (extra) {
    case "hello":
      return <g stroke={K} strokeWidth={2.5}><path d="M 4 -30 h 22 a 4 4 0 0 1 4 4 v 10 a 4 4 0 0 1 -4 4 h -14 l -6 5 l 1 -5 h -3 a 4 4 0 0 1 -4 -4 v -10 a 4 4 0 0 1 4 -4 Z" fill="#fff" /><text x={15.5} y={-18} textAnchor="middle" fontSize={10} fontFamily="Archivo Black,Arial Black,sans-serif" fill={K} stroke="none">Hi!</text></g>;
    case "lanyard":
      return <g stroke={K} strokeWidth={2.5}><path d="M -14 -42 L 0 -26 L 14 -42" fill="none" stroke="#3fa7d6" strokeWidth={3} /><rect x={-10} y={-27} width={20} height={16} rx={2} fill="#fff" /><rect x={-10} y={-27} width={20} height={5} fill="#f5c518" /><text x={0} y={-14} textAnchor="middle" fontSize={5.5} fontFamily="Space Mono,monospace" fontWeight={700} fill={K} stroke="none">SMART</text></g>;
    case "scarf":
      return <g stroke={K} strokeWidth={3} strokeLinejoin="round"><path d="M -29 -36 Q 0 -26 29 -36 L 30 -28 Q 0 -18 -30 -28 Z" fill="#e23d4f" /><path d="M 14 -28 L 22 -8 L 12 -8 L 8 -26 Z" fill="#e23d4f" /><path d="M -20 -32 L -20 -26 M -8 -29 L -8 -23 M 4 -29 L 4 -23" stroke="#eeeae0" strokeWidth={2} /></g>;
    case "bowtie":
      return <g stroke={K} strokeWidth={2.5} strokeLinejoin="round" fill="#e23d4f"><path d="M 0 -30 L -13 -37 L -13 -23 Z" /><path d="M 0 -30 L 13 -37 L 13 -23 Z" /><circle cx={0} cy={-30} r={3.5} /></g>;
    case "tie":
      return <g stroke={K} strokeWidth={2.5} strokeLinejoin="round" fill="#3a5bc7"><path d="M -5 -32 L 5 -32 L 3 -27 L -3 -27 Z" /><path d="M -3 -27 L 3 -27 L 7 -10 L 0 -5 L -7 -10 Z" /></g>;
    case "book":
      return <g stroke={K} strokeWidth={2.5} strokeLinejoin="round"><rect x={22} y={-40} width={20} height={26} rx={2} fill="#b4441f" transform="rotate(12 32 -27)" /><path d="M 26 -33 L 37 -31" stroke="#f5c518" strokeWidth={2} transform="rotate(12 32 -27)" /></g>;
    case "pinEN":
    case "pinES":
      return <g stroke={K} strokeWidth={2.5}><circle cx={-16} cy={-24} r={8} fill={extra === "pinEN" ? "#3a5bc7" : "#e23d4f"} /><text x={-16} y={-21} textAnchor="middle" fontSize={7} fontFamily="Archivo Black,Arial Black,sans-serif" fill={extra === "pinEN" ? "#fff" : "#f5c518"} stroke="none">{extra === "pinEN" ? "EN" : "ES"}</text></g>;
    default:
      return null;
  }
}

export function Lingo({ look, dir = 1, moving = false, ghost = false, dead = false, t = 0 }: { look: Look; dir?: number; moving?: boolean; ghost?: boolean; dead?: boolean; t?: number }) {
  const col = COLORS[look.color] || COLORS[0];
  const bob = moving ? Math.abs(Math.sin(t * 12)) * -4 : 0;
  const step = moving ? Math.sin(t * 12) * 4 : 0;
  if (dead) {
    return (
      <g transform="translate(0,-14) rotate(-84)">
        <g transform="translate(0,40)">
          <path d={BODY} fill={col.c} stroke={K} strokeWidth={SW} strokeLinejoin="round" />
          <Eyes face="none" dir={1} dead />
          <path d="M -8 -34 Q 0 -30 8 -34" fill="none" stroke={K} strokeWidth={3} strokeLinecap="round" />
        </g>
        <g fill="#f5c518" stroke={K} strokeWidth={2} transform="rotate(84)">
          {[[-26, -46], [6, -58], [30, -40]].map(([x, y], i) => <path key={i} d={`M ${x} ${y - 7} L ${x + 2} ${y - 2} L ${x + 7} ${y} L ${x + 2} ${y + 2} L ${x} ${y + 7} L ${x - 2} ${y + 2} L ${x - 7} ${y} L ${x - 2} ${y - 2} Z`} />)}
        </g>
      </g>
    );
  }
  return (
    <g opacity={ghost ? 0.5 : 1}>
      {!ghost && <ellipse cx={0} cy={0} rx={30} ry={7} fill="rgba(0,0,0,0.28)" />}
      <g transform={`translate(0,${bob})`}>
        {ghost ? (
          <path d="M -31 -10 C -35 -44 -29 -82 0 -83 C 29 -82 35 -44 31 -10 Q 24 -2 18 -10 Q 10 0 3 -10 Q -5 0 -12 -10 Q -20 -2 -31 -10 Z" fill={col.c} stroke={K} strokeWidth={SW} strokeLinejoin="round" />
        ) : (
          <>
            <ellipse cx={-13 + step} cy={-5} rx={11} ry={7} fill={col.d} stroke={K} strokeWidth={SW} />
            <ellipse cx={13 - step} cy={-5} rx={11} ry={7} fill={col.d} stroke={K} strokeWidth={SW} />
            <path d={BODY} fill={col.c} stroke={K} strokeWidth={SW} strokeLinejoin="round" />
          </>
        )}
        <path d="M -22 -24 C -24 -40 -22 -64 -10 -72" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={5} strokeLinecap="round" />
        <path d="M 24 -18 C 28 -30 28 -50 22 -66" fill="none" stroke={col.d} strokeWidth={6} strokeLinecap="round" opacity={0.6} />
        <ellipse cx={-34 + (moving ? step * 0.6 : 0)} cy={-34} rx={6} ry={9} fill={col.c} stroke={K} strokeWidth={3.5} />
        <ellipse cx={34 - (moving ? step * 0.6 : 0)} cy={-34} rx={6} ry={9} fill={col.c} stroke={K} strokeWidth={3.5} />
        <circle cx={-21} cy={-39} r={4.5} fill="#ff8f8f" opacity={0.55} />
        <circle cx={21} cy={-39} r={4.5} fill="#ff8f8f" opacity={0.55} />
        <Eyes face={look.face} dir={dir} />
        <path d="M -6 -37 Q 0 -32 6 -37" fill="none" stroke={K} strokeWidth={3} strokeLinecap="round" />
        <Face face={look.face} />
        <Extra extra={look.extra} />
        <Hat hat={look.hat} />
        {ghost && <ellipse cx={0} cy={-112} rx={16} ry={5} fill="none" stroke="#f5c518" strokeWidth={3} />}
      </g>
    </g>
  );
}

/* standalone SVG for menus, lobby, voting */
export function LingoBadge({ look, size = 80, ghost, dead, style }: { look: Look; size?: number; ghost?: boolean; dead?: boolean; style?: React.CSSProperties }) {
  return (
    <svg viewBox="-50 -124 100 132" width={size} height={size * 1.32} style={{ display: "block", overflow: "visible", ...style }} aria-hidden>
      <Lingo look={look} ghost={ghost} dead={dead} />
    </svg>
  );
}
