"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { toast } from "sonner";

interface EditGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: Id<"conversations">;
  currentGroupName: string;
  currentUserId: Id<"users">;
}

export function EditGroupDialog({
  isOpen,
  onClose,
  conversationId,
  currentGroupName,
  currentUserId,
}: EditGroupDialogProps) {
  const [groupName, setGroupName] = useState(currentGroupName);
  const [isLoading, setIsLoading] = useState(false);
  const updateConversationName = useMutation(api.conversations.updateConversationName);

  const handleSave = async () => {
    if (!groupName.trim()) {
      toast.error("Group name cannot be empty");
      return;
    }

    if (groupName === currentGroupName) {
      toast.info("No changes made");
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await updateConversationName({
        conversationId,
        userId: currentUserId,
        newName: groupName.trim(),
      });
      toast.success("Group name updated successfully");
      onClose();
    } catch (error) {
      console.error("Failed to update group name:", error);
      toast.error("Failed to update group name");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setGroupName(currentGroupName);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Group Name</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="group-name" className="text-sm font-medium">
              Group Name
            </label>
            <Input
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="col-span-3"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
