import { v } from "convex/values";
import { query } from "./_generated/server";

export const searchMessages = query({
  args: {
    conversationId: v.id("conversations"),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db
      .query("messages")
      .withIndex("byConversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    return allMessages.filter((msg) =>
      msg.content.toLowerCase().includes(args.searchTerm.toLowerCase())
    );
  },
});

export const searchConversations = query({
  args: {
    userId: v.id("users"),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all conversations for the user
    const allConversations = await ctx.db.query("conversations").collect();
    const userConversations = allConversations.filter((conv) =>
      conv.participants.includes(args.userId)
    );

    // Filter by name (for group chats)
    return userConversations.filter(
      (conv) =>
        conv.name?.toLowerCase().includes(args.searchTerm.toLowerCase()) || false
    );
  },
});
