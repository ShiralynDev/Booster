'use client';

import { InfiniteScroll } from "@/components/infinite-scroll";
import { UserAvatar } from "@/components/user-avatar";
import { COMMENT_REPLIES_SIZE, COMMENT_SECTION_SIZE, MAX_COMMENT_LENGTH } from "@/constants";
import { compactDate, compactNumber } from "@/lib/utils";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { CommentOutput } from "@/modules/videos/types";
import { trpc } from "@/trpc/client";
import { useClerk, useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Smile, Send, MoreHorizontal } from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import { skipToken } from "@tanstack/react-query";
import { useClampDetector } from "../../hooks/resize-hook";
import { CommentReplyInput } from "./comment-reply-input";
import { User } from "@/modules/users/types";

type Comment = CommentOutput[0];



interface CommentProps {
    parentComment: Comment;
    videoId: string;
    viewer?: User;
    isPending: boolean;
    depth:number;
    maxDepth: number;
}

export const Comment = ({ parentComment, videoId, viewer,depth,maxDepth  }: CommentProps) => {
    const clerk = useClerk();
    const utils = trpc.useUtils();
    const { isSignedIn } = useAuth();


    const isTemp = parentComment.commentId.startsWith("temp-");

    // open state controls fetching
    const [open, setOpen] = useState(false);

   const input = !isTemp ? 
   { commentId: parentComment.commentId, videoId, limit: COMMENT_REPLIES_SIZE }
    : skipToken;

    const [repliesData, query] = trpc.comments.getReplies.useSuspenseInfiniteQuery(
        input,
        {
            getNextPageParam: (last) => last?.nextCursor, // <-- goes in options
        }
    );


    const replies = useMemo(
        () => repliesData ? repliesData.pages.flatMap(p => p.comments) : [],
        [repliesData]
    );

    // Prefetch before opening
    const prefetchReplies = useCallback(() => {
        if(isTemp) return;
        console.log('prefetching replies of',parentComment.commentId)
        utils.comments.getReplies.prefetchInfinite({ commentId: parentComment.commentId, videoId, limit: COMMENT_REPLIES_SIZE });
    }, [utils, parentComment.commentId, videoId]);

    // the list of THIS parent’s children
    const listKey = { commentId: parentComment.parentId, videoId, limit: COMMENT_REPLIES_SIZE };

    const {mutate: commentAddReply, isPending} = trpc.comments.createReply.useMutation({
        onSuccess:() => {
            utils.comments.getReplies.invalidate({commentId: parentComment.commentId, videoId,limit:COMMENT_REPLIES_SIZE})
            utils.comments.getTopLevel.invalidate({videoId})
            setReplyingTo(null);
        }
    })

    const likeRoot = trpc.commentReactions.create.useMutation({
        onMutate: async ({ commentId }) => {
            await utils.comments.getTopLevel.cancel({ videoId, limit: COMMENT_SECTION_SIZE });
            const previous = utils.comments.getTopLevel.getInfiniteData({ videoId, limit: COMMENT_SECTION_SIZE });

            utils.comments.getTopLevel.setInfiniteData({ videoId, limit: COMMENT_SECTION_SIZE }, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((p: any) => ({
                        ...p,
                        comments: p.comments.map((c: any) =>
                            c.commentId === commentId ? { ...c, viewerLiked: true, commentLikes: c.commentLikes + (c.viewerLiked ? 0 : 1) } : c
                        ),
                    })),
                };
            });

            return { previous };
        },
        onError: (_e, _v, ctx) => {
            if (ctx?.previous) utils.comments.getTopLevel.setInfiniteData({ videoId, limit: COMMENT_SECTION_SIZE }, ctx.previous);
            clerk.openSignIn();
        },
        onSettled: () => utils.comments.getTopLevel.invalidate({ videoId, limit: COMMENT_SECTION_SIZE }),
    });

    const unlikeRoot = trpc.commentReactions.delete.useMutation({
        onMutate: async ({ commentId }) => {
            await utils.comments.getTopLevel.cancel({ videoId, limit: COMMENT_SECTION_SIZE });
            const previous = utils.comments.getTopLevel.getInfiniteData({ videoId, limit: COMMENT_SECTION_SIZE });

            utils.comments.getTopLevel.setInfiniteData({ videoId, limit: COMMENT_SECTION_SIZE }, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((p: any) => ({
                        ...p,
                        comments: p.comments.map((c: any) =>
                            c.commentId === commentId ? { ...c, viewerLiked: false, commentLikes: c.commentLikes - (c.viewerLiked ? 1 : 0) } : c
                        ),
                    })),
                };
            });

            return { previous };
        },
        onError: (_e, _v, ctx) => {
            if (ctx?.previous) utils.comments.getTopLevel.setInfiniteData({ videoId, limit: COMMENT_SECTION_SIZE }, ctx.previous);
            clerk.openSignIn();
        },
        onSettled: () => utils.comments.getTopLevel.invalidate({ videoId, limit: COMMENT_SECTION_SIZE }),
    });


    const likeReply = trpc.commentReactions.create.useMutation({
        onMutate: async ({ commentId }) => {
            await utils.comments.getReplies.cancel(listKey);
            const previous = utils.comments.getReplies.getInfiniteData(listKey);

            utils.comments.getReplies.setInfiniteData(listKey, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((p: any) => ({
                        ...p,
                        comments: p.comments.map((c: any) =>
                            c.commentId === commentId
                                ? { ...c, viewerLiked: true, commentLikes: c.commentLikes + (c.viewerLiked ? 0 : 1) }
                                : c
                        ),
                    })),
                };
            });

            return { previous };
        },
        onError: (_e, _v, ctx) => {
            if (ctx?.previous) utils.comments.getReplies.setInfiniteData(listKey, ctx.previous);
            clerk.openSignIn();
        },
        onSettled: () => utils.comments.getReplies.invalidate(listKey),
    });

    const unlikeReply = trpc.commentReactions.delete.useMutation({
        onMutate: async ({ commentId }) => {
            await utils.comments.getReplies.cancel(listKey);
            const previous = utils.comments.getReplies.getInfiniteData(listKey);

            utils.comments.getReplies.setInfiniteData(listKey, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((p: any) => ({
                        ...p,
                        comments: p.comments.map((c: any) =>
                            c.commentId === commentId
                                ? { ...c, viewerLiked: false, commentLikes: c.commentLikes - (c.viewerLiked ? 1 : 0) }
                                : c
                        ),
                    })),
                };
            });

            return { previous };
        },
        onError: (_e, _v, ctx) => {
            if (ctx?.previous) utils.comments.getReplies.setInfiniteData(listKey, ctx.previous);
            clerk.openSignIn();
        },
        onSettled: () => utils.comments.getReplies.invalidate(listKey),
    });

    // Wrappers
    const addCommentReply = (commentId: string, replyText: string) =>{
        if (!isSignedIn) return clerk.openSignIn();
        setOpen(true)
        commentAddReply({ parentId: commentId, videoId, comment: replyText });
    }

    const handleLike = (c: Comment) => {
        if (!isSignedIn) return clerk.openSignIn();
        const isRoot = !c.parentId;
        console.log("ROOT",c.commentId,isRoot)
        if (!c.viewerLiked) {
            isRoot ? likeRoot.mutate({ commentId: c.commentId }) : likeReply.mutate({ commentId: c.commentId });
        } else {
            isRoot ? unlikeRoot.mutate({ commentId: c.commentId }) : unlikeReply.mutate({ commentId: c.commentId });
        }
    };

    // UI state
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const { setRefFor, isClamped } = useClampDetector();
    const [replyingTo, setReplyingTo] = useState<{ id: string } | null>(null);
    

    return (
        <div className="">
            <motion.div key={parentComment.commentId} className="group relative">
                <div className="flex gap-3">
                    <UserAvatar size="sm" imageUrl={parentComment.user.imageUrl} name={parentComment.user.name} />
                    <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <UserInfo size="sm" name={parentComment.user.name?.replace(/\s*null\s*$/i, "")} />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {compactDate(parentComment.createdAt) ?? ""}
                            </span>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>

                        <p
                            ref={setRefFor(parentComment.commentId)}
                            className={[
                                "text-sm text-gray-800 dark:text-gray-200 mb-2 max-w-xs text-left",
                                "whitespace-pre-wrap break-words",
                                expanded[parentComment.commentId] ? "" : "line-clamp-2",
                            ].join(" ")}
                        >
                            {parentComment.comment}
                        </p>

                        {(expanded[parentComment.commentId] || isClamped[parentComment.commentId]) && (
                            <button
                                className="text-xs text-amber-600 hover:underline"
                                onClick={() =>
                                    setExpanded((x) => ({ ...x, [parentComment.commentId]: !x[parentComment.commentId] }))
                                }
                            >
                                {expanded[parentComment.commentId] ? "Show less" : "Read more"}
                            </button>
                        )}

                        <div
                            className="flex items-center gap-6"
                            
                        >
                            <button
                                onClick={() => handleLike(parentComment)}
                                className="flex gap-1 text-xs text-gray-500 dark:text-gray-400 hover:cursor-pointer hover:text-amber-500 transition-colors"
                            >
                                <Heart className={`w-4 h-4 ${parentComment.viewerLiked ? "fill-amber-500 text-amber-500" : ""}`} />
                                {compactNumber(parentComment.commentLikes)}
                            </button>

                            {depth < maxDepth && (
                            <button
                                onClick={() => setReplyingTo({ id: parentComment.commentId })}
                                className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
                                disabled={isPending}
                            >
                                <MessageCircle className="w-4 h-4" />
                                Reply
                            </button>
                        )}
                            {(parentComment.replies ?? 0) > 0 && (
                                <button
                                    onMouseEnter={prefetchReplies}
                                    onFocus={prefetchReplies}
                                    onTouchStart={prefetchReplies}
                                    onClick={() => setOpen((s) => !s)}
                                >
                                    <span className="text-xs text-muted-foreground">
                                        {open ? "Hide replies" : `Show ${parentComment.replies} replies`}
                                    </span>
                                </button>
                            )}

                        </div>

                        {/* Reply input */}
                        {/* TODO: change to a single component to avoid re-rendering all comments on each value change */}
                        {replyingTo?.id === parentComment.commentId && (
                            <CommentReplyInput 
                                isPending={isPending}
                                addCommentReply={addCommentReply}
                                viewer={viewer}
                                parentCommentId={parentComment.commentId}
                            />
                        )}

                        {/* Children */}
                        {open && (
                            <>
                                <div className="mt-3 pl-6 border-l border-amber-500 rounded-b-2xl dark:border-gray-800 space-y-4">
                                    {replies.map((child) => (
                                        <Comment key={child.commentId} isPending={isPending}  parentComment={child} videoId={videoId} viewer={viewer} depth={depth + 1} maxDepth={maxDepth}/>
                                    ))}


                                </div>
                                <InfiniteScroll
                                    isManual={true}
                                    hasNextPage={query.hasNextPage}
                                    isFetchingNextPage={query.isFetchingNextPage}
                                    fetchNextPage={query.fetchNextPage}
                                />
                            </>
                        )}
                    </div>


                </div>
            </motion.div>
        </div>
    );
};
