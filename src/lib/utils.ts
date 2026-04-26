import { Character } from '../data/hiragana';

export function normalizeRomaji(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '');
}

export function isCorrectAnswer(input: string, correct: string): boolean {
  const normalized = normalizeRomaji(input);
  const expected = normalizeRomaji(correct);

  if (normalized === expected) return true;

  const alternativeMap: Record<string, string[]> = {
    'shi': ['shi', 'si'],
    'chi': ['chi', 'ti'],
    'tsu': ['tsu', 'tu'],
    'fu': ['fu', 'hu'],
    'wo': ['wo', 'o'],
    'n': ['n', "n'"],
    'xtu': ['xtu', 'ltu', 'っ'],
  };

  const alternatives = alternativeMap[expected.toLowerCase()];
  if (alternatives && alternatives.includes(normalized)) {
    return true;
  }

  return false;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getGroupDisplayName(group: string, script: 'hiragana' | 'katakana' | 'mixed' = 'hiragana'): string {
  const hiraganaSample: Record<string, string> = {
    'aiueo': 'あ',
    'ka': 'か',
    'sa': 'さ',
    'ta': 'た',
    'na': 'な',
    'ha': 'は',
    'ma': 'ま',
    'ya': 'や',
    'ra': 'ら',
    'wa': 'わ',
    'handakuon': 'ぱ',
    'dakuon': 'が',
    'small-tsu': 'っ',
    'long-vowel': 'ー',
  };
  
  const katakanaSample: Record<string, string> = {
    'aiueo': 'ア',
    'ka': 'カ',
    'sa': 'サ',
    'ta': 'タ',
    'na': 'ナ',
    'ha': 'ハ',
    'ma': 'マ',
    'ya': 'ヤ',
    'ra': 'ラ',
    'wa': 'ワ',
    'handakuon': 'パ',
    'dakuon': 'ガ',
    'small-tsu': 'ッ',
    'long-vowel': 'ー',
  };

  let sample: string;
  if (script === 'mixed') {
    sample = `${hiraganaSample[group] || '?'}${katakanaSample[group] || '?'}`;
  } else {
    sample = script === 'katakana' ? (katakanaSample[group] || '?') : (hiraganaSample[group] || '?');
  }
  
  const displayNames: Record<string, string> = {
    'aiueo': `AIUEO (${sample})`,
    'ka': `Ka (${sample})`,
    'sa': `Sa (${sample})`,
    'ta': `Ta (${sample})`,
    'na': `Na (${sample})`,
    'ha': `Ha (${sample})`,
    'ma': `Ma (${sample})`,
    'ya': `Ya (${sample})`,
    'ra': `Ra (${sample})`,
    'wa': `Wa (${sample})`,
    'handakuon': `Handakuon (${sample})`,
    'dakuon': `Dakuon (${sample})`,
    'small-tsu': `Small Tsu (${sample})`,
    'long-vowel': `Long Vowels (${sample})`,
  };
  return displayNames[group] || group;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function calculateExpectedTime(characterCount: number): number {
  const baseTime = 3;
  const perCharacter = 3;
  return baseTime + characterCount * perCharacter;
}