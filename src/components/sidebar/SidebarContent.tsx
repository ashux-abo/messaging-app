"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { AvailableUsers } from "@/components/sidebar/AvailableUsers";
import { Plus, Users, Search } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface SidebarContentProps {
  onClose?: () => void;
  onShowSelectMembers?: () => void;
  onCurrentUserIdChange?: (userId: Id<"users">) => void;
}

export function SidebarContent({
  onClose,
  onShowSelectMembers,
  onCurrentUserIdChange,
}: SidebarContentProps) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllUsers, setShowAllUsers] = useState(false);

  const shouldFetchUser = isSignedIn && user;
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    shouldFetchUser ? { clerkId: user!.id } : "skip",
  );

  const upsertUser = useMutation(api.users.upsertUser);

  useEffect(() => {
    if (isSignedIn && user && currentUser === null) {
      upsertUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || "Anonymous",
        imageUrl: user.imageUrl || "",
      });
    }
  }, [isSignedIn, user, currentUser, upsertUser]);

  useEffect(() => {
    if (currentUser?._id) {
      onCurrentUserIdChange?.(currentUser._id);
    }
  }, [currentUser?._id, onCurrentUserIdChange]);

  const conversations = useQuery(
    api.conversations.getConversationsByUserId,
    currentUser ? { userId: currentUser._id } : "skip",
  );

  const allUsers = useQuery(api.users.getAllUsers);
  const createConversation = useMutation(
    api.conversations.getOrCreateDirectConversation,
  );

  const handleStartChat = async (userId: string) => {
    if (!currentUser) return;
    try {
      const conversationId = await createConversation({
        userId1: currentUser._id,
        userId2: userId as any,
      });
      setSearchTerm("");
      setShowAllUsers(false);
      router.push(`/chat/${conversationId}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const filteredConversations =
    conversations?.filter((conv: any) => {
      if (conv.type === "direct") {
        const otherParticipant = conv.participants.find(
          (id: any) => id !== currentUser?._id,
        );
        return true;
      }
      return conv.name?.toLowerCase().includes(searchTerm.toLowerCase());
    }) || [];

  const filteredUsers =
    allUsers?.filter(
      (u: any) =>
        u._id !== currentUser?._id &&
        u.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  return (
    <div className="w-64 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header - Fixed height */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Image
              src="/koneksyon.svg"
              alt="KONEKSYON"
              width={32}
              height={32}
              className="w-8 h-8 border-2 rounded-1xl"
            />
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Messages
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {currentUser && <NotificationCenter userId={currentUser._id} />}
            <ThemeToggle />
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={showAllUsers ? "Search users..." : "Search..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg text-sm h-10"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={() => setShowAllUsers(!showAllUsers)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-10 rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showAllUsers ? "Hide Users" : "New Chat"}
          </Button>

          {currentUser && !showAllUsers && (
            <Button
              onClick={() => {
                onShowSelectMembers?.();
              }}
              variant="outline"
              className="w-full text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-sm h-10 rounded-lg"
            >
              <Users className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          )}
        </div>
      </div>

      {/* Scrollable Content Area - Takes remaining space */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3">
            {/* Available Users Section */}
            {currentUser && <AvailableUsers currentUserId={currentUser._id} />}

            {currentUser && (
              <Separator className="my-3 bg-gray-200 dark:bg-gray-800" />
            )}

            {!showAllUsers && searchTerm && filteredUsers.length > 0 && (
              <>
                <p className="px-2 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Users
                </p>
                {filteredUsers.map((u: any) => (
                  <button
                    key={u._id}
                    onClick={() => {
                      handleStartChat(u._id as string);
                      onClose?.();
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm mb-1 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={u.imageUrl}
                        alt={u.name}
                        className="w-9 h-9 rounded-full ring-2 ring-gray-100 dark:ring-gray-800"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {u.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                <Separator className="my-3 bg-gray-200 dark:bg-gray-800" />
              </>
            )}

            {!showAllUsers && filteredConversations.length > 0 ? (
              <>
                <p className="px-2 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Messages
                </p>
                {filteredConversations.map((conv: any) => {
                  const otherUser =
                    conv.type === "direct"
                      ? allUsers?.find(
                          (u: any) =>
                            u._id !== currentUser?._id &&
                            conv.participants.includes(u._id),
                        )
                      : null;

                  const conversationName =
                    conv.name || otherUser?.name || "Group Chat";
                  const conversationImage = otherUser?.imageUrl;

                  return (
                    <Link
                      key={conv._id}
                      href={`/chat/${conv._id}`}
                      onClick={() => onClose?.()}
                      className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 mb-1 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        {conversationImage ? (
                          <img
                            src={conversationImage}
                            alt={conversationName}
                            className="w-9 h-9 rounded-full ring-2 ring-gray-100 dark:ring-gray-800"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center ring-2 ring-gray-100 dark:ring-gray-800">
                            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {conversationName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {conv.participants.length}{" "}
                            {conv.type === "direct" ? "member" : "members"}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </>
            ) : (
              !showAllUsers && (
                <div className="px-3 py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Image
                      src="/koneksyon.svg"
                      alt="KONEKSYON"
                      width={32}
                      height={32}
                      className="w-8 h-8 opacity-50"
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    No conversations yet
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Click "New Chat" to start messaging
                  </p>
                </div>
              )
            )}
          </div>
        </ScrollArea>
      </div>

      {/* User Profile - Fixed at bottom */}
      {currentUser && (
        <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/profile"
            onClick={() => onClose?.()}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <img
              src={currentUser.imageUrl}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full ring-2 ring-emerald-100 dark:ring-emerald-900/30"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                View profile
              </p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
