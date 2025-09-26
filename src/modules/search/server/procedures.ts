import { db } from "@/db";
import { userFollows, users, videoRatings, videos, videoViews } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { and, avg, count, desc, eq, getTableColumns, ilike, isNotNull, lt, or, sql, sum } from "drizzle-orm";
import z from "zod";

export const searchRouter = createTRPCRouter({
    getManyByQuery: baseProcedure
        .input(z.object({
            query: z.string().nullish(),
            // categoryId: z.string().uuid().nullish(),
            cursor: z.object({
                id: z.string().uuid(),
                updatedAt: z.date(),
            }).nullish(),
            limit: z.number().min(1).max(100)
        }))
        .query(async ({ ctx, input }) => {

            const { cursor, limit, query } = input;

            const videoViewsStats = db.$with("video_views_stats").as(
                db
                    .select({
                        videoId: videoViews.videoId,
                        viewCount: sum(videoViews.seen).as("viewCount"),
                    })
                    .from(videoViews)
                    .groupBy(videoViews.videoId)
            );

            const ratingStats = db.$with("video_stats").as(
                db
                    .select({
                        videoId: videoRatings.videoId,
                        ratingCount: count(videoRatings.rating).as("ratingCount"),
                        averageRating: avg(videoRatings.rating).as("avgRating")
                    })
                    .from(videoRatings)
                    .groupBy(videoRatings.videoId)
            );

            const data = await db
                .with(ratingStats, videoViewsStats)
                .select({
                    ...getTableColumns(videos),
                    user: {
                        ...getTableColumns(users),
                        followsCount: sql<number>` (SELECT COUNT(*) FROM ${userFollows} WHERE ${userFollows.creatorId} = ${users.id}) `.mapWith(Number),
                        videoCount: sql<number>`(SELECT COUNT(*) FROM ${videos} WHERE ${videos.userId} = ${users.id})`.mapWith(Number),
                    },
                    videoRatings: ratingStats.ratingCount,
                    averageRating: ratingStats.averageRating,
                    videoViews: videoViewsStats.viewCount,
                }).from(videos)
                .innerJoin(users, eq(videos.userId, users.id))
                .leftJoin(ratingStats, eq(ratingStats.videoId, videos.id))
                .leftJoin(videoViewsStats, eq(videoViewsStats.videoId, videos.id))
                .where(and(
                    ilike(videos.title, `%${query}%`),
                    eq(videos.visibility, 'public'),
                    cursor ?
                        or(
                            lt(videos.updatedAt, cursor.updatedAt)
                            , and(
                                eq(videos.updatedAt, cursor.updatedAt),
                                lt(videos.id, cursor.id)
                            ))
                        : undefined)).orderBy(desc(videos.updatedAt), desc(videos.id)).limit(limit + 1); //ad 1 to limit to check if there's more data

            const hasMore = data.length > limit;

            const items = hasMore ? data.slice(0, -1) : data;

            const lastItem = items[items.length - 1];
            const nextCursor = hasMore
                ? {
                    id: lastItem.id,
                    updatedAt: lastItem.updatedAt,
                } : null

            return {
                items,
                nextCursor,
            }
        }),
})