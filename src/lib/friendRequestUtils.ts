import { Id } from '@/convex/_generated/dataModel';

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export interface FriendRequest {
    _id: Id<'friendRequests'>;
    senderId: Id<'users'>;
    recipientId: Id<'users'>;
    status: FriendRequestStatus;
    createdAt: number;
    respondedAt?: number;
    sender?: {
        _id: Id<'users'>;
        name?: string;
        email?: string;
        imageUrl?: string;
    };
    recipient?: {
        _id: Id<'users'>;
        name?: string;
        email?: string;
        imageUrl?: string;
    };
}

export interface Friend {
    _id: Id<'users'>;
    name?: string;
    email?: string;
    imageUrl?: string;
    status?: 'online' | 'offline' | 'away';
}

export const getFriendRequestMessage = (request: FriendRequest): string => {
    const senderName = request.sender?.name || 'Someone';
    
    switch (request.status) {
        case 'pending':
            return `${senderName} sent you a friend request`;
        case 'accepted':
            return `You are now friends with ${senderName}`;
        case 'declined':
            return `You declined ${senderName}'s friend request`;
        case 'blocked':
            return `${senderName} is blocked`;
        default:
            return 'Friend request';
    }
};

export const sortFriendRequests = (
    requests: FriendRequest[],
    sortBy: 'newest' | 'oldest' | 'name' = 'newest'
): FriendRequest[] => {
    const sorted = [...requests];
    
    switch (sortBy) {
        case 'newest':
            return sorted.sort((a, b) => b.createdAt - a.createdAt);
        case 'oldest':
            return sorted.sort((a, b) => a.createdAt - b.createdAt);
        case 'name':
            return sorted.sort((a, b) => {
                const nameA = a.sender?.name || '';
                const nameB = b.sender?.name || '';
                return nameA.localeCompare(nameB);
            });
        default:
            return sorted;
    }
};

export const filterFriendRequests = (
    requests: FriendRequest[],
    status: FriendRequestStatus | 'all' = 'pending'
): FriendRequest[] => {
    if (status === 'all') return requests;
    return requests.filter((req) => req.status === status);
};

export const areFriends = (status: FriendRequestStatus): boolean => {
    return status === 'accepted';
};

export const canSendRequest = (status?: FriendRequestStatus): boolean => {
    return !status || status === 'declined' || status === 'blocked';
};
