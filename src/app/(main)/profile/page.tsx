"use client";

import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Link href="/chat">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Chat
        </Button>
      </Link>

      {currentUser && (
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex justify-center">
              <Avatar className="w-24 h-24">
                <AvatarImage src={currentUser.imageUrl} />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>

            {/* User Info */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Name
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {currentUser.name}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Email
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {currentUser.email}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Status
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      currentUser.isOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {currentUser.isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Last Seen
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {new Date(currentUser.lastSeen).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Sign Out Button */}
            <Button
              onClick={handleSignOut}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
