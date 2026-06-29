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
