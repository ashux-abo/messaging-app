import { useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';

export interface UseFriendRequestsOptions {
    userId: Id<'users'>;
}

export interface UseFriendRequestsReturn {
    pendingRequests: any[];
    friendList: any[];
    pendingCount: number;
    isLoading: boolean;
    sendRequest: (recipientId: Id<'users'>) => Promise<boolean>;
    acceptRequest: (requestId: Id<'friendRequests'>) => Promise<boolean>;
    declineRequest: (requestId: Id<'friendRequests'>) => Promise<boolean>;
}

export function useFriendRequests(options: UseFriendRequestsOptions): UseFriendRequestsReturn {
    const { userId } = options;

    const pendingRequests = useQuery(
        api.friendRequests.getPendingFriendRequests,
        { userId }
    );

    const sendFriendRequest = useMutation(api.friendRequests.sendFriendRequest);
    const acceptFriendRequest = useMutation(api.friendRequests.acceptFriendRequest);
    const declineFriendRequest = useMutation(api.friendRequests.declineFriendRequest);
    const friendList = useQuery(api.friendRequests.getFriendsForUser, { userId });

    const handleSendRequest = useCallback(
        async (recipientId: Id<'users'>) => {
            try {
                await sendFriendRequest({ senderId: userId, recipientId });
                toast.success('Friend request sent!');
                return true;
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Failed to send friend request';
                toast.error(errorMsg);
                return false;
            }
        },
        [sendFriendRequest, userId]
    );

    const handleAcceptRequest = useCallback(
        async (requestId: Id<'friendRequests'>) => {
            try {
                await acceptFriendRequest({ requestId });
                toast.success('Friend request accepted!');
                return true;
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Failed to accept request';
                toast.error(errorMsg);
                return false;
            }
        },
        [acceptFriendRequest]
    );

    const handleDeclineRequest = useCallback(
        async (requestId: Id<'friendRequests'>) => {
            try {
                await declineFriendRequest({ requestId });
                toast.success('Friend request declined');
                return true;
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Failed to decline request';
                toast.error(errorMsg);
                return false;
            }
        },
        [declineFriendRequest]
    );

    const isLoading = pendingRequests === undefined || friendList === undefined;

    return {
        pendingRequests: pendingRequests || [],
        friendList: friendList || [],
        pendingCount: pendingRequests?.length ?? 0,
        isLoading,
        sendRequest: handleSendRequest,
        acceptRequest: handleAcceptRequest,
        declineRequest: handleDeclineRequest,
    };
}

export function useCheckFriendStatus(userId: Id<'users'>, targetUserId: Id<'users'>) {
    const shouldQuery = userId !== targetUserId;
    
    const friendStatus = useQuery(
        api.friendRequests.getFriendRequestStatus,
        shouldQuery ? { userId, targetUserId } : 'skip'
    );

    return { 
        friendStatus,
        isFriend: friendStatus?.status === 'accepted',
        isPending: friendStatus?.status === 'pending',
        direction: friendStatus?.direction || null,
        requestId: friendStatus?.requestId || null,
        isLoading: friendStatus === undefined && shouldQuery
    };
}