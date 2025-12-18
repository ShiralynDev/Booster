import { db } from "@/db";
import { rewardedView,  users,  videos } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq, gte, sql } from "drizzle-orm";
import z from "zod";

const awardXp = async (userId: string) => {
    

    //select all rewardedViews that have been updated in the past 20 hours.
    //

    const RATE_LIMIT_REWARDS_TIME = 20 * 60 * 60 * 1000; // 20h
    const since = new Date(Date.now() - RATE_LIMIT_REWARDS_TIME);

    const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(rewardedView)
    .where(and(
        eq(rewardedView.userId, userId),
        gte(rewardedView.updatedAt, since),
    ));

    const currentDailyCount = Number(count);

    let xpToAward = 0;
    let message = undefined;

    if (currentDailyCount < 5) {
        xpToAward = 20;
    } else if (currentDailyCount === 5) {
        xpToAward = 15;
    } else if (currentDailyCount === 6) {
        xpToAward = 10;
    } else if (currentDailyCount === 7) {
        xpToAward = 5;
    } else {
        xpToAward = 0;
        message = "Daily XP limit reached for watching videos.";
    }

    console.log("XP to award:", xpToAward);

   
    return { xpToAward: xpToAward, message };
}

const updateUserXp = async (userId: string, xpToAward: number) => {
    await db
    .update(users)
    .set({ xp: sql<number>`(${users.xp} + ${xpToAward})` })
    .where(eq(users.id, userId));
}

export const rewardedViewsRouter = createTRPCRouter({


    //TODO: THERE MIGHT BE A RCE
    awardXpForView: protectedProcedure
    .input(
        z.object({ videoId: z.string() })
    )
    .mutation(async ({ctx, input }) => {
        const {videoId} = input;
        const {id:userId} = ctx.user;


        const [video] = await db
        .select({isFeatured:videos.isFeatured})
        .from(videos)
        .where(eq(videos.id,videoId))
        .limit(1)

        if(!video.isFeatured) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Can't reward xp on this video" })
        }

        const [rewardedViewRow] = await db
        .select()
        .from(rewardedView)
        .where(and(eq(rewardedView.videoId,videoId),eq(rewardedView.userId,userId)))



        if(!rewardedViewRow){
            //insert

            const {xpToAward} = await awardXp(userId );

            await db.insert(rewardedView).values({
                userId: userId,
                videoId: videoId,
                xpEarned: xpToAward
            }).returning();

            //update user XP

            await updateUserXp(userId, xpToAward);

            return {xpEarned: xpToAward, message:`You've earned ${xpToAward} XP for watching this featured video`};

        }else{
            //update

            const now = new Date();
            const last_update = new Date(rewardedViewRow.updatedAt);
            //PONGO 20 horas por ejemplo
            const RATE_LIMIT_REWARDS_TIME = 20 * 60 * 60 * 1000; // 20 hour in ms 

            const {xpToAward} = await awardXp(userId );
            if (now.getTime() - last_update.getTime() < RATE_LIMIT_REWARDS_TIME) {

                return {message: "You've already earned rewards for this video recently.",xpEarned: 0};

            }else{

                //After 20 hours reward again.
                await db
                .update(rewardedView)
                .set({xpEarned: xpToAward})
                .where(and(eq(rewardedView.videoId,videoId),eq(rewardedView.userId,userId)))
                .returning();

                //update user XP
                updateUserXp(userId, xpToAward);

                return {xpEarned: xpToAward, message:`You've earned ${xpToAward} XP for watching this featured video`};
            }
        }
    })
});
