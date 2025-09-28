import { z } from "zod";
import { db } from "@/db";
import { videos, videoViews } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and, or, lt, desc, sql, getTableColumns } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const studioRouter = createTRPCRouter({

    getOne: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({  input }) => {
            

            const [video] = await db
                .select({
                    ...getTableColumns(videos),
                    views: sql<number>`SUM(${videoViews.seen})`.mapWith(Number),
                })
                .from(videos)
                .leftJoin(videoViews, eq(videoViews.videoId, videos.id))
                .where(eq(videos.id, input.id))
                .groupBy(videos.id);
            if (!video) {
                throw new TRPCError({ code: "NOT_FOUND" })
            }
            return video;
        }),

    getMany: protectedProcedure
        .input(
            z.object({
                cursor: z.object({
                    id: z.string().uuid(),
                    updatedAt: z.date(),
                }).nullish(),
                limit: z.number().min(1).max(100),
            })
        )
        .query(async ({ ctx, input }) => {
            const { cursor, limit } = input;
            const { id: userId } = ctx.user; //rename id to userId



            const data = await db.select().from(videos).where(
                and(
                    eq(videos.userId, userId),
                    cursor ?
                        or(
                            lt(videos.updatedAt, cursor.updatedAt)
                            , and(
                                eq(videos.updatedAt, cursor.updatedAt),
                                lt(videos.id, cursor.id)
                            ))
                        : undefined)).orderBy(desc(videos.updatedAt), desc(videos.id)).limit(limit + 1); //ad 1 to limit to check if there's more data
            const hasMore = data.length > limit;
            //remove last item if hasMore
            const items = hasMore ? data.slice(0, -1) : data;

            const lastItem = items[items.length - 1];
            const nextCursor = hasMore ?
                {
                    id: lastItem.id,
                    updatedAt: lastItem.updatedAt,
                } : null;

            return {
                items,
                nextCursor,
            }
        })
})    
