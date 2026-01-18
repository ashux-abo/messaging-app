"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

interface FriendRequestsProps {
  userId: Id<"users">;
}

export function FriendRequests({ userId }: FriendRequestsProps) {
  const pendingRequests = useQuery(
    api.friendRequests.getPendingFriendRequests,
    { userId },
  );
  const acceptRequest = useMutation(api.friendRequests.acceptFriendRequest);
  const declineRequest = useMutation(api.friendRequests.declineFriendRequest);

  const handleAccept = async (requestId: Id<"friendRequests">) => {
    try {
      await acceptRequest({ requestId });
      toast.success("Friend request accepted!");
    } catch (error) {
      toast.error("Failed to accept request");
    }
  };

  const handleDecline = async (requestId: Id<"friendRequests">) => {
    try {
      await declineRequest({ requestId });
      toast.success("Friend request declined");
    } catch (error) {
      toast.error("Failed to decline request");
    }
  };

  if (!pendingRequests || pendingRequests.length === 0) {
    return null;
  }

  return (
    <Card className="mb-3">
      <CardHeader className="pb-2 p-3">
        <CardTitle className="text-base">
          Friend Requests ({pendingRequests.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {pendingRequests.map((request: any) => (
            <div
              key={request._id}
              className="flex flex-col gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={request.sender?.imageUrl} />
                  <AvatarFallback>
                    {request.sender?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs truncate">
                    {request.sender?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {request.sender?.email}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAccept(request._id)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-7 text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDecline(request._id)}
                  className="flex-1 h-7 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                >
                  <X className="w-3 h-3 mr-1" />
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
