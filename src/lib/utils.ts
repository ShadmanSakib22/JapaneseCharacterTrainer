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

export function getGroupDisplayName(group: string): string {
  const displayNames: Record<string, string> = {
    'aiueo': 'AIUEO (あ)',
    'ka': 'Ka (か)',
    'sa': 'Sa (さ)',
    'ta': 'Ta (た)',
    'na': 'Na (な)',
    'ha': 'Ha (は)',
    'ma': 'Ma (ま)',
    'ya': 'Ya (や)',
    'ra': 'Ra (ら)',
    'wa': 'Wa (わ)',
    'handakuon': 'Handakuon (ぱ)',
    'dakuon': 'Dakuon (が)',
    'small-tsu': 'Small Tsu (っ)',
    'long-vowel': 'Long Vowels (ー)',
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