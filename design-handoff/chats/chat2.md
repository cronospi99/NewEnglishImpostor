# Industrial cartoon game redesign

_Started 2026-09-04 02:54 UTC_

---

## User

Continuing from "Impostor word game for English".

## Assistant

We're building an Impostor game for English language learning (A1–C1), styled as a Sherlock Holmes case-file aesthetic. The game runs on a single teacher projector with students speaking aloud.

Core flow: numbered "eyes closed" reveal per round → teacher reads a secret word to one player → clue round (everyone gives one-sentence clues) → discussion → vote (who's the impostor?) → score reveal and carry forward. Rounds are labelled "Case No." Timer, player names, and scores persist across rounds.

Design is Sherlock-inspired: sepia-ink background, brass accents, Libre Baskerville/Spectral type, typewriter mono for labels, 3px corners, oxblood impostor card. We kept Nocturne's structure (dark ground, outlined buttons, flush-left, fading rules) but shifted palette and typography. Old Nocturne version saved as backup.

Fixed two layout issues: button labels now stay on one line with proper line-height, button rows are content-sized instead of stretch-pinned, and the setup grid wraps on narrow screens (minmax grid, 48px gap collapse to single column).

Word packs are graded A1–C1, 8 words each, mixed topics. You mentioned deciding topics for you — we haven't swapped those yet. If you have specific topics you teach (animals, food, adjectives, etc.), I'll rebuild the word packs to match.

Next: confirm which topics you want in the word packs, or we're ready to test.

Files: Impostor.dc.html, support.js. (Impostor v1 Nocturne.dc.html is the old version.)

## User

Execute the following updates to the application codebase:

Apply Industrial Cartoon Styling:

Update all UI components to use heavy black outlines, industrial color palettes (hazard yellow, rust, steel gray, warning orange), bold typography, and mechanical design accents (rivets, hazard striping, metal plates).

Upgrade Impostor Selection Logic:

Implement crypto.getRandomValues() for selection.

Store previous game states to prevent the same player from being chosen as the impostor in back-to-back games.

Implement Student Word Tracking & Obfuscated Metrics:

Create a text input interface for the teacher to record words spoken by each student.

Calculate word distribution percentages per student automatically.

Randomize the display order of the word statistics panel so metrics do not directly signal the impostor's identity.

Build the Voting Phase System:

Add a dedicated voting interface displaying all active players alongside real-time vote counters.

Provide increment/decrement buttons for the teacher to assign votes to each player during discussions.

Add Teacher Phase Controls:

Implement a "Close Voting" control button accessible only in the teacher panel to lock vote submission.

Design the Vote Statistics & Impostor Reveal Sequence:

Display a vote distribution summary chart immediately after voting is locked.

Trigger an industrial-themed CSS/JS reveal animation (e.g., sliding shutter doors, warning siren, or mechanical hatch opening) that announces the actual impostor.

## Assistant

_[tool: read_file]_

Saving the Sherlock version, then rebuilding.

_[tool: copy_files]_

_[tool: dc_write]_

_[tool: ready_for_verification]_

All six items are in, restyled as an industrial factory-floor look (hazard yellow, rust, steel plate, heavy black outlines, rivets, hard offset shadows, Archivo Black / Space Mono).

- **Selection**: `crypto.getRandomValues` with rejection sampling for uniform draws; last round's impostors are excluded from the eligible pool (falls back to everyone if too few players). Round history is stored per game.
- **Word log**: clue phase has a per-student text input; counts split on commas/spaces, percentages computed automatically.
- **Metrics panel**: shown during discussion in a crypto-shuffled order, reshuffled each round, never sorted by output.
- **Voting**: card per player with −/+ counters and a live total; teacher panel at the bottom with Clear votes and Close voting (re-openable).
- **Reveal**: locking voting shows the final distribution chart and the accused; "Open the hatch" runs sliding hazard shutters plus a siren pulse and a stamped-in verdict.

Word packs are still the old graded lists — tell me your topics and I'll swap them.

## User

Found issues — fixing…

## Assistant

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Discussion phase fixed — badge, timer plate, paragraph and buttons now stack flush left in a column with consistent gaps. (The lint note is about the old backup file, not this one.)

## User

Add a button to mix main topic before starting the game, because it could be repetitive the same word every time I open a new match

## Assistant

I'll tag the existing words with topics and add a topic row plus a "Mix it up" button, and persist used words so a fresh session doesn't repeat.

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now the renderVals entries and the setup row.

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Added a **Main topic** row on setup with a **Mix the topic** button (orange), which picks a different topic at random each press. Topics: All, Food, Animals, Places, Weather, Travel, Work, Feelings — every word pack is now tagged, 14 words per level (2 per topic), so the header shows level · topic and the hopper count.

Also fixed the repetition itself: played words are now remembered in the browser, so opening a new match no longer starts from the same pool. "Clear scores" also clears that memory.

## User

Found issues — fixing…

## Assistant

Expanding the packs to 4 words per topic per level (28 per level) and surfacing a recycle notice.

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now the recycle notice.

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Word packs expanded to 4 words per topic per level — 28 per level, 140 total, so picking a single topic gives you 4 fresh words at that level (28 with "All", 140 on Mixed) instead of 2.

The hopper label now also shows how many are still unplayed, turns yellow at 3 or fewer, and says "all played — the next job recycles this topic" when the pool is about to reset.

## User

create a randomizer when typing the words so it's fair to choose who provides words first, also in the voting screen, allow typing students name of course to randomize them

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now the two screens.

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Log sheet now runs in a randomly drawn speaking order (crypto-shuffled each round), with ordinal badges, the first speaker highlighted and named above the sheet, and a **Draw order** button to re-draw it.

On the voting screen each player's name is now an editable field — type corrections live during the vote — and the teacher panel has a **Shuffle names** button that reorders the vote cards so card position doesn't hint at anything.

## User

when I click, don't skip to next screen

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Cause was the keyboard shortcut: Space/Enter on a focused button fired the click *and* the global advance, so one click jumped two screens. Now only → advances, and it's ignored while any button or input has focus.

## User

allow seeing the chosen words in the voting screen

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

The voting screen now shows a "Words on the record" panel listing every student with the words you logged, in the same shuffled name order as the vote cards, so the class can review clues while voting.

Note: you've hit 91% of your usage quota — this is a good stopping point. Also, the Nocturne design system got attached to this project, which conflicts with the industrial styling you asked for; I kept the industrial look. Tell me if you'd rather I restyle to Nocturne.

## User

depending on the words chosen, in the percentage tab, create non-impostor probabilities (the impostor could mention related words so that's the trap and the idea of the game) according to the chosen words then provide more % to those who approach more to the real word, and add more categories (4 more)

## Assistant

Adding proximity scoring and four more categories.

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

## Assistant

Adding words for the four new topics to every level.

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

The percentage panel is now a proximity reading instead of a word count. Each student's clues are scored against the round's real word — exact or partial match, words from the hint, words in the topic's associated field, then a character-similarity fallback — best clue dominates, extra clues add a little. Percentages are that score as a share of the class total, so students whose clues sit nearer the real word read higher, with close / warm / distant bands and matching bar colours.

The panel keeps its scrambled order and a note that a high reading only means the clue was close — the impostor can land close by guessing the field, which is the trap.

Four new topics added (Sports, Technology, Home, School), 4 words each per level: 44 words per level, 220 total.

