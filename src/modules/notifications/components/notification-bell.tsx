'use client';

import { Mail } from "lucide-react";
import { trpc } from "@/trpc/client";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { NotificationDropdown } from "./notification-dropdown";
import { useAuth } from "@clerk/nextjs";

export const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Refetch when dropdown opens
    useEffect(() => {
        if (isOpen) {
            refetch();
        }
    }, [isOpen, refetch]);

    if (!clerkUserId) return null;

  

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative p-2 rounded-lg transition-colors",
                    "hover:bg-muted",
                    isOpen && "bg-muted"
                )}
                aria-label="Notifications"
            >
                <Mail className="size-5" />
                {!!unreadCount && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadCount && unreadCount > 99 ? '99+' : ""}
                </span>
                )}
            </button>

            {isOpen && (
                <NotificationDropdown 
                    onClose={() => setIsOpen(false)}
                    onNotificationRead={refetch}
                />
            )}
        </div>
    );
};
