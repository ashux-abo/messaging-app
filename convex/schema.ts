import { defineSchema, defineTable } from 'convex/server';
import { v } from "convex/values"

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        email: v.string(),
        name: v.string(),
        imageUrl: v.string(),
        isOnline: v.boolean(),
        lastSeen: v.number(),
        friendRequestsEnabled: v.optional(v.boolean()), // Optional for backward compatibility, default true
    })
    .index("byClerkId", ["clerkId"])
    .index("byIsOnline", ["isOnline"]),

    conversations: defineTable({
        type: v.union(v.literal("direct"), v.literal("group")),
        name: v.optional(v.string()), // Optional for direct messages
        participants: v.array(v.id("users")), // Array of user IDs
        lastMessageAt: v.number()
    })
    .index("byLastMessageAt", ["lastMessageAt"]),

    messages: defineTable({
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        content: v.string(),
        type: v.union(v.literal("text"), v.literal("image"), v.literal("file")),
        timestamp: v.number(),
        reactions: v.array(
            v.object({
                userId: v.id("users"),
                emoji: v.string(),
            })
        ),
        isEdited: v.boolean(),
        repliedToMessageId: v.optional(v.id("messages")), // For message replies/threading
    })
    .index("byConversation", ["conversationId", "timestamp"])
    .index("byTimestamp", ["timestamp"])
    .index("byRepliedTo", ["repliedToMessageId"]),

    typingIndicators: defineTable({
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        lastTypedAt: v.number(),
    })
    .index("byConversation", ["conversationId"])
    .index("byConversationAndUser", ["conversationId", "userId"]),

    friendRequests: defineTable({
        senderId: v.id("users"),
        recipientId: v.id("users"),
        status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined")),
        createdAt: v.number(),
        respondedAt: v.optional(v.number()),
    })
    .index("byRecipient", ["recipientId", "status"])
    .index("bySender", ["senderId", "status"])
    .index("byUsers", ["senderId", "recipientId"]),

    notifications: defineTable({
        userId: v.id("users"), // Recipient of notification
        type: v.union(
            v.literal("message"),
            v.literal("friend_request"),
            v.literal("group_invite")
        ),
        senderId: v.id("users"), // User who triggered the notification
        conversationId: v.optional(v.id("conversations")), // For message and group invite notifications
        friendRequestId: v.optional(v.id("friendRequests")), // For friend request notifications
        isRead: v.boolean(),
        createdAt: v.number(),
    })
    .index("byUser", ["userId", "isRead"])
    .index("byUserAndTime", ["userId", "createdAt"]),
});
