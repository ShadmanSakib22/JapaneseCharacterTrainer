import { create } from 'zustand';
import type { KanjiWord } from '../data/kanji';

interface PracticeState {
  retriesThisSession: number;
  isReshuffling: boolean;
  incrementRetries: () => void;
  triggerReshuffle: () => void;
  clearReshuffle: () => void;
  resetStore: () => void;
  kanjiDeck: KanjiWord[];
  setKanjiDeck: (deck: KanjiWord[]) => void;
  clearKanjiDeck: () => void;
}

export const usePracticeStore = create<PracticeState>((set) => ({
  retriesThisSession: 0,
  isReshuffling: false,
  incrementRetries: () =>
    set((state) => ({ retriesThisSession: state.retriesThisSession + 1 })),
  triggerReshuffle: () => set({ isReshuffling: true }),
  clearReshuffle: () => set({ isReshuffling: false }),
  resetStore: () =>
    set({
      retriesThisSession: 0,
      isReshuffling: false,
    }),
  kanjiDeck: [],
  setKanjiDeck: (deck) => set({ kanjiDeck: deck }),
  clearKanjiDeck: () => set({ kanjiDeck: [] }),
}));