"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { X } from "lucide-react";

interface ReplyPreviewProps {
  repliedToMessageId: Id<"messages">;
  onRemoveReply: () => void;
}

export function ReplyPreview({ repliedToMessageId, onRemoveReply }: ReplyPreviewProps) {
  const originalMessage = useQuery(api.messages.getMessageById, {
    messageId: repliedToMessageId,
  });

  const sender = useQuery(
    api.users.getUserById,
    originalMessage?.senderId ? { userId: originalMessage.senderId } : "skip"
  );

  if (!originalMessage || !sender) {
    return null;
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 px-3 py-2 rounded flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
          Replying to {sender.name}
        </p>
        <p className="text-xs text-gray-700 dark:text-gray-300 truncate">
          {originalMessage.content}
        </p>
      </div>
      <button
        onClick={onRemoveReply}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
