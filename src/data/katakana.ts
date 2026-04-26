import type { Character } from './hiragana';

export const katakana: Character[] = [
  // AIUEO row
  { char: 'ア', romaji: 'a', group: 'aiueo', type: 'normal' },
  { char: 'イ', romaji: 'i', group: 'aiueo', type: 'normal' },
  { char: 'ウ', romaji: 'u', group: 'aiueo', type: 'normal' },
  { char: 'エ', romaji: 'e', group: 'aiueo', type: 'normal' },
  { char: 'オ', romaji: 'o', group: 'aiueo', type: 'normal' },

  // Ka row
  { char: 'カ', romaji: 'ka', group: 'ka', type: 'normal' },
  { char: 'キ', romaji: 'ki', group: 'ka', type: 'normal' },
  { char: 'ク', romaji: 'ku', group: 'ka', type: 'normal' },
  { char: 'ケ', romaji: 'ke', group: 'ka', type: 'normal' },
  { char: 'コ', romaji: 'ko', group: 'ka', type: 'normal' },

  // Sa row
  { char: 'サ', romaji: 'sa', group: 'sa', type: 'normal' },
  { char: 'シ', romaji: 'shi', group: 'sa', type: 'normal' },
  { char: 'ス', romaji: 'su', group: 'sa', type: 'normal' },
  { char: 'セ', romaji: 'se', group: 'sa', type: 'normal' },
  { char: 'ソ', romaji: 'so', group: 'sa', type: 'normal' },

  // Ta row
  { char: 'タ', romaji: 'ta', group: 'ta', type: 'normal' },
  { char: 'チ', romaji: 'chi', group: 'ta', type: 'normal' },
  { char: 'ツ', romaji: 'tsu', group: 'ta', type: 'normal' },
  { char: 'テ', romaji: 'te', group: 'ta', type: 'normal' },
  { char: 'ト', romaji: 'to', group: 'ta', type: 'normal' },

  // Na row
  { char: 'ナ', romaji: 'na', group: 'na', type: 'normal' },
  { char: 'ニ', romaji: 'ni', group: 'na', type: 'normal' },
  { char: 'ヌ', romaji: 'nu', group: 'na', type: 'normal' },
  { char: 'ネ', romaji: 'ne', group: 'na', type: 'normal' },
  { char: 'ノ', romaji: 'no', group: 'na', type: 'normal' },

  // Ha row
  { char: 'ハ', romaji: 'ha', group: 'ha', type: 'normal' },
  { char: 'ヒ', romaji: 'hi', group: 'ha', type: 'normal' },
  { char: 'フ', romaji: 'fu', group: 'ha', type: 'normal' },
  { char: 'ヘ', romaji: 'he', group: 'ha', type: 'normal' },
  { char: 'ホ', romaji: 'ho', group: 'ha', type: 'normal' },

  // Ma row
  { char: 'マ', romaji: 'ma', group: 'ma', type: 'normal' },
  { char: 'ミ', romaji: 'mi', group: 'ma', type: 'normal' },
  { char: 'ム', romaji: 'mu', group: 'ma', type: 'normal' },
  { char: 'メ', romaji: 'me', group: 'ma', type: 'normal' },
  { char: 'モ', romaji: 'mo', group: 'ma', type: 'normal' },

  // Ya row
  { char: 'ヤ', romaji: 'ya', group: 'ya', type: 'normal' },
  { char: 'ユ', romaji: 'yu', group: 'ya', type: 'normal' },
  { char: 'ヨ', romaji: 'yo', group: 'ya', type: 'normal' },

  // Ra row
  { char: 'ラ', romaji: 'ra', group: 'ra', type: 'normal' },
  { char: 'リ', romaji: 'ri', group: 'ra', type: 'normal' },
  { char: 'ル', romaji: 'ru', group: 'ra', type: 'normal' },
  { char: 'レ', romaji: 're', group: 'ra', type: 'normal' },
  { char: 'ロ', romaji: 'ro', group: 'ra', type: 'normal' },

  // Wa row
  { char: 'ワ', romaji: 'wa', group: 'wa', type: 'normal' },
  { char: 'ヲ', romaji: 'wo', group: 'wa', type: 'normal' },
  { char: 'ン', romaji: 'n', group: 'wa', type: 'normal' },

  // Handakuon (p-row)
  { char: 'パ', romaji: 'pa', group: 'handakuon', type: 'handakuon' },
  { char: 'ピ', romaji: 'pi', group: 'handakuon', type: 'handakuon' },
  { char: 'プ', romaji: 'pu', group: 'handakuon', type: 'handakuon' },
  { char: 'ペ', romaji: 'pe', group: 'handakuon', type: 'handakuon' },
  { char: 'ポ', romaji: 'po', group: 'handakuon', type: 'handakuon' },

  // Dakuon (g-row)
  { char: 'ガ', romaji: 'ga', group: 'dakuon', type: 'dakuon' },
  { char: 'ギ', romaji: 'gi', group: 'dakuon', type: 'dakuon' },
  { char: 'グ', romaji: 'gu', group: 'dakuon', type: 'dakuon' },
  { char: 'ゲ', romaji: 'ge', group: 'dakuon', type: 'dakuon' },
  { char: 'ゴ', romaji: 'go', group: 'dakuon', type: 'dakuon' },

  // Small Tsu
  { char: 'ッ', romaji: 'xtu', group: 'small-tsu', type: 'small-tsu' },

  // Long Vowels
  { char: 'アー', romaji: 'aa', group: 'long-vowel', type: 'long-vowel' },
  { char: 'イー', romaji: 'ii', group: 'long-vowel', type: 'long-vowel' },
  { char: 'ウー', romaji: 'uu', group: 'long-vowel', type: 'long-vowel' },
  { char: 'エー', romaji: 'ee', group: 'long-vowel', type: 'long-vowel' },
  { char: 'オー', romaji: 'oo', group: 'long-vowel', type: 'long-vowel' },
];

export const katakanaGroups = [
  'aiueo',
  'ka',
  'sa',
  'ta',
  'na',
  'ha',
  'ma',
  'ya',
  'ra',
  'wa',
  'handakuon',
  'dakuon',
  'small-tsu',
  'long-vowel',
] as const;

export type KatakanaGroup = (typeof katakanaGroups)[number];