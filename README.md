# Messaging App

A real-time messaging application built with **Next.js 16**, **Clerk** for authentication, **Convex** for the backend database, and **shadcn/ui** for the UI components.

## Features

**Authentication**
- Clerk integration for secure sign-up and sign-in
- Protected routes and user profiles
- Persistent user sessions

**Real-time Messaging**
- Instant message delivery with Convex subscriptions
- Direct messages and group chats
- Message history with pagination
- Typing indicators and online status

**Advanced Features**
- Message reactions (emojis)
- Edit and delete messages
- User search and conversation search
- Dark/light mode toggle
- Responsive mobile-first design
- Error boundaries and skeleton loaders

**Technical Stack**
- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **UI Components**: shadcn/ui powered by Radix UI
- **Authentication**: Clerk
- **Database**: Convex (real-time backend)
- **Styling**: Tailwind CSS with next-themes
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Clerk account (free at [clerk.com](https://clerk.com))
- Convex account (free at [convex.dev](https://convex.dev))

### Installation

1. **Clone the repository**
```bash
git clone [(https://github.com/ashux-abo/messaging-app.git)
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

