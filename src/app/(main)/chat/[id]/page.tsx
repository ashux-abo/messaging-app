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
import { useState, useRef, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";

export const dynamic = 'force-dynamic';
export default function ChatPage() {
  const { user } = useUser();
  const params = useParams();
  const conversationId = params.id as string;
  const [replyingTo, setReplyingTo] = useState<Id<"messages"> | null>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement }>({});
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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
  const otherUserId = conversation?.participants?.find(
    (id: any) => id !== currentUser?._id
  );

  const otherUser = useQuery(
    api.users.getUserById,
    otherUserId ? { userId: otherUserId } : "skip"
  );

  const handleReply = (messageId: Id<"messages">) => {
    setReplyingTo(messageId);
    
    // Scroll to the message being replied to
    setTimeout(() => {
      const messageElement = messageRefs.current[messageId];
      if (messageElement && messagesContainerRef.current) {
        messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
        messageElement.classList.add("animate-pulse");
        setTimeout(() => {
          messageElement.classList.remove("animate-pulse");
        }, 2000);
      }
    }, 0);
  };

  if (!currentUser || !conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <MessageSkeleton />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen w-full">
      <ChatHeader
        conversation={conversation}
        otherUser={otherUser || undefined}
        currentUser={currentUser}
      />

      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-white dark:bg-gray-950 p-2 md:p-4 flex flex-col justify-between"
      >
        {messages && messages.length > 0 ? (
          <div className="space-y-3 md:space-y-4">
            {messages.map((message: any) => (
              <div
                key={message._id}
                ref={(el) => {
                  if (el) messageRefs.current[message._id] = el;
                }}
                className={`transition-all duration-300 ${
                  replyingTo === message._id
                    ? "bg-yellow-100 dark:bg-yellow-900/30 rounded-lg px-2 py-1"
                    : ""
                }`}
              >
                <ChatMessage
                  message={message}
                  currentUserId={currentUser?._id}
                  onReply={handleReply}
                />
              </div>
            ))}
            <TypingIndicator
              conversationId={conversationId as any}
              userId={currentUser?._id}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}
      </div>

      <MessageInput
        conversationId={conversationId as any}
        currentUserId={currentUser?._id}
        recipientId={
          conversation.type === "direct" ? otherUserId : undefined
        }
        replyingTo={replyingTo}
        onClearReply={() => setReplyingTo(null)}
      />
    </div>
  );
}
