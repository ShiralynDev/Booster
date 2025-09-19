import { db } from "@/db";
import { videoRatings } from "@/db/schema";
import {  createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const videoRatingsRouter = createTRPCRouter({
    create: protectedProcedure
    .input(z.object({ 
        videoId: z.string().uuid(),
        newRating: z.number().int().min(1).max(5),
    }))
    .mutation(async ({input,ctx}) => {
        const {videoId} = input;
        const {newRating} = input;

        const {id:userId} = ctx.user;
        console.log(userId)

        const [existingRating] = await db
        .select().from(videoRatings)
            .where(and(
                eq(videoRatings.videoId,videoId),
                eq(videoRatings.userId,userId)
            ))

        // console.log(existingRating)

        if(existingRating){
            //update if not rate limited

            const now = new Date();
            const last_update = new Date(existingRating.updatedAt);
            const RATE_LIMIT_VIEWS_TIME = 500; //  10 seconds to rate again

            if(now.getTime() - last_update.getTime() < RATE_LIMIT_VIEWS_TIME){
                console.log("rate limited")
                throw new TRPCError({code: "TOO_MANY_REQUESTS", message: "limit"})
            }else{
                console.log("updating rating")
                const [updatedVideoRatings] = await db
                .update(videoRatings)
                .set({
                        rating: newRating,
                        updatedAt: now
                    }).where(and(
                    eq(videoRatings.videoId,existingRating.videoId),
                    eq(videoRatings.userId,existingRating.userId)
                    ))
                    .returning()
                return updatedVideoRatings;
            }
        }

        const [createdVideoRating] = await db
            .insert(videoRatings)
            .values({
                    userId,
                    videoId,
                    rating: newRating})
            .returning()

        return createdVideoRating
    })

})
