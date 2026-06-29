"use client";
import { useUser, useClerk } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { getKanjiSM2Store, saveKanjiSM2Store } from "../lib/kanjiStorage";
import { mergeSyncProgress } from "../lib/syncProgress";

type SyncState = "idle" | "syncing" | "done" | "error";

export function AuthNav() {
  const { isSignedIn, user } = useUser();
  const { signOut, openSignIn } = useClerk();
  const [syncState, setSyncState] = useState<SyncState>("idle");

  type CardRow = { kanji: string; interval: number; easeFactor: number; repetitions: number; nextReview: number; lastReview: number };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convexApi = api as any;
  const rawRemote = (useQuery(convexApi.progress.getProgress, isSignedIn ? {} : "skip") ?? []) as CardRow[];
  const remoteCards = rawRemote.map(({ kanji, interval, easeFactor, repetitions, nextReview, lastReview }) => ({
    kanji, interval, easeFactor, repetitions, nextReview, lastReview,
  }));
  const upsertProgress = useMutation(convexApi.progress.upsertProgress);

  async function handleSync() {
    if (syncState !== "idle") return;
    setSyncState("syncing");
    try {
      const localStore = getKanjiSM2Store();
      const { merged, toUpload } = mergeSyncProgress(remoteCards, localStore);
      saveKanjiSM2Store(merged);
      if (toUpload.length > 0) {
        await upsertProgress({ cards: toUpload });
      }
      setSyncState("done");
      setTimeout(() => setSyncState("idle"), 2000);
    } catch {
      setSyncState("error");
      setTimeout(() => setSyncState("idle"), 2000);
    }
  }

  const syncLabel =
    syncState === "syncing" ? "SYNCING..." :
      syncState === "done" ? "SYNCED ✓" :
        syncState === "error" ? "SYNC FAILED" :
          "SYNC PROGRESS";

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.7)",
        borderBottom: "1px solid rgba(255,215,0,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "12px",
        padding: "6px 16px",
      }}
    >
      {isSignedIn ? (
        <>
          <span
            className="font-pixel hidden sm:flex"
            style={{ fontSize: "7px", color: "var(--text-dim)" }}
          >
            {user?.primaryEmailAddress?.emailAddress ?? user?.username ?? "USER"}
          </span>
          <button
            onClick={handleSync}
            disabled={syncState !== "idle"}
            className="font-pixel"
            style={{
              fontSize: "7px",
              color: syncState === "done" ? "var(--accent-green)" : syncState === "error" ? "var(--accent-red)" : "var(--accent-gold)",
              background: "none",
              border: "1px solid currentColor",
              padding: "3px 8px",
              cursor: syncState !== "idle" ? "default" : "pointer",
              opacity: syncState === "syncing" ? 0.6 : 1,
            }}
          >
            {syncLabel}
          </button>
          <button
            onClick={() => signOut()}
            className="font-pixel border px-[8px] py-[3px]"
            style={{
              fontSize: "7px",
              color: "var(--text-dim)",
              background: "none",
              // border: "none",
              cursor: "pointer",
            }}
          >
            SIGN OUT
          </button>
        </>
      ) : (
        <button
          onClick={() => openSignIn()}
          className="font-pixel"
          style={{
            fontSize: "7px",
            color: "var(--text-dim)",
            background: "none",
            border: "1px solid rgba(255,215,0,0.2)",
            padding: "3px 8px",
            cursor: "pointer",
          }}
        >
          LOGIN TO SYNC
        </button>
      )}
    </div>
  );
}
