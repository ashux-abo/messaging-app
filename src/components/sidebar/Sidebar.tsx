"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { AvailableUsers } from "@/components/sidebar/AvailableUsers";
import { Plus, MessageSquare } from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllUsers, setShowAllUsers] = useState(false);

  // Get current user's Convex ID
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    isSignedIn && user ? { clerkId: user.id } : "skip"
  );

  // Get conversations for current user
  const conversations = useQuery(
    api.conversations.getConversationsByUserId,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const allUsers = useQuery(api.users.getAllUsers);

  const createConversation = useMutation(api.conversations.getOrCreateDirectConversation);

  const handleStartChat = async (userId: string) => {
    if (!currentUser) return;
    try {
      const conversationId = await createConversation({
        userId1: currentUser._id,
        userId2: userId as any,
      });
      setSearchTerm("");
      setShowAllUsers(false);
      router.push(`/chat/${conversationId}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const filteredConversations =
    conversations?.filter((conv: any) => {
      if (conv.type === "direct") {
        // For direct messages, find the other participant's name
        const otherParticipant = conv.participants.find(
          (id: any) => id !== currentUser?._id
        );
        // Note: In a real app, you'd fetch the user name here
        return true;
      }
      return conv.name?.toLowerCase().includes(searchTerm.toLowerCase());
    }) || [];

  const filteredUsers =
    allUsers?.filter(
      (u: any) =>
        u._id !== currentUser?._id &&
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-blue-600 shrink-0" />
            <h1 className="text-base md:text-lg font-bold text-gray-900 dark:text-white truncate">
              Messages
            </h1>
          </div>
          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            {currentUser && <NotificationCenter userId={currentUser._id} />}
            <ThemeToggle />
          </div>
        </div>

        {/* Search and New Chat */}
        <Input
          placeholder={showAllUsers ? "Search users..." : "Search conversations..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-gray-100 dark:bg-gray-800 border-0 rounded-lg mb-2 text-sm"
        />
        <Button 
          onClick={() => setShowAllUsers(!showAllUsers)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showAllUsers ? "Hide Users" : "New Chat"}
        </Button>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Available Users Section */}
          {currentUser && <AvailableUsers currentUserId={currentUser._id} />}
          
          {currentUser && <Separator className="my-2" />}

          {showAllUsers && (
            <>
              <p className="px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                ALL USERS
              </p>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u: any) => (
                  <button
                    key={u._id}
                    onClick={() => {
                      handleStartChat(u._id as string);
                      onClose?.();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-xs md:text-sm text-gray-900 dark:text-white mb-1"
                  >
                    <div className="font-medium truncate">{u.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {u.email}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                  No users found
                </div>
              )}
              <Separator className="my-2" />
            </>
          )}

          {!showAllUsers && searchTerm && filteredUsers.length > 0 && (
            <>
              <p className="px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                USERS
              </p>
              {filteredUsers.map((u: any) => (
                <button
                  key={u._id}
                  onClick={() => {
                    handleStartChat(u._id as string);
                    onClose?.();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-xs md:text-sm text-gray-900 dark:text-white mb-1"
                >
                  <div className="font-medium truncate">{u.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {u.email}
                  </div>
                </button>
              ))}
              <Separator className="my-2" />
            </>
          )}

          {!showAllUsers && filteredConversations.length > 0 ? (
            <>
              <p className="px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                CONVERSATIONS
              </p>
              {filteredConversations.map((conv: any) => (
                <Link
                  key={conv._id}
                  href={`/chat/${conv._id}`}
                  onClick={() => onClose?.()}
                  className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 mb-1 group"
                >
                  <div className="font-medium text-gray-900 dark:text-white text-xs md:text-sm truncate">
                    {conv.name || "Direct Message"}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {conv.participants.length} participants
                  </div>
                </Link>
              ))}
            </>
          ) : (
            !showAllUsers && (
              <div className="px-3 py-8 text-center text-gray-600 dark:text-gray-400">
                <p className="text-xs md:text-sm">No conversations yet</p>
                <p className="text-xs">Click "New Chat" to start messaging</p>
              </div>
            )
          )}
        </div>
      </ScrollArea>

      {/* User Profile */}
      {currentUser && (
        <div className="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/profile"
            onClick={() => onClose?.()}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <img
              src={currentUser.imageUrl}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {currentUser.email}
              </p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
