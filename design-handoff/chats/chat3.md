# Navigation improvements

_Started 2026-09-10 23:08 UTC_

---

## User

Continuing from "Industrial cartoon game redesign".

## Assistant

We're building an industrial-styled Impostor game for English learning (A1–C1). The flow is: setup picks level and topic → clue round with word logging and randomized speaking order → discussion with proximity-scored word metrics → voting with shuffled player names → impostor reveal with animated hatch.

Core features now live:
- Crypto-random impostor selection with history exclusion (no back-to-back repeats).
- Per-student word logging during clues; teacher can edit student names live.
- Proximity scoring: each clue measured against the real word (exact match, partial, hint words, topic field, character similarity). Percentages reflect how close each student's best clue sits to the target, with warm/close/distant bands. Scoring is shuffled in display order so the metrics don't signal the impostor directly.
- Voting interface with name edit fields and shuffle button; vote totals live-update.
- Reveal sequence: vote distribution chart → sliding hazard shutters + siren + stamped verdict.
- Word hopper: tagged by 12 topics (Food, Animals, Places, Weather, Travel, Work, Feelings, Sports, Technology, Home, School, All), 4 words per topic per level, 220 total. "Mix the topic" button randomizes mid-setup. Played words are remembered; recycled topic shows a notice when pool exhausts.
- Speaking order randomized per round with draw button; voting card order shuffled.
- Voting screen shows "Words on the record" — logged clues paired with shuffled student names for class reference during discussion.
- Keyboard: → only advances screens; Space/Enter ignored if button/input focused.

All styling is industrial (hazard yellow, rust, steel, black outlines, rivets, hard shadows, Archivo Black/Space Mono).

Ready to test or adjust scoring weights / topic content.

Files: Impostor.dc.html.

## User

add back button to go back to previous menus, as well, avoid the missing click and going forward

## Assistant

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

Now the edits.

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now expose the values and add the header button.

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Added a **← Back** button in the header (dimmed when there's nothing to go back to) plus the ← key. It restores the full previous step — card-deal position, logged words, votes, timer, even the used-word list — so stepping back never loses state or burns a word.

Forward moves now ignore a second trigger within 450ms, so a stray double-click can't skip a step.

## User

allow a mode for spanish version, so I decide if I play spanish or english

## Assistant

_[tool: read_file]_

_[tool: read_file]_

_[tool: run_script]_

_[tool: run_script]_

Now inserting the Spanish data at the placeholder.

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

I added a **Language** switch (English / Español) at the top of the setup screen. It stays set between sessions.

In Spanish mode:
- **Words:** there's a separate Spanish word list with the same 220 entries (A1–C1, 11 topics). Each entry has a word, a decoy and a hint.
- **Screens:** every screen and label is in Spanish, and the header shows the language next to the level (e.g. "ES · B1").
- **Scoring:** the closeness scores check clues against the Spanish list. Accents don't matter, so "frio" matches "frío".

Pick the language before you deal the cards. If you switch during a round, the screens change language but that round's word doesn't. The Spanish word list uses Spain Spanish (ordenador, móvil); tell me if you'd prefer Latin American words.

