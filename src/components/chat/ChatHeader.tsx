"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical } from "lucide-react";
import Link from "next/link";

interface ChatHeaderProps {
  conversation: Doc<"conversations">;
  otherUser?: Doc<"users">;
  currentUser: Doc<"users">;
}

export function ChatHeader({
  conversation,
  otherUser,
  currentUser,
}: ChatHeaderProps) {
  const title = conversation.type === "direct" ? otherUser?.name : conversation.name;
  const isOnline = otherUser?.isOnline;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/chat">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>

          {conversation.type === "direct" && otherUser && (
            <>
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser.imageUrl} />
                <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {title}
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </>
          )}

          {conversation.type === "group" && (
            <>
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                {conversation.participants.length}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {title}
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {conversation.participants.length} members
                </p>
              </div>
            </>
          )}
        </div>

        <Button variant="ghost" size="icon">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
