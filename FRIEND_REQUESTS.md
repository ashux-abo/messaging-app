# Friend Requests & Messaging Control Feature

## Overview

This feature implements a friend request system with granular control over who can send you direct messages. Users can choose to allow direct messages from anyone or only from friends.

## Key Features

### 1. **Friend Requests System**
- Send friend requests to other users
- Accept or decline pending requests
- View list of sent, pending, and accepted friends
- Prevent duplicate friend requests

### 2. **Message Control for Non-Friends**
- **Default Behavior**: Users can receive direct messages from anyone (messaging enabled by default)
- **Toggle Option**: Users can disable direct messaging from non-friends via profile settings
- **Messaging Restriction**: When disabled, only accepted friends can send messages
- **Graceful Error**: Clear error message when attempting to message someone who doesn't accept non-friend messages

## Database Schema Changes

### Updated `users` Table
```typescript
users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.string(),
    isOnline: v.boolean(),
    lastSeen: v.number(),
    friendRequestsEnabled: v.boolean(), // NEW: Allow messages from non-friends
})
```

### New `friendRequests` Table
```typescript
friendRequests: defineTable({
    senderId: v.id("users"),
    recipientId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined")),
    createdAt: v.number(),
    respondedAt: v.optional(v.number()),
})
.index("byRecipient", ["recipientId", "status"])
.index("bySender", ["senderId", "status"])
.index("byUsers", ["senderId", "recipientId"])
```

## Convex Functions

### New File: `convex/friendRequests.ts`

#### Mutations
- **`sendFriendRequest`**: Send a friend request to another user
  - Args: `senderId`, `recipientId`
  - Prevents duplicate requests
  - Prevents requesting already-friends

- **`acceptFriendRequest`**: Accept a pending friend request
  - Args: `requestId`
  - Only accepts pending requests

- **`declineFriendRequest`**: Decline a pending friend request
  - Args: `requestId`
  - Marks request as declined

#### Queries
- **`getPendingFriendRequests`**: Get all pending requests for a user
  - Args: `userId`
  - Returns enriched with sender details

- **`getSentFriendRequests`**: Get all pending requests sent by a user
  - Args: `userId`
  - Returns enriched with recipient details

- **`getFriendsForUser`**: Get all accepted friends
  - Args: `userId`
  - Returns list of friend user objects

- **`areFriends`**: Check if two users are friends
  - Args: `userId1`, `userId2`
  - Returns boolean

### Updated File: `convex/users.ts`

- **`upsertUser`**: Updated to set `friendRequestsEnabled: true` by default
- **`toggleFriendRequestsEnabled`**: New mutation to toggle messaging preferences
  - Args: `userId`
  - Returns new state

### Updated File: `convex/messages.ts`

- **`sendMessage`**: Enhanced with friendship checking
  - New optional arg: `recipientId`
  - Checks if recipient has `friendRequestsEnabled: false`
  - If disabled, verifies sender and recipient are friends
  - Throws error if non-friend attempts to message restricted user

## UI Components

### 1. **FriendRequests Component**
**File**: `src/components/friend/FriendRequests.tsx`
- Displays pending friend requests received
- Shows sender name, email, and avatar
- Quick accept/decline buttons
- Badge showing count of pending requests

### 2. **UserList Component**
**File**: `src/components/friend/UserList.tsx`
- **Friends Section**: View your friends list with online status
- **Pending Requests Section**: View requests you've sent (expandable)
- **Add Friends Section**: Browse available users to send friend requests to
- Prevent duplicate requests with "Pending" state

### 3. **Profile Page Updates**
**File**: `src/app/(main)/profile/page.tsx`
- Added messaging preference toggle
- ON (default): Anyone can message you
- OFF: Only friends can message you
- Clear description of current setting
- Responsive layout with sidebar on desktop

## Message Input Component Updates

**File**: `src/components/chat/MessageInput.tsx`
- New optional prop: `recipientId`
- Passes recipient ID to `sendMessage` mutation
- Displays user-friendly error message if messaging is restricted

## Chat Page Updates

**File**: `src/app/(main)/chat/[id]/page.tsx`
- Passes `recipientId` only for direct conversations
- For group chats, `recipientId` remains undefined

## User Workflow

### Sending a Friend Request
1. Navigate to profile page
2. Scroll to "Add Friends" section
3. Click "Add" button next to desired user
4. Friend request is sent and shows as "Pending"
5. Recipient receives notification in their friend requests

### Accepting/Declining a Request
1. User sees incoming requests in their profile
2. Click ✓ to accept or ✗ to decline
3. Accepted users appear in friends list
4. Both users can now message each other freely

### Controlling Who Can Message You

#### Enable (Default)
1. Go to profile page
2. Toggle is set to "ON"
3. Anyone can send you direct messages

#### Disable
1. Go to profile page
2. Click toggle to set to "OFF"
3. Only your friends can send you direct messages
4. Non-friends attempting to message receive error

### Attempting to Message a Restricted User
1. Non-friend clicks to start a conversation
2. Tries to send message
3. Gets error: "This user only accepts messages from friends. Send a friend request first."
4. User can then send friend request

## Error Handling

- Duplicate friend request: "Friend request already exists"
- Already friends: "Already friends"
- Invalid request state: "Request is not pending"
- Messaging restricted user: "This user only accepts messages from friends. Send a friend request first."
- User not found: "User not found"

## Default Settings

✅ **New Users**
- `friendRequestsEnabled: true` (can receive messages from anyone)
- Ready to receive friend requests immediately

## Performance Considerations

- Indexed queries on `recipientId`, `senderId`, and user combinations
- Efficient friend checking with bidirectional query support
- Optimized friend list retrieval with set deduplication

## Security Notes

- All mutations require valid user IDs
- Friendship checks prevent unauthorized messaging
- Convex authentication prevents unauthorized API calls
- User can only modify their own messaging preferences

## Future Enhancements

- [ ] Block user functionality
- [ ] Friend request notifications (real-time)
- [ ] Friend suggestion algorithm
- [ ] Bulk friend import from contacts
- [ ] Friend request expiration (auto-decline after 30 days)
- [ ] Message request inbox (separate from friends)
