import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createConversation = mutation({
  args: {
    type: v.union(v.literal("direct"), v.literal("group")),
    name: v.optional(v.string()),
    participants: v.array(v.id("users")),
    creatorId: v.optional(v.id("users")), // Add creator ID
  },
  handler: async (ctx, args) => {
    // For group conversations, separate creator and invited users
    let participants = args.participants;
    let invitedUsers: typeof args.participants = [];

    if (args.type === "group" && args.creatorId) {
      // Creator is automatically a participant
      participants = [args.creatorId];
      // Everyone else is invited
      invitedUsers = args.participants.filter((id) => id !== args.creatorId);
    }

    // Create the conversation first
    const conversationId = await ctx.db.insert("conversations", {
      type: args.type,
      name: args.name,
      participants,
      invitedUsers,
      creatorId: args.type === "group" ? args.creatorId : undefined,
      lastMessageAt: Date.now(),
    });

    // Create notifications for invited users with the conversation ID
    if (args.type === "group" && args.creatorId && invitedUsers.length > 0) {
      for (const userId of invitedUsers) {
        await ctx.db.insert("notifications", {
          userId,
          type: "group_invite",
          senderId: args.creatorId,
          conversationId,
          isRead: false,
          createdAt: Date.now(),
        });
      }
    }

    return conversationId;
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
      conv.participants.includes(args.userId) || (conv.invitedUsers && conv.invitedUsers.includes(args.userId))
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
      invitedUsers: [],
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

    // Check if user is already a participant
    if (conversation.participants.includes(args.userId)) {
      throw new Error("User is already in this group");
    }

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

export const acceptGroupInvitation = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    // Check if user is invited
    if (!conversation.invitedUsers?.includes(args.userId)) {
      throw new Error("User is not invited to this group");
    }

    // Move user from invitedUsers to participants
    const updatedInvited = (conversation.invitedUsers || []).filter(
      (id) => id !== args.userId
    );
    const updatedParticipants = [...conversation.participants, args.userId];

    await ctx.db.patch(args.conversationId, {
      invitedUsers: updatedInvited,
      participants: updatedParticipants,
    });

    // Mark notification as read
    const notifications = await ctx.db
      .query("notifications")
      .collect()
      .then((notifs) =>
        notifs.filter(
          (n) =>
            n.userId === args.userId &&
            n.type === "group_invite" &&
            n.conversationId === args.conversationId
        )
      );

    for (const notif of notifications) {
      await ctx.db.patch(notif._id, { isRead: true });
    }
  },
});

export const declineGroupInvitation = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    // Remove user from invitedUsers
    const updatedInvited = (conversation.invitedUsers || []).filter(
      (id) => id !== args.userId
    );

    await ctx.db.patch(args.conversationId, {
      invitedUsers: updatedInvited,
    });

    // Delete the notification
    const notifications = await ctx.db
      .query("notifications")
      .collect()
      .then((notifs) =>
        notifs.filter(
          (n) =>
            n.userId === args.userId &&
            n.type === "group_invite" &&
            n.conversationId === args.conversationId
        )
      );

    for (const notif of notifications) {
      await ctx.db.delete(notif._id);
    }
  },
});
