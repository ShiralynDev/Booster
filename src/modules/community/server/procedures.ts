import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { userFollows, users, assets, communities, communityMembers, posts } from "@/db/schema";
import { z } from "zod";
import { and, eq, inArray, desc, lt, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
    ? createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)!
      )
    : null;

export const communityRouter = createTRPCRouter({
    getMany: baseProcedure
        .input(z.object({
            categoryId: z.string().uuid().optional(),
            limit: z.number().min(1).max(100).default(20),
            cursor: z.string().nullish(),
        }))
        .query(async ({ input }) => {
            const { categoryId, limit, cursor } = input;

            const data = await db
                .select()
                .from(communities)
                .where(and(
                    categoryId ? eq(communities.categoryId, categoryId) : undefined,
                    cursor ? lt(communities.createdAt, new Date(cursor)) : undefined
                ))
                .limit(limit + 1)
                .orderBy(desc(communities.createdAt));

            let nextCursor: string | undefined = undefined;
            if (data.length > limit) {
                const nextItem = data.pop();
                if (nextItem) {
                    nextCursor = nextItem.createdAt.toISOString();
                }
            }

            return {
                items: data,
                nextCursor,
            };
        }),

    get: baseProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ input, ctx }) => {
            const [community] = await db
                .select()
                .from(communities)
                .where(eq(communities.communityId, input.id));

            if (!community) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            // Check if user is a member
            let isMember = false;
            if (ctx.user) {
                const [membership] = await db
                    .select()
                    .from(communityMembers)
                    .where(and(
                        eq(communityMembers.communityId, input.id),
                        eq(communityMembers.userId, ctx.user.id)
                    ));
                isMember = !!membership;
            }

            // Get member count
            const [memberCount] = await db
                .select({ count: count() })
                .from(communityMembers)
                .where(eq(communityMembers.communityId, input.id));

            return {
                ...community,
                isMember,
                memberCount: memberCount.count,
            };
        }),

    join: protectedProcedure
        .input(z.object({ communityId: z.string().uuid() }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.user.id;

            await db.insert(communityMembers).values({
                communityId: input.communityId,
                userId,
            }).onConflictDoNothing();

            return { success: true };
        }),

    leave: protectedProcedure
        .input(z.object({ communityId: z.string().uuid() }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.user.id;

            await db.delete(communityMembers)
                .where(and(
                    eq(communityMembers.communityId, input.communityId),
                    eq(communityMembers.userId, userId)
                ));

            return { success: true };
        }),

    getPosts: baseProcedure
        .input(z.object({
            communityId: z.string().uuid(),
            limit: z.number().min(1).max(100).default(20),
            cursor: z.string().nullish(),
        }))
        .query(async ({ input }) => {
            const { communityId, limit, cursor } = input;

            const data = await db
                .select({
                    post: posts,
                    user: {
                        id: users.id,
                        name: users.name,
                        imageUrl: users.imageUrl,
                        username: users.username,
                    }
                })
                .from(posts)
                .innerJoin(users, eq(posts.userId, users.id))
                .where(and(
                    eq(posts.communityId, communityId),
                    cursor ? lt(posts.createdAt, new Date(cursor)) : undefined
                ))
                .limit(limit + 1)
                .orderBy(desc(posts.createdAt));

            let nextCursor: string | undefined = undefined;
            if (data.length > limit) {
                const nextItem = data.pop();
                if (nextItem) {
                    nextCursor = nextItem.post.createdAt.toISOString();
                }
            }

            return {
                items: data,
                nextCursor,
            };
        }),

    getMessages: baseProcedure
        .input(z.object({
            channelId: z.string().uuid(),
            limit: z.number().min(1).max(100).default(20),
            cursor: z.string().nullish(), // timestamp string
        }))
        .query(async ({ input }) => {
            const { channelId, limit, cursor } = input;

            if (!supabaseAdmin) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Supabase client not initialized",
                });
            }

            // 1. Fetch messages from Supabase
            let query = supabaseAdmin
                .from('community_messages')
                .select('*')
                .eq('channel_id', channelId)
                .order('created_at', { ascending: false })
                .limit(limit + 1);

            if (cursor) {
                query = query.lt('created_at', cursor);
            }

            const { data: messages, error } = await query;

            if (error) {
                console.error("Supabase error:", error);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch messages" });
            }

            if (!messages || messages.length === 0) {
                return { items: [], nextCursor: undefined };
            }

            let nextCursor: string | undefined = undefined;
            if (messages.length > limit) {
                const nextItem = messages.pop();
                if (nextItem) {
                    nextCursor = nextItem.created_at;
                }
            }

            // 2. Fetch user details from Neon
            const userIds = [...new Set(messages.map(m => m.user_id))];
            
            const usersData = await db
                .select({
                    id: users.id,
                    name: users.name,
                    imageUrl: users.imageUrl,
                    username: users.username,
                    equippedAssetId: users.equippedAssetId,
                    equippedTitleId: users.equippedTitleId,
                })
                .from(users)
                .where(inArray(users.id, userIds));

            // Fetch assets (icons and titles)
            const assetIds = usersData
                .flatMap(u => [u.equippedAssetId, u.equippedTitleId])
                .filter((id): id is string => !!id);
            
            const assetsData = assetIds.length > 0 
                ? await db.select().from(assets).where(inArray(assets.assetId, assetIds))
                : [];
            
            const assetMap = new Map(assetsData.map(a => [a.assetId, a]));

            const userMap = new Map(usersData.map(u => {
                const equippedAsset = u.equippedAssetId ? assetMap.get(u.equippedAssetId) : null;
                const equippedTitle = u.equippedTitleId ? assetMap.get(u.equippedTitleId) : null;
                
                return [u.id, {
                    ...u,
                    equippedAsset,
                    equippedTitle
                }];
            }));

            // 3. Combine data
            const enrichedMessages = messages.map(msg => {
                const user = userMap.get(msg.user_id) || {
                    id: msg.user_id,
                    name: "Unknown User",
                    imageUrl: "",
                    username: "unknown",
                    equippedAsset: null,
                    equippedTitle: null,
                };

                return {
                    id: msg.id,
                    content: msg.content,
                    createdAt: new Date(msg.created_at),
                    user
                };
            });

            return {
                items: enrichedMessages, // Return newest to oldest for pagination
                nextCursor,
            };
        }),

    sendMessage: protectedProcedure
        .input(z.object({
            channelId: z.string().uuid(),
            content: z.string().min(1).max(1000),
        }))
        .mutation(async ({ ctx, input }) => {
            const { channelId, content } = input;
            const userId = ctx.user.id;

            if (!supabaseAdmin) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Supabase client not initialized",
                });
            }

            // Check if user follows the channel or is the owner
            if (userId !== channelId) {
                const [follow] = await db
                    .select()
                    .from(userFollows)
                    .where(and(
                        eq(userFollows.userId, userId),
                        eq(userFollows.creatorId, channelId)
                    ));

                if (!follow) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "You must follow the channel to send messages.",
                    });
                }
            }

            const { data, error } = await supabaseAdmin
                .from('community_messages')
                .insert({
                    channel_id: channelId,
                    user_id: userId,
                    content,
                })
                .select()
                .single();

            if (error) {
                console.error("Supabase error:", error);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to send message" });
            }

            return data;
        }),
});
