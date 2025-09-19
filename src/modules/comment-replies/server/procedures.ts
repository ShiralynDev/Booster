import { db } from "@/db";
import { commentReactions, commentReplies, comments, users } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { desc, eq, getTableColumns, inArray, sql } from "drizzle-orm";
import z from "zod";

export const commentRepliesRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(z.object({
      commentId: z.string().uuid(), // parent comment id
    }))
    .query(async ({ctx, input }) => {
      const parentId = input.commentId;

      let userId;
      const [user] = await db.select().from(users).where(inArray(users.clerkId, ctx.clerkUserId ? [ctx.clerkUserId] : []));

      if (user) {
        userId = user.id;
      }

      const likesSql = sql<number>`(
        select count(*)::int from ${commentReactions} cr
        where cr.comment_id = ${comments.commentId}
      )`;

      const viewerLikedSql = sql<boolean>`exists (
              select 1 from ${commentReactions} cr2
              where cr2.comment_id = ${comments.commentId}
                and cr2.user_id = ${userId}
            )`;

      const replies = await db
        .select({
          commentId: comments.commentId,
          comment: comments.comment,
          createdAt: comments.createdAt,
          commentLikes: likesSql.mapWith(Number),

          user: { ...getTableColumns(users) },

          hasReplies: sql<boolean>` exists ( select 1 from ${commentReplies} cr2 where cr2.replying_to_id = ${comments.commentId}) `.mapWith(Boolean),
          repliesCount: sql<number>` ( select count(*)::int from ${commentReplies} cr3 where cr3.replying_to_id = ${comments.commentId}) `.mapWith(Number),
          viewerLiked: viewerLikedSql.mapWith(Boolean),
        })
        .from(commentReplies)
        .innerJoin(comments, eq(comments.commentId, commentReplies.commentId))
        .innerJoin(users, eq(users.id, comments.userId))
        .where(eq(commentReplies.replyingToId, parentId))
        .orderBy(desc(comments.createdAt), desc(comments.commentId));

      return replies; 
    }),

    // create: --> create comment + add reply 
    create: protectedProcedure
    .input(z.object({
        parentId: z.string().uuid(),
        videoId: z.string().uuid(),
        comment: z.string()
    }))
    .mutation(async ({ctx,input}) => {

        const {comment,parentId,videoId} = input;
        
        //TODO: improve
        if(comment.length == 0){
          return; 
        }
        
        const [user] = await db
            .select()
            .from(users)
            .where(inArray(users.clerkId, ctx.clerkUserId ? [ctx.clerkUserId] : []))

        let userId;
        if (user) {
            userId = user.id
        } else {
            throw new TRPCError({ code: "UNAUTHORIZED" })
        }
        const [newComment] = await db
        .insert(comments)
        .values({
            userId: userId,
            videoId: videoId,
            comment:comment,
        }).returning()

        const newReply = await db
        .insert(commentReplies)
        .values({
            replyingToId:parentId,
            commentId: newComment.commentId
        })

        return {
            newComment,
            newReply
        }
    })
});

