import { memo } from "react";
import { BELL, WORLD, doors, furniture, halls, rooms, stations, type Furniture } from "./map";

const K = "#0e1113";

export const MapDefs = memo(function MapDefs() {
  return (
    <defs>
      <pattern id="f-wood" width="80" height="24" patternUnits="userSpaceOnUse">
        <rect width="80" height="24" fill="#a8774a" />
        <path d="M0 23.5H80M40 0V24" stroke="#7d5432" strokeWidth="2" />
        <path d="M6 8h20M50 15h18" stroke="#b98a5c" strokeWidth="2" />
      </pattern>
      <pattern id="f-tile" width="60" height="60" patternUnits="userSpaceOnUse">
        <rect width="60" height="60" fill="#c9cfc9" />
        <path d="M0 59H60M59 0V60" stroke="#9aa39c" strokeWidth="2" />
      </pattern>
      <pattern id="f-carpet" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill="#7a3a33" />
        <circle cx="10" cy="10" r="2" fill="#8d4840" />
      </pattern>
      <pattern id="f-check" width="80" height="80" patternUnits="userSpaceOnUse">
        <rect width="80" height="80" fill="#eeeae0" />
        <rect width="40" height="40" fill="#2b3236" /><rect x="40" y="40" width="40" height="40" fill="#2b3236" />
      </pattern>
      <pattern id="f-lab" width="50" height="50" patternUnits="userSpaceOnUse">
        <rect width="50" height="50" fill="#2d5b74" />
        <path d="M0 49H50M49 0V50" stroke="#24485c" strokeWidth="2" />
        <circle cx="25" cy="25" r="2" fill="#3fa7d6" opacity=".5" />
      </pattern>
      <pattern id="f-marble" width="120" height="120" patternUnits="userSpaceOnUse">
        <rect width="120" height="120" fill="#e5e0d2" />
        <path d="M0 119H120M119 0V120" stroke="#c6bfac" strokeWidth="2" />
        <path d="M10 30 Q 40 10 70 40 T 115 60" fill="none" stroke="#d3ccb8" strokeWidth="2" />
      </pattern>
      <pattern id="f-hall" width="56" height="56" patternUnits="userSpaceOnUse">
        <rect width="56" height="56" fill="#59636a" />
        <path d="M0 55H56M55 0V56" stroke="#4a5359" strokeWidth="2" />
        <circle cx="8" cy="8" r="2.5" fill="#6d787e" /><circle cx="48" cy="48" r="2.5" fill="#6d787e" />
      </pattern>
      <pattern id="f-rug" width="60" height="60" patternUnits="userSpaceOnUse">
        <rect width="60" height="60" fill="#3f8f4a" />
        <rect x="0" y="0" width="30" height="30" fill="#46994f" /><rect x="30" y="30" width="30" height="30" fill="#46994f" />
      </pattern>
      <pattern id="hazard" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="14" height="28" fill="#f5c518" /><rect x="14" width="14" height="28" fill={K} />
      </pattern>
      <radialGradient id="lamp" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fff6c8" stopOpacity="0.22" />
        <stop offset="100%" stopColor="#fff6c8" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
});

function Piece({ f }: { f: Furniture }) {
  const { x, y, w, h } = f;
  const box = (fill: string, rx = 4) => <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} stroke={K} strokeWidth={4} />;
  switch (f.kind) {
    case "board":
      return <g>{box("#f2efe6", 2)}<text x={x + w / 2} y={y + h - 7} textAnchor="middle" fontSize={15} fontFamily="'Space Mono',monospace" fontWeight={700} fill="#3a5bc7">{f.label}</text></g>;
    case "kidtable":
      return <g>{box("#f5c518", 14)}{[0, 1].map((i) => <circle key={i} cx={x + 24 + i * (w - 48)} cy={y + h + 14} r={11} fill="#e23d4f" stroke={K} strokeWidth={3} />)}</g>;
    case "toybox":
      return <g>{box("#3a5bc7")}<text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" fontSize={40}>🧸</text></g>;
    case "shelf": case "shelfH": {
      const books = [];
      const vert = f.kind === "shelf";
      const n = Math.floor((vert ? h : w) / 22);
      for (let i = 0; i < n; i++) {
        const c = ["#e23d4f", "#3a5bc7", "#f5c518", "#2fb3a0", "#9b6bd3"][i % 5];
        books.push(vert
          ? <rect key={i} x={x + 4} y={y + 6 + i * 22} width={w - 8} height={16} fill={c} stroke={K} strokeWidth={1.5} />
          : <rect key={i} x={x + 6 + i * 22} y={y + 4} width={16} height={h - 8} fill={c} stroke={K} strokeWidth={1.5} />);
      }
      return <g>{box("#6b4a2e", 2)}{books}</g>;
    }
    case "readtable": case "bigtable": case "meeting":
      return <g>{box("#a8774a", 8)}<rect x={x + 12} y={y + 12} width={w - 24} height={h - 24} rx={4} fill="none" stroke="#7d5432" strokeWidth={2} />
        {f.kind === "readtable" && <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle" fontSize={28}>📖</text>}
        {f.kind === "bigtable" && <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" fontSize={30}>☕ 📝</text>}</g>;
    case "labdesk": {
      const n = Math.floor(w / 90);
      return <g>{box("#1b2023")}{Array.from({ length: n }, (_, i) => (
        <g key={i}><rect x={x + 14 + i * 90} y={y + 6} width={54} height={30} rx={3} fill="#3fa7d6" stroke={K} strokeWidth={2.5} /><path d={`M ${x + 30 + i * 90} ${y + 44} q 11 -10 22 0`} fill="none" stroke="#f5c518" strokeWidth={3} /></g>
      ))}</g>;
    }
    case "desk":
      return <g>{box("#c9a36d")}<rect x={x + w / 2 - 14} y={y + h + 6} width={28} height={18} rx={4} fill="#4a5359" stroke={K} strokeWidth={3} /></g>;
    case "examdesk":
      return <g>{box("#d9d4c4", 2)}<rect x={x + 18} y={y + 10} width={34} height={26} fill="#fff" stroke={K} strokeWidth={1.5} /></g>;
    case "counter":
      return <g>{box("#b4441f")}<text x={x + 40} y={y + 36} fontSize={28}>☕</text><text x={x + 110} y={y + 36} fontSize={28}>🥐</text><text x={x + 180} y={y + 36} fontSize={28}>🍩</text><text x={x + 250} y={y + 36} fontSize={28}>🧃</text></g>;
    case "cafetable":
      return <g><circle cx={x + w / 2} cy={y + h / 2} r={w / 2} fill="#eeeae0" stroke={K} strokeWidth={4} /><text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle" fontSize={26}>🍰</text></g>;
    case "frontdesk":
      return <g>{box("#2b3236")}<rect x={x} y={y + h - 14} width={w} height={14} fill="url(#hazard)" stroke={K} strokeWidth={3} />
        <text x={x + w / 2} y={y + 30} textAnchor="middle" fontSize={17} fontFamily="'Archivo Black',sans-serif" fill="#f5c518">SMART</text>
        <text x={x + w / 2} y={y + 44} textAnchor="middle" fontSize={10} fontFamily="'Space Mono',monospace" fontWeight={700} fill="#f2efe6" letterSpacing="2">ACADEMIA DE IDIOMAS</text></g>;
    case "bell":
      return <g><circle cx={BELL.x} cy={BELL.y} r={70} fill="#2b3236" stroke={K} strokeWidth={5} /><circle cx={BELL.x} cy={BELL.y} r={58} fill="url(#hazard)" stroke={K} strokeWidth={3} />
        <circle cx={BELL.x} cy={BELL.y} r={36} fill="#e23d4f" stroke={K} strokeWidth={5} /><circle cx={BELL.x - 10} cy={BELL.y - 10} r={9} fill="#ff8f8f" /></g>;
    case "sofa": case "sofaV":
      return <g>{box("#9b6bd3", 14)}<rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} rx={10} fill="#b48ae0" stroke={K} strokeWidth={2} /></g>;
    case "plants": case "plant":
      return <g>{box("#8a5a3b", 6)}<text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" fontSize={40}>🪴</text></g>;
    case "lockers":
      return <g>{box("#8b969c", 2)}{Array.from({ length: Math.floor(h / 50) }, (_, i) => <path key={i} d={`M ${x} ${y + 50 * (i + 1)} h ${w}`} stroke={K} strokeWidth={2} />)}</g>;
    case "clock":
      return <g>{box("#1b2023", 6)}<text x={x + w / 2} y={y + 28} textAnchor="middle" fontSize={20} fontFamily="'Space Mono',monospace" fontWeight={700} fill="#e23d4f">00:45</text></g>;
    case "bossdesk":
      return <g>{box("#6b4a2e")}<text x={x + 30} y={y + 50} fontSize={30}>🖋️</text><text x={x + w - 70} y={y + 50} fontSize={30}>🏅</text></g>;
    case "frames":
      return <g>{box("#c9a227", 2)}{[0, 1, 2].map((i) => <rect key={i} x={x + 5} y={y + 14 + i * 70} width={w - 10} height={50} fill="#f2efe6" stroke={K} strokeWidth={2} />)}</g>;
    case "coffeetable":
      return <g>{box("#a8774a", 10)}<text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" fontSize={30}>💬</text></g>;
    default:
      return box("#6d787e");
  }
}

/* static floor plan — rendered once */
export const MapStatic = memo(function MapStatic({ labels = true }: { labels?: boolean }) {
  return (
    <g>
      <rect x={-400} y={-400} width={WORLD.w + 800} height={WORLD.h + 800} fill="#141a1d" />
      {/* walls: each room drawn larger in dark, floors on top */}
      {rooms.map((r) => <rect key={"w" + r.id} x={r.r.x - 16} y={r.r.y - 16} width={r.r.w + 32} height={r.r.h + 32} rx={6} fill="#4a5359" stroke={K} strokeWidth={5} />)}
      {halls.map((h, i) => <rect key={"wh" + i} x={h.x - 16} y={h.y - 16} width={h.w + 32} height={h.h + 32} rx={6} fill="#4a5359" stroke={K} strokeWidth={5} />)}
      {halls.map((h, i) => <rect key={"h" + i} x={h.x} y={h.y} width={h.w} height={h.h} fill="url(#f-hall)" />)}
      {rooms.map((r) => <rect key={"f" + r.id} x={r.r.x} y={r.r.y} width={r.r.w} height={r.r.h} fill={`url(#f-${r.floor})`} />)}
      {doors.map((d, i) => (
        <g key={"d" + i}>
          <rect x={d.x} y={d.y} width={d.w} height={d.h} fill="url(#f-hall)" />
          {d.v
            ? <><rect x={d.x - 6} y={d.y + d.h / 2 - 10} width={8} height={20} fill="#f5c518" stroke={K} strokeWidth={2} /><rect x={d.x + d.w - 2} y={d.y + d.h / 2 - 10} width={8} height={20} fill="#f5c518" stroke={K} strokeWidth={2} /></>
            : <><rect x={d.x + d.w / 2 - 10} y={d.y - 6} width={20} height={8} fill="#f5c518" stroke={K} strokeWidth={2} /><rect x={d.x + d.w / 2 - 10} y={d.y + d.h - 2} width={20} height={8} fill="#f5c518" stroke={K} strokeWidth={2} /></>}
        </g>
      ))}
      {/* hallway hazard edging + signs */}
      {halls.map((h, i) => (
        <g key={"hz" + i}>
          <text x={h.x + h.w / 2} y={h.y + h.h / 2 + 10} textAnchor="middle" fontSize={30} fontFamily="'Archivo Black',sans-serif" fill="rgba(242,239,230,0.12)" letterSpacing="18">{i === 0 ? "MAIN HALLWAY · PASILLO" : "SOUTH HALLWAY · PASILLO SUR"}</text>
        </g>
      ))}
      {rooms.map((r) => <ellipse key={"l" + r.id} cx={r.r.x + r.r.w / 2} cy={r.r.y + r.r.h / 2} rx={r.r.w * 0.6} ry={r.r.h * 0.6} fill="url(#lamp)" />)}
      {furniture.map((f, i) => <Piece key={i} f={f} />)}
      {stations.map((s) => (
        <g key={s.id}>
          <circle cx={s.x} cy={s.y} r={22} fill="#1b2023" stroke={K} strokeWidth={4} />
          <circle cx={s.x} cy={s.y} r={14} fill="none" stroke="#6d787e" strokeWidth={3} strokeDasharray="5 4" />
        </g>
      ))}
      {labels && rooms.map((r) => (
        <g key={"s" + r.id} transform={`translate(${r.r.x + r.r.w / 2},${r.r.y + 4})`}>
          <rect x={-r.en.length * 8 - 18} y={-26} width={r.en.length * 16 + 36} height={44} rx={4} fill="#1b2023" stroke={K} strokeWidth={4} />
          <rect x={-r.en.length * 8 - 18} y={-26} width={10} height={44} fill={r.accent} stroke={K} strokeWidth={3} />
          <text x={4} y={-2} textAnchor="middle" fontSize={20} fontFamily="'Archivo Black',sans-serif" fill="#f2efe6">{r.en.toUpperCase()}</text>
          <text x={4} y={13} textAnchor="middle" fontSize={11} fontFamily="'Space Mono',monospace" fontWeight={700} fill={r.accent} letterSpacing="1.5">{r.es.toUpperCase()}</text>
        </g>
      ))}
    </g>
  );
});
