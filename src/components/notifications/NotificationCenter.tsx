"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, X, Check, MessageSquare, UserPlus, Users } from "lucide-react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface NotificationCenterProps {
  userId: Id<"users">;
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadNotifications = useQuery(
    api.notifications.getUnreadNotifications,
    { userId }
  );
  
  const markAsRead = useMutation(api.notifications.markNotificationAsRead);
  const markAllAsRead = useMutation(
    api.notifications.markAllNotificationsAsRead
  );
  const deleteNotification = useMutation(api.notifications.deleteNotification);
  const acceptFriendRequest = useMutation(
    api.friendRequests.acceptFriendRequest
  );

  const unreadCount = useMemo(
    () => unreadNotifications?.length ?? 0,
    [unreadNotifications]
  );

  const handleNotificationClick = async (notification: any) => {
    try {
      await markAsRead({ notificationId: notification._id });

      if (notification.type === "message" && notification.conversationId) {
        router.push(`/chat/${notification.conversationId}`);
        setIsOpen(false);
      } else if (
        notification.type === "friend_request" &&
        notification.friendRequest?.status === "pending"
      ) {
        // Keep panel open to show action buttons
        await markAsRead({ notificationId: notification._id });
      }
    } catch (error) {
      console.error("Error handling notification:", error);
    }
  };

  const handleAcceptFriendRequest = async (
    e: React.MouseEvent,
    friendRequestId: Id<"friendRequests">
  ) => {
    e.stopPropagation();
    try {
      await acceptFriendRequest({ requestId: friendRequestId });
      toast.success("Friend request accepted!");
    } catch (error) {
      toast.error("Failed to accept friend request");
    }
  };

  const handleDeleteNotification = async (
    e: React.MouseEvent,
    notificationId: Id<"notifications">
  ) => {
    e.stopPropagation();
    try {
      await deleteNotification({ notificationId });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({ userId });
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "friend_request":
        return <UserPlus className="w-4 h-4 text-purple-500" />;
      case "group_invite":
        return <Users className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationMessage = (notification: any) => {
    switch (notification.type) {
      case "message":
        return `${notification.sender?.name} sent you a message`;
      case "friend_request":
        return `${notification.sender?.name} sent you a friend request`;
      case "group_invite":
        return `${notification.sender?.name} invited you to a group chat`;
      default:
        return "You have a new notification";
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition h-8 w-8 md:h-10 md:w-10 flex items-center justify-center"
      >
        <Bell className="w-4 h-4 md:w-5 md:h-5 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Mobile Overlay Backdrop */}
          <div 
            className="fixed md:hidden inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Card */}
          <div className="fixed md:fixed bottom-0 md:bottom-auto left-0 md:right-4 md:top-16 w-full md:w-96 md:max-h-96 bg-white dark:bg-gray-800 rounded-t-lg md:rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[80vh] md:max-h-96 flex flex-col">
            {/* Header */}
            <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleMarkAllAsRead}
                  className="text-xs"
                >
                  Mark all as read
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {unreadNotifications && unreadNotifications.length > 0 ? (
                unreadNotifications.map((notification: any) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className="p-2 md:p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition"
                  >
                    <div className="flex gap-2 md:gap-3">
                      <Avatar className="w-8 h-8 md:w-10 md:h-10 shrink-0">
                        <AvatarImage src={notification.sender?.imageUrl} />
                        <AvatarFallback>
                          {notification.sender?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">
                              {getNotificationMessage(notification)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={(e) =>
                              handleDeleteNotification(e, notification._id)
                            }
                            className="shrink-0 text-gray-400 hover:text-red-500 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Friend Request Action Buttons */}
                        {notification.type === "friend_request" &&
                          notification.friendRequest?.status === "pending" && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                onClick={(e) =>
                                  handleAcceptFriendRequest(
                                    e,
                                    notification.friendRequestId
                                  )
                                }
                                className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(e, notification._id);
                                }}
                                className="h-7 text-xs"
                              >
                                Decline
                              </Button>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs md:text-sm">No notifications yet</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  router.push("/profile");
                  setIsOpen(false);
                }}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                View all notifications
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
