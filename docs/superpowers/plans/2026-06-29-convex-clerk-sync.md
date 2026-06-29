# Convex + Clerk Progress Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add optional Clerk auth + Convex backend so users can sync their kanji SM-2 progress across devices via a sync button, without touching the existing localStorage-first guest flow.

**Architecture:** The app stays fully functional without login — localStorage is always the local source of truth. When a user signs in with Clerk, a persistent session is stored in a cookie. A "Sync Progress" button appears in a thin global auth strip in the layout header; clicking it runs a merge-and-upload to Convex using the "higher repetitions wins" strategy, then pulls any superior remote records back to localStorage.

**Tech Stack:** Next.js 16 (App Router), Convex (backend + realtime DB), `@clerk/nextjs` (auth), Zustand + localStorage (unchanged local store)

## Global Constraints

- Never remove or break the localStorage-first guest flow — all existing pages must work identically without login
- Clerk session persists in cookie — user never re-logs in on same device
- Merge strategy: per-card, keep the record with higher `repetitions`; if equal, keep the one with the more recent `lastReview`
- Convex table is keyed by Clerk `userId` (the `identity.subject` string)
- `CardState` shape is fixed: `{ kanji, interval, easeFactor, repetitions, nextReview, lastReview }` — do not add fields
- SM2 localStorage key is `jplift_kanji_sm2` — do not change it
- All new UI follows the existing retro/pixel aesthetic (`font-pixel`, `btn-game`, game-panel colours)

---

## File Map

| Path | Status | Responsibility |
|------|--------|----------------|
| `convex/schema.ts` | Create | Convex DB schema — `card_progress` table |
| `convex/auth.config.ts` | Create | Tell Convex which Clerk domain to trust for JWTs |
| `convex/progress.ts` | Create | `getProgress` query + `upsertProgress` mutation |
| `src/lib/syncProgress.ts` | Create | Merge logic + orchestrate pull/push with Convex |
| `src/components/AuthNav.tsx` | Create | Thin header strip: sign-in/out + Sync Progress button |
| `src/app/layout.tsx` | Modify | Wrap children in `ConvexClerkProvider`, add `AuthNav` |
| `package.json` | Modify | Add `convex`, `@clerk/nextjs` dependencies |
| `.env.local` | Create | Env vars (template — user fills values) |

---

### Task 1: Install Dependencies and Environment Setup

**Files:**
- Modify: `package.json`
- Create: `.env.local`

**Interfaces:**
- Produces: `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` env vars available to the app

- [ ] **Step 1: Install packages**

```bash
cd "/home/toasty/Desktop/Code Projects/JapaneseCharacterTrainer"
npm install convex @clerk/nextjs
```

Expected output ends with: `added N packages` with no errors.

- [ ] **Step 2: Initialise Convex project**

```bash
npx convex dev --once
```

This will:
1. Ask you to log in to Convex (opens browser) — log in or create a free account
2. Ask for a project name — enter `moji-crawler`
3. Write `convex/` directory scaffolding and update `.env.local` with `NEXT_PUBLIC_CONVEX_URL`

If `.env.local` doesn't exist after this, create it manually in the next step.

- [ ] **Step 3: Create `.env.local` template**

Create `.env.local` in the project root. Convex will have already added `NEXT_PUBLIC_CONVEX_URL`. Add the Clerk keys:

```bash
# .env.local
NEXT_PUBLIC_CONVEX_URL=<filled by `npx convex dev --once` above>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXX
CLERK_SECRET_KEY=sk_test_XXXXXXXX
```

To get the Clerk keys:
1. Go to https://clerk.com → create a free account and a new application called "Moji Crawler"
2. Choose "Email" as the sign-in method (simplest for classmates)
3. Copy **Publishable key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
4. Copy **Secret key** → `CLERK_SECRET_KEY`

- [ ] **Step 4: Add `.env.local` to `.gitignore` (verify)**

```bash
grep -q ".env.local" .gitignore && echo "already ignored" || echo ".env.local" >> .gitignore
```

Expected: `already ignored` (Next.js scaffolding already adds it) or it's now added.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add convex and clerk dependencies"
```

---

### Task 2: Convex Schema and Auth Config

**Files:**
- Create: `convex/schema.ts`
- Create: `convex/auth.config.ts`

**Interfaces:**
- Produces: `card_progress` table with indexes `by_user` and `by_user_kanji`
- Produces: Convex auth configured to accept Clerk JWTs from your Clerk domain

> **Before this task:** You need your Clerk Frontend API URL. Find it in Clerk Dashboard → API Keys. It looks like `https://[slug].clerk.accounts.dev`.

- [ ] **Step 1: Write `convex/schema.ts`**

```ts
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  card_progress: defineTable({
    userId: v.string(),
    kanji: v.string(),
    interval: v.number(),
    easeFactor: v.number(),
    repetitions: v.number(),
    nextReview: v.number(),
    lastReview: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_kanji", ["userId", "kanji"]),
});
```

- [ ] **Step 2: Write `convex/auth.config.ts`**

Replace `https://[YOUR-CLERK-SLUG].clerk.accounts.dev` with the value from Clerk Dashboard → API Keys → Frontend API URL.

```ts
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: "https://[YOUR-CLERK-SLUG].clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
```

- [ ] **Step 3: Push schema to Convex**

```bash
npx convex dev --once
```

Expected: Convex prints `Schema updated` and `card_progress` appears in your Convex dashboard under Tables.

- [ ] **Step 4: Verify schema in dashboard**

Open https://dashboard.convex.dev → your project → Data. Confirm `card_progress` table exists with correct columns.

- [ ] **Step 5: Commit**

```bash
git add convex/
git commit -m "feat: add convex schema and clerk auth config"
```

---

### Task 3: Convex Progress Query and Mutation

**Files:**
- Create: `convex/progress.ts`

**Interfaces:**
- Produces: `api.progress.getProgress` — query returning `Array<CardState & { _id, userId }>` or `null` if unauthenticated
- Produces: `api.progress.upsertProgress` — mutation accepting `cards: CardState[]`, upserts per `(userId, kanji)`, returns `void`
- Consumes: Convex auth identity `ctx.auth.getUserIdentity()` — `identity.subject` is the Clerk user ID

- [ ] **Step 1: Write `convex/progress.ts`**

```ts
// convex/progress.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const cardFields = {
  kanji: v.string(),
  interval: v.number(),
  easeFactor: v.number(),
  repetitions: v.number(),
  nextReview: v.number(),
  lastReview: v.number(),
};

export const getProgress = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("card_progress")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

export const upsertProgress = mutation({
  args: { cards: v.array(v.object(cardFields)) },
  handler: async (ctx, { cards }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    for (const card of cards) {
      const existing = await ctx.db
        .query("card_progress")
        .withIndex("by_user_kanji", (q) =>
          q.eq("userId", userId).eq("kanji", card.kanji)
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, card);
      } else {
        await ctx.db.insert("card_progress", { userId, ...card });
      }
    }
  },
});
```

- [ ] **Step 2: Push to Convex and verify**

```bash
npx convex dev --once
```

Expected: Convex prints `Functions updated` including `progress:getProgress` and `progress:upsertProgress`.

- [ ] **Step 3: Commit**

```bash
git add convex/progress.ts
git commit -m "feat: add convex progress query and upsert mutation"
```

---

### Task 4: Provider Setup and Layout Integration

**Files:**
- Create: `src/app/ConvexClerkProvider.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` from env
- Produces: `ClerkProvider` + `ConvexProviderWithClerk` wrapping all page children so any component can call `useAuth()` and Convex hooks

- [ ] **Step 1: Create `src/app/ConvexClerkProvider.tsx`**

This must be a client component because Clerk hooks need the browser.

```tsx
// src/app/ConvexClerkProvider.tsx
"use client";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

- [ ] **Step 2: Modify `src/app/layout.tsx`**

Add the provider import and wrap `{children}` with `<ConvexClerkProvider>`. The existing font variables and `<Analytics />` stay exactly as-is.

```tsx
// src/app/layout.tsx
import { Press_Start_2P, VT323, Orbitron } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ConvexClerkProvider } from "./ConvexClerkProvider";

const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "MOJI CRAWLER — Japanese Character Trainer",
  description: "Master Japanese characters in a retro RPG adventure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full ${pressStart2P.variable} ${vt323.variable} ${orbitron.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <ConvexClerkProvider>
          {children}
        </ConvexClerkProvider>
        <Analytics />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Start dev server and verify no crash**

```bash
npm run dev
```

Open http://localhost:3000. Expected: app loads exactly as before. No console errors about missing providers.

- [ ] **Step 4: Commit**

```bash
git add src/app/ConvexClerkProvider.tsx src/app/layout.tsx
git commit -m "feat: wrap app in ConvexClerkProvider"
```

---

### Task 5: Sync Logic (Merge Strategy)

**Files:**
- Create: `src/lib/syncProgress.ts`

**Interfaces:**
- Consumes: `getKanjiSM2Store(): KanjiSM2Store` from `src/lib/kanjiStorage.ts`
- Consumes: `saveKanjiSM2Store(store: KanjiSM2Store): void` from `src/lib/kanjiStorage.ts`
- Consumes: `api.progress.getProgress` — Convex query result type: `Array<{ kanji: string, interval: number, easeFactor: number, repetitions: number, nextReview: number, lastReview: number }> | null`
- Consumes: `upsertProgress` — Convex mutation accepting `{ cards: CardState[] }`
- Produces: `mergeSyncProgress(remoteCards, localStore): { merged: KanjiSM2Store, toUpload: CardState[] }` — pure function, no side effects
- Produces: `runSync(convexClient, userId): Promise<"ok" | "unauthenticated">` — orchestrates full pull → merge → push → save cycle

**Merge rule:** For each kanji, compare local and remote `CardState`. Winner = higher `repetitions`. Tie-break = higher `lastReview`. The merged store is saved to localStorage. Records where local won (or remote has no entry) are uploaded to Convex.

- [ ] **Step 1: Write `src/lib/syncProgress.ts`**

```ts
// src/lib/syncProgress.ts
import type { CardState, KanjiSM2Store } from "./kanjiStorage";
import { getKanjiSM2Store, saveKanjiSM2Store } from "./kanjiStorage";

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

// Called by the SyncButton — convexClient is the ConvexReactClient instance
// passed via the useMutation/useQuery hooks from the calling component.
// This function is NOT called directly; it is used by SyncButton via the hooks.
// Exported for testing only.
export type SyncResult = "ok" | "unauthenticated" | "error";
```

- [ ] **Step 2: Write a quick sanity check in the browser console (manual test)**

After the dev server is running, open the browser console on any page and run:

```js
// Paste this into the console to verify merge logic manually
const local = { 山: { kanji:"山", interval:6, easeFactor:2.5, repetitions:2, nextReview:9999, lastReview:1000 } };
const remote = [{ kanji:"山", interval:1, easeFactor:2.5, repetitions:1, nextReview:1, lastReview:500 }];
// Expected: merged["山"].repetitions === 2, toUpload has 山
console.log("local wins:", local["山"].repetitions > remote[0].repetitions); // true
```

Expected output: `local wins: true`

- [ ] **Step 3: Commit**

```bash
git add src/lib/syncProgress.ts
git commit -m "feat: add SM-2 merge logic for cross-device sync"
```

---

### Task 6: AuthNav Component (Sign In/Out + Sync Button)

**Files:**
- Create: `src/components/AuthNav.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `useUser()`, `useClerk()` from `@clerk/nextjs`
- Consumes: `useMutation()` from `convex/react` with `api.progress.upsertProgress`
- Consumes: `useQuery()` from `convex/react` with `api.progress.getProgress`
- Consumes: `mergeSyncProgress(remoteCards, localStore)` from `src/lib/syncProgress.ts`
- Consumes: `getKanjiSM2Store()`, `saveKanjiSM2Store()` from `src/lib/kanjiStorage.ts`
- Produces: A thin horizontal strip rendered above `{children}` in layout — invisible to guests, shows username + Sync button + Sign Out when signed in

**UI spec:**
- Strip height: `py-2 px-4` — minimal, doesn't compete with page content
- Background: `rgba(0,0,0,0.7)` with `border-bottom: 1px solid rgba(255,215,0,0.15)` (matches game-panel aesthetic)
- Guest state: one small `[LOGIN TO SYNC]` button, right-aligned, `font-pixel text-[8px]` in `var(--text-dim)` colour
- Signed-in state: `<username>  [SYNC PROGRESS]  [SIGN OUT]` — all `font-pixel text-[8px]`
- Sync button during sync: shows `SYNCING...` and is disabled
- Sync button after success: briefly shows `SYNCED ✓` for 2 seconds then reverts

- [ ] **Step 1: Create `src/components/AuthNav.tsx`**

```tsx
// src/components/AuthNav.tsx
"use client";
import { useUser, useClerk, SignInButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { getKanjiSM2Store, saveKanjiSM2Store } from "../lib/kanjiStorage";
import { mergeSyncProgress } from "../lib/syncProgress";

type SyncState = "idle" | "syncing" | "done";

export function AuthNav() {
  const { isSignedIn, user } = useUser();
  const { signOut, openSignIn } = useClerk();
  const [syncState, setSyncState] = useState<SyncState>("idle");

  const remoteCards = useQuery(api.progress.getProgress) ?? [];
  const upsertProgress = useMutation(api.progress.upsertProgress);

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
      setSyncState("idle");
    }
  }

  const syncLabel =
    syncState === "syncing" ? "SYNCING..." : syncState === "done" ? "SYNCED ✓" : "SYNC PROGRESS";

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
            className="font-pixel"
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
              color: syncState === "done" ? "var(--accent-green)" : "var(--accent-gold)",
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
            className="font-pixel"
            style={{
              fontSize: "7px",
              color: "var(--text-dim)",
              background: "none",
              border: "none",
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
```

- [ ] **Step 2: Add `AuthNav` to `src/app/layout.tsx`**

Add the import and place `<AuthNav />` inside `<ConvexClerkProvider>`, above `{children}`:

```tsx
// src/app/layout.tsx  (show only the body change — all other code stays the same)
import { AuthNav } from "../components/AuthNav";

// ...inside RootLayout:
      <body className="min-h-full flex flex-col">
        <ConvexClerkProvider>
          <AuthNav />
          {children}
        </ConvexClerkProvider>
        <Analytics />
      </body>
```

- [ ] **Step 3: Verify guest flow in browser**

```bash
npm run dev
```

Open http://localhost:3000. Expected:
- Thin strip at the top with `LOGIN TO SYNC` text in dim colour
- Clicking it opens Clerk's sign-in modal
- After signing in: strip shows email, `SYNC PROGRESS`, and `SIGN OUT`
- Clicking `SYNC PROGRESS` shows `SYNCING...` then `SYNCED ✓` for 2 seconds

- [ ] **Step 4: Verify progress appears in Convex dashboard**

After clicking Sync while signed in, go to https://dashboard.convex.dev → your project → Data → `card_progress`. Rows should appear keyed to your Clerk user ID.

- [ ] **Step 5: Verify guest flow still works**

Sign out, then navigate to `/practice/select?mode=kanji`, select some kanji groups, play a round and grade cards. Confirm SM-2 grades still save to localStorage (check DevTools → Application → Local Storage → `jplift_kanji_sm2`).

- [ ] **Step 6: Commit**

```bash
git add src/components/AuthNav.tsx src/app/layout.tsx
git commit -m "feat: add AuthNav with sign-in/out and sync progress button"
```

---

### Task 7: Cross-Device Sync Verification

This task verifies the full pull-merge-push cycle works end-to-end.

**Files:**
- No new files — this is a verification task

- [ ] **Step 1: Simulate Device A**

In your browser with localStorage cleared (DevTools → Application → Storage → Clear site data):
1. Sign in with Clerk
2. Navigate to kanji play, review 5+ cards, grade them
3. Click `SYNC PROGRESS`
4. Verify rows appear in Convex dashboard

- [ ] **Step 2: Simulate Device B**

Open a private/incognito window (fresh localStorage):
1. Sign in with the **same Clerk account**
2. Click `SYNC PROGRESS` immediately (before reviewing any cards)
3. Check DevTools → Application → Local Storage → `jplift_kanji_sm2`
4. Expected: Device A's progress is now present in Device B's localStorage

- [ ] **Step 3: Verify merge direction**

On Device B, review one card from Device A's set with a lower quality grade (which lowers repetitions). Click `SYNC PROGRESS`.

In Convex dashboard, the card's `repetitions` should still reflect Device A's higher value — Device B's weaker grade did not overwrite the better progress.

- [ ] **Step 4: Verify no regressions**

Sign out completely. Play a full round on the kanji page as a guest. Confirm:
- SM-2 grades save correctly to localStorage
- `SYNC PROGRESS` button is not visible (only `LOGIN TO SYNC` shows)
- All existing pages (`/`, `/practice`, `/practice/play`) load without errors

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: convex + clerk cross-device sync complete"
```

---

## Self-Review

**Spec coverage check:**

| Requirement | Task |
|-------------|------|
| App works without login | Global constraint enforced; guest flow verified in Task 6 step 5 and Task 7 step 4 |
| Optional login for sync | Task 6 — `LOGIN TO SYNC` visible to guests, no forced redirect |
| Persistent session (no re-login) | Task 4 — ClerkProvider handles cookie-based session |
| Sync button visible when logged in | Task 6 — `AuthNav` shows `SYNC PROGRESS` only when `isSignedIn` |
| Sync button click pushes/pulls from DB | Task 6 — `handleSync` runs merge then `upsertProgress` |
| Higher repetitions wins merge | Task 5 — `mergeSyncProgress` implements this exactly |
| Tie-break: higher `lastReview` | Task 5 — secondary condition in `mergeSyncProgress` |

**Placeholder scan:** None found. All code blocks are complete and runnable.

**Type consistency:** `CardState` shape used identically across `kanjiStorage.ts`, `convex/progress.ts` (`cardFields`), and `syncProgress.ts`. `api.progress.getProgress` return type is `Array<CardState & { _id, userId, _creationTime }>` — the spread in `mergeSyncProgress` only accesses the 6 `CardState` fields, so the extra Convex fields are safely ignored.
