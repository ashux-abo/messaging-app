"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MoreHorizontal, Trash2, X, Edit2 } from "lucide-react";
import { toast } from "sonner";

interface MessageActionsProps {
  messageId: Id<"messages">;
  currentUserId: Id<"users">;
  messageSenderId: Id<"users">;
  messageContent: string;
  onClose: () => void;
  onEdit?: (newContent: string) => void;
}

export function MessageActions({ 
  messageId, 
  currentUserId, 
  messageSenderId,
  messageContent,
  onClose,
  onEdit
}: MessageActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditMode, setShowEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(messageContent);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const editMessage = useMutation(api.messages.editMessage);

  const isOwnMessage = currentUserId === messageSenderId;

  const handleDelete = async () => {
    try {
      await deleteMessage({ messageId });
      onClose();
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleEditSave = async () => {
    if (!editedContent.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    if (editedContent === messageContent) {
      toast.info("No changes made");
      setShowEditMode(false);
      return;
    }

    try {
      await editMessage({ messageId, content: editedContent.trim() });
      if (onEdit) {
        onEdit(editedContent.trim());
      }
      toast.success("Message edited successfully");
      setShowEditMode(false);
      onClose();
    } catch (error) {
      console.error("Failed to edit message:", error);
      toast.error("Failed to edit message");
    }
  };

  const handleEditCancel = () => {
    setEditedContent(messageContent);
    setShowEditMode(false);
  };

  if (showEditMode) {
    return (
      <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border border-orange-300 dark:border-orange-700 rounded-lg shadow-lg p-3 z-50 w-64 max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Edit message</p>
          <button
            onClick={handleEditCancel}
            className="p-1 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
          rows={3}
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={handleEditCancel}
            className="flex-1 px-3 py-1 text-sm border border-orange-300 dark:border-orange-700 rounded hover:bg-orange-100 dark:hover:bg-orange-900/30"
          >
            Cancel
          </button>
          <button
            onClick={handleEditSave}
            className="flex-1 px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

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
        <>
          <button
            onClick={() => setShowEditMode(true)}
            className="w-full px-3 py-2 text-sm text-left hover:bg-orange-100 dark:hover:bg-orange-900/30 flex items-center gap-2 text-orange-600 dark:text-orange-400 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit message
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full px-3 py-2 text-sm text-left hover:bg-orange-100 dark:hover:bg-orange-900/30 flex items-center gap-2 text-red-600 dark:text-red-400 transition-colors border-t border-gray-200 dark:border-gray-700"
          >
            <Trash2 className="w-4 h-4" />
            Delete for everyone
          </button>
        </>
      ) : (
        <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
          No actions available
        </div>
      )}
    </div>
  );
}
