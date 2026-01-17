"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, Clock, MessageCircle } from "lucide-react";
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
    <div className="pb-2">
      <p className="px-2 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
        AVAILABLE USERS
      </p>
      <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
        {availableUsers.map((user: any) => (
          <div
            key={user._id}
            className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Avatar className="w-7 h-7 shrink-0">
              <AvatarImage src={user.imageUrl} />
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 overflow-hidden mr-1">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate leading-tight">
                {user.name}
              </p>
            </div>
            <div className="flex gap-0.5 shrink-0">
              {sentRequestIds.has(user._id as any) ? (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled
                  className="h-7 w-7 p-0 min-w-[28px]"
                  title="Pending"
                >
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSendFriendRequest(user._id as Id<"users">)}
                    className="h-7 w-7 p-0 min-w-[28px] text-emerald-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    title="Add friend"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleStartChat(user._id as Id<"users">)}
                    className="h-7 w-7 p-0 min-w-[28px] bg-emerald-600 hover:bg-emerald-700"
                    title="Chat"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
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