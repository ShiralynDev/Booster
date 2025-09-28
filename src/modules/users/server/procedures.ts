import { db } from "@/db";
import {  users, videoRatings, videos, videoViews } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { desc,eq, getTableColumns, inArray, sql } from "drizzle-orm";
import z from "zod";

export const usersRouter = createTRPCRouter({
    

    getByClerkId: protectedProcedure
    .input(z.object({clerkId: z.string().nullish()}))
    .query(async ({input}) => {
        const {clerkId} = input;
        const [user] = await db
        .select()
        .from(users)
        .where(inArray(users.clerkId, clerkId ? [clerkId] : []));
        

        if(!user) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `User with clerkId ${input.clerkId} not found`
            });
        }

        return user;
    }),

     getByUserId: baseProcedure
    .input(z.object({userId: z.string().uuid()}))
    .query(async ({input}) => {
        const {userId} = input;

        const [user] = await db
        .select()
        .from(users)
        .where(inArray(users.id, userId ? [userId] : []));

        if(!user) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `User with clerkId ${userId} not found`
            });
        }

        return user;
    }),

   getVideosByUserId: baseProcedure
  .input(z.object({ userId: z.string().uuid() }))
  .query(async ({ input }) => {
    const { userId } = input;

    const [user] = await db
      .select()
      .from(users)
      .where(inArray(users.id, userId ? [userId] : []));
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `User with id ${userId} not found`, // ← was "clerkId"
      });
    }

    const userVideos = await db
      .select({
        ...getTableColumns(videos),
        videoViews: sql<number>`
          COALESCE((
            SELECT SUM(${videoViews.seen})
            FROM ${videoViews}
            WHERE ${videoViews.videoId} = ${videos.id}
          ), 0)
        `.mapWith(Number),

        averageRating: sql<number> `(SELECT AVG(${videoRatings.rating}) FROM ${videoRatings} WHERE ${videoRatings.videoId} = ${videos.id})`.mapWith(Number),
        
      })
      .from(videos)
      .where(eq(videos.userId, userId))
      .orderBy(desc(videos.createdAt));

    return { userVideos,  };
  }),
})