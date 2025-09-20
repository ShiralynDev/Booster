import { db } from '@/db';
import { users } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { cache } from 'react';
import superjson from 'superjson';

import { ratelimit } from '@/lib/ratelimit';

export const createTRPCContext = cache(async () => {
  /** NO DATABASE QUERIES HERE
   * @see: https://trpc.io/docs/server/context
   */

  const { userId } = await auth();

  return { clerkUserId: userId };

  // return { userId: 'user_123' };
});

//hover on context -> potential clerkUserId: string | null
export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;


export const protectedProcedure = t.procedure.use(async function isAuthed(opts){
  //protect endpoint
  const {ctx} = opts;
  if(!ctx.clerkUserId){
    throw new TRPCError({code: "UNAUTHORIZED"});
  }

  const [user] = await db.select().from(users).where(eq(users.clerkId,ctx.clerkUserId)).limit(1);

  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const { success } = await ratelimit.limit(user.id);
  
  if (!success) {
    console.log("ratelimit exceeded for userId", user.id);
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "You are being rate limited." });
  }



  return opts.next({ctx: {
      ...ctx,
      user,
    },
  });

})

//Procedure ↗	API endpoint - can be a query, mutation, or subscription.