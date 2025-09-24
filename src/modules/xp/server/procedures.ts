import { db } from "@/db";
import { users } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { eq } from "drizzle-orm";
import z from "zod";

export const xpRouter = createTRPCRouter({
    getXpByUserId: baseProcedure
    .input(z.object({userId: z.string().uuid()}))
    .query( async ({ctx,input}) => {

        const {userId} = input;

        const xp = await db
        .select({
            xp: users.xp || 0,
        })
        .from(users)
        .where(eq(users.id,userId))
        
        return xp;
    })
})