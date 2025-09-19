import { z } from "zod";
import { db } from "@/db";
import { userFollows, users, videoRatings, videos, videoViews } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and, or, lt, desc, sql, getTableColumns, sum, avg, inArray, isNotNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const homeRouter = createTRPCRouter({

    getOne: baseProcedure
        .input(z.object({id: z.string().uuid()}))
        .query(async ({input,ctx}) => {
    
            const {clerkUserId}  = ctx;
            let userId;
    
            const [user] = await db
            .select()
            .from(users)
            .where(inArray(users.clerkId,clerkUserId ? [clerkUserId] : [])) //trick
    
            if(user){
                userId = user.id;
            }
    
            const viewerFollow = db.$with("viewer_follow").as(
                db
                .select()
                .from(userFollows)
                .where(inArray(userFollows.userId,userId ? [userId] : []))
            )
    
          
    
    
            const[existingVideo] = await db
            .with(viewerFollow)
            .select({
                ...getTableColumns(videos), //instead of ...videos
                user: {
                    ...getTableColumns(users),
                    followsCount: sql<number>` (SELECT COUNT(*) FROM ${userFollows} WHERE ${userFollows.creatorId} = ${users.id}) `.mapWith(Number),
                    viewerIsFollowing: isNotNull(viewerFollow.userId).mapWith(Boolean),
                    videoCount: sql<number>`(SELECT COUNT(*) FROM ${videos} WHERE ${videos.userId} = ${users.id})`.mapWith(Number)
                },
                videoRatings: db.$count(videoRatings, eq(videoRatings.videoId,videos.id)), //inefficient?
            })
            .from(videos)
            .innerJoin(users,eq(videos.userId,users.id))
            .leftJoin(viewerFollow,eq(viewerFollow.creatorId,users.id))
            .where(
                eq(videos.id,input.id)
            )
            //inner join to get data of user
    
            if(!existingVideo){
                throw new TRPCError({code: "NOT_FOUND"})
            }
    
            const [viewCount] = await db
            .select({
                    count: sum(videoViews.seen)
                })
            .from(videoViews)
            .where(eq(videoViews.videoId,input.id))
    
    
    
            
            const [averageRating] = await db
            .select({
                    averageRating: avg(videoRatings.rating)
                }).from(videoRatings)
            .where(eq(videoRatings.videoId,input.id))
    
    
    
            const average = Number(averageRating?.averageRating ?? 0);
            return {
                ...existingVideo,
                videoViews: Number(viewCount.count ?? 0),
                averageRating: average,
                viewer: user,
            }
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
