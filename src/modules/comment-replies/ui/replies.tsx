'use client';

import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { UserInfo } from '@/modules/users/ui/components/user-info';
import { useClampDetector } from '@/modules/comments/hooks/resize-hook';
import { formatDistanceToNow } from 'date-fns';
import { UserAvatar } from '@/components/user-avatar';
import { Heart, MessageCircle, Send, Smile } from 'lucide-react';
import { comment } from 'postcss';
import { InfiniteScroll } from '@/components/infinite-scroll';
import { MAX_COMMENT_LENGTH } from '@/constants';
import { comments } from '@/db/schema';
import { motion } from 'framer-motion';
import { CommentOutput } from '@/modules/videos/types';
import { compactDate, compactNumber } from '@/lib/utils';

type Comment = CommentOutput

interface RepliesProps {
    parentId: string;
    depth: number;
    maxDepth: number
    handleAddReply: (commentId: string) => void;
    handleLike: (comment: Comment) => void;
    prefetchReplies: (commentId: string) => void;
    viewer?: object; //TODO, change to user
    replyText?: string;
    setReplyText: React.Dispatch<React.SetStateAction<string>>;
};

export const Replies = ({
    parentId,
    depth,
    maxDepth,
    handleAddReply,
    handleLike,
    prefetchReplies,
    viewer,
    replyText,
    setReplyText,
}: RepliesProps) => {
    // If your tRPC returns [data] for suspense:
    const [replies] = trpc.commentReplies.getMany.useSuspenseQuery({ commentId: parentId });
    // If it returns data directly, use:
    // const replies = trpc.commentReplies.getMany.useSuspenseQuery({ commentId: parentId });

    
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const { setRefFor, isClamped } = useClampDetector();
    const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});
    const [replyingTo, setReplyingTo] = useState<{ id: string, type: 'comment' | 'reply', parentId?: number } | null>(null);






    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 border-l">
            {replies.map((comment) => (
                <motion.div
                    key={comment.commentId}
                    // initial={{ opacity: 0, y: 20 }}
                    // animate={{ opacity: 1, y: 0 }}
                    // exit={{ opacity: 0, height: 0 }}
                    // transition={{ duration: 0.3 }}
                    className="group relative"
                >
                    <div className="flex gap-3">
                        <UserAvatar
                            size="sm"
                            imageUrl={comment.user.imageUrl}
                            name={comment.user.name}
                        />
                        <div className="flex-initial">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <UserInfo
                                    size="sm"
                                    name={comment.user.name?.replace(/\s*null\s*$/i, "")}
                                />
                                {/* TODO: Add user tags */}
                                {/* {comment.userTags?.map((tag, index) => (
                      <UserTag key={index} tag={tag} />
                    ))} */}
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {compactDate(comment.createdAt) ?? ""}
                                </span>
                            </div>
                            <p
                                ref={setRefFor(comment.commentId)}
                                className={[
                                    "text-sm text-gray-800 dark:text-gray-200 mb-2 max-w-xs text-left",
                                    "whitespace-pre-wrap break-words",
                                    expanded[comment.commentId] ? "" : "line-clamp-2"
                                ].join(" ")}
                            >
                                {comment.comment}
                            </p>

                            {(expanded[comment.commentId] || isClamped[comment.commentId]) && (
                                <button
                                    className="text-xs text-amber-600 hover:underline"
                                    onClick={() =>
                                        setExpanded(x => ({ ...x, [comment.commentId]: !x[comment.commentId] }))
                                    }
                                >
                                    {expanded[comment.commentId] ? "Show less" : "Read more"}
                                </button>)}


                            <div className="flex items-center gap-6" onMouseEnter={() => prefetchReplies(comment.commentId)}>
                                <div
                                    onClick={() => handleLike(comment)}
                                    className="flex gap-1 text-xs text-gray-500 dark:text-gray-400 hover:cursor-pointer hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                                // disabled={isPending && (comment.commentId === pendingCommentId)}
                                >
                                    <Heart
                                        className={`w-4 h-4 ${comment.viewerLiked ? 'fill-amber-500 text-amber-500' : ''}`}
                                    />
                                    {/* {comment.likes} */} {compactNumber(comment.commentLikes)}
                                </div>
                                <button
                                    onClick={() => setReplyingTo({ id: comment.commentId, type: 'comment' })}
                                    className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Reply
                                </button>

                                {/* Show replies */}
                                {comment.hasReplies && (
                                    <>
                                        <button
                                            onMouseEnter={() => prefetchReplies(comment.commentId)}   // optional UX boost
                                            onFocus={() => prefetchReplies(comment.commentId)}        // keyboard
                                            onTouchStart={() => prefetchReplies(comment.commentId)}   // mobile
                                            onClick={() =>
                                                setOpenReplies(s => ({ ...s, [comment.commentId]: !s[comment.commentId] }))
                                            }
                                        >
                                            <span className="text-xs text-muted-foreground">{openReplies[comment.commentId] ? "Hide replies" : `Show ${comment.repliesCount} replies`}</span>
                                        </button>
                                    </>
                                )}

                                {/* {comment.replies && comment.replies.length > 0 && (
                    <button
                      onClick={() => toggleReplies(comment.id)}
                      className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {comment.isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      {comment.replies.reduce((total, reply) =>
                        total + 1 + (reply.replies?.length || 0), 0)} replies
                    </button>
                  )} */}
                            </div>

                            {(depth < maxDepth && openReplies[comment.commentId]) && (
                                <Replies
                                    depth={depth + 1}
                                    maxDepth={3}
                                    parentId={comment.commentId}
                                    handleAddReply={handleAddReply}
                                    handleLike={handleLike}
                                    prefetchReplies={prefetchReplies}
                                    viewer={viewer}
                                    replyText={replyText}
                                    setReplyText={setReplyText}
                                />)}

                            {/* Reply Input */}
                            {replyingTo?.id === comment.commentId && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-2 ">
                                    <div className="flex gap-3 items-center">
                                        <UserAvatar
                                            size="sm"
                                            imageUrl={viewer?.imageUrl || "/public-user.png"}
                                            name={viewer?.name || "Booster anonymous user"}
                                        />
                                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1 flex items-center">
                                            <input
                                                type="text"
                                                value={replyText}
                                                onChange={(e) => { setReplyText(e.target.value) }}
                                                placeholder="Add a comment..."
                                                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                                // TODO: implement visual character limit
                                                maxLength={MAX_COMMENT_LENGTH}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddReply(comment.commentId)}
                                            />
                                            <div className="flex items-center gap-2">
                                                <p className="ml-2 text-xs text-muted-foreground">{replyText.length ?? "0"}/{MAX_COMMENT_LENGTH}</p>
                                                <button className="text-gray-500 hover:text-amber-500 transition-colors">
                                                    <Smile className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => { handleAddReply(comment.commentId) }}
                                                    disabled={!replyText.trim()}
                                                    className={`p-1 rounded-full transition-colors ${replyText.trim() ? 'text-amber-500 hover:text-amber-600' : 'text-gray-400'}`}
                                                >
                                                    <Send className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Replies }
                  {comment.replies && comment.replies.length > 0 && comment.isExpanded && (
                    renderReplies(comment.replies, comment.id)
                  )} */}
                        </div>
                        {/* // <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
                //   <MoreHorizontal className="w-4 h-4" />
                // </button> */}
                    </div>
                </motion.div>
            ))}
            {/* <InfiniteScroll
                isManual={false}
                hasNextPage={query.hasNextPage}
                isFetchingNextPage={query.isFetchingNextPage}
                fetchNextPage={query.fetchNextPage}
            /> */}
        </div>
    );
};
