"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface AddMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: Id<"users">;
  conversationId: Id<"conversations">;
  currentParticipants: Id<"users">[];
}

export function AddMemberDialog({
  isOpen,
  onClose,
  currentUserId,
  conversationId,
  currentParticipants,
}: AddMemberDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);

  const allUsers = useQuery(api.users.getAllUsers);
  const addParticipantToGroup = useMutation(api.conversations.addParticipantToGroup);

  // Filter users that are not already in the group
  const availableUsers = useMemo(
    () =>
      allUsers?.filter(
        (user: any) =>
          user._id !== currentUserId &&
          !currentParticipants.includes(user._id as Id<"users">) &&
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [],
    [allUsers, currentUserId, currentParticipants, searchTerm]
  );

  const handleSelectUser = (userId: Id<"users">) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user to add");
      return;
    }

    try {
      for (const userId of selectedUsers) {
        await addParticipantToGroup({
          conversationId,
          userId,
        });
      }
      toast.success(`Added ${selectedUsers.length} member(s) to the group!`);
      setSelectedUsers([]);
      setSearchTerm("");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to add members");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-green-600" />
            Add Members to Group
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
              Search Users
            </label>
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Available Users
            </p>
            <div className="max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
              {availableUsers.length > 0 ? (
                availableUsers.map((user: any) => (
                  <div
                    key={user._id}
                    onClick={() => handleSelectUser(user._id)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUsers.includes(user._id)
                        ? "bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-400"
                        : "bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => {}}
                      className="w-4 h-4 text-orange-600 rounded cursor-pointer"
                    />
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={user.imageUrl} />
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No available users found
                </p>
              )}
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected ({selectedUsers.length})
              </p>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedUsers.length} user(s) selected to add to the group
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMembers}
              disabled={selectedUsers.length === 0}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              Add Members
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
