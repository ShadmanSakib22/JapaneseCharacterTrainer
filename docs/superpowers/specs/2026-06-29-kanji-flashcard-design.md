# Kanji Flashcard Feature — Design Spec
**Date:** 2026-06-29  
**Status:** Approved

---

## Overview

Add an Anki-style kanji flashcard mode to KANA QUEST using SM-2 spaced repetition. Cards are selected by letter group or random deck size, studied one at a time with flip-to-reveal, and graded Easy / Medium / Hard / Forgot. SM-2 state persists in localStorage. Auth and a real DB are deferred — the storage layer is isolated so migration to Convex later is a one-afternoon job.

---

## Architecture & Routing

```
/practice                  ← main mode selector (unlock KANJI card)
  └─ /practice/select?mode=kanji  ← kanji selection screen (branched from existing select page)
       └─ /kanji/play      ← flashcard session
```

**Card passing:** Selected `KanjiWord[]` is written to the existing Zustand store (extending `src/lib/store.ts`) before navigating to `/kanji/play`. No URL payload — avoids mobile browser URL length limits. If the store is empty on arrival at `/kanji/play`, redirect back to `/practice/select?mode=kanji`.

**Back navigation:** `/kanji/play` → `/practice/select?mode=kanji` → `/practice`

---

## Data Model

### KanjiWord (existing)
```ts
interface KanjiWord {
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning: string;
}
```

### SM-2 Card State
```ts
type CardState = {
  kanji: string;
  interval: number;      // days until next review
  easeFactor: number;    // starts at 2.5
  repetitions: number;   // consecutive correct reviews
  nextReview: number;    // timestamp (ms)
  lastReview: number;    // timestamp (ms)
};

type KanjiSM2Store = Record<string, CardState>;
```

**localStorage key:** `jplift_kanji_sm2`

### Grade → SM-2 Quality Mapping
| User Grade | SM-2 Quality |
|------------|-------------|
| Forgot     | 0           |
| Hard       | 2           |
| Medium     | 3           |
| Easy       | 5           |

### SM-2 Algorithm
Standard SM-2:
- If quality < 3: reset repetitions=0, interval=1
- Else: interval = previous_interval × EF (or 1 → 6 → EF-scaled)
- EF = EF + (0.1 - (5 - quality) × (0.08 + (5 - quality) × 0.02)), min 1.3
- nextReview = now + interval × 86400000ms

### Session Ordering
Cards sorted: **unseen first → lowest nextReview → highest interval last.** Ensures new and struggling cards always surface early in a session.

### Storage API (isolated layer)
```ts
// src/lib/kanjiStorage.ts
getKanjiSM2Store(): KanjiSM2Store
saveKanjiSM2Store(store: KanjiSM2Store): void
applyGrade(store: KanjiSM2Store, kanji: string, quality: number): KanjiSM2Store
buildSessionDeck(cards: KanjiWord[], store: KanjiSM2Store): KanjiWord[]
```
Swapping localStorage for Convex later only requires changing these four functions.

---

## Kanji Selection Screen (`/practice/select?mode=kanji`)

### Letter Group Picker
- Grid of toggle buttons, one per hiragana initial (あ, い, う, え, お, か…)
- Each button shows: the kana label + kanji count in that group (e.g. `あ 34`)
- Small dim text below each: `12/34 seen` (SM-2 coverage progress)
- Toggle on/off; active state uses `pixel-border-gold` + gold glow
- "SELECT ALL" shortcut button at top

### Random Deck Panel
- Separate section below letter groups
- Preset sizes: **25 / 50 / 100 / 200**
- Mutually exclusive with letter group selection — picking a size clears group selection and vice versa
- Random mode uses SM-2 priority ordering (not truly random): unseen + worst-known first

### Start Button
- Shows card count: `▶ START 47 CARDS` using `btn-game btn-game-gold`
- Disabled (greyed) if nothing selected
- On click: writes selected `KanjiWord[]` to Zustand store, pushes to `/kanji/play`

### Visual Style
Full retro-arcade style: `game-panel` wrapper, `font-pixel` section headers, `btn-game` buttons, gold/cyan glow on selection, scanline overlay inherited from body.

---

## Flashcard Session (`/kanji/play`)

### HUD (top bar)
- `game-panel` bar matching existing play page header
- Left: `◀ SELECT` back button
- Center: progress bar + `3 / 47` card counter
- Right: session grade tally (small colored dots or counts: 🟢E 🔵M 🟡H 🔴F)

### Card — Front
- Large centered kanji (`font-vt` or large pixel font, ~6-8rem), glow-cyan
- `game-panel` card with `pixel-border`
- Bottom: `▼ TAP TO REVEAL ▼` in dim `font-pixel` text, pulsing

### Card — Back (after flip)
- 3D CSS flip animation (rotateY 180°)
- Top: kanji smaller (~2rem), dim
- Center: **meaning** large (`font-vt`, ~2rem, `--text-primary`)
- Below: hiragana (`font-vt`, gold glow)
- Below: romaji (`font-vt`, dim)
- Card border changes to `pixel-border-gold` on reveal

### Grading Buttons (appear after flip only)
```
[FORGOT]   [HARD]   [MEDIUM]   [EASY]
  red      magenta    cyan      green
```
All use `btn-game` base. Colors:
- FORGOT: `--accent-red`
- HARD: `--accent-magenta`
- MEDIUM: `--accent-cyan`
- EASY: `--accent-green`

On grade: run SM-2, save to localStorage, advance to next card.

### Session Complete Screen
- `font-pixel` header: `▓ SESSION COMPLETE ▓` with gold glow
- Summary stats: total cards seen, breakdown by grade (colored counts)
- Two buttons:
  - `↺ RETRY WEAK CARDS` (magenta) — re-queues only Forgot + Hard cards
  - `◀ BACK TO SELECT` (default btn-game)

---

## Zustand Store Extension (`src/lib/store.ts`)
Add to existing store:
```ts
kanjiDeck: KanjiWord[];          // selected cards for current session
setKanjiDeck: (deck: KanjiWord[]) => void;
clearKanjiDeck: () => void;
```

---

## Files to Create / Modify

| File | Action |
|------|--------|
| `src/lib/kanjiStorage.ts` | Create — SM-2 logic + localStorage API |
| `src/lib/store.ts` | Modify — add kanjiDeck state |
| `src/app/practice/select/page.tsx` | Modify — add kanji branch for mode=kanji |
| `src/app/kanji/play/page.tsx` | Create — flashcard session |
| `src/app/practice/page.tsx` | Modify — unlock KANJI mode card |

---

## Out of Scope (deferred)
- Auth / user accounts
- Convex DB (swap-in later via `kanjiStorage.ts`)
- Daily review limits / new card drip-feed
- Audio pronunciation
- Stroke order diagrams
