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
    })
    .index("byConversation", ["conversationId", "timestamp"])
    .index("byTimestamp", ["timestamp"]),

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
});
