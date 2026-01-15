"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AddMemberDialog } from "./AddMemberDialog";

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
  const [showAddMember, setShowAddMember] = useState(false);
  const title = conversation.type === "direct" ? otherUser?.name : conversation.name;
  const isOnline = otherUser?.isOnline;

  return (
    <>
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 md:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <Link href="/chat">
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </Link>

            {conversation.type === "direct" && otherUser && (
              <>
                <Avatar className="h-8 w-8 md:h-10 md:w-10 shrink-0">
                  <AvatarImage src={otherUser.imageUrl} />
                  <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base truncate">
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
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xs md:text-sm shrink-0">
                  {conversation.participants.length}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base truncate">
                    {title}
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {conversation.participants.length} members
                  </p>
                </div>
              </>
            )}
          </div>

          {conversation.type === "group" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAddMember(true)}
              className="h-8 w-8 md:h-10 md:w-10 shrink-0 text-green-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              title="Add member to group"
            >
              <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          )}

        </div>
      </div>

      {showAddMember && (
        <AddMemberDialog
          isOpen={showAddMember}
          onClose={() => setShowAddMember(false)}
          currentUserId={currentUser._id}
          conversationId={conversation._id}
          currentParticipants={conversation.participants}
        />
      )}
    </>
  );
}
