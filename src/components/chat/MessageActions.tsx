"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MoreHorizontal, Trash2, X } from "lucide-react";

interface MessageActionsProps {
  messageId: Id<"messages">;
  currentUserId: Id<"users">;
  messageSenderId: Id<"users">;
  onClose: () => void;
}

export function MessageActions({ 
  messageId, 
  currentUserId, 
  messageSenderId, 
  onClose 
}: MessageActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteMessage = useMutation(api.messages.deleteMessage);

  const isOwnMessage = currentUserId === messageSenderId;

  const handleDelete = async () => {
    try {
      await deleteMessage({ messageId });
      onClose();
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  if (showDeleteConfirm) {
    return (
      <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border border-orange-300 dark:border-orange-700 rounded-lg shadow-lg p-3 z-50 min-w-[200px]">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Delete message?</p>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="p-1 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          This will permanently delete the message for everyone.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="flex-1 px-3 py-1 text-sm border border-orange-300 dark:border-orange-700 rounded hover:bg-orange-100 dark:hover:bg-orange-900/30"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border border-orange-300 dark:border-orange-700 rounded-lg shadow-lg py-1 z-50 min-w-[150px]">
      {isOwnMessage ? (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full px-3 py-2 text-sm text-left hover:bg-orange-100 dark:hover:bg-orange-900/30 flex items-center gap-2 text-red-600 dark:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete for everyone
        </button>
      ) : (
        <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
          No actions available
        </div>
      )}
    </div>
  );
}
