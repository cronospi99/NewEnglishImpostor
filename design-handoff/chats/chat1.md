# Impostor word game for English

_Started 2026-08-20 21:21 UTC_

---

## User

Create a game about Impostor, like the classic impostor using clues and key words for English classes

## Assistant



## Assistant

_[tool: ask_user]_

Waiting on your answers — the classroom setup question especially, since it determines whether I build a secret pass-the-phone flow or a projector view.

## User

Answered — learners: Mixed / any age; level: A1 beginner, A2 elementary, B1 intermediate, B2 upper-int, C1 advanced; setup: One teacher device on a projector, students speak out loud; secret: A related decoy word, A vague hint; language_focus: Topic vocabulary, Adjectives & description; topics: decide for me, mixed vocabulary; teacher_tools: Round timer, Player count & names, Voting screen, Score tracking across rounds; scaffolding: Minimal — just the word, keep it fast; design_system: Picked a design system (now attached)

## Assistant

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

Building it as a projector game with a per-player secret reveal (numbered "eyes closed" deal), using the Nocturne dark system.

_[tool: dc_write]_

_[tool: ready_for_verification]_

Built as a projector game with a numbered "eyes closed" deal — the screen shows one card at a time, you call the number, everyone else looks away. Then clue round → discussion → vote → reveal, with scores carried across rounds.

Two things worth knowing: word packs are graded A1–C1 (8 words each, mixed topics) plus a Mixed setting, and Space or → advances every phase so you don't have to be at the keyboard. Tell me the topics you actually teach and I'll swap the packs.

## User

Change the graphic style for a Harry Potter-like one or Sherlock Holmes inspired one

## Assistant

Harry Potter is a protected brand, so I'll go the Sherlock route — a gaslight/case-file look — keeping Nocturne's bones (dark ground, outlined actions, flush-left, fading rules) but shifting palette and type.

_[tool: copy_files]_

_[tool: dc_write]_

_[tool: ready_for_verification]_

Restyled as a gaslight case-file look: sepia-ink ground, brass accent, Libre Baskerville headings over Spectral, typewriter mono for labels, sharper 3px corners, and a masthead double rule. The impostor card now reads in oxblood instead of the brass. Rounds are labelled "Case No." Game logic is untouched; the old Nocturne version is saved as `Impostor v1 Nocturne.dc.html`.

I skipped Harry Potter — that's a protected brand, so I can't reproduce its visual identity. If you want that direction, I can do a generic candlelit-spellbook variant (deep green/gold, blackletter-ish display) instead.

## User

Found issues — fixing…

## Assistant

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Fixed: buttons now keep labels on one line with a real line-height, and every button row is content-sized (`align-items:center`) instead of stretch-pinned.

## User

Found issues — fixing…

## Assistant

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Setup no longer overflows: option rows wrap, the grid columns can shrink (`minmax(0,1fr)`, 48px gap), and the two-up sub-rows collapse to one column when narrow.

