import type { CardState, KanjiSM2Store } from "./kanjiStorage";

type RemoteCard = CardState;

export function mergeSyncProgress(
  remoteCards: RemoteCard[],
  localStore: KanjiSM2Store
): { merged: KanjiSM2Store; toUpload: CardState[] } {
  const merged: KanjiSM2Store = { ...localStore };
  const toUpload: CardState[] = [];
  const remoteMap = new Map(remoteCards.map((r) => [r.kanji, r]));

  for (const remote of remoteCards) {
    const local = localStore[remote.kanji];
    if (!local) {
      merged[remote.kanji] = remote;
    } else {
      const remoteWins =
        remote.repetitions > local.repetitions ||
        (remote.repetitions === local.repetitions && remote.lastReview > local.lastReview);
      if (remoteWins) {
        merged[remote.kanji] = remote;
      } else {
        toUpload.push(local);
      }
    }
  }

  for (const [kanji, local] of Object.entries(localStore)) {
    if (!remoteMap.has(kanji)) {
      toUpload.push(local);
    }
  }

  return { merged, toUpload };
}
