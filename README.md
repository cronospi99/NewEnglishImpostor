# Impostor — Smart Academia de Idiomas

A word game for English classes, with two modes:

- **Classic mode** (`/classic`): one projector screen. The teacher hands out secret words one card at a time, logs each student's clue, runs the vote and opens the hatch. This is a port of the Claude Design prototype (`design-handoff/project/Impostor.dc.html`).
- **Videogame mode** (`/host`): the projector shows a QR code. Students scan it, design their own character and walk around a top-down map of a Smart Academia de Idiomas branch. They complete English missions in each room while the impostor tries to eliminate them. Meetings combine the original word game (everyone types one word about the secret word) with phone voting.

## How a videogame round works

1. The teacher opens **Host a game** on the projector. A room code and QR code appear.
2. Students scan the code (or go to `/join/CODE`), choose a name, colour, hat, face and extra, and press **Join the shift**.
3. The teacher picks the level, language, number of impostors, missions per player and timers, then presses **Start the shift**.
4. Each phone shows the student's role. The crew sees the secret word; the impostor sees a decoy word or a vague hint.
5. **Crew:** walk to the rooms on your mission list (yellow `!` markers; the 🗺 map also shows them) and press **Use** to play the mission. The crew wins when the shared mission bar fills up or every impostor is voted out.
6. **Impostor:** get close to a crew member and press **Eliminate** (there is a cooldown). Impostors can pretend to do missions, but those don't count. Impostors win when they equal or outnumber the crew.
7. **Meetings** start when someone reports a body (**Report**), rings the emergency bell in Reception, or the teacher presses **Call meeting**. Everyone types one word about the secret word, then votes on their phone. The projector shows the clues, the votes and the ejection.
8. Eliminated players become ghosts and keep doing missions.

### The map

There are 11 rooms, and each room's sign shows its English and Spanish names. Every room has one mission:

| Room | Mission |
| --- | --- |
| Reception | Answer the phone (polite replies) + emergency bell |
| Kids Classroom | Picture cards (vocabulary) |
| Teens Classroom | Sentence builder (word order) |
| Adults Classroom | Fix the email (grammar) |
| Library | Shelve the words (categories / parts of speech) |
| Language Lab | Listening booth (text-to-speech minimal pairs) |
| Cafeteria | Take the order (food vocabulary) |
| Teachers' Room | Mark the test (spot the spelling mistake) |
| Exam Room | Exam paper (gap fill) |
| Director's Office | File certificates (CEFR levels in order) |
| Speaking Corner | Small talk (conversation replies) |

Missions use easy content at A1–A2 and harder content at B1–C1. "Mixed" uses both. When a student finishes a mission, the game tells them what that room is used for.

All character and map art is original SVG drawn in code (`src/game/Character.tsx`, `src/game/MapView.tsx`). There are no external image assets.

## Architecture

```
Phones / projector  ──WebSocket──►  relay (Cloudflare Worker + Durable Object)
   (Vite + React app on Vercel)          forwards messages within a room
```

- The **host browser (projector) runs the game rules**: `src/game/engine.ts` covers roles, kills, meetings, votes and win checks. Only the host knows the roles. Phones receive a public snapshot plus a private message for themselves.
- Players broadcast their own position about 10 times a second while moving.
- The **relay** (`relay/`) is a small Cloudflare Worker that forwards messages between the people in a room. Vercel can't hold long-lived WebSocket connections, so the relay lives on Cloudflare's free plan. That plan covers classroom use: incoming WebSocket messages count 20:1 against the request quota, and outgoing messages are free.

## Run it locally

```bash
npm install
npm run relay        # terminal 1: local relay on ws://localhost:8787
npm run dev          # terminal 2: app on http://localhost:5173
```

To try it with real phones on the same Wi-Fi, open `http://<your-computer-ip>:5173/host`. The QR code will point the phones at your computer, and in development they connect to the relay on port 8787 of the same host.

Tests: `npm test` covers the rule engine and checks that every mission station and the bell are reachable on the map.

## Deploy

### 1. Relay → Cloudflare Workers (free)

```bash
cd relay
npm install
npx wrangler login      # opens the browser once
npx wrangler deploy
```

Wrangler prints a URL such as `https://impostor-relay.<your-subdomain>.workers.dev`. Change `https` to `wss` and save it for the next step.

### 2. App → Vercel

1. On vercel.com: **Add New → Project → Import** `cronospi99/NewEnglishImpostor`.
2. Framework preset: **Vite** (`vercel.json` already sets the build and SPA rewrites).
3. **Environment Variables** → add `VITE_RELAY_URL = wss://impostor-relay.<your-subdomain>.workers.dev`.
4. Deploy. Students join at `https://<your-app>.vercel.app/join/CODE`, and the QR code on the host screen fills this in automatically.

Each later push to `main` redeploys the app automatically. You only need to redeploy the relay when `relay/` changes.

## Project layout

```
src/
  App.tsx, Home.tsx          routes: / · /classic · /host · /join/CODE
  classic/ClassicGame.tsx    classic projector mode
  game/
    engine.ts                host-side rules (+ engine.test.ts)
    map.ts, MapView.tsx      academy floor plan, collision, artwork
    Character.tsx            "Lingo" character + customization options
    missions.ts, MissionPanel.tsx   mission content and mini-games
    Host.tsx, Player.tsx     projector screen and phone screen
    net.ts                   WebSocket client with reconnect
  shared/                    word packs (EN/ES), proximity scoring, random, storage
relay/                       Cloudflare Worker relay
scripts/relay-dev.mjs        local relay for development
design-handoff/              original Claude Design export and chat transcripts
```
