import { db } from "@/db";
import { userFollows, users } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and,eq, sql } from "drizzle-orm";
import z from "zod";

export const usersRouter = createTRPCRouter({
    

})