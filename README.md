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

### The academy's special places

- **Reception lobby:** the game starts here. It is surrounded by **4 sales offices** with glass walls (you can see through them, but you can only walk in through their doors).
- **Bathrooms:** in about **1 game in 5** they're locked: "🚫💩 OUT OF ORDER — It's been bad-pooped!" The door is taped shut and everyone gets a warning when the shift starts.
- **The watchman:** stands with his scanner arch at the lobby's south door. The arch beeps whenever someone walks through it, and he turns to look at whoever is nearby.
- **The AC** in the Adults Classroom is always broken (smoke and "AC BROKEN").

### The map

There are 12 rooms plus 4 sales offices, and each room's sign shows its English and Spanish names. Every room has one mission:

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
| Adults Classroom | **Fix the AC** — set the thermostat to the number the teacher says *in words* ("twenty-two degrees"), restart it… and it always breaks again. Trying still counts! |
| Library + whole map | **The missing books** — find 3 lost student books hidden around the academy (blue books, only you see yours), then shelve them in alphabetical order |
| South door | **Security check** — answer the watchman's questions, then stand still for the scanner |
| Bathrooms | **Fix the bathroom sign** — bathroom vocabulary (not assigned when the bathrooms are locked) |

Missions use easy content at A1–A2 and harder content at B1–C1. "Mixed" uses both. When a student finishes a mission, the game tells them what that room is used for.

All character and map art is original SVG drawn in code (`src/game/Character.tsx`, `src/game/MapView.tsx`). There are no external image assets.

## Demo mode (try it alone)

Choose **Demo** on the home page, or go to `/demo`. You play videogame mode on one device against 5 bots, with no phones, QR codes or relay server needed. Everything runs in your browser tab.

1. Design your character and press **Join the shift**. The projector screen opens with the bots already in the lobby.
2. Press **Start the shift**. The view switches to your phone screen. Use the **📽 Projector / 📱 Phone** toggle at the top to switch between the two at any time.
3. The bots walk around the academy, do missions, eliminate (when they're the impostor), report bodies, fix sabotage, type clues, chat and vote.

Demo games don't add points to your badge collection.

## Among Us–style mechanics (videogame mode)

- **Vision blocked by walls.** Light spills through doorways but not through walls. Ghosts see everything and float through walls.
- **Eliminations.** The impostor has a cooldown. The killer snaps onto the victim's spot, the victim sees who got them, and nearby players see a ZAP effect.
- **Vents** (impostors only). The vents form three linked networks. Hop between vents in the same network, then exit.
- **Sabotage** (impostors only):
  - **Lights out:** the crew's vision shrinks until someone flips the switches at the fuse box in the South hallway.
  - **Fire alarm:** two players must hold panel A (Library) and panel B (Director's Office) at the same time within 45 s, or the impostors win.
  - The emergency bell doesn't work during a sabotage.
- **Meetings.** A full-screen splash announces the meeting. Players type one clue word, then accuse each other with quick English phrases ("I suspect …", "… was with me", "I saw … near the body"). The teacher can enable free text in the lobby settings. The vote result shows who voted for whom.
- **Emotes** (👋 😱 🤔 👍 😂 ❗) appear as bubbles above your character.
- **The teacher can play.** In the lobby, scan the yellow "Teacher plays too" QR code with your phone. You join as a regular player with a 🎓 badge and can be the impostor too.
- **Sound effects** are synthesized in the browser, so there are no audio files. There's a 🔊 toggle on the lobby screens.

## Points and teacher badges

Students earn points during videogame mode:

| Action | Points |
| --- | --- |
| Complete a mission (crew) | +1 |
| Vote for a real impostor | +1 |
| Report a body | +1 |
| Fix a sabotage | +1 |
| Eliminate someone (impostor) | +1 |
| Survive to the end | +1 |
| Crew wins / impostors win | +2 / +3 |

Every **4 points** unlocks a random collectible card of a teacher from the Ibagué branch. There are 25 cards, and the coordinator's golden card only appears after 10 others. Points and cards are saved on each student's phone, so a student keeps their collection when they play on the same device. They can view it under **🏅 Badges** on the home page, in the lobby, or on the end screen. Card art and descriptions are in `src/badges/teachers.ts`; edit them there.

## Screens fit any device

Every screen fits the device without scrolling. A screen lays out for the device's width and shrinks evenly if it's still too tall (`src/shared/Fit.tsx`). On phones in landscape, the character designer and the meeting screen switch to a side-by-side layout.

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
