/* WebSocket client for the room relay (relay/ or scripts/relay-dev.mjs). */

export type Envelope = { f: string; d: any };
export type NetStatus = "connecting" | "open" | "closed";

export function relayBase(): string {
  const env = (import.meta.env.VITE_RELAY_URL as string | undefined)?.trim();
  if (env) return env.replace(/\/$/, "");
  const proto = location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${location.hostname}:8787`;
}

export class Relay {
  private ws: WebSocket | null = null;
  private listeners = new Set<(e: Envelope) => void>();
  private statusListeners = new Set<(s: NetStatus) => void>();
  private queue: string[] = [];
  private retry = 0;
  private closed = false;
  private ping: ReturnType<typeof setInterval> | null = null;
  status: NetStatus = "connecting";

  constructor(private code: string, private id: string, private role: "host" | "player") {
    this.open();
  }

  private setStatus(s: NetStatus) {
    this.status = s;
    this.statusListeners.forEach((fn) => fn(s));
  }

  private open() {
    if (this.closed) return;
    this.setStatus("connecting");
    const url = `${relayBase()}/room/${encodeURIComponent(this.code)}?id=${encodeURIComponent(this.id)}&role=${this.role}`;
    let ws: WebSocket;
    try { ws = new WebSocket(url); } catch { return this.reconnect(); }
    this.ws = ws;
    ws.onopen = () => {
      this.retry = 0;
      this.setStatus("open");
      this.queue.splice(0).forEach((m) => ws.send(m));
      this.ping = setInterval(() => this.raw({ t: "_ping" }), 20000);
    };
    ws.onmessage = (ev) => {
      let env: Envelope;
      try { env = JSON.parse(String(ev.data)); } catch { return; }
      this.listeners.forEach((fn) => fn(env));
    };
    ws.onclose = (ev) => {
      if (ws !== this.ws) return;
      if (this.ping) clearInterval(this.ping);
      if (ev.code === 4000) { this.closed = true; this.setStatus("closed"); return; }
      this.reconnect();
    };
    ws.onerror = () => { try { ws.close(); } catch { /* ignore */ } };
  }

  private reconnect() {
    if (this.closed) return;
    this.setStatus("connecting");
    const wait = Math.min(8000, 500 * 2 ** this.retry++);
    setTimeout(() => this.open(), wait);
  }

  private raw(obj: unknown, queue = false) {
    const s = JSON.stringify(obj);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(s);
    else if (queue) this.queue.push(s);
  }

  /* to: "host" | peer id | undefined (everyone else). Volatile messages (positions) are not queued. */
  send(d: unknown, to?: string, volatile = false) {
    this.raw(to ? { t: to, d } : { d }, !volatile);
  }

  on(fn: (e: Envelope) => void) {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }

  onStatus(fn: (s: NetStatus) => void) {
    this.statusListeners.add(fn);
    fn(this.status);
    return () => { this.statusListeners.delete(fn); };
  }

  close() {
    this.closed = true;
    if (this.ping) clearInterval(this.ping);
    try { this.ws?.close(1000); } catch { /* ignore */ }
  }
}

export function makeId() {
  const b = new Uint8Array(9);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(36).padStart(2, "0")).join("").slice(0, 14);
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function makeCode() {
  const b = new Uint8Array(4);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => CODE_CHARS[x % CODE_CHARS.length]).join("");
}
