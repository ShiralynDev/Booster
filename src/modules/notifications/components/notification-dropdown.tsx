'use client';

import { trpc } from "@/trpc/client";
import { UserAvatar } from "@/components/user-avatar";
import { formatDistanceToNow } from "date-fns";
import { CheckCheck, MessageCircle, UserPlus, X, Mail, Rocket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NotificationDropdownProps {
    onClose: () => void;
    onNotificationRead: () => void;
}

export const NotificationDropdown = ({ onClose, onNotificationRead }: NotificationDropdownProps) => {
    const { data: notifications, isLoading } = trpc.notifications.getNotifications.useQuery();
    const utils = trpc.useUtils();

    const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
        onSuccess: () => {
            utils.notifications.getNotifications.invalidate();
            utils.notifications.getUnreadCount.invalidate();
            onNotificationRead();
        },
    });

    const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
        onSuccess: () => {
            utils.notifications.getNotifications.invalidate();
            utils.notifications.getUnreadCount.invalidate();
            onNotificationRead();
        },
    });

    const handleMarkAsRead = (notificationId: string) => {
        markAsReadMutation.mutate({ notificationId });
    };

    const handleMarkAllAsRead = () => {
        markAllAsReadMutation.mutate();
    };

    const getNotificationIcon = (type: 'follow' | 'comment' | 'reply' | 'boost') => {
        switch (type) {
            case 'follow':
                return <UserPlus className="size-4 text-blue-500" />;
            case 'comment':
                return <MessageCircle className="size-4 text-green-500" />;
            case 'reply':
                return <MessageCircle className="size-4 text-purple-500" />;
            case 'boost':
                return <Rocket className="size-4 text-orange-500" />;
        }
    };

    const getNotificationText = (notification: any) => {
        switch (notification.type) {
            case 'follow':
                return `${notification.relatedUser?.name || 'Someone'} started following you`;
            case 'comment':
                return `${notification.relatedUser?.name || 'Someone'} commented on your video "${notification.video?.title || 'your video'}"`;
            case 'reply':
                return `${notification.relatedUser?.name || 'Someone'} replied to your comment`;
            case 'boost':
                return `${notification.relatedUser?.name || 'Someone'} boosted your channel with ${notification.boostAmount || 0} XP`;
            default:
                return 'New notification';
        }
    };

    const getNotificationLink = (notification: any) => {
        switch (notification.type) {
            case 'follow':
                return `/users/${notification.relatedUserId}`;
            case 'comment':
            case 'reply':
                return `/explorer/videos/${notification.videoId}`;
            case 'boost':
                return `/users/${notification.userId}`; // Navigate to the boosted user's channel
            default:
                return '#';
        }
    };

    return (
        <div className="absolute right-0 top-full mt-2 w-[400px] max-w-[calc(100vw-2rem)] bg-background border border-border rounded-lg shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
                <h3 className="font-semibold text-lg">Notifications</h3>
                <div className="flex items-center gap-2">
                    {notifications && notifications.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            disabled={markAllAsReadMutation.isPending}
                            className="text-xs"
                        >
                            <CheckCheck className="size-4 mr-1" />
                            Mark all read
                        </Button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-muted rounded transition-colors"
                        aria-label="Close"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            </div>

            {/* Notification List */}
            <ScrollArea className="max-h-[500px]">
                {isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2">Loading notifications...</p>
                    </div>
                ) : notifications && notifications.length > 0 ? (
                    <div className="divide-y divide-border">
                        {notifications.map((notification) => (
                            <Link
                                key={notification.id}
                                href={getNotificationLink(notification)}
                                onClick={() => {
                                    if (!notification.isRead) {
                                        handleMarkAsRead(notification.id);
                                    }
                                    onClose();
                                }}
                                className={`
                                    flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors
                                    ${!notification.isRead ? 'bg-blue-500/5' : ''}
                                `}
                            >
                                {/* User Avatar */}
                                <div className="flex-shrink-0">
                                    {notification.relatedUser && (
                                        <UserAvatar
                                            imageUrl={notification.relatedUser.imageUrl}
                                            name={notification.relatedUser.name}
                                            size="sm"
                                            userId={notification.relatedUserId || ''}
                                            disableLink={true}
                                        />
                                    )}
                                </div>

                                {/* Notification Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-2">
                                        {getNotificationIcon(notification.type)}
                                        <p className="text-sm flex-1">
                                            {getNotificationText(notification)}
                                        </p>
                                    </div>
                                    
                                    {/* Comment Preview */}
                                    {notification.comment && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            "{notification.comment.comment}"
                                        </p>
                                    )}
                                    
                                    {/* Timestamp */}
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                </div>

                                {/* Unread Indicator */}
                                {!notification.isRead && (
                                    <div className="flex-shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        <Mail className="size-12 mx-auto mb-2 opacity-50" />
                        <p className="font-medium">No notifications yet</p>
                        <p className="text-sm mt-1">When you get notifications, they'll show up here</p>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
};
