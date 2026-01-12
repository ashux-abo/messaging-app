"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface TypingIndicatorProps {
  conversationId: Id<"conversations">;
  userId?: Id<"users">;
}

export function TypingIndicator({
  conversationId,
  userId,
}: TypingIndicatorProps) {
  const typingUsers = useQuery(api.typing.getTypingUsers, {
    conversationId,
  });

  const displayUsers = typingUsers?.filter((u: any) => u && u._id !== userId);

  if (!displayUsers || displayUsers.length === 0) {
    return null;
  }

  const typingText =
    displayUsers.length === 1
      ? `${displayUsers[0].name} is typing`
      : displayUsers.length === 2
        ? `${displayUsers[0].name} and ${displayUsers[1].name} are typing`
        : `${displayUsers.length} people are typing`;

  return (
    <div className="text-xs text-gray-600 dark:text-gray-400 italic">
      {typingText}
    </div>
  );
}
