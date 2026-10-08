/* Impostor game relay: one Durable Object per room code.
   It only forwards JSON envelopes between the host (teacher screen) and players;
   all game rules run in the host's browser.

   Client → relay: { t?: "host" | <peer id>, d: any }   (no t = everyone else)
   Relay → client: { f: <sender id> | "_sys", d: any } */

export interface Env {
  ROOMS: DurableObjectNamespace;
}

type Tag = { id: string; role: "host" | "player" };

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const m = url.pathname.match(/^\/room\/([A-Z0-9]{3,8})$/i);
    if (!m) return new Response("impostor relay ok", { headers: { "content-type": "text/plain" } });
    if (req.headers.get("Upgrade") !== "websocket") return new Response("expected websocket", { status: 426 });
    const stub = env.ROOMS.get(env.ROOMS.idFromName(m[1].toUpperCase()));
    return stub.fetch(req);
  }
};

export class Room implements DurableObject {
  constructor(private state: DurableObjectState) {}

  private peers(): { ws: WebSocket; tag: Tag }[] {
    return this.state.getWebSockets().map((ws) => ({ ws, tag: ws.deserializeAttachment() as Tag }));
  }

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const id = url.searchParams.get("id") || "";
    const role = url.searchParams.get("role") === "host" ? "host" : "player";
    if (!/^[\w-]{4,40}$/.test(id)) return new Response("bad id", { status: 400 });

    for (const p of this.peers()) {
      if (p.tag.id === id) try { p.ws.close(4000, "replaced"); } catch {}
    }
    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];
    this.state.acceptWebSocket(server);
    server.serializeAttachment({ id, role } satisfies Tag);

    const others = this.peers().filter((p) => p.tag.id !== id);
    for (const p of others) this.send(p.ws, { f: "_sys", d: { type: "peer-join", id, role } });
    this.send(server, { f: "_sys", d: { type: "welcome", peers: others.map((p) => p.tag) } });
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer) {
    const me = ws.deserializeAttachment() as Tag;
    let env: { t?: string; d?: unknown };
    try { env = JSON.parse(typeof raw === "string" ? raw : new TextDecoder().decode(raw)); } catch { return; }
    if (env.t === "_ping") return this.send(ws, { f: "_sys", d: { type: "pong" } });
    const out = JSON.stringify({ f: me.id, d: env.d });
    for (const p of this.peers()) {
      if (p.ws === ws) continue;
      if (env.t === "host" ? p.tag.role !== "host" : env.t && env.t !== p.tag.id) continue;
      try { p.ws.send(out); } catch {}
    }
  }

  async webSocketClose(ws: WebSocket) {
    const me = ws.deserializeAttachment() as Tag;
    try { ws.close(1000, "bye"); } catch {}
    for (const p of this.peers()) {
      if (p.ws !== ws && p.tag.id !== me.id) this.send(p.ws, { f: "_sys", d: { type: "peer-leave", id: me.id, role: me.role } });
    }
  }

  async webSocketError(ws: WebSocket) {
    return this.webSocketClose(ws);
  }

  private send(ws: WebSocket, msg: unknown) {
    try { ws.send(JSON.stringify(msg)); } catch {}
  }
}
