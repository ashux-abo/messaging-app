import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createConversation = mutation({
  args: {
    type: v.union(v.literal("direct"), v.literal("group")),
    name: v.optional(v.string()),
    participants: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conversations", {
      type: args.type,
      name: args.name,
      participants: args.participants,
      lastMessageAt: Date.now(),
    });
  },
});

export const getConversation = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

export const getConversationsByUserId = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const allConversations = await ctx.db.query("conversations").collect();
    return allConversations.filter((conv) =>
      conv.participants.includes(args.userId)
    );
  },
});

export const getOrCreateDirectConversation = mutation({
  args: {
    userId1: v.id("users"),
    userId2: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("conversations")
      .collect()
      .then((convs) =>
        convs.find(
          (c) =>
            c.type === "direct" &&
            c.participants.includes(args.userId1) &&
            c.participants.includes(args.userId2)
        )
      );

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("conversations", {
      type: "direct",
      participants: [args.userId1, args.userId2],
      lastMessageAt: Date.now(),
    });
  },
});

export const updateConversationLastMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
    });
  },
});

export const addParticipantToGroup = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const updated = [...conversation.participants, args.userId];
    await ctx.db.patch(args.conversationId, {
      participants: updated,
    });
  },
});

export const removeParticipantFromGroup = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const updated = conversation.participants.filter((id) => id !== args.userId);
    await ctx.db.patch(args.conversationId, {
      participants: updated,
    });
  },
});
