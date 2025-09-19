import {  createTRPCRouter, } from '../init';

import { categoriesRouter } from '@/modules/categories/server/procedures';
import { studioRouter } from '@/modules/studio/server/procedure';
import { videosRouter } from '@/modules/videos/server/procedures';
import { videoViewsRouter } from '@/modules/video-views/server/procedures';
import { videoRatingsRouter } from '@/modules/video-ratings/server/procedures';
import { usersRouter } from '@/modules/users/server/procedures';
import { followsRouter } from '@/modules/follows/server/procedure';
import { commentsRouter } from '@/modules/comments/server/procedures';
import { commentReactionsRouter } from '@/modules/comment-reactions/server/procedures';
import { commentRepliesRouter } from '@/modules/comment-replies/server/procedures';
import { homeRouter } from '@/modules/home/server/procedures';
// import { followsRouter } from '@/modules/follows/server/procedure';

export const appRouter = createTRPCRouter({

    studio: studioRouter,
    categories: categoriesRouter,
    videos:videosRouter,
    videoViews:videoViewsRouter,
    videoRatings: videoRatingsRouter,
    users: usersRouter,
    follows: followsRouter,
    comments: commentsRouter,
    commentReactions: commentReactionsRouter,
    home: homeRouter,
    // userFollowers: followsRouter
    

    // hello: protectedProcedure
    //   .input(
    //     z.object({
    //       text: z.string(),
    //     }),
    //   )
    //   .query( (opts) => {
    //     // throw new TRPCError({ code: "BAD_REQUEST"});
    //     // console.log("hello")
    //     console.log({fromContext: opts.ctx.clerkUserId});
    //     console.log({dbUser: opts.ctx.user});

    //     // const { userId } = await auth();
    //     // console.log("userId", userId);

    //     return {
    //       greeting: `hello ${opts.input.text}`,
    //     };
    //   }),



});
// export type definition of API
export type AppRouter = typeof appRouter;


// https://trpc.io/docs/concepts
