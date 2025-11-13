'use client';

import { Mail } from "lucide-react";
import { trpc } from "@/trpc/client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { NotificationDropdown } from "./notification-dropdown";
import { useAuth } from "@clerk/nextjs";
import { useNotificationDropdown } from "@/contexts/notification-context";

export const NotificationBell = () => {
    const { isOpen, close, openNotifications } = useNotificationDropdown();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { userId: clerkUserId } = useAuth();

    // Get unread count
    const { data: unreadCount, refetch } = trpc.notifications.getUnreadCount.useQuery(
        undefined,
        {
            enabled: !!clerkUserId,
            //TODO: change or optimize
            refetchInterval: 30000, // Refetch every 1min 30 seconds
        },
    );

    // Get unread messages count
    const { data: unreadMessagesCount, refetch: refetchMessages } = trpc.messages.getUnreadCount.useQuery(
        undefined,
        {
            enabled: !!clerkUserId,
            refetchInterval: 30000, // Refetch every 30 seconds
        },
    );

    const totalUnread = (unreadCount || 0) + (unreadMessagesCount || 0);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                close();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, close]);

    // Refetch when dropdown opens
    useEffect(() => {
        if (isOpen) {
            refetch();
            refetchMessages();
        }
    }, [isOpen, refetch, refetchMessages]);

    if (!clerkUserId) return null;

  

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => isOpen ? close() : openNotifications()}
                className={cn(
                    "relative p-2 rounded-lg transition-colors",
                    "hover:bg-muted",
                    isOpen && "bg-muted"
                )}
                aria-label="Notifications"
            >
                <Mail className="size-5" />
                {totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {totalUnread > 99 ? '99+' : totalUnread}
                </span>
                )}
            </button>

            {isOpen && (
                <NotificationDropdown 
                    onClose={close}
                    onNotificationRead={refetch}
                />
            )}
        </div>
    );
};
