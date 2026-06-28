export interface KanjiWord {
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning: string;
}

import { kanjiP1 } from './kanji-p1';
import { kanjiP2 } from './kanji-p2';
import { kanjiP3 } from './kanji-p3';
import { kanjiP4 } from './kanji-p4';
import { kanjiP5 } from './kanji-p5';
import { kanjiP6 } from './kanji-p6';
import { kanjiP7 } from './kanji-p7';
import { kanjiP8 } from './kanji-p8';

export const kanji: KanjiWord[] = [
  ...kanjiP1,
  ...kanjiP2,
  ...kanjiP3,
  ...kanjiP4,
  ...kanjiP5,
  ...kanjiP6,
  ...kanjiP7,
  ...kanjiP8,
];

// Export individual page arrays for selective loading if needed
export { kanjiP1, kanjiP2, kanjiP3, kanjiP4, kanjiP5, kanjiP6, kanjiP7, kanjiP8 };
