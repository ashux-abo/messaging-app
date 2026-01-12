import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("byConversationAndUser", (q) =>
        q
          .eq("conversationId", args.conversationId)
          .eq("userId", args.userId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastTypedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("typingIndicators", {
        conversationId: args.conversationId,
        userId: args.userId,
        lastTypedAt: Date.now(),
      });
    }
  },
});

export const getTypingUsers = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const indicators = await ctx.db
      .query("typingIndicators")
      .withIndex("byConversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    // Filter out indicators older than 3 seconds
    const now = Date.now();
    const activeIndicators = indicators.filter(
      (ind) => now - ind.lastTypedAt < 3000
    );

    // Get user info for active typing indicators
    const typingUsers = await Promise.all(
      activeIndicators.map((ind) => ctx.db.get(ind.userId))
    );

    return typingUsers.filter((u) => u !== null);
  },
});

export const clearTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("byConversationAndUser", (q) =>
        q
          .eq("conversationId", args.conversationId)
          .eq("userId", args.userId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
