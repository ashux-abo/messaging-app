# Messaging App

A real-time messaging application built with **Next.js 16**, **Clerk** for authentication, **Convex** for the backend database, and **shadcn/ui** for the UI components.

## Features

✅ **Authentication**
- Clerk integration for secure sign-up and sign-in
- Protected routes and user profiles
- Persistent user sessions

✅ **Real-time Messaging**
- Instant message delivery with Convex subscriptions
- Direct messages and group chats
- Message history with pagination
- Typing indicators and online status

✅ **Advanced Features**
- Message reactions (emojis)
- Edit and delete messages
- User search and conversation search
- Dark/light mode toggle
- Responsive mobile-first design
- Error boundaries and skeleton loaders

✅ **Technical Stack**
- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **UI Components**: shadcn/ui powered by Radix UI
- **Authentication**: Clerk
- **Database**: Convex (real-time backend)
- **Styling**: Tailwind CSS with next-themes
- **State Management**: Zustand
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Clerk account (free at [clerk.com](https://clerk.com))
- Convex account (free at [convex.dev](https://convex.dev))

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd messaging-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory with:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
CLERK_SECRET_KEY=<your-clerk-secret-key>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Convex Database
CONVEX_DEPLOYMENT=<your-convex-deployment>
NEXT_PUBLIC_CONVEX_URL=https://<your-deployment>.convex.cloud
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (auth)/               # Authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (main)/               # Protected routes
│   │   ├── chat/[id]/        # Chat conversation page
│   │   ├── profile/          # User profile page
│   │   └── layout.tsx        # Main layout with sidebar
│   ├── api/                  # API routes
│   ├── hooks/                # Custom hooks
│   ├── globals.css           # Global styles
│   └── layout.tsx            # Root layout
├── components/
│   ├── chat/                 # Chat components
│   ├── sidebar/              # Sidebar navigation
│   ├── shared/               # Shared components (theme toggle, error boundary)
│   └── ui/                   # shadcn/ui components
├── hooks/                    # Custom React hooks
└── lib/                      # Utilities
convex/
├── schema.ts                 # Convex database schema
├── users.ts                  # User queries/mutations
├── conversations.ts          # Conversation management
├── messages.ts               # Message operations
├── typing.ts                 # Typing indicators
└── search.ts                 # Search functionality
```

## Core Functionality

### Authentication
- Users sign up/sign in via Clerk
- User data is stored in Convex on first login
- Protected routes redirect to sign-in when unauthenticated

### Real-time Chat
- Create direct messages with other users
- Create group conversations
- Send, edit, and delete messages
- React to messages with emojis
- See typing indicators from other users
- View online/offline status

### User Experience
- Dark/light mode toggle
- Responsive mobile-first design
- Error handling with error boundaries
- Skeleton loaders for async content
- Toast notifications for feedback

## Available Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack

# Production
npm run build        # Build for production
npm start           # Start production server

# Linting
npm run lint        # Run ESLint

# Convex
npx convex dev      # Start Convex dev server
npx convex deploy   # Deploy Convex backend to production
```

## API & Convex Functions

### Users
- `upsertUser`: Create or update user
- `getUserByClerkId`: Get user by Clerk ID
- `getAllUsers`: Get all users
- `setUserOnline`: Update online status

### Conversations
- `createConversation`: Create new conversation
- `getConversation`: Get conversation details
- `getConversationsByUserId`: Get user's conversations
- `getOrCreateDirectConversation`: Get or create 1:1 conversation
- `addParticipantToGroup`: Add user to group chat
- `removeParticipantFromGroup`: Remove user from group chat

### Messages
- `sendMessage`: Send a new message
- `getMessages`: Get all messages in conversation
- `getMessagesPaginated`: Get paginated messages (20 per page)
- `editMessage`: Edit a message
- `deleteMessage`: Delete a message
- `addReaction`: Add emoji reaction to message
- `watchMessages`: Real-time message subscription

### Typing & Search
- `setTyping`: Broadcast typing status
- `getTypingUsers`: Get users currently typing
- `searchMessages`: Search messages in conversation
- `searchConversations`: Search conversations by name

## Deployment

### Deploy to Vercel
```bash
npm run build
git push origin main  # Automatically deploys via Vercel
```

### Deploy Convex Backend
```bash
npx convex deploy
```

## Environment Variables

Required environment variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in page URL |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up page URL |
| `CONVEX_DEPLOYMENT` | Convex deployment ID |
| `NEXT_PUBLIC_CONVEX_URL` | Convex cloud URL |

## Performance & Scalability

- **Real-time subscriptions**: Uses Convex's built-in real-time capabilities
- **Pagination**: Messages paginated to reduce initial load
- **Optimized re-renders**: React hooks and Convex queries minimize unnecessary updates
- **Code splitting**: Next.js automatic code splitting for faster page loads
- **Image optimization**: Next.js Image component for optimized assets

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues or questions:
- Open a GitHub issue
- Check [Clerk documentation](https://clerk.com/docs)
- Check [Convex documentation](https://convex.dev/docs)
- Check [Next.js documentation](https://nextjs.org/docs)

## Roadmap

- [ ] Voice/video calling
- [ ] File/image upload with cloud storage
- [ ] Message encryption
- [ ] User blocking
- [ ] Message pinning
- [ ] Read receipts
- [ ] Push notifications
- [ ] Mobile app (React Native)


This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
