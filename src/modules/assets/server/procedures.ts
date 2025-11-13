import { db } from "@/db";
import { assets, userAssets} from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, getTableColumns, isNotNull } from "drizzle-orm";
import z from "zod";

export const assetsRouter = createTRPCRouter({

    getMany: baseProcedure
    .query(async () => {
        const activeAssets = await db
        .select()
        .from(assets)
        return activeAssets
    }),

    getAssetsByUser: protectedProcedure
    .query(async ({ctx}) => {
        const {user} = ctx;

        const ownedItems = await db
        .select({
            ...getTableColumns(assets),
        })
        .from(userAssets)
        .innerJoin(assets,eq(userAssets.assetId,assets.assetId))
        .where(eq(userAssets.userId,user.id))

        return ownedItems;
    }),
     getAssetsByUserId: baseProcedure 
    .input(z.object({
        userId: z.string().uuid(),
    }))
    .query(async ({input}) => {
        const {userId} = input;

        const ownedItems = await db
        .select({
            ...getTableColumns(assets),
        })
        .from(userAssets)
        .innerJoin(assets,eq(userAssets.assetId,assets.assetId))
        .where(eq(userAssets.userId,userId))

        return ownedItems;
    }),

    // Get all reward assets (those with requiredLevel set)
    getRewardAssets: baseProcedure
    .query(async () => {
        const rewardAssets = await db
        .select()
        .from(assets)
        .where(isNotNull(assets.requiredLevel))
        
        return rewardAssets;
    }),

    // Claim a reward (add to user's assets)
    claimReward: protectedProcedure
    .input(z.object({
        assetId: z.string().uuid(),
    }))
    .mutation(async ({ctx, input}) => {
        const {user} = ctx;
        const {assetId} = input;

        // Check if user already has this asset
        const existing = await db
        .select()
        .from(userAssets)
        .where(
            eq(userAssets.userId, user.id) && eq(userAssets.assetId, assetId)
        )
        .limit(1);

        if (existing.length > 0) {
            throw new Error("Reward already claimed");
        }

        // Add asset to user's collection
        await db.insert(userAssets).values({
            userId: user.id,
            assetId: assetId,
        });

        return { success: true };
    })

})