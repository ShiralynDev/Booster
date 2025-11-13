'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface NotificationContextType {
    isOpen: boolean;
    activeTab: 'notifications' | 'messages';
    selectedUserId: string | null;
    openNotifications: () => void;
    openMessages: (userId?: string) => void;
    close: () => void;
    setActiveTab: (tab: 'notifications' | 'messages') => void;
    clearSelectedUser: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const openNotifications = () => {
        setActiveTab('notifications');
        setSelectedUserId(null);
        setIsOpen(true);
    };

    const openMessages = (userId?: string) => {
        setActiveTab('messages');
        setSelectedUserId(userId || null);
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
        // Reset selectedUserId after closing animation
        setTimeout(() => setSelectedUserId(null), 300);
    };

    const clearSelectedUser = () => {
        setSelectedUserId(null);
    };

    return (
        <NotificationContext.Provider
            value={{
                isOpen,
                activeTab,
                selectedUserId,
                openNotifications,
                openMessages,
                close,
                setActiveTab,
                clearSelectedUser,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationDropdown = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotificationDropdown must be used within a NotificationProvider');
    }
    return context;
};
