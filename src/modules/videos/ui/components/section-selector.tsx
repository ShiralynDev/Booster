"use client";

import { useState } from "react";
import { SuggestionsSection } from "../sections/suggestions-section";
import { CommentsSection } from "../sections/comments-section";
import { trpc } from "@/trpc/client"
import { VideoDescription } from "./video-description"
import { VideoReactions } from "./video-reactions"
import { useAuth } from "@clerk/nextjs"
type Tab = "videos" | "comments" | "info";

export const SectionSelector = ({ videoId }: { videoId: string }) => {
  const [tab, setTab] = useState<Tab>("info");

  const { data: video } = trpc.videos.getOne.useQuery({ id: videoId });

  const { isSignedIn } = useAuth()
  const utils = trpc.useContext()
  const createRating = trpc.videoRatings.create.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId })
      utils.home.getMany.invalidate({ limit: 10 })
    },
  })

  const onRate = (value: number) => {
    if (!isSignedIn) return false
    if (!value) return false
    createRating.mutate({ videoId, newRating: value })
    return true
  }

  return (
    <div className="mt-2 flex flex-col items-center">
      <div className="w-full max-w-[880px]">
        <div className="flex justify-center items-center gap-3 mb-5">
            <button
                onClick={() => setTab("info")}
                className={`px-3 py-1.5 rounded-full font-medium transition ${
                  tab === "info"
                   ? "bg-gradient-to-b from-primary to-secondary text-textprimary"
                    : "bg-[#333333]   text-white"
                }`}
              >
                Info
                
             </button>
          <button
            onClick={() => setTab("videos")}
            className={`px-3 py-1.5 rounded-full font-medium transition ${
              tab === "videos"
               ? "bg-gradient-to-b from-primary to-secondary text-textprimary"
                : "bg-[#333333]   text-white"
            }`}
          >
            Videos
          </button>
          <button
            onClick={() => setTab("comments")}
            className={`px-3 py-1.5 rounded-full font-medium transition ${
              tab === "comments"
                ? "bg-gradient-to-b from-primary to-secondary text-textprimary"
                : "bg-[#333333]   text-white"
            }`}
          >
            Comments
          </button>
              
        </div>

        <div>
          {tab === "videos" && (
            <div>
              <SuggestionsSection videoId={videoId} />
            </div>
          )}

          {tab === "comments" && (
            <div>
              <CommentsSection videoId={videoId} openComments home={false} />
            </div>
          )}

          {tab === "info" && (
            <div>
              {video ? (
                <div className="flex flex-col gap-4">
                  <VideoReactions
                  
                    avgRating={video.averageRating ?? 0}
                    videoRatings={video.videoRatings ?? 0}
                    onRate={onRate}
                    viewerRating={video.user?.viewerRating ?? 0}
                  />

                  <VideoDescription
                    compactViews={String(video.videoViews)}
                    expandedViews={String(video.videoViews)}
                    compactDate={new Date(video.createdAt).toLocaleDateString()}
                    expandedDate={new Date(video.createdAt).toLocaleDateString()}
                    description={video.description}
                  />
                </div>
              ) : (
                <div className="text-sm text-gray-500">Loading info…</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
