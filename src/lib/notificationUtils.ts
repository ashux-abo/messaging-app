import { Id } from '@/convex/_generated/dataModel';

export interface Notification {
    _id: Id<'notifications'>;
    userId: Id<'users'>;
    type: 'message' | 'friend_request' | 'group_invite';
    senderId: Id<'users'>;
    conversationId?: Id<'conversations'>;
    friendRequestId?: Id<'friendRequests'>;
    isRead: boolean;
    createdAt: number;
    sender?: {
        _id: Id<'users'>;
        name?: string;
        email?: string;
        imageUrl?: string;
    };
    conversation?: {
        _id: Id<'conversations'>;
        name?: string;
        type: 'direct' | 'group';
    };
}

export const getNotificationMessage = (notification: Notification): string => {
    switch (notification.type) {
        case 'message':
            return `${notification.sender?.name || 'Someone'} sent you a message`;
        case 'friend_request':
            return `${notification.sender?.name || 'Someone'} sent you a friend request`;
        case 'group_invite':
            return `${notification.sender?.name || 'Someone'} invited you to ${notification.conversation?.name || 'a group'}`;
        default:
            return 'New notification';
    }
};

export const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'message':
            return 'MessageSquare';
        case 'friend_request':
            return 'UserPlus';
        case 'group_invite':
            return 'Users';
        default:
            return 'Bell';
    }
};

export const getNotificationColor = (type: string) => {
    switch (type) {
        case 'message':
            return 'blue';
        case 'friend_request':
            return 'purple';
        case 'group_invite':
            return 'green';
        default:
            return 'gray';
    }
};

export const groupNotificationsByType = (notifications: Notification[]) => {
    const grouped = {
        messages: [] as Notification[],
        friendRequests: [] as Notification[],
        groupInvites: [] as Notification[],
    };

    notifications.forEach((notif) => {
        switch (notif.type) {
            case 'message':
                grouped.messages.push(notif);
                break;
            case 'friend_request':
                grouped.friendRequests.push(notif);
                break;
            case 'group_invite':
                grouped.groupInvites.push(notif);
                break;
        }
    });

    return grouped;
};
