'use client';

import { useState } from 'react';
import { compactDate, compactNumber } from '@/lib/utils';
import { VideoGetOneOutput } from '@/modules/videos/types';
import { VideoPlayer } from '@/modules/videos/ui/components/video-player';
import { CommentsSection } from '@/modules/videos/ui/sections/comments-section';
import { Eye, Calendar, ThumbsUp, Share, Download, Save, ChevronDown, ChevronUp, Play, Pause, MessageCircle, Edit3Icon, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFollow } from '@/modules/follows/hooks/follow-hook';
import { SubButton } from '@/modules/subscriptions/ui/components/sub-button';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/user-avatar';

type Video = VideoGetOneOutput;

interface Props {
    video: Video;
}

export const VideoSection = ({ video }: Props) => {
    const [commentsOpen, setCommentsOpen] = useState(false);
    const { userId } = useAuth();
    const [isPlaying, setIsPlaying] = useState(true);
    const [showControls, setShowControls] = useState(false);
    const { onClick, isPending } = useFollow({
        userId: video.user.id,
        isFollowing: video.user.viewerIsFollowing,
        fromVideoId: video.id
    })


    return (
        <div className="flex flex-col gap-6 p-4 bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen">
            {/* Video Container with light theme styling */}
            <div className="relative rounded-2xl overflow-hidden bg-white shadow-xl ring-1 ring-amber-200/50 group">
                {/* Keep the frame strictly 16:9 */}
                <div
                    className="relative aspect-video"
                    onMouseEnter={() => setShowControls(true)}
                    onMouseLeave={() => setShowControls(false)}
                >
                    <VideoPlayer
                        autoPlay
                        playbackId={video.muxPlaybackId}
                        thumbnailUrl={video.thumbnailUrl}
                    />

                    {/* Title on hover (top-left) */}
                    <div className={`pointer-events-none absolute top-5 left-5 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                        <h1 className="text-xl sm:text-2xl font-semibold text-white drop-shadow-md bg-black/30 px-3 py-1 rounded-lg">
                            {video.title}
                        </h1>
                    </div>

                    {/* Controls bar on hover */}
                   
                </div>
            </div>

            {/* Video Info Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{video.title}</h1>
                <p className="text-gray-600 mb-6">{video.description || "No description available"}</p>

                {/* Stats + actions row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-amber-100">
                    <div className="flex flex-wrap items-center gap-6 text-amber-700 text-sm">
                        <div className="inline-flex items-center gap-2 bg-amber-100 px-3 py-1.5 rounded-full">
                            <Eye className="h-4 w-4" />
                            <span className="font-medium">{compactNumber(video.videoViews)} views</span>
                        </div>
                        <div className="inline-flex items-center gap-2 bg-amber-100 px-3 py-1.5 rounded-full">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">{compactDate(video.createdAt)}</span>
                        </div>
                        <div className="inline-flex items-center gap-2 bg-amber-100 px-3 py-1.5 rounded-full">
                            <ThumbsUp className="h-4 w-4" />
                            <span className="font-medium">{compactNumber(video.averageRating)} likes</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button className="inline-flex items-center gap-2 px-5 h-10 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200 transition">
                            <Share className="h-4 w-4" />
                            <span className="text-sm font-medium">Share</span>
                        </button>
                        <button className="inline-flex items-center gap-2 px-5 h-10 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200 transition">
                            <Download className="h-4 w-4" />
                            <span className="text-sm font-medium">Download</span>
                        </button>
                        <button className="inline-flex items-center gap-2 px-5 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 transition shadow-md">
                            <Save className="h-4 w-4" />
                            <span className="text-sm font-medium">Save</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Channel Info */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
                <div className="flex items-center gap-4">
                 <UserAvatar
                        size="lg"
                        imageUrl={video.user.imageUrl}
                        name={video.user.name}
                        className="ring-2 ring-white shadow-lg"
              />
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{video.user?.name || 'Channel Name'}</h3>
                        <p className="text-sm text-amber-600">{video.user.followsCount}</p>
                    </div>
                    <div className="flex">
                        {userId === video.user.clerkId ? (
                            <Button
                                className="rounded-full gap-2 shadow-sm hover:shadow-md transition-all"
                                asChild
                                variant="secondary"
                                size="sm"
                            >
                                <Link href={`/studio/videos/${video.id}`}>
                                    <Edit3Icon className="size-4" />
                                </Link>
                            </Button>
                        ) : (
                            <SubButton
                                onClick={onClick}
                                disabled={false}
                                isSubscribed={video.user.viewerIsFollowing}
                                className="rounded-full p-4 shadow-sm hover:shadow-md transition-all"
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Comments section */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-amber-100">
                <button
                    onClick={() => setCommentsOpen((v) => !v)}
                    className="w-full h-16 px-6 flex items-center justify-between border-b border-amber-100 hover:bg-amber-50 transition"
                >
                    <span className="text-lg font-semibold text-amber-900 inline-flex items-center gap-3">
                        <MessageCircle className="h-5 w-5 text-amber-600" />
                        Comments (24)
                    </span>
                    <span className="h-10 w-10 rounded-full bg-amber-100 hover:bg-amber-200 inline-flex items-center justify-center transition text-amber-700">
                        {commentsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </span>
                </button>

                <AnimatePresence initial={false}>
                    {commentsOpen && (
                        <motion.div
                            key="comments"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                        >
                            <div className="p-6">
                                <CommentsSection videoId={video.id} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>


        </div>
    );
};