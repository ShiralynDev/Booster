'use client'
import { motion, AnimatePresence } from "framer-motion";
import { Play, Eye,  StarIcon, Calendar1,  RocketIcon, Trophy, BoxesIcon, X } from "lucide-react";
import { useState, useMemo, Suspense } from "react";
import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { compactDate } from "@/lib/utils";
import { VideoThumbnail } from "@/modules/videos/ui/components/video-thumbnail";
import { UserAvatar } from "@/components/user-avatar";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { ErrorBoundary } from "react-error-boundary";
import { BunnyEmbed } from "@/modules/videos/ui/sections/BunnyEmbed";
import { useAuth } from "@clerk/nextjs";

interface HomeViewProps {
    categoryId?: string;
}

export const RewardsView = ({ categoryId }: HomeViewProps) => {
    return (
        <Suspense fallback={<RewardsSkeleton />}>
            <ErrorBoundary fallback={<p>Failed to load categories.</p>}>
                <RewardsViewSuspense categoryId={categoryId} />
            </ErrorBoundary>
        </Suspense>
    )
}

const RewardsSkeleton = () => {
    return (
        <div className="overflow-hidden mb-10 px-4 pt-2.5 flex flex-col gap-y-8 animate-pulse">
        </div>
    );
};

// Video Player Popup Component
interface VideoPlayerPopupProps {
    videoId: string;
    isOpen: boolean;
    onClose: () => void;
    videos: any[];
}

const VideoPlayerPopup = ({ videoId, isOpen, onClose, videos }: VideoPlayerPopupProps) => {
    const video = videos.find(v => v.id === videoId);


    const { userId: clerkUserId } = useAuth();
    const utils = trpc.useUtils();
    const { data: user } = trpc.users.getByClerkId.useQuery({
        clerkId: clerkUserId,
    });
    const userId = user?.id;

    const { mutate: buy } = trpc.xp.rewardXp.useMutation({
        onSuccess: () => {
          utils.xp.getXpByUserId.invalidate({ userId });
          utils.assets.getAssetsByUser.invalidate();
        }
      })
    
    const createView = trpc.videoViews.create.useMutation({
        onSuccess: () => {
            utils.videos.getOne.invalidate({ id: videoId });
        },
    });



    const videoEnd = () => {
        console.log("SE TERMINO JIJIJIJI")
        buy({amount: 35, videoId})
        createView.mutate({videoId})
    }

    if (!video) return null;

    console.log("JAJA");

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Popup Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-4">
                                    <UserAvatar
                                        size="md"
                                        imageUrl={video.user?.imageUrl || "/public-user.png"}
                                        name={video.user?.name || "Anonymous"}
                                        userId={video.user?.id}
                                        badgeSize={5}
                                    />
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                            {video.title || "Untitled"}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            {video.user?.name?.replace(/\s*null\s*$/i, "") || "Anonymous"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Video Player */}
                            <div className=" bg-black relative">
                                {/* You can replace the above with your actual video player: */}
                                <BunnyEmbed libraryId={video.bunnyLibraryId} videoId={video.bunnyVideoId}                                    
                                    onVideoEnd={videoEnd}
                                />
                               
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export const RewardsViewSuspense = ({ categoryId }: HomeViewProps) => {
    const [watching, setWatching] = useState("");
    const [selectedCategory] = useState();
    console.log(categoryId)

    const [data, query] = trpc.explorer.getMany.useSuspenseInfiniteQuery(
        { limit: DEFAULT_LIMIT * 2 },
        { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

    const videos = useMemo(() => data ? data.pages.flatMap(p => p.items) : [], [data]);
    const featuredVideos = videos.filter(v => v.isFeatured);

    const closeVideoPopup = () => setWatching("");

    return (
        <div className="overflow-hidden mb-10 px-4 pt-2.5 flex flex-col gap-y-12 sm:ml-16">
            {/* Video Player Popup */}
            <VideoPlayerPopup
                videoId={watching}
                isOpen={watching !== ""}
                onClose={closeVideoPopup}
                videos={videos}
            />

            {/* Enhanced Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative text-center mb-8"
            >
                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            rotate: 360,
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            rotate: -360,
                            scale: [1.2, 1, 1.2]
                        }}
                        transition={{
                            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
                    />
                </div>

                <div className="relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-amber-600 to-orange-600 dark:from-white dark:via-amber-400 dark:to-orange-400 bg-clip-text text-transparent mt-5 pt-5 leading-tight"
                    >
                        Rewards
                    </motion.h1>
                </div>
            </motion.div>

            {/* Enhanced Video Grid Section */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.7 }}
                className="relative"
            >
                {/* Enhanced Video Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedCategory}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 space-y-8 items-end"
                    >
                        {featuredVideos.map((video, index) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="group cursor-pointer relative"
                            >
                                {/* Enhanced Hover Glow */}
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                />

                                <div className="relative bg-transparent rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border"
                                    onClick={() => {setWatching(video.id)}}
                                >
                                    {/* Video Thumbnail */}
                                    <div className="relative aspect-video overflow-hidden">
                                        <VideoThumbnail
                                            duration={video.duration || 0}
                                            title={video.title}
                                            imageUrl={video.thumbnailUrl}
                                            previewUrl={video.previewUrl}
                                        />

                                        <div className="flex items-center gap-1 absolute top-4 right-4">
                                            <BoxesIcon className="size-4 text-purple-500" />
                                            <span className="text-xs">35</span>
                                        </div>

                                        {/* Enhanced Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Enhanced Video Info Overlay */}
                                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                                            {video.categoryId && (
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-lg backdrop-blur-sm"
                                                >
                                                    {video.categoryId}
                                                </motion.div>
                                            )}

                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                whileHover={{ opacity: 1, scale: 1 }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                            >
                                                <div className="bg-black/80 text-white px-3 py-1 rounded-lg text-xs font-medium backdrop-blur-sm flex items-center gap-1">
                                                    <Play className="w-3 h-3" />
                                                    Watch
                                                </div>
                                            </motion.div>
                                        </div>

                                        {/* Enhanced Stats Overlay */}
                                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="flex items-center gap-3 text-white text-sm">
                                                <div className="flex items-center gap-1 backdrop-blur-sm bg-black/30 px-2 py-1 rounded-lg">
                                                    <Eye className="w-3 h-3" />
                                                    <span>{formatCompactNumber(Number(video.videoViews) || 0)}</span>
                                                </div>
                                                <div className="flex items-center gap-1 backdrop-blur-sm bg-black/30 px-2 py-1 rounded-lg">
                                                    <StarIcon className="w-3 h-3 text-yellow-300" />
                                                    <span>{Number(video.averageRating).toFixed(1)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enhanced Content */}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-3 line-clamp-2">
                                            {video.title || "Untitled"}
                                        </h3>

                                        {/* Enhanced Creator Info */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <UserAvatar
                                                size="md"
                                                imageUrl={video.user?.imageUrl || "/public-user.png"}
                                                name={video.user?.name || "Anonymous"}
                                                userId={video.user?.id}
                                                badgeSize={5}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                                    {video.user?.name?.replace(/\s*null\s*$/i, "") || "Anonymous"}
                                                </p>
                                                {video.user?.name === "sammas24 null" ? (
                                                    <p className="flex items-center gap-2 text-orange-500 text-xs">
                                                        Founder & Developer <RocketIcon className="size-3" />
                                                    </p>
                                                ) : (
                                                    <p className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                                                        Top Content Creator <Trophy className="size-3" />
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Enhanced Stats */}
                                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-4 h-4" />
                                                    <span>{formatCompactNumber(Number(video.videoViews) || 0)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <StarIcon className="w-4 h-4 text-yellow-500" />
                                                    <span>{Number(video.averageRating).toFixed(1)}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                                <Calendar1 className="w-4 h-4" />
                                                <span>{compactDate(video.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            <InfiniteScroll
                isManual={false}
                hasNextPage={query.hasNextPage}
                isFetchingNextPage={query.isFetchingNextPage}
                fetchNextPage={query.fetchNextPage}
            />
        </div>
    );
};

const formatCompactNumber = (number: number): string => {
    return Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(number);
};