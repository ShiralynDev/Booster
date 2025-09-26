'use client'

import { DEFAULT_LIMIT } from "@/constants"
import { trpc } from "@/trpc/client"
import { Suspense, useMemo, useState } from "react"
import { format } from "date-fns"
import { compactDate, compactNumber, formatDuration } from "@/lib/utils"
import Image from "next/image"
import { VideoThumbnail } from "@/modules/videos/ui/components/video-thumbnail"
import { UserAvatar } from "@/components/user-avatar"
import { Rating, RatingButton } from "@/components/ui/shadcn-io/rating"
import { InfiniteScroll } from "@/components/infinite-scroll"
import { ErrorBoundary } from "react-error-boundary"

interface SearchViewProps {
    query: string | undefined
}


export const SearchView = ({ query }: SearchViewProps) => {
    return (
        <Suspense fallback={<SearchViewSkeleton />}>
            <ErrorBoundary fallback={<p>Error</p>}>
                <SearchViewSuspense query={query} />
            </ErrorBoundary>
        </Suspense>
    )
}

const SearchViewSkeleton = () => {
    return (
        <div className="min-h-screen bg-[#212121] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Results Header Skeleton */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-gray-700">
                    <div className="h-4 bg-gray-700 rounded w-48 animate-pulse"></div>
                    <div className="flex items-center gap-3">
                        <div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
                        <div className="h-10 bg-gray-700 rounded w-32 animate-pulse"></div>
                    </div>
                </div>

                {/* Video List Skeleton */}
                <div className="space-y-6">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex flex-col lg:flex-row bg-[#333333] rounded-xl overflow-hidden border border-gray-700 animate-pulse"
                        >
                            {/* Thumbnail Skeleton */}
                            <div className="relative lg:w-96 xl:w-[400px] h-48 lg:h-56 flex-shrink-0 bg-gray-700">
                            </div>

                            {/* Video Content Skeleton */}
                            <div className="flex-1 p-6 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="h-6 bg-gray-700 rounded w-3/4 animate-pulse"></div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
                                        <div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gray-700 animate-pulse"></div>
                                        <div className="h-4 bg-gray-700 rounded w-32 animate-pulse"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
                                        <div className="h-4 bg-gray-700 rounded w-2/3 animate-pulse"></div>
                                    </div>
                                </div>

                                {/* Rating Skeleton */}
                                <div className="flex items-center gap-3 mt-4">
                                    <div className="flex gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                                        ))}
                                    </div>
                                    <div className="h-4 bg-gray-700 rounded w-8 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination Skeleton */}
                <div className="flex justify-center gap-2 mt-12">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="w-11 h-11 bg-gray-700 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export const SearchViewSuspense = ({ query }: SearchViewProps) => {

    const [data, resultQuery] = trpc.search.getManyByQuery.useSuspenseInfiniteQuery(
        { query, limit: DEFAULT_LIMIT },
        { getNextPageParam: (lastPage) => lastPage.nextCursor }
    )

    // Use actual data when available, otherwise use mock data
    const videos = useMemo(() => {
        if (!data) return [];

        return data.pages.flatMap(
            (page) => Object.values(page.items).filter((item) => item)
        );
    }, [data]);

    return (
        <div className="min-h-screen bg-[#212121] text-white">
            {/* Results Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-gray-700">
                    <div className="text-gray-400 text-sm">
                        {videos.length} results
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-gray-300">Sort by:</span>
                        <select className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent">
                            <option>Relevance</option>
                            <option>Upload date</option>
                            <option>View count</option>
                            <option>Rating</option>
                        </select>
                    </div>
                </div>

                {/* Video List */}
                <div className="space-y-6">
                    {videos.map((video) => (
                        <div
                            key={video.id}
                            className="flex flex-col lg:flex-row bg-[#333333] rounded-xl overflow-hidden border border-gray-700 hover:border-yellow-400/30 transition-all duration-300 hover:shadow-2xl "
                        >
                            {/* Thumbnail */}
                            <div className="relative lg:w-96 xl:w-[400px] h-48 lg:h-56 flex-shrink-0">
                                <VideoThumbnail title={video.title} duration={video.duration} imageUrl={video.thumbnailUrl}
                                />

                                {/* {video.isLive && (
                                    <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
                                        Live
                                    </div>
                                )} */}
                            </div>

                            {/* Video Content */}
                            <div className="flex-1 p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                                        {video.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-gray-400 text-sm mb-3">
                                        <span>{compactNumber(Number(video.videoViews) ?? 0)}</span>
                                        <span>{compactDate(video.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <UserAvatar imageUrl={video.user.imageUrl} name={video.user.name} userId={video.user.id} />
                                        <span className="font-medium">{video.user.name}</span>
                                        {/* TODO: verified */}
                                        {/* {video.channel.verified && (
                                            <i className="fas fa-check-circle text-yellow-400 text-sm" />
                                        )} */}
                                    </div>
                                    <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                                        {video.description}
                                    </p>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-3">
                                    <Rating value={Math.floor(Number(video.averageRating))} readOnly>
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <RatingButton className="text-amber-500" key={index} />
                                        ))}
                                    </Rating>
                                    <div className="text-center">
                                        <p className="text-xs text-muted-foreground">({Number(video.averageRating).toFixed(1)})</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <InfiniteScroll isManual={false} hasNextPage={resultQuery.hasNextPage} isFetchingNextPage={resultQuery.isFetchingNextPage} fetchNextPage={resultQuery.fetchNextPage} />
            </div>
        </div>
    )
}