"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Check, Clock } from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo } from "react";

interface UserWithFriendStatusProps {
  userId: Id<"users">;
}

export function UserList({ userId }: UserWithFriendStatusProps) {
  const [expandedRequests, setExpandedRequests] = useState(false);
  const allUsers = useQuery(api.users.getAllUsers);
  const userFriends = useQuery(api.friendRequests.getFriendsForUser, {
    userId,
  });
  const sentRequests = useQuery(api.friendRequests.getSentFriendRequests, {
    userId,
  });

  const sendFriendRequest = useMutation(api.friendRequests.sendFriendRequest);

  const handleSendFriendRequest = async (recipientId: Id<"users">) => {
    try {
      await sendFriendRequest({ senderId: userId, recipientId });
      toast.success("Friend request sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send friend request");
    }
  };

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
        (user) =>
          user._id !== userId && !friendIds.has(user._id as any)
      ) || [],
    [allUsers, userId, friendIds]
  );

  if (!allUsers || !userFriends) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Friends List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Friends ({userFriends.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {userFriends.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No friends yet. Send a friend request to get started!
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {userFriends.map((friend: any) => (
                <div
                  key={friend._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={friend.imageUrl} />
                    <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{friend.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {friend.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Sent Requests */}
      {sentRequests && sentRequests.length > 0 && (
        <Card>
          <CardHeader
            className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
            onClick={() => setExpandedRequests(!expandedRequests)}
          >
            <CardTitle className="text-lg flex items-center justify-between">
              Pending Requests ({sentRequests.length})
              <Clock className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          {expandedRequests && (
            <CardContent className="space-y-2">
              {sentRequests.map((request) => (
                <div
                  key={request._id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-900"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={request.recipient?.imageUrl} />
                    <AvatarFallback>
                      {request.recipient?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{request.recipient?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Pending...
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Available Users */}
      {availableUsers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Add Friends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.imageUrl} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={sentRequestIds.has(user._id as any)}
                    onClick={() =>
                      handleSendFriendRequest(user._id as Id<"users">)
                    }
                  >
                    {sentRequestIds.has(user._id as any) ? (
                      <>
                        <Clock className="w-4 h-4 mr-1" />
                        Pending
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
