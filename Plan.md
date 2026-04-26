Japanese Character Practice App - Full Plan (Version 1)
Project Overview

- App Name: JPLift - Japanese Character Trainer
- Platform: Next.js 16 with React 19, Tailwind CSS, DaisyUI
- Storage: Browser localStorage for character data and analytics
  Route Structure
  /practice → Mode Selection (landing page)
  /practice/select → Group/Character Selection
  /practice/play → Practice Session (cards + input)
  Character Data Schema
  type Character = {
  char: string; // Japanese character: あ, い, カ, etc.
  romaji: string; // Romaji representation: a, i, ka, etc.
  group: string; // aiueo, ka, sa, ta, na, ha, ma, ya, ra, wa, special
  type: 'normal' | 'handakuon' | 'dakuon' | 'small-tsu' | 'long-vowel';
  }
  Hiragana Characters (46 + 1 + specials):
- Normal: あ-お (aiueo), か-こ (ka), さ-し (sa), た-ち (ta), な-ぬ (na), は-ほ (ha), ま-も (ma), や-よ (ya), ら-ろ (ra), わ-ん (wa)
- Special: ぱ/ぴ/ぷ/ぺ/ぽ (handakuon), が/ぎ/ぐ/げ/ご (dakuon), っ (small tsu), あ/い/う/え/お + ー (long vowels)
  Katakana Characters: Same structure with ア/イ/ウ/エ/オ, etc.
  UI/UX Specification
  Page 1: /practice - Mode Selection
- Two large clickable cards side-by-side
- Each card shows: Large Japanese character sample, mode name (Hiragana/Katakana)
- Selected card highlighted (border/shadow)
- "Next" button enabled when mode selected
- Query param: ?mode=hiragana or ?mode=katakana
  Page 2: /practice/select - Group Selection
- Header shows selected mode with back button
- Multi-checkbox groups in grid layout:
  - Regular groups: AIUEO, Ka, Sa, Ta, Na, Ha, Ma, Ya, Ra, Wa
  - Special checkboxes: Handakuon, Dakuon, Small Tsu, Long Vowels
- "Select All" / "Clear All" buttons
- Character count preview (e.g., "15 characters selected")
- "Start Practice" button → navigates to /practice/play with selected groups encoded
  Page 3: /practice/play - Practice Session
  Components:
- Timer display (top-right): MM:SS format, starts on page mount
- Card grid (responsive 2-4 columns):
  - Each card: Japanese character (large, centered) + input field
  - Input: text, placeholder "type romaji"
  - Auto-focus first input on load
- Submit button (bottom)
- After submission:
  - Correct inputs: Green border/background
  - Incorrect inputs: Red border/background, show correct answer
- "Practice Again" button: Clears inputs, resets timer
- Analytics panel (collapsible or modal)
  Analytics Display:
  ✓ You took 5:30
  → Expected time: ~4:00 (based on 15 characters)
  [Weakest Section]
  ✗ Ha-row: 2 wrong (は, ひ)
  [Characters needing more practice]
  ✗ ひ (hi) - wrong 3 times
  ✗ ふ (fu) - wrong 2 times
  Retries this session: 2
  Total attempts: 47
  localStorage Schema
  type Stats = {
  totalAttempts: number; // Total submissions ever
  retriesThisSession: number; // Clears on new practice start
  sessions: Session[]; // History of all sessions
  characterMistakes: Record
  }
