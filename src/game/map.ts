/* Smart Academia de Idiomas — branch floor plan (world units). */

export interface Rect { x: number; y: number; w: number; h: number }

export type Floor = "wood" | "tile" | "carpet" | "check" | "lab" | "marble" | "hall" | "rug";

export interface Room {
  id: string;
  en: string;
  es: string;
  /* one-line description used when a mission is completed in that room */
  about: string;
  r: Rect;
  floor: Floor;
  accent: string;
}

export interface Station {
  id: string;
  room: string;
  x: number;
  y: number;
  mission: string; // mission id
  label: string;
}

export const WORLD = { w: 2420, h: 1900 };

export const rooms: Room[] = [
  { id: "kids", en: "Kids Classroom", es: "Aula Kids", about: "Where the youngest students learn with songs and games.", r: { x: 80, y: 60, w: 540, h: 440 }, floor: "rug", accent: "#7bbf5a" },
  { id: "library", en: "Library", es: "Biblioteca", about: "A quiet room where you borrow books and graded readers.", r: { x: 720, y: 60, w: 520, h: 440 }, floor: "carpet", accent: "#b4441f" },
  { id: "lab", en: "Language Lab", es: "Laboratorio", about: "Computers and headphones for listening practice.", r: { x: 1340, y: 60, w: 520, h: 440 }, floor: "lab", accent: "#3fa7d6" },
  { id: "teens", en: "Teens Classroom", es: "Aula Teens", about: "The classroom for teenage groups.", r: { x: 1960, y: 60, w: 380, h: 440 }, floor: "wood", accent: "#f07a1a" },
  { id: "cafe", en: "Cafeteria", es: "Cafetería", about: "Grab a coffee and a snack during the break.", r: { x: 80, y: 740, w: 540, h: 440 }, floor: "check", accent: "#e94f64" },
  { id: "reception", en: "Reception", es: "Recepción", about: "The front desk: enrolment, information and the emergency bell.", r: { x: 720, y: 740, w: 980, h: 440 }, floor: "marble", accent: "#f5c518" },
  { id: "adults", en: "Adults Classroom", es: "Aula Adultos", about: "Evening classes for adults and professionals.", r: { x: 1800, y: 740, w: 540, h: 440 }, floor: "wood", accent: "#9b6bd3" },
  { id: "teachers", en: "Teachers' Room", es: "Sala de Profesores", about: "Teachers plan lessons and mark tests here.", r: { x: 80, y: 1420, w: 540, h: 420 }, floor: "tile", accent: "#4fb39a" },
  { id: "exam", en: "Exam Room", es: "Sala de Exámenes", about: "Silence please! Official exams take place here.", r: { x: 720, y: 1420, w: 520, h: 420 }, floor: "tile", accent: "#d9d4c4" },
  { id: "office", en: "Director's Office", es: "Dirección", about: "The director signs certificates and meets parents.", r: { x: 1340, y: 1420, w: 520, h: 420 }, floor: "carpet", accent: "#c9a227" },
  { id: "speaking", en: "Speaking Corner", es: "Rincón de Conversación", about: "Sofas and plants: the place to practise conversation.", r: { x: 1960, y: 1420, w: 380, h: 420 }, floor: "rug", accent: "#e98fc0" }
];

export const halls: Rect[] = [
  { x: 80, y: 560, w: 2260, h: 120 },
  { x: 80, y: 1240, w: 2260, h: 120 }
];

/* doors: v = vertical passage (connects top/bottom), h = horizontal passage */
export const doors: (Rect & { v: boolean })[] = [
  // top rooms → upper hall
  { x: 290, y: 470, w: 120, h: 120, v: true },
  { x: 920, y: 470, w: 120, h: 120, v: true },
  { x: 1540, y: 470, w: 120, h: 120, v: true },
  { x: 2090, y: 470, w: 120, h: 120, v: true },
  // middle rooms ↔ halls
  { x: 290, y: 650, w: 120, h: 120, v: true },
  { x: 900, y: 650, w: 140, h: 120, v: true },
  { x: 1400, y: 650, w: 140, h: 120, v: true },
  { x: 2010, y: 650, w: 120, h: 120, v: true },
  { x: 290, y: 1150, w: 120, h: 120, v: true },
  { x: 1150, y: 1150, w: 140, h: 120, v: true },
  { x: 2010, y: 1150, w: 120, h: 120, v: true },
  // bottom rooms ← lower hall
  { x: 290, y: 1330, w: 120, h: 120, v: true },
  { x: 920, y: 1330, w: 120, h: 120, v: true },
  { x: 1540, y: 1330, w: 120, h: 120, v: true },
  { x: 2090, y: 1330, w: 120, h: 120, v: true },
  // reception side doors
  { x: 590, y: 900, w: 160, h: 120, v: false },
  { x: 1670, y: 900, w: 160, h: 120, v: false }
];

/* furniture players walk around: [rect, kind] */
export type Furniture = Rect & { kind: string; label?: string };
export const furniture: Furniture[] = [
  // kids
  { x: 150, y: 90, w: 300, h: 26, kind: "board", label: "red · blue · green" },
  { x: 150, y: 220, w: 110, h: 70, kind: "kidtable" }, { x: 330, y: 220, w: 110, h: 70, kind: "kidtable" },
  { x: 150, y: 360, w: 110, h: 70, kind: "kidtable" }, { x: 470, y: 330, w: 110, h: 110, kind: "toybox" },
  // library
  { x: 740, y: 90, w: 30, h: 360, kind: "shelf" }, { x: 1190, y: 90, w: 30, h: 360, kind: "shelf" },
  { x: 860, y: 110, w: 240, h: 30, kind: "shelfH" }, { x: 880, y: 260, w: 200, h: 90, kind: "readtable" },
  // lab
  { x: 1380, y: 120, w: 440, h: 50, kind: "labdesk" }, { x: 1380, y: 260, w: 180, h: 50, kind: "labdesk" }, { x: 1640, y: 260, w: 180, h: 50, kind: "labdesk" },
  // teens
  { x: 2000, y: 90, w: 300, h: 26, kind: "board", label: "Present Perfect" },
  { x: 2010, y: 200, w: 120, h: 60, kind: "desk" }, { x: 2180, y: 200, w: 120, h: 60, kind: "desk" },
  { x: 2010, y: 330, w: 120, h: 60, kind: "desk" },
  // cafe
  { x: 100, y: 770, w: 300, h: 50, kind: "counter" },
  { x: 160, y: 920, w: 90, h: 90, kind: "cafetable" }, { x: 380, y: 920, w: 90, h: 90, kind: "cafetable" }, { x: 270, y: 1060, w: 90, h: 90, kind: "cafetable" },
  // reception
  { x: 760, y: 770, w: 360, h: 60, kind: "frontdesk" },
  { x: 1110, y: 900, w: 140, h: 140, kind: "bell" },
  { x: 1450, y: 780, w: 220, h: 50, kind: "sofa" },
  { x: 1500, y: 1080, w: 160, h: 60, kind: "plants" },
  // adults
  { x: 1840, y: 770, w: 300, h: 26, kind: "board", label: "Phrasal verbs" },
  { x: 1900, y: 880, w: 380, h: 70, kind: "meeting" }, { x: 1900, y: 1040, w: 380, h: 70, kind: "meeting" },
  // teachers
  { x: 100, y: 1450, w: 40, h: 300, kind: "lockers" },
  { x: 240, y: 1560, w: 260, h: 120, kind: "bigtable" },
  { x: 460, y: 1760, w: 140, h: 60, kind: "sofa" },
  // exam
  { x: 780, y: 1520, w: 70, h: 50, kind: "examdesk" }, { x: 940, y: 1520, w: 70, h: 50, kind: "examdesk" }, { x: 1100, y: 1520, w: 70, h: 50, kind: "examdesk" },
  { x: 780, y: 1660, w: 70, h: 50, kind: "examdesk" }, { x: 940, y: 1660, w: 70, h: 50, kind: "examdesk" }, { x: 1100, y: 1660, w: 70, h: 50, kind: "examdesk" },
  { x: 920, y: 1780, w: 110, h: 40, kind: "clock" },
  // office
  { x: 1480, y: 1560, w: 240, h: 80, kind: "bossdesk" }, { x: 1360, y: 1450, w: 30, h: 220, kind: "frames" },
  { x: 1760, y: 1740, w: 80, h: 80, kind: "plant" },
  // speaking corner
  { x: 1990, y: 1460, w: 60, h: 160, kind: "sofaV" }, { x: 2250, y: 1460, w: 60, h: 160, kind: "sofaV" },
  { x: 2100, y: 1520, w: 100, h: 70, kind: "coffeetable" }, { x: 2260, y: 1760, w: 60, h: 60, kind: "plant" }
];

export const stations: Station[] = [
  { id: "s-kids", room: "kids", x: 520, y: 230, mission: "picture", label: "Picture cards" },
  { id: "s-library", room: "library", x: 980, y: 400, mission: "sort", label: "Shelve the words" },
  { id: "s-lab", room: "lab", x: 1600, y: 400, mission: "listen", label: "Listening booth" },
  { id: "s-teens", room: "teens", x: 2250, y: 360, mission: "unscramble", label: "Sentence builder" },
  { id: "s-cafe", room: "cafe", x: 470, y: 800, mission: "order", label: "Take the order" },
  { id: "s-reception", room: "reception", x: 940, y: 880, mission: "phone", label: "Answer the phone" },
  { id: "s-adults", room: "adults", x: 2080, y: 1150 - 30, mission: "grammar", label: "Fix the email" },
  { id: "s-teachers", room: "teachers", x: 370, y: 1740, mission: "spot", label: "Mark the test" },
  { id: "s-exam", room: "exam", x: 1180, y: 1460, mission: "gap", label: "Exam paper" },
  { id: "s-office", room: "office", x: 1600, y: 1720, mission: "levels", label: "File certificates" },
  { id: "s-speaking", room: "speaking", x: 2150, y: 1700, mission: "reply", label: "Small talk" }
];

export const BELL = { x: 1180, y: 970 };
export const RANGE = { use: 110, kill: 130, report: 150, bell: 150 };
export const VISION = { crew: 360, impostor: 470 };
export const SPEED = 330; // units / second
export const RADIUS = 20;

export function spawnPoint(i: number, n: number) {
  const a = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2;
  return { x: Math.round(BELL.x + Math.cos(a) * 150), y: Math.round(BELL.y + Math.sin(a) * 115) };
}

const inside = (x: number, y: number, r: Rect, mx: number, my: number) =>
  x >= r.x + mx && x <= r.x + r.w - mx && y >= r.y + my && y <= r.y + r.h - my;

export function walkable(x: number, y: number): boolean {
  const m = RADIUS;
  const onFloor =
    rooms.some((rm) => inside(x, y, rm.r, m, m)) ||
    halls.some((h) => inside(x, y, h, m, m)) ||
    doors.some((d) => inside(x, y, d, d.v ? m : 0, d.v ? 0 : m));
  if (!onFloor) return false;
  return !furniture.some((f) => x > f.x - m * 0.7 && x < f.x + f.w + m * 0.7 && y > f.y - m * 0.5 && y < f.y + f.h + m * 0.9);
}

/* axis-separated move so players slide along walls */
export function moveWithin(x: number, y: number, dx: number, dy: number) {
  let nx = x, ny = y;
  if (walkable(x + dx, y)) nx = x + dx;
  if (walkable(nx, y + dy)) ny = y + dy;
  return { x: nx, y: ny };
}

export function roomAt(x: number, y: number): Room | null {
  return rooms.find((rm) => inside(x, y, rm.r, 0, 0)) || null;
}

export const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);
