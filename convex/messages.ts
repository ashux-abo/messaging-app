import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("file")),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      type: args.type,
      timestamp: Date.now(),
      reactions: [],
      isEdited: false,
    });

    // Update conversation's lastMessageAt
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
    });

    return messageId;
  },
});

export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("byConversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();
  },
});

export const getMessagesPaginated = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.number(),
    cursor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("messages")
      .withIndex("byConversation", (q) => q.eq("conversationId", args.conversationId));

    if (args.cursor) {
      query = query.filter((q) => q.lt(q.field("timestamp"), args.cursor!));
    }

    const messages = await query.order("desc").take(args.limit);
    const nextCursor = messages.length === args.limit ? messages[messages.length - 1].timestamp : null;

    return {
      messages: messages.reverse(),
      nextCursor,
    };
  },
});

export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      content: args.content,
      isEdited: true,
    });
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.messageId);
  },
});

export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    const existingReaction = message.reactions.find(
      (r) => r.userId === args.userId && r.emoji === args.emoji
    );

    if (existingReaction) {
      // Remove reaction if already exists
      const updated = message.reactions.filter(
        (r) => !(r.userId === args.userId && r.emoji === args.emoji)
      );
      await ctx.db.patch(args.messageId, { reactions: updated });
    } else {
      // Add new reaction
      const updated = [...message.reactions, { userId: args.userId, emoji: args.emoji }];
      await ctx.db.patch(args.messageId, { reactions: updated });
    }
  },
});

export const watchMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("byConversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();
  },
});
