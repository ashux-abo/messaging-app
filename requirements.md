# Requirements Documentation

## 1. Functional Requirements

### 1.1 User Authentication
- FR-1.1: Users can sign up with email/password or OAuth
- FR-1.2: Users can sign in and sign out
- FR-1.3: Session management with automatic token refresh
- FR-1.4: Password reset functionality

### 1.2 Messaging
- FR-2.1: Users can send text messages in real-time
- FR-2.2: Users can send images and files
- FR-2.3: Users can edit and delete their own messages
- FR-2.4: Messages are delivered within 500ms
- FR-2.5: Message history is paginated (20 messages per page)

### 1.3 Conversations
- FR-3.1: Users can start 1-on-1 conversations
- FR-3.2: Users can create group chats (up to 50 members)
- FR-3.3: Users can see conversation list with last message preview
- FR-3.4: Unread message count is displayed

### 1.4 User Interactions
- FR-4.1: Users can search for other users
- FR-4.2: Users can send friend requests
- FR-4.3: Users can accept/decline friend requests
- FR-4.4: Users can see online/offline status
- FR-4.5: Typing indicators show when someone is typing

### 1.5 Additional Features
- FR-5.1: Message reactions (emoji)
- FR-5.2: Reply to specific messages
- FR-5.3: Forward messages
- FR-5.4: Dark/light theme toggle

## 2. Non-Functional Requirements

### 2.1 Performance
- NFR-1.1: Page load time < 3 seconds
- NFR-1.2: Message delivery latency < 500ms
- NFR-1.3: Support 50+ concurrent users per chat

### 2.2 Security
- NFR-2.1: All API routes require authentication
- NFR-2.2: Input validation on all forms
- NFR-2.3: XSS and CSRF protection
- NFR-2.4: Rate limiting on API endpoints

### 2.3 Scalability
- NFR-3.1: Database optimized with proper indexes
- NFR-3.2: Image optimization and CDN delivery

### 2.4 Accessibility
- NFR-4.1: WCAG 2.1 Level AA compliance
- NFR-4.2: Keyboard navigation support
- NFR-4.3: Screen reader compatible

## 3. User Stories

### Epic 1: Authentication
**US-1.1**: As a new user, I want to sign up with my email so that I can create an account.
- Acceptance Criteria:
  - Email validation is performed
  - Password must be at least 8 characters
  - Success message is displayed
  - User is redirected to main app

**US-1.2**: As a user, I want to sign in with Google so that I can quickly access my account.
- Acceptance Criteria:
  - OAuth flow is initiated
  - User is authenticated via Google
  - User is redirected to main app

### Epic 2: Messaging
**US-2.1**: As a user, I want to send a message to a friend so that we can communicate.
- Acceptance Criteria:
  - Message appears instantly in chat
  - Message is saved to database
  - Recipient receives notification
  - Timestamp is displayed

**US-2.2**: As a user, I want to see typing indicators so that I know when someone is responding.
- Acceptance Criteria:
  - "User is typing..." appears when they type
  - Indicator disappears after 3 seconds of inactivity
  - Multiple users typing are handled

### Epic 3: Conversations
**US-3.1**: As a user, I want to see all my conversations so that I can choose who to chat with.
- Acceptance Criteria:
  - List shows all conversations
  - Last message preview is visible
  - Unread count is displayed
  - Online status is shown

## 4. API Specifications

### 4.1 Convex Queries

**users.get**
```typescript
// Get current user profile
export const get = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
  },
});

-messages.list

// Get messages for a conversation
export const list = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("desc")
      .take(50);
  },
});


### 4.2 Convex Mutations
- messages.send

// Send a new message
export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("image")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: identity.subject,
      content: args.content,
      type: args.type,
      timestamp: Date.now(),
    });
  },
});

