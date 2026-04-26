export interface Character {
  char: string;
  romaji: string;
  group: string;
  type: 'normal' | 'handakuon' | 'dakuon' | 'small-tsu' | 'long-vowel';
}

export const hiragana: Character[] = [
  // AIUEO row
  { char: 'あ', romaji: 'a', group: 'aiueo', type: 'normal' },
  { char: 'い', romaji: 'i', group: 'aiueo', type: 'normal' },
  { char: 'う', romaji: 'u', group: 'aiueo', type: 'normal' },
  { char: 'え', romaji: 'e', group: 'aiueo', type: 'normal' },
  { char: 'お', romaji: 'o', group: 'aiueo', type: 'normal' },

  // Ka row
  { char: 'か', romaji: 'ka', group: 'ka', type: 'normal' },
  { char: 'き', romaji: 'ki', group: 'ka', type: 'normal' },
  { char: 'く', romaji: 'ku', group: 'ka', type: 'normal' },
  { char: 'け', romaji: 'ke', group: 'ka', type: 'normal' },
  { char: 'こ', romaji: 'ko', group: 'ka', type: 'normal' },

  // Sa row
  { char: 'さ', romaji: 'sa', group: 'sa', type: 'normal' },
  { char: 'し', romaji: 'shi', group: 'sa', type: 'normal' },
  { char: 'す', romaji: 'su', group: 'sa', type: 'normal' },
  { char: 'せ', romaji: 'se', group: 'sa', type: 'normal' },
  { char: 'そ', romaji: 'so', group: 'sa', type: 'normal' },

  // Ta row
  { char: 'た', romaji: 'ta', group: 'ta', type: 'normal' },
  { char: 'ち', romaji: 'chi', group: 'ta', type: 'normal' },
  { char: 'つ', romaji: 'tsu', group: 'ta', type: 'normal' },
  { char: 'て', romaji: 'te', group: 'ta', type: 'normal' },
  { char: 'と', romaji: 'to', group: 'ta', type: 'normal' },

  // Na row
  { char: 'な', romaji: 'na', group: 'na', type: 'normal' },
  { char: 'に', romaji: 'ni', group: 'na', type: 'normal' },
  { char: 'ぬ', romaji: 'nu', group: 'na', type: 'normal' },
  { char: 'ね', romaji: 'ne', group: 'na', type: 'normal' },
  { char: 'の', romaji: 'no', group: 'na', type: 'normal' },

  // Ha row
  { char: 'は', romaji: 'ha', group: 'ha', type: 'normal' },
  { char: 'ひ', romaji: 'hi', group: 'ha', type: 'normal' },
  { char: 'ふ', romaji: 'fu', group: 'ha', type: 'normal' },
  { char: 'へ', romaji: 'he', group: 'ha', type: 'normal' },
  { char: 'ほ', romaji: 'ho', group: 'ha', type: 'normal' },

  // Ma row
  { char: 'ま', romaji: 'ma', group: 'ma', type: 'normal' },
  { char: 'み', romaji: 'mi', group: 'ma', type: 'normal' },
  { char: 'む', romaji: 'mu', group: 'ma', type: 'normal' },
  { char: 'め', romaji: 'me', group: 'ma', type: 'normal' },
  { char: 'も', romaji: 'mo', group: 'ma', type: 'normal' },

  // Ya row
  { char: 'や', romaji: 'ya', group: 'ya', type: 'normal' },
  { char: 'ゆ', romaji: 'yu', group: 'ya', type: 'normal' },
  { char: 'よ', romaji: 'yo', group: 'ya', type: 'normal' },

  // Ra row
  { char: 'ら', romaji: 'ra', group: 'ra', type: 'normal' },
  { char: 'り', romaji: 'ri', group: 'ra', type: 'normal' },
  { char: 'る', romaji: 'ru', group: 'ra', type: 'normal' },
  { char: 'れ', romaji: 're', group: 'ra', type: 'normal' },
  { char: 'ろ', romaji: 'ro', group: 'ra', type: 'normal' },

  // Wa row
  { char: 'わ', romaji: 'wa', group: 'wa', type: 'normal' },
  { char: 'を', romaji: 'wo', group: 'wa', type: 'normal' },
  { char: 'ん', romaji: 'n', group: 'wa', type: 'normal' },

  // Handakuon (p-row)
  { char: 'ぱ', romaji: 'pa', group: 'handakuon', type: 'handakuon' },
  { char: 'ぴ', romaji: 'pi', group: 'handakuon', type: 'handakuon' },
  { char: 'ぷ', romaji: 'pu', group: 'handakuon', type: 'handakuon' },
  { char: 'ぺ', romaji: 'pe', group: 'handakuon', type: 'handakuon' },
  { char: 'ぽ', romaji: 'po', group: 'handakuon', type: 'handakuon' },

  // Dakuon (g-row)
  { char: 'が', romaji: 'ga', group: 'dakuon', type: 'dakuon' },
  { char: 'ぎ', romaji: 'gi', group: 'dakuon', type: 'dakuon' },
  { char: 'ぐ', romaji: 'gu', group: 'dakuon', type: 'dakuon' },
  { char: 'げ', romaji: 'ge', group: 'dakuon', type: 'dakuon' },
  { char: 'ご', romaji: 'go', group: 'dakuon', type: 'dakuon' },

  // Small Tsu
  { char: 'っ', romaji: 'xtu', group: 'small-tsu', type: 'small-tsu' },

  // Long Vowels
  { char: 'あー', romaji: 'aa', group: 'long-vowel', type: 'long-vowel' },
  { char: 'いー', romaji: 'ii', group: 'long-vowel', type: 'long-vowel' },
  { char: 'うー', romaji: 'uu', group: 'long-vowel', type: 'long-vowel' },
  { char: 'えー', romaji: 'ee', group: 'long-vowel', type: 'long-vowel' },
  { char: 'おー', romaji: 'oo', group: 'long-vowel', type: 'long-vowel' },
];

export const hiraganaGroups = [
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

export type HiraganaGroup = (typeof hiraganaGroups)[number];