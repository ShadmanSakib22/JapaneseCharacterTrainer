import type { CardState, KanjiSM2Store } from "./kanjiStorage";

type RemoteCard = CardState;

export function mergeSyncProgress(
  remoteCards: RemoteCard[],
  localStore: KanjiSM2Store
): { merged: KanjiSM2Store; toUpload: CardState[] } {
  const merged: KanjiSM2Store = { ...localStore };
  const toUpload: CardState[] = [];

  // Merge remote records into local — remote wins if it has higher progress
  for (const remote of remoteCards) {
    const local = merged[remote.kanji];
    if (!local) {
      merged[remote.kanji] = remote;
    } else {
      const remoteWins =
        remote.repetitions > local.repetitions ||
        (remote.repetitions === local.repetitions &&
          remote.lastReview > local.lastReview);
      if (remoteWins) {
        merged[remote.kanji] = remote;
      }
    }
  }

  // Determine which local records need uploading (anything not in remote, or local won)
  const remoteMap = new Map(remoteCards.map((r) => [r.kanji, r]));
  for (const [kanji, local] of Object.entries(merged)) {
    const remote = remoteMap.get(kanji);
    if (!remote) {
      toUpload.push(local);
    } else {
      const localWins =
        local.repetitions > remote.repetitions ||
        (local.repetitions === remote.repetitions &&
          local.lastReview >= remote.lastReview);
      if (localWins) {
        toUpload.push(local);
      }
    }
  }

  return { merged, toUpload };
}

// Exported for typing and testing
export type SyncResult = "ok" | "unauthenticated" | "error";
