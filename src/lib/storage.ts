import type { Character } from '../data/hiragana';

export type PracticeMode = 'hiragana' | 'katakana' | 'mixed';

export type Session = {
  id: string;
  date: string;
  mode: PracticeMode;
  groups: string[];
  duration: number;
  correct: number;
  wrong: number;
  mistakes: Record<string, number>;
};

export type Stats = {
  totalAttempts: number;
  retriesThisSession: number;
  sessions: Session[];
  characterMistakes: Record<string, number>;
};

const STATS_KEY = 'jplift_stats';

export function getStats(): Stats {
  if (typeof window === 'undefined') {
    return getDefaultStats();
  }
  const stored = localStorage.getItem(STATS_KEY);
  if (!stored) {
    return getDefaultStats();
  }
  try {
    return JSON.parse(stored);
  } catch {
    return getDefaultStats();
  }
}

function getDefaultStats(): Stats {
  return {
    totalAttempts: 0,
    retriesThisSession: 0,
    sessions: [],
    characterMistakes: {},
  };
}

export function saveStats(stats: Stats): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function incrementAttempts(): void {
  const stats = getStats();
  stats.totalAttempts += 1;
  saveStats(stats);
}

export function incrementRetries(): void {
  const stats = getStats();
  stats.retriesThisSession += 1;
  saveStats(stats);
}

export function resetRetries(): void {
  const stats = getStats();
  stats.retriesThisSession = 0;
  saveStats(stats);
}

export function recordSession(session: Session): void {
  const stats = getStats();
  stats.sessions.push(session);
  for (const [char, count] of Object.entries(session.mistakes)) {
    stats.characterMistakes[char] = (stats.characterMistakes[char] || 0) + count;
  }
  saveStats(stats);
}

export function getWeakestGroup(mistakes: Record<string, number>, characters: Character[]): string | null {
  const groupCounts: Record<string, number> = {};
  for (const char of characters) {
    if (mistakes[char.char]) {
      groupCounts[char.group] = (groupCounts[char.group] || 0) + mistakes[char.char];
    }
  }
  let weakest: string | null = null;
  let maxCount = 0;
  for (const [group, count] of Object.entries(groupCounts)) {
    if (count > maxCount) {
      maxCount = count;
      weakest = group;
    }
  }
  return weakest;
}

export function getCharactersNeedingPractice(
  characterMistakes: Record<string, number>,
  threshold: number = 2
): { char: string; count: number }[] {
  return Object.entries(characterMistakes)
    .filter(([, count]) => count >= threshold)
    .map(([char, count]) => ({ char, count }))
    .sort((a, b) => b.count - a.count);
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}