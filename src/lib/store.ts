import { create } from 'zustand';

interface PracticeState {
  retriesThisSession: number;
  isReshuffling: boolean;
  incrementRetries: () => void;
  triggerReshuffle: () => void;
  clearReshuffle: () => void;
  resetStore: () => void;
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
}));