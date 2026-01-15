"use client";

import { SidebarContent } from "./SidebarContent";
import { Id } from "@/convex/_generated/dataModel";

interface SidebarProps {
  onClose?: () => void;
  onShowSelectMembers?: () => void;
  onCurrentUserIdChange?: (userId: Id<"users">) => void;
}

export function Sidebar({ onClose, onShowSelectMembers, onCurrentUserIdChange }: SidebarProps) {
  return (
    <SidebarContent 
      onClose={onClose}
      onShowSelectMembers={onShowSelectMembers}
      onCurrentUserIdChange={onCurrentUserIdChange}
    />
  );
}
