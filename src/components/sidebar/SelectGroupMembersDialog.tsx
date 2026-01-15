"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { useMemo } from "react";

interface SelectGroupMembersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: Id<"users">;
  selectedUsers: Id<"users">[];
  onSelectedUsersChange: (users: Id<"users">[]) => void;
  onCreateClick: () => void;
}

export function SelectGroupMembersDialog({
  isOpen,
  onClose,
  currentUserId,
  selectedUsers,
  onSelectedUsersChange,
  onCreateClick,
}: SelectGroupMembersDialogProps) {
  const allUsers = useQuery(api.users.getAllUsers);

  const availableUsers = useMemo(
    () =>
      allUsers?.filter(
        (user: any) => user._id !== currentUserId
      ) || [],
    [allUsers, currentUserId]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 pointer-events-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md flex flex-col max-h-[80vh] pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select Members
          </h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={onCreateClick}
              disabled={selectedUsers.length < 2}
              className="bg-emerald-600 hover:bg-emerald-700 text-sm"
            >
              Create
            </Button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Users List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {availableUsers.length > 0 ? (
              availableUsers.map((user: any) => (
                <button
                  key={user._id}
                  onClick={() => {
                    if (selectedUsers.includes(user._id as Id<"users">)) {
                      onSelectedUsersChange(
                        selectedUsers.filter(id => id !== user._id)
                      );
                    } else {
                      onSelectedUsersChange([
                        ...selectedUsers,
                        user._id as Id<"users">,
                      ]);
                    }
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    selectedUsers.includes(user._id as Id<"users">)
                      ? "bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-600"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                      selectedUsers.includes(user._id as Id<"users">)
                        ? "bg-orange-600 border-orange-600"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {selectedUsers.includes(user._id as Id<"users">) && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>

                  {/* User Info */}
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
                </button>
              ))
            ) : (
              <div className="px-3 py-8 text-center text-gray-600 dark:text-gray-400">
                No users available
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer - Selected Count */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {selectedUsers.length} selected
          </p>
        </div>
      </div>
    </div>
  );
}
