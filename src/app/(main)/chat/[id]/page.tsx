"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { MessageInput } from "@/components/chat/MessageInput";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageSkeleton } from "@/components/chat/MessageSkeleton";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { useParams } from "next/navigation";

export default function ChatPage() {
  const { user } = useUser();
  const params = useParams();
  const conversationId = params.id as string;

  // Get current user
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  // Get conversation details
  const conversation = useQuery(
    api.conversations.getConversation,
    conversationId ? { conversationId: conversationId as any } : "skip"
  );

  // Get messages (real-time)
  const messages = useQuery(
    api.messages.watchMessages,
    conversationId ? { conversationId: conversationId as any } : "skip"
  );

  // Get other user info for direct messages
  const otherUserId = conversation?.participants.find(
    (id: any) => id !== currentUser?._id
  );

  const otherUser = useQuery(
    api.users.getUserById,
    otherUserId ? { userId: otherUserId } : "skip"
  );

  if (!currentUser || !conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <MessageSkeleton />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      <ChatHeader
        conversation={conversation}
        otherUser={otherUser || undefined}
        currentUser={currentUser}
      />

      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-950 p-4 flex flex-col justify-between">
        {messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message: any) => (
              <ChatMessage
                key={message._id}
                message={message}
                currentUserId={currentUser._id}
              />
            ))}
            <TypingIndicator
              conversationId={conversationId as any}
              userId={currentUser._id}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600 dark:text-gray-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}
      </div>

      <MessageInput
        conversationId={conversationId as any}
        currentUserId={currentUser._id}
        recipientId={
          conversation.type === "direct" ? otherUserId : undefined
        }
      />
    </div>
  );
}
