'use client'

import { UserAvatar } from "@/components/user-avatar"
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { trpc } from "@/trpc/client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, MoreHorizontal, Send, Smile, ChevronDown, ChevronUp, Crown, Star, Zap } from "lucide-react";
import { useAuth, useClerk } from "@clerk/clerk-react";
import { COMMENT_SECTION_SIZE } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Comment } from "@/modules/comments/ui/components/comment";
import { compactNumber } from "@/lib/utils";
import { CommentInput } from "@/modules/comments/ui/components/comment-input";

interface CommentSectionProps {
  videoId: string;
}


export const CommentsSection = ({ videoId }: CommentSectionProps) => {

  const clerk = useClerk();
  const utils = trpc.useUtils();
  const { isSignedIn } = useAuth();

  const [rootComments, query] = trpc.comments.getTopLevel.useSuspenseInfiniteQuery({
    videoId,
    limit: COMMENT_SECTION_SIZE,
  }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });


  const items = useMemo(
    () => rootComments ? rootComments.pages.flatMap(p => p.comments) : [],
    [rootComments]
  );

  const viewer = rootComments.pages[0].viewer;

  const key = { videoId, limit: COMMENT_SECTION_SIZE }; 

  const {mutate: createRootComment,isPending} = trpc.comments.create.useMutation({
    onMutate: async ({ videoId, comment }) => {
      // 1) stop any in-flight fetches for THIS exact key
      await utils.comments.getTopLevel.cancel(key);

      // 2) snapshot current cache
      const prev = utils.comments.getTopLevel.getInfiniteData(key);

      const tempId = crypto.randomUUID()

      const now = new Date();
      const viewer = prev?.pages?.[0]?.viewer;

      // 3) optimistic row – shape must match rows from getTopLevel
      const optimisticItem = {
        commentId: tempId,
        userId: viewer?.id ?? "optimistic-user",
        videoId,
        comment,
        createdAt: now,
        updatedAt: now,
        parentId: null,
        replies: 0,
        user: viewer ?? {
          id: "optimistic-user",
          clerkId: "",
          name: "You",
          imageUrl: "",
        },
        commentLikes: 0,
        viewerLiked: false,
      } as NonNullable<typeof prev>["pages"][number]["comments"][number];

      // 4) write optimistic cache
      utils.comments.getTopLevel.setInfiniteData(key, (old) => {
        if (!old) return old;

        const [first, ...rest] = old.pages;
        const firstPage =
          first ??
          ({
            comments: [],
            viewer,
            commentCount: 0,
            nextCursor: null,
          } as (typeof old)["pages"][number]);

        const newFirstPage = {
          ...firstPage,
          comments: [optimisticItem, ...firstPage.comments].slice(0, COMMENT_SECTION_SIZE),
          commentCount: (firstPage.commentCount ?? 0) + 1,
        };

        // preserve pageParams to avoid cache bugs
        return {
          ...old,
          pages: [newFirstPage, ...rest],
        };
      });

      // provide rollback context
      return { prev,tempId };
    },

    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      utils.comments.getTopLevel.setInfiniteData(key, ctx.prev);
    },

    onSettled: () => {
      utils.comments.getTopLevel.invalidate(key);
    },
     onSuccess: (serverRow, _vars, ctx) => {
      if (!ctx) return;

      // `serverRow` should be what your mutation returns: the created comment row.
      // Make sure your server returns the same shape your list uses (join fields, etc.).
      utils.comments.getTopLevel.setInfiniteData(key, (old) => {
        if (!old) return old;

        // Try to replace inside the first page; if you paginate, you could scan all pages
        const pages = old.pages.map((p, i) => {
          if (i !== 0) return p;
          const idx = p.comments.findIndex((c) => c.commentId === ctx.tempId);
          if (idx === -1) return p;

          // Merge to preserve any client-only fields if needed
          const replaced = {
            ...p.comments[idx],
            ...serverRow, // server has the real commentId, updatedAt, etc.
          };

          const nextComments = p.comments.slice();
          nextComments[idx] = replaced;
          return { ...p, comments: nextComments };
        });

        return { ...old, pages };
      });

      // still refetch in background to be safe
      utils.comments.getTopLevel.invalidate({videoId,limit:COMMENT_SECTION_SIZE});
    },
  });


  const createComment = (newComment:string) => {
    if (!isSignedIn) {
      clerk.openSignIn();
      return;
    }
    console.log('creating optimistic')
    createRootComment({
      videoId,
      comment: newComment,
    })
  }


  const UserTag = ({ tag }: { tag: string }) => {
    let bgColor = "bg-blue-100";
    let textColor = "text-blue-800";
    let icon = null;

    if (tag === "Creator") {
      bgColor = "bg-purple-100";
      textColor = "text-purple-800";
      icon = <Crown className="w-3 h-3" />;
    } else if (tag === "Top Fan" || tag === "VIP") {
      bgColor = "bg-amber-100";
      textColor = "text-amber-800";
      icon = <Star className="w-3 h-3" />;
    } else if (tag === "Editor") {
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      icon = <Zap className="w-3 h-3" />;
    } else if (tag === "Explorer") {
      bgColor = "bg-indigo-100";
      textColor = "text-indigo-800";
    } else if (tag === "Musician") {
      bgColor = "bg-pink-100";
      textColor = "text-pink-800";
    }

    return (
      <span className={`inline-flex items-center gap-1 ${bgColor} ${textColor} px-2 py-1 rounded-full text-xs font-medium`}>
        {icon}
        {tag}
      </span>
    );
  };

  return (

    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg h-full flex flex-col border border-gray-200 dark:border-gray-800 space-y-4 flex-1 ">


      {/* Comment description UI: input + comment count */}


      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span className="text-montserrat">Comments</span>
          {/* <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-1 ml-2">
            {comments.reduce((total, comment) => total + 1 + (comment.replies?.reduce((replyTotal, reply) => 
              replyTotal + 1 + (reply.replies?.length || 0), 0) || 0), 0)}
          </span> */}
          {compactNumber(rootComments.pages[0].commentCount ?? 0)}
        </h2>
      </div>

      {/* COmment input */}
      <CommentInput 
        viewer={viewer}
        createComment={createComment}
      />
      
      <div className="flex flex-col gap-6 m-4 min-w-0 overflow-x-hidden">

        {items.map((comment) =>
          <Comment key={comment.commentId} parentComment={comment} videoId={videoId} viewer={rootComments.pages[0].viewer} isPending={isPending} depth={1} maxDepth={4}/>
        )}
      </div>
      <InfiniteScroll
        isManual={false}
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />

    </div >

  );
};

