import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';

export interface UseNotificationOptions {
    userId: Id<'users'>;
    autoMarkAsRead?: boolean;
    pollingInterval?: number; // milliseconds
}

export function useNotifications(options: UseNotificationOptions) {
    const { userId, autoMarkAsRead = false } = options;
    
    const unreadNotifications = useQuery(
        api.notifications.getUnreadNotifications,
        { userId }
    );

    const markAsRead = useMutation(api.notifications.markNotificationAsRead);
    const markAllAsRead = useMutation(api.notifications.markAllNotificationsAsRead);
    const deleteNotification = useMutation(api.notifications.deleteNotification);

    const handleMarkAsRead = useCallback(
        async (notificationId: Id<'notifications'>) => {
            try {
                await markAsRead({ notificationId });
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        },
        [markAsRead]
    );

    const handleMarkAllAsRead = useCallback(
        async () => {
            try {
                await markAllAsRead({ userId });
            } catch (error) {
                console.error('Failed to mark all notifications as read:', error);
            }
        },
        [markAllAsRead, userId]
    );

    const handleDeleteNotification = useCallback(
        async (notificationId: Id<'notifications'>) => {
            try {
                await deleteNotification({ notificationId });
            } catch (error) {
                console.error('Failed to delete notification:', error);
            }
        },
        [deleteNotification]
    );

    return {
        notifications: unreadNotifications,
        unreadCount: unreadNotifications?.length ?? 0,
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
        deleteNotification: handleDeleteNotification,
    };
}

export function useMessageNotification(userId: Id<'users'>, senderId: Id<'users'>, conversationId: Id<'conversations'>) {
    const createNotification = useMutation(api.notifications.createMessageNotification);

    const sendNotification = useCallback(
        async () => {
            try {
                await createNotification({ userId, senderId, conversationId });
            } catch (error) {
                console.error('Failed to create notification:', error);
            }
        },
        [createNotification, userId, senderId, conversationId]
    );

    return { sendNotification };
}
