"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { SelectGroupMembersDialog } from "@/components/sidebar/SelectGroupMembersDialog";
import { CreateGroupDialog } from "@/components/sidebar/CreateGroupDialog";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { Id } from "@/convex/_generated/dataModel";

interface MainLayoutContentProps {
  children: ReactNode;
}

export function MainLayoutContent({ children }: MainLayoutContentProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSelectMembers, setShowSelectMembers] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);
  const [currentUserId, setCurrentUserId] = useState<Id<"users"> | null>(null);

  return (
    <div className="flex h-screen bg-white dark:bg-black">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <ErrorBoundary>
        <div
          className={`fixed md:static inset-y-0 left-0 z-40 transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <Sidebar 
            onClose={() => setSidebarOpen(false)}
            onShowSelectMembers={() => {
              setShowSelectMembers(true);
              setSelectedUsers([]);
            }}
            onCurrentUserIdChange={setCurrentUserId}
          />
        </div>
      </ErrorBoundary>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <ErrorBoundary>
        <main className="flex-1 flex flex-col w-full md:w-auto">{children}</main>
      </ErrorBoundary>

      {/* Dialogs - Rendered at top level to avoid clipping */}
      {currentUserId && (
        <>
          <SelectGroupMembersDialog
            isOpen={showSelectMembers}
            onClose={() => {
              setShowSelectMembers(false);
              setSelectedUsers([]);
            }}
            currentUserId={currentUserId}
            selectedUsers={selectedUsers}
            onSelectedUsersChange={setSelectedUsers}
            onCreateClick={() => {
              setShowSelectMembers(false);
              setShowCreateGroup(true);
            }}
          />

          <CreateGroupDialog
            isOpen={showCreateGroup}
            onClose={() => {
              setShowCreateGroup(false);
              setSelectedUsers([]);
            }}
            currentUserId={currentUserId}
            selectedUsers={selectedUsers}
          />
        </>
      )}
    </div>
  );
}
