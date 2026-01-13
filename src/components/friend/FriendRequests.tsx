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
    { userId }
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
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          Friend Requests ({pendingRequests.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingRequests.map((request: any) => (
          <div
            key={request._id}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900"
          >
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="w-10 h-10">
                <AvatarImage src={request.sender?.imageUrl} />
                <AvatarFallback>
                  {request.sender?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-sm">{request.sender?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {request.sender?.email}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDecline(request._id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <X className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAccept(request._id)}
                className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <Check className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
