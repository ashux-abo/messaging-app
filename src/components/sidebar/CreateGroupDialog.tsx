"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: Id<"users">;
  selectedUsers: Id<"users">[];
}

export function CreateGroupDialog({ isOpen, onClose, currentUserId, selectedUsers }: CreateGroupDialogProps) {
  const [groupName, setGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const allUsers = useQuery(api.users.getAllUsers);
  const createGroupConversation = useMutation(api.conversations.createConversation);

  // Get details of selected users
  const selectedUserDetails = allUsers?.filter((user: any) => 
    selectedUsers.includes(user._id as Id<"users">)
  ) || [];

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 2) return;

    setIsCreating(true);
    try {
      await createGroupConversation({
        type: "group",
        name: groupName.trim(),
        participants: selectedUsers,
        creatorId: currentUserId,
      });
      onClose();
      setGroupName("");
    } catch (error) {
      console.error("Failed to create group:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-400" />
            Create Group Chat
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Group Name
            </label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="w-full"
              disabled={isCreating}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Members ({selectedUsers.length})
            </p>
            <div className="max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
              {selectedUserDetails.length > 0 ? (
                selectedUserDetails.map((user: any) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-2 p-2 rounded bg-white dark:bg-gray-600"
                  >
                    <Avatar className="w-6 h-6 shrink-0">
                      <AvatarImage src={user.imageUrl} />
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {user.name}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No users selected. Select at least 2 users to create a group.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedUsers.length < 2 || isCreating}
              className="flex-1 bg-orange-300 hover:bg-orange-500"
            >
              {isCreating ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
