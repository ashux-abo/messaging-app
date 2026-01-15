"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMemo } from "react";

interface AvailableUsersProps {
  currentUserId: Id<"users">;
}

export function AvailableUsers({ currentUserId }: AvailableUsersProps) {
  const router = useRouter();
  const allUsers = useQuery(api.users.getAllUsers);
  const userFriends = useQuery(api.friendRequests.getFriendsForUser, {
    userId: currentUserId,
  });
  const sentRequests = useQuery(api.friendRequests.getSentFriendRequests, {
    userId: currentUserId,
  });
  
  const sendFriendRequest = useMutation(api.friendRequests.sendFriendRequest);
  const createConversation = useMutation(
    api.conversations.getOrCreateDirectConversation
  );

  const friendIds = useMemo(
    () => new Set(userFriends?.map((f) => f._id)),
    [userFriends]
  );
  
  const sentRequestIds = useMemo(
    () => new Set(sentRequests?.map((r) => r.recipientId)),
    [sentRequests]
  );

  // Filter out self and friends
  const availableUsers = useMemo(
    () =>
      allUsers?.filter(
        (user: any) =>
          user._id !== currentUserId && !friendIds.has(user._id as any)
      ) || [],
    [allUsers, currentUserId, friendIds]
  );

  const handleSendFriendRequest = async (recipientId: Id<"users">) => {
    try {
      await sendFriendRequest({ senderId: currentUserId, recipientId });
      toast.success("Friend request sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send friend request");
    }
  };

  const handleStartChat = async (userId: Id<"users">) => {
    try {
      const conversationId = await createConversation({
        userId1: currentUserId,
        userId2: userId,
      });
      router.push(`/chat/${conversationId}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      toast.error("Failed to start conversation");
    }
  };

  if (!allUsers || !userFriends || availableUsers.length === 0) {
    return null;
  }

  return (
    <div className="px-2 pb-2">
      <p className="px-2 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
        AVAILABLE USERS
      </p>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {availableUsers.map((user: any) => (
          <div
            key={user._id}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Avatar className="w-7 h-7 md:w-8 md:h-8 shrink-0">
              <AvatarImage src={user.imageUrl} />
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              {sentRequestIds.has(user._id as any) ? (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled
                  className="h-7 w-7 md:h-8 md:w-8 p-0"
                  title="Friend request pending"
                >
                  <Clock className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSendFriendRequest(user._id as Id<"users">)}
                    className="h-7 w-7 md:h-8 md:w-8 p-0 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    title="Send friend request"
                  >
                    <UserPlus className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleStartChat(user._id as Id<"users">)}
                    className="h-7 px-2 md:h-8 text-xs bg-green-600 hover:bg-green-700"
                    title="Start conversation"
                  >
                    Chat
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
