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
