import type { KanjiWord } from '../data/kanji';

export type CardState = {
  kanji: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReview: number;
  lastReview: number;
};

export type KanjiSM2Store = Record<string, CardState>;

const SM2_KEY = 'jplift_kanji_sm2';

export function getKanjiSM2Store(): KanjiSM2Store {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(SM2_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveKanjiSM2Store(store: KanjiSM2Store): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SM2_KEY, JSON.stringify(store));
}

export function applyGrade(
  store: KanjiSM2Store,
  kanji: string,
  quality: number
): KanjiSM2Store {
  const now = Date.now();
  const card = store[kanji] ?? {
    kanji,
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    nextReview: now,
    lastReview: now,
  };

  let { interval, easeFactor, repetitions } = card;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  return {
    ...store,
    [kanji]: {
      kanji,
      interval,
      easeFactor,
      repetitions,
      nextReview: now + interval * 86_400_000,
      lastReview: now,
    },
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildSessionDeck(
  cards: KanjiWord[],
  store: KanjiSM2Store
): KanjiWord[] {
  const now = Date.now();
  const unseen: KanjiWord[] = [];
  const due: KanjiWord[] = [];
  const notDue: KanjiWord[] = [];

  for (const card of cards) {
    const state = store[card.kanji];
    if (!state) unseen.push(card);
    else if (state.nextReview <= now) due.push(card);
    else notDue.push(card);
  }

  due.sort((a, b) => store[a.kanji].nextReview - store[b.kanji].nextReview);
  notDue.sort((a, b) => store[a.kanji].easeFactor - store[b.kanji].easeFactor);

  return [...shuffle(unseen), ...shuffle(due), ...notDue];
}

export function getKanjiGroups(cards: KanjiWord[]): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const card of cards) {
    const ch = card.hiragana[0];
    if (!seen.has(ch)) {
      seen.add(ch);
      order.push(ch);
    }
  }
  return order;
}

export function getCardsByGroup(cards: KanjiWord[], group: string): KanjiWord[] {
  return cards.filter((c) => c.hiragana[0] === group);
}

export function getSeenCount(
  group: string,
  cards: KanjiWord[],
  store: KanjiSM2Store
): number {
  return cards.filter((c) => c.hiragana[0] === group && store[c.kanji]).length;
}
