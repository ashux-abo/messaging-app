import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    recipientId: v.optional(v.id("users")), // For 1-on-1 messages to check friendship
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("file")),
  },
  handler: async (ctx, args) => {
    // Check friendship restrictions for 1-on-1 messages
    if (args.recipientId) {
      const recipient = await ctx.db.get(args.recipientId);
      if (!recipient) throw new Error("Recipient not found");

      // If recipient has friend requests disabled, check if they're friends
      const friendRequestsEnabled = recipient.friendRequestsEnabled ?? true; // Default to true
      if (!friendRequestsEnabled) {
        // Check if sender and recipient are friends
        const friendRequest = await ctx.db
          .query("friendRequests")
          .filter((q) =>
            q.and(
              q.or(
                q.and(
                  q.eq(q.field("senderId"), args.senderId),
                  q.eq(q.field("recipientId"), args.recipientId)
                ),
                q.and(
                  q.eq(q.field("senderId"), args.recipientId),
                  q.eq(q.field("recipientId"), args.senderId)
                )
              ),
              q.eq(q.field("status"), "accepted")
            )
          )
          .first();

        if (!friendRequest) {
          throw new Error(
            "This user only accepts messages from friends. Send a friend request first."
          );
        }
      }
    }

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

    // Create notifications for other participants
    const conversation = await ctx.db.get(args.conversationId);
    if (conversation) {
      for (const participantId of conversation.participants) {
        if (participantId !== args.senderId) {
          await ctx.db.insert("notifications", {
            userId: participantId,
            type: "message",
            senderId: args.senderId,
            conversationId: args.conversationId,
            isRead: false,
            createdAt: Date.now(),
          });
        }
      }
    }

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
