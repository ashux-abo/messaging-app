import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const createMessageNotification = mutation({
  args: {
    userId: v.id("users"),
    senderId: v.id("users"),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    // Don't create notification for sender
    if (args.userId === args.senderId) return;

    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "message",
      senderId: args.senderId,
      conversationId: args.conversationId,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

export const createFriendRequestNotification = mutation({
  args: {
    recipientId: v.id("users"),
    senderId: v.id("users"),
    friendRequestId: v.id("friendRequests"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.recipientId,
      type: "friend_request",
      senderId: args.senderId,
      friendRequestId: args.friendRequestId,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

export const createGroupInviteNotification = mutation({
  args: {
    userIds: v.array(v.id("users")), // Users to invite
    inviterId: v.id("users"),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    // Create notification for each user (except inviter)
    const notificationIds = await Promise.all(
      args.userIds.map(async (userId) => {
        if (userId === args.inviterId) return null;
        return await ctx.db.insert("notifications", {
          userId,
          type: "group_invite",
          senderId: args.inviterId,
          conversationId: args.conversationId,
          isRead: false,
          createdAt: Date.now(),
        });
      })
    );
    return notificationIds.filter((id) => id !== null);
  },
});

export const getUnreadNotifications = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("byUser", (q) =>
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .order("desc")
      .collect();

    // Enrich with sender info and conversation/friend request details
    const enriched = await Promise.all(
      notifications.map(async (notif) => {
        const sender = await ctx.db.get(notif.senderId);
        let extra: any = {};

        if (notif.conversationId) {
          const conversation = await ctx.db.get(notif.conversationId);
          extra.conversation = conversation;
          if (conversation?.type === "direct") {
            const otherParticipant = conversation.participants.find(
              (id) => id !== args.userId
            );
            if (otherParticipant) {
              const otherUser = await ctx.db.get(otherParticipant);
              extra.otherUser = otherUser;
            }
          }
        }

        if (notif.friendRequestId) {
          const friendRequest = await ctx.db.get(notif.friendRequestId);
          extra.friendRequest = friendRequest;
        }

        return { ...notif, sender, ...extra };
      })
    );

    return enriched;
  },
});

export const getNotifications = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("byUserAndTime", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    // Enrich with sender info
    const enriched = await Promise.all(
      notifications.map(async (notif) => {
        const sender = await ctx.db.get(notif.senderId);
        let extra: any = {};

        if (notif.conversationId) {
          const conversation = await ctx.db.get(notif.conversationId);
          extra.conversation = conversation;
        }

        if (notif.friendRequestId) {
          const friendRequest = await ctx.db.get(notif.friendRequestId);
          extra.friendRequest = friendRequest;
        }

        return { ...notif, sender, ...extra };
      })
    );

    return enriched;
  },
});

export const markNotificationAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      isRead: true,
    });
  },
});

export const markAllNotificationsAsRead = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("byUser", (q) =>
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();

    await Promise.all(
      unreadNotifications.map((notif) =>
        ctx.db.patch(notif._id, { isRead: true })
      )
    );
  },
});

export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
  },
});

export const getUnreadCount = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("byUser", (q) =>
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();

    return notifications.length;
  },
});
