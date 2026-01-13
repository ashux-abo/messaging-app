"use client";

import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { FriendRequests } from "@/components/friend/FriendRequests";
import { UserList } from "@/components/friend/UserList";

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isTogglingMessaging, setIsTogglingMessaging] = useState(false);
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );
  const toggleFriendRequests = useMutation(
    api.users.toggleFriendRequestsEnabled
  );

  const handleToggleFriendRequests = async () => {
    if (!currentUser) return;
    setIsTogglingMessaging(true);
    try {
      const newState = await toggleFriendRequests({ userId: currentUser._id });
      toast.success(
        newState
          ? "Direct messaging enabled for non-friends"
          : "Direct messaging disabled - only friends can message you"
      );
    } catch (error) {
      toast.error("Failed to update messaging preferences");
    } finally {
      setIsTogglingMessaging(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 md:p-4 pt-16 md:pt-4">
      <Link href="/chat">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Chat
        </Button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {/* Profile Card */}
        {currentUser && (
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-3 md:p-6">
                {/* Avatar */}
                <div className="flex justify-center">
                  <Avatar className="w-20 h-20 md:w-24 md:h-24">
                    <AvatarImage src={currentUser.imageUrl} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>

                {/* User Info */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      Name
                    </label>
                    <p className="text-base md:text-lg font-medium text-gray-900 dark:text-white">
                      {currentUser.name}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      Email
                    </label>
                    <p className="text-base md:text-lg font-medium text-gray-900 dark:text-white break-all">
                      {currentUser.email}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      Status
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          currentUser.isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                      <p className="text-base md:text-lg font-medium text-gray-900 dark:text-white">
                        {currentUser.isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      Last Seen
                    </label>
                    <p className="text-xs md:text-base font-medium text-gray-900 dark:text-white">
                      {new Date(currentUser.lastSeen).toLocaleString()}
                    </p>
                  </div>

                  {/* Messaging Preferences */}
                  <div className="border-t pt-4">
                    <div className="flex items-start md:items-center justify-between gap-3">
                      <div className="flex-1">
                        <label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                          Allow direct messages from non-friends
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {currentUser.friendRequestsEnabled
                            ? "Anyone can message you directly"
                            : "Only friends can message you"}
                        </p>
                      </div>
                      <Button
                        onClick={handleToggleFriendRequests}
                        disabled={isTogglingMessaging}
                        variant={
                          currentUser.friendRequestsEnabled
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className="shrink-0"
                      >
                        {currentUser.friendRequestsEnabled ? "ON" : "OFF"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Sign Out Button */}
                <Button
                  onClick={() => {
                    signOut();
                    router.push("/");
                  }}
                  variant="destructive"
                  className="w-full text-sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Friend Requests and User List Sidebar */}
        {currentUser && (
          <div className="md:col-span-1 space-y-3 md:space-y-4">
            <FriendRequests userId={currentUser._id} />
            <UserList userId={currentUser._id} />
          </div>
        )}
      </div>
    </div>
  );
}
