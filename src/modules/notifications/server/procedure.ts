import { db } from "@/db";
import { notifications, users, videos, comments } from "@/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { sql, eq, and, desc, getTableColumns } from "drizzle-orm";
import z from "zod";

export const notificationsRouter = createTRPCRouter({
  // Get all notifications for the current user
  getNotifications: protectedProcedure
    .query(async ({ ctx }) => {
      const { user } = ctx;
      
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Must be logged in to view notifications",
        });
      }

      const userNotifications = await db
        .select({
          ...getTableColumns(notifications),
          relatedUser: {
            id: users.id,
            name: users.name,
            imageUrl: users.imageUrl,
          },
          video: {
            id: videos.id,
            title: videos.title,
          },
          comment: {
            commentId: comments.commentId,
            comment: comments.comment,
          },
        })
        .from(notifications)
        .leftJoin(users, eq(notifications.relatedUserId, users.id))
        .leftJoin(videos, eq(notifications.videoId, videos.id))
        .leftJoin(comments, eq(notifications.commentId, comments.commentId))
        .where(eq(notifications.userId, user.id))
        .orderBy(desc(notifications.createdAt))
        .limit(50);

      return userNotifications;
    }),

  // Get unread count
  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      const { user } = ctx;
      
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Must be logged in to view notifications",
        });
      }

      const [result] = await db
        .select({
          count: sql<number>`COUNT(*)`.mapWith(Number),
        })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, user.id),
            eq(notifications.isRead, false)
          )
        );

      return result?.count || 0;
    }),

  // Mark a notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { notificationId } = input;

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Must be logged in",
        });
      }

      const [notification] = await db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, user.id)
          )
        )
        .returning();

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      return notification;
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      const { user } = ctx;

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Must be logged in",
        });
      }

      await db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.userId, user.id),
            eq(notifications.isRead, false)
          )
        );

      return { success: true };
    }),

  // Create a notification (internal use)
  create: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        type: z.enum(["follow", "comment", "reply", "boost"]),
        relatedUserId: z.string().uuid().optional(),
        videoId: z.string().uuid().optional(),
        commentId: z.string().uuid().optional(),
        boostAmount: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { userId, type, relatedUserId, videoId, commentId, boostAmount } = input;

      const [notification] = await db
        .insert(notifications)
        .values({
          userId,
          type,
          relatedUserId: relatedUserId || null,
          videoId: videoId || null,
          commentId: commentId || null,
          boostAmount: boostAmount || null,
        })
        .returning();

      return notification;
    }),
});
