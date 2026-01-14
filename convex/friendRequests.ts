import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendFriendRequest = mutation({
  args: {
    senderId: v.id("users"),
    recipientId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if already friends
    const existing = await ctx.db
      .query("friendRequests")
      .withIndex("byUsers", (q) =>
        q
          .eq("senderId", args.senderId)
          .eq("recipientId", args.recipientId)
      )
      .first();

    if (existing) {
      throw new Error("Friend request already exists");
    }

    // Check reverse direction too
    const reverse = await ctx.db
      .query("friendRequests")
      .withIndex("byUsers", (q) =>
        q
          .eq("senderId", args.recipientId)
          .eq("recipientId", args.senderId)
      )
      .first();

    if (reverse && reverse.status === "accepted") {
      throw new Error("Already friends");
    }

    const friendRequestId = await ctx.db.insert("friendRequests", {
      senderId: args.senderId,
      recipientId: args.recipientId,
      status: "pending",
      createdAt: Date.now(),
    });

    // Create notification for friend request
    await ctx.db.insert("notifications", {
      userId: args.recipientId,
      type: "friend_request",
      senderId: args.senderId,
      friendRequestId,
      isRead: false,
      createdAt: Date.now(),
    });

    return friendRequestId;
  },
});

export const acceptFriendRequest = mutation({
  args: {
    requestId: v.id("friendRequests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Friend request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Request is not pending");
    }

    await ctx.db.patch(args.requestId, {
      status: "accepted",
      respondedAt: Date.now(),
    });

    // Create notification for the original sender that their request was accepted
    await ctx.db.insert("notifications", {
      userId: request.senderId,
      type: "friend_request_accepted",
      senderId: request.recipientId,
      friendRequestId: args.requestId,
      isRead: false,
      createdAt: Date.now(),
    });

    return args.requestId;
  },
});

export const declineFriendRequest = mutation({
  args: {
    requestId: v.id("friendRequests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Friend request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Request is not pending");
    }

    await ctx.db.patch(args.requestId, {
      status: "declined",
      respondedAt: Date.now(),
    });

    return args.requestId;
  },
});

export const getPendingFriendRequests = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("friendRequests")
      .withIndex("byRecipient", (q) =>
        q
          .eq("recipientId", args.userId)
          .eq("status", "pending")
      )
      .collect();

    // Enrich with sender info
    const enriched = await Promise.all(
      requests.map(async (req) => {
        const sender = await ctx.db.get(req.senderId);
        return { ...req, sender };
      })
    );

    return enriched;
  },
});

export const getSentFriendRequests = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("friendRequests")
      .withIndex("bySender", (q) =>
        q
          .eq("senderId", args.userId)
          .eq("status", "pending")
      )
      .collect();

    // Enrich with recipient info
    const enriched = await Promise.all(
      requests.map(async (req) => {
        const recipient = await ctx.db.get(req.recipientId);
        return { ...req, recipient };
      })
    );

    return enriched;
  },
});

export const getFriendsForUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get all accepted requests where user is sender or recipient
    const sentRequests = await ctx.db
      .query("friendRequests")
      .withIndex("bySender", (q) =>
        q
          .eq("senderId", args.userId)
          .eq("status", "accepted")
      )
      .collect();

    const receivedRequests = await ctx.db
      .query("friendRequests")
      .withIndex("byRecipient", (q) =>
        q
          .eq("recipientId", args.userId)
          .eq("status", "accepted")
      )
      .collect();

    // Extract friend IDs
    const friendIds = new Set<string>();
    sentRequests.forEach((req) => friendIds.add(req.recipientId));
    receivedRequests.forEach((req) => friendIds.add(req.senderId));

    // Fetch friend details
    const friends = await Promise.all(
      Array.from(friendIds).map(async (id) => {
        return await ctx.db.get(id as any);
      })
    );

    return friends.filter((f) => f !== null);
  },
});

export const areFriends = query({
  args: {
    userId1: v.id("users"),
    userId2: v.id("users"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db
      .query("friendRequests")
      .withIndex("byUsers", (q) =>
        q
          .eq("senderId", args.userId1)
          .eq("recipientId", args.userId2)
      )
      .first();

    if (request && request.status === "accepted") {
      return true;
    }

    const reverseRequest = await ctx.db
      .query("friendRequests")
      .withIndex("byUsers", (q) =>
        q
          .eq("senderId", args.userId2)
          .eq("recipientId", args.userId1)
      )
      .first();

    return reverseRequest?.status === "accepted";
  },
});

export const getFriendRequestStatus = query({
  args: {
    userId: v.id("users"),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if sent a request
    const sentRequest = await ctx.db
      .query("friendRequests")
      .withIndex("byUsers", (q) =>
        q
          .eq("senderId", args.userId)
          .eq("recipientId", args.targetUserId)
      )
      .first();

    if (sentRequest) {
      return { status: sentRequest.status, direction: "sent" as const, requestId: sentRequest._id };
    }

    // Check if received a request
    const receivedRequest = await ctx.db
      .query("friendRequests")
      .withIndex("byUsers", (q) =>
        q
          .eq("senderId", args.targetUserId)
          .eq("recipientId", args.userId)
      )
      .first();

    if (receivedRequest) {
      return { status: receivedRequest.status, direction: "received" as const, requestId: receivedRequest._id };
    }

    return { status: "none" as const, direction: null, requestId: null };
  },
});