'use client';

import { trpc } from "@/trpc/client";
import { UserAvatar } from "@/components/user-avatar";
import { formatDistanceToNow } from "date-fns";
import { Send, ArrowLeft, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";

interface MessageChatProps {
    userId: string;
    onBack: () => void;
    onClose: () => void;
}

export const MessageChat = ({ userId, onBack, onClose }: MessageChatProps) => {
    const [messageContent, setMessageContent] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const utils = trpc.useUtils();

    // Get the other user's details
    const { data: otherUser } = trpc.users.getByUserId.useQuery({ userId });
    
    // Get messages
    const { data: messages, isLoading } = trpc.messages.getMessagesWithUser.useQuery(
        { otherUserId: userId },
        {
            refetchInterval: 5000, // Refetch every 5 seconds for new messages
        }
    );

    // Send message mutation
    const sendMessageMutation = trpc.messages.sendMessage.useMutation({
        onSuccess: () => {
            setMessageContent("");
            utils.messages.getMessagesWithUser.invalidate();
            utils.messages.getConversations.invalidate();
            utils.messages.getUnreadCount.invalidate();
            // Scroll to bottom after sending
            setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        },
    });

    // Scroll to bottom on initial load and when new messages arrive
    useEffect(() => {
        if (messages && messages.length > 0) {
            scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageContent.trim()) return;

        sendMessageMutation.mutate({
            receiverId: userId,
            content: messageContent.trim(),
        });
    };

    if (isLoading) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <Loader2 className="size-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm">Loading messages...</p>
            </div>
        );
    }

    if (!otherUser) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <p className="text-red-500 font-medium text-sm">User not found</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="p-1 h-auto"
                >
                    <ArrowLeft className="size-4" />
                </Button>
                
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <UserAvatar
                        imageUrl={otherUser.imageUrl}
                        name={otherUser.name}
                        size="sm"
                        userId={userId}
                        disableLink={true}
                    />
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{otherUser.name}</p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    aria-label="Close"
                >
                    <X className="size-4" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 max-h-[400px] overflow-y-auto">
                <div className="space-y-3">
                    {messages && messages.length > 0 ? (
                        messages.map((message) => {
                            const isOwnMessage = message.senderId !== userId;
                            return (
                                <div
                                    key={message.id}
                                    className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {!isOwnMessage && (
                                        <UserAvatar
                                            imageUrl={message.senderImageUrl}
                                            name={message.senderName}
                                            size="xs"
                                            userId={message.senderId}
                                            disableLink={true}
                                        />
                                    )}
                                    
                                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                        <div
                                            className={`rounded-2xl px-3 py-2 ${
                                                isOwnMessage
                                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                                    : 'bg-muted text-foreground'
                                            }`}
                                        >
                                            <p className="text-xs break-words">{message.content}</p>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">
                                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p className="text-sm font-medium mb-1">No messages yet</p>
                            <p className="text-xs">Start the conversation!</p>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-border">
                <div className="flex gap-2">
                    <Input
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 h-9 text-sm"
                        maxLength={1000}
                        disabled={sendMessageMutation.isPending}
                    />
                    <Button
                        type="submit"
                        disabled={!messageContent.trim() || sendMessageMutation.isPending}
                        size="sm"
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full px-4"
                    >
                        {sendMessageMutation.isPending ? (
                            <Loader2 className="size-3 animate-spin" />
                        ) : (
                            <Send className="size-3" />
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};
