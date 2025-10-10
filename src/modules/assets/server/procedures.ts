import { db } from "@/db";
import { assets, userAssets} from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, getTableColumns } from "drizzle-orm";
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
    })

})