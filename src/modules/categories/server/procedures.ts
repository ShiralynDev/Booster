import { db } from "@/db";
import { categories } from "@/db/schema";

import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const categoriesRouter = createTRPCRouter({
    getMany: baseProcedure.query(async () => { //baseProcedure -> public for everybody
        const data = await db.select().from(categories);
        return data;
    })
});