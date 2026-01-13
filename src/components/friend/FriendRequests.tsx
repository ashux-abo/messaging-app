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
      <CardHeader className="pb-3 p-3 md:p-6">
        <CardTitle className="text-base md:text-lg">
          Friend Requests ({pendingRequests.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-3 md:p-6 pt-0 md:pt-0">
        {pendingRequests.map((request: any) => (
          <div
            key={request._id}
            className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-gray-50 dark:bg-gray-900 gap-2"
          >
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <Avatar className="w-8 h-8 md:w-10 md:h-10 shrink-0">
                <AvatarImage src={request.sender?.imageUrl} />
                <AvatarFallback>
                  {request.sender?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs md:text-sm truncate">{request.sender?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {request.sender?.email}
                </p>
              </div>
            </div>
            <div className="flex gap-1 md:gap-2 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDecline(request._id)}
                className="h-7 w-7 md:h-8 md:w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <X className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAccept(request._id)}
                className="h-7 w-7 md:h-8 md:w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <Check className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
