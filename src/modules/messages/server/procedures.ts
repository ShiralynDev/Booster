import { createTRPCRouter } from "@/trpc/init";
import { protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { messages, users, userFollows } from "@/db/schema";
import { z } from "zod";
import { and, eq, or, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const messagesRouter = createTRPCRouter({
    // Get conversations list (users you've exchanged messages with)
    getConversations: protectedProcedure
        .query(async ({ ctx }) => {
            const currentUserId = ctx.user.id;

            // Get all unique users the current user has exchanged messages with
            const conversations = await db
                .selectDistinctOn([users.id], {
                    userId: users.id,
                    userName: users.name,
                    userImageUrl: users.imageUrl,
                    userClerkId: users.clerkId,
                    lastMessageContent: messages.content,
                    lastMessageTime: messages.createdAt,
                    lastMessageSenderId: messages.senderId,
                    unreadCount: sql<number>`
                        (SELECT COUNT(*) 
                         FROM ${messages} 
                         WHERE ${messages.receiverId} = ${currentUserId} 
                         AND ${messages.senderId} = ${users.id}
                         AND ${messages.isRead} = false)
                    `.mapWith(Number),
                })
                .from(messages)
                .innerJoin(
                    users,
                    or(
                        and(eq(messages.senderId, users.id), eq(messages.receiverId, currentUserId)),
                        and(eq(messages.receiverId, users.id), eq(messages.senderId, currentUserId))
                    )!
                )
                .where(
                    or(
                        eq(messages.senderId, currentUserId),
                        eq(messages.receiverId, currentUserId)
                    )
                )
                .orderBy(users.id, desc(messages.createdAt));

            return conversations;
        }),

    // Get messages with a specific user
    getMessagesWithUser: protectedProcedure
        .input(z.object({ otherUserId: z.string().uuid() }))
        .query(async ({ input, ctx }) => {
            const currentUserId = ctx.user.id;
            const { otherUserId } = input;

            // Verify both users follow each other
            const mutualFollow = await db
                .select()
                .from(userFollows)
                .where(
                    or(
                        and(
                            eq(userFollows.userId, currentUserId),
                            eq(userFollows.creatorId, otherUserId)
                        ),
                        and(
                            eq(userFollows.userId, otherUserId),
                            eq(userFollows.creatorId, currentUserId)
                        )
                    )
                );

            if (mutualFollow.length < 2) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Both users must follow each other to exchange messages",
                });
            }

            // Get messages between the two users
            const messagesList = await db
                .select({
                    id: messages.id,
                    content: messages.content,
                    senderId: messages.senderId,
                    receiverId: messages.receiverId,
                    isRead: messages.isRead,
                    createdAt: messages.createdAt,
                    senderName: users.name,
                    senderImageUrl: users.imageUrl,
                })
                .from(messages)
                .innerJoin(users, eq(messages.senderId, users.id))
                .where(
                    or(
                        and(
                            eq(messages.senderId, currentUserId),
                            eq(messages.receiverId, otherUserId)
                        ),
                        and(
                            eq(messages.senderId, otherUserId),
                            eq(messages.receiverId, currentUserId)
                        )
                    )
                )
                .orderBy(messages.createdAt);

            // Mark all messages from the other user as read
            await db
                .update(messages)
                .set({ isRead: true })
                .where(
                    and(
                        eq(messages.senderId, otherUserId),
                        eq(messages.receiverId, currentUserId),
                        eq(messages.isRead, false)
                    )
                );

            return messagesList;
        }),

    // Send a message
    sendMessage: protectedProcedure
        .input(z.object({
            receiverId: z.string().uuid(),
            content: z.string().min(1).max(1000),
        }))
        .mutation(async ({ input, ctx }) => {
            const senderId = ctx.user.id;
            const { receiverId, content } = input;

            // Verify both users follow each other
            const mutualFollow = await db
                .select()
                .from(userFollows)
                .where(
                    or(
                        and(
                            eq(userFollows.userId, senderId),
                            eq(userFollows.creatorId, receiverId)
                        ),
                        and(
                            eq(userFollows.userId, receiverId),
                            eq(userFollows.creatorId, senderId)
                        )
                    )
                );

            if (mutualFollow.length < 2) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Both users must follow each other to exchange messages",
                });
            }

            // Insert the message
            const [newMessage] = await db
                .insert(messages)
                .values({
                    senderId,
                    receiverId,
                    content,
                })
                .returning();

            return newMessage;
        }),

    // Get users that the current user can message (mutual follows)
    getMutualFollows: protectedProcedure
        .query(async ({ ctx }) => {
            const currentUserId = ctx.user.id;

            // Get users where both follow each other
            const mutualFollowers = await db
                .select({
                    id: users.id,
                    name: users.name,
                    imageUrl: users.imageUrl,
                    clerkId: users.clerkId,
                })
                .from(userFollows)
                .innerJoin(users, eq(userFollows.creatorId, users.id))
                .where(eq(userFollows.userId, currentUserId))
                .innerJoin(
                    sql`${userFollows} as reverse_follows`,
                    sql`reverse_follows.user_id = ${userFollows.creatorId} AND reverse_follows.creator_id = ${currentUserId}`
                );

            return mutualFollowers;
        }),

    // Get unread message count
    getUnreadCount: protectedProcedure
        .query(async ({ ctx }) => {
            const currentUserId = ctx.user.id;

            const [result] = await db
                .select({
                    count: sql<number>`COUNT(*)`.mapWith(Number),
                })
                .from(messages)
                .where(
                    and(
                        eq(messages.receiverId, currentUserId),
                        eq(messages.isRead, false)
                    )
                );

            return result?.count || 0;
        }),

    // Mark messages as read
    markAsRead: protectedProcedure
        .input(z.object({ otherUserId: z.string().uuid() }))
        .mutation(async ({ input, ctx }) => {
            const currentUserId = ctx.user.id;
            const { otherUserId } = input;

            await db
                .update(messages)
                .set({ isRead: true })
                .where(
                    and(
                        eq(messages.senderId, otherUserId),
                        eq(messages.receiverId, currentUserId),
                        eq(messages.isRead, false)
                    )
                );

            return { success: true };
        }),
});
