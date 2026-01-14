"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Smile } from "lucide-react";

interface ReactionPickerProps {
  messageId: Id<"messages">;
  currentUserId: Id<"users">;
  isCurrentUser: boolean;
  onClose: () => void;
}

const COMMON_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

export function ReactionPicker({ messageId, currentUserId, isCurrentUser, onClose }: ReactionPickerProps) {
  const addReaction = useMutation(api.messages.addReaction);

  const handleReaction = async (emoji: string) => {
    try {
      await addReaction({
        messageId,
        userId: currentUserId,
        emoji,
      });
      onClose();
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  };

  return (
    <div className={`absolute bottom-full mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex gap-1 z-50 ${
      isCurrentUser ? "right-0" : "left-0"
    }`}>
      {COMMON_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleReaction(emoji)}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-lg"
          title={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
