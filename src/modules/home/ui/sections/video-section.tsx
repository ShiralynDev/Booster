'use client';

import { useEffect, useRef, useState } from 'react';
import { compactDate, compactNumber } from '@/lib/utils';
import { HomeGetManyOutput, VideoGetOneOutput } from '@/modules/videos/types';
import { VideoPlayer } from '@/modules/videos/ui/components/video-player';
import { CommentsSection } from '@/modules/videos/ui/sections/comments-section';
import { Eye, Calendar, ThumbsUp, Share, Download, Save, Play, Clock, Edit3Icon, ChevronLeft, ZapIcon, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFollow } from '@/modules/follows/hooks/follow-hook';
import { SubButton } from '@/modules/subscriptions/ui/components/sub-button';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/user-avatar';
import { trpc } from '@/trpc/client';
import { VideoReactions } from '@/modules/videos/ui/components/video-reactions';
import { toast } from 'sonner';
import { DEFAULT_LIMIT } from '@/constants';
import { User } from '@/modules/users/types';

type Video = {
    user: {
        followsCount: number;
        viewerIsFollowing: boolean;
        videoCount: number;
        viewerRating: number;
        id: string;
        clerkId: string;
        name: string;
        imageUrl: string;
        createdAt: Date;
        updatedAt: Date;
    };
    videoRatings: number;
    averageRating: number;
    videoViews: number;
    id: string;
    title: string;
    description: string | null;
    muxStatus: string | null;
    muxAssetId: string | null;
    muxUploadId: string | null;
    muxPlaybackId: string | null;
    muxTrackId: string | null;
    muxTrackStatus: string | null;
    thumbnailUrl: string | null;
    thumbnailKey: string | null;
    updatedAt: Date;
    createdAt: Date;
    viewer:User | null;
}

interface Props { video: Video; }

export const VideoSection = ({ video }: Props) => {
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [showAddXpModal, setShowAddXpModal] = useState(false);
    const [selectedXp, setSelectedXp] = useState(10);
    const { isSignedIn, userId } = useAuth();
    const [showTitle, setShowTitle] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const videoPlayerRef = useRef<{ play: () => void; pause: () => void }>(null);

    const utils = trpc.useUtils();
    const { onClick } = useFollow({
        userId: video.user.id,
        isFollowing: video.user.viewerIsFollowing,
        fromVideoId: video.id,
        home: true,
    });

    useEffect(() => {
        const t = setTimeout(() => setShowTitle(false), 4000);
        return () => clearTimeout(t);
    }, []);

    const createView = trpc.videoViews.create.useMutation({
        onSuccess: () => { utils.home.getMany.invalidate({ limit:DEFAULT_LIMIT }); },
    });

    const handlePlay = () => {
        setIsPlaying(true);
        if (!isSignedIn) return;
        createView.mutate({ videoId: video.id });
    };
    const handlePause = () => setIsPlaying(false);

    // When open, comments panel is 40vh (desktop) / 50vh (mobile). When closed, 70px.
    const collapsedPx = 60;

    const createRating = trpc.videoRatings.create.useMutation({
        onSuccess: () => {
            utils.home.getMany.invalidate({ limit:DEFAULT_LIMIT })
        },
        onError: (error) => {
            if (error.message === "limit") toast.error("Wait a bit before rating again!")
        }
    })

    const onRate = (value: number) => {
        if (!isSignedIn) return false;
        if (!value) return false;

        createRating.mutate({
            videoId: video.id,
            newRating: value
        })
        return true;
    }

    const xpOptions = [10, 20, 50, 75, 100, 500, 1000];
    const currentXp = 350;
    const xpNeededForNextLevel = 1000;
    const level = 1;
    const progressPercentage = (currentXp / xpNeededForNextLevel) * 100;

    const handleAddXp = () => {
        // Here you would implement the actual XP adding logic
        console.log(`Adding ${selectedXp} XP`);
        setShowAddXpModal(false);
        toast.success(`Added ${selectedXp} XP to ${video.user.name}`);
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setSelectedXp(value);
        
        // Snap to the closest predefined value
        const closest = xpOptions.reduce((prev, curr) => {
            return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
        });
        
        setSelectedXp(closest);
    };

    // Create evenly spaced positions for all markers
    const getMarkerPosition = (value: number, index: number) => {
        return (index / (xpOptions.length - 1)) * 100;
    };

    return (
        <div className="h-full w-full flex flex-col gap-4 overflow-hidden">
            {/* Add XP Modal */}
            <AnimatePresence>
                {showAddXpModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAddXpModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add XP</h3>
                                <button 
                                    onClick={() => setShowAddXpModal(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="mb-6">
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Select how much XP to add to {video.user.name}</p>
                                
                                {/* XP Slider */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">XP Amount</span>
                                        <span className="text-lg font-bold text-amber-600 dark:text-amber-400">+{selectedXp}</span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="range"
                                            min="0"
                                            max="6"
                                            step="1"
                                            value={xpOptions.indexOf(selectedXp)}
                                            onChange={(e) => setSelectedXp(xpOptions[parseInt(e.target.value)])}
                                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                        />
                                        <div className="absolute top-3 left-0 right-0 flex justify-between pointer-events-none">
                                            {xpOptions.map((value, index) => (
                                                <div 
                                                    key={value} 
                                                    className={`w-0.5 h-3 bg-gray-400 rounded-full ${selectedXp === value ? 'bg-amber-500 h-4' : ''}`}
                                                    style={{ marginLeft: `${getMarkerPosition(value, index)}%` }}
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <span>10</span>
                                        <span>1000</span>
                                    </div>
                                </div>
                                
                                {/* Quick Select Buttons */}
                                <div className="grid grid-cols-4 gap-3">
                                    {xpOptions.map((xp) => (
                                        <button
                                            key={xp}
                                            onClick={() => setSelectedXp(xp)}
                                            className={`p-3 rounded-xl border transition-all ${
                                                selectedXp === xp 
                                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500 shadow-md' 
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-amber-400'
                                            }`}
                                        >
                                            <span className="font-semibold">+{xp}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAddXpModal(false)}
                                    className="flex-1 py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddXp}
                                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
                                >
                                    Add XP
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* VIDEO AREA */}
            <div className="relative group flex-1 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">

                {/* Floating title on pause / first seconds */}
                <AnimatePresence>
                    {(!isPlaying || showTitle) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute top-4 left-4 z-20 hidden sm:block pointer-events-none rounded-lg"
                        >
                            <div className="bg-white/90 dark:bg-[#333333]/90 backdrop-blur-md rounded-xl p-4 max-w-md border border-gray-200 dark:border-gray-700 shadow-md">
                                <h2 className="text-gray-900 dark:text-white font-bold text-lg line-clamp-1">{video.title}</h2>
                                <div className="flex items-center gap-4 mt-2 text-gray-600 dark:text-gray-300 text-sm">
                                    <div className="flex items-center gap-1"><Eye className="w-4 h-4" /><span>{compactNumber(video.videoViews)} views</span></div>
                                    <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{new Date(video.createdAt).toLocaleDateString()}</span></div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Player fills container */}
                <div className="absolute inset-0">
                    <VideoPlayer
                        ref={videoPlayerRef}
                        autoPlay={isPlaying}
                        onPlay={handlePlay}
                        onPause={handlePause}
                        playbackId={video.muxPlaybackId}
                        thumbnailUrl={video.thumbnailUrl}
                    />

                    {/* Big play overlay when paused */}
                    <AnimatePresence>
                        {!isPlaying && (
                            <motion.button
                                type="button"
                                onClick={() => videoPlayerRef.current?.play()}
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.85 }}
                                className="absolute inset-0 z-20 flex items-center justify-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-white/80 dark:bg-[#333333]/80 backdrop-blur-md flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                                        <Play className="h-8 w-8 text-white fill-white ml-1" />
                                    </div>
                                </div>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* META + BUTTONS */}
            <div className='flex items-start justify-between'>
                <div className="flex flex-col sm:items-start sm:justify-between gap-3 ml-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-gray-700 dark:text-gray-300 text-sm max-w-7xl">
                        <p className='text-2xl font-semibold text-gray-900 dark:text-white line-clamp-1'>{video.title} </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Channel Info Card */}
                        <div className="flex items-center bg-white dark:bg-[#333333] rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700 shadow-sm flex-1">
                            <div className="flex items-center gap-3">
                                <UserAvatar size="lg" imageUrl={video.user.imageUrl} name={video.user.name} className="ring-2 ring-white shadow-sm" />
                                <div className="flex-1">
                                    <div className='flex items-center gap-2'>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{video.user?.name ?? 'Channel Name'}</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{compactNumber(video.user.followsCount)} followers</p>
                                </div>
                                <div className='ml-2'>
                                    {userId === video.user.clerkId ? (
                                        <Button asChild variant="outline" size="sm" className="rounded-full gap-2 p-4 shadow-sm hover:shadow-md border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <a href={`/studio/videos/${video.id}`}>
                                                <Edit3Icon className="size-4" /><p>Edit</p>
                                            </a>
                                        </Button>
                                    ) : (
                                        <SubButton 
                                            onClick={onClick} 
                                            disabled={false} 
                                            isSubscribed={video.user.viewerIsFollowing} 
                                            className="rounded-full p-4 shadow-sm hover:shadow-md transition-all bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600" 
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* XP Progress Card */}
                        <div className="bg-gradient-to-r from-amber-400/10 to-orange-500/10 dark:from-amber-400/5 dark:to-orange-500/5 rounded-2xl p-4 border border-amber-200 dark:border-amber-800/50 shadow-sm flex-1 min-w-[300px]">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-1 rounded-lg">
                                        <ZapIcon className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Level {level}</span>
                                </div>
                                
                                <button 
                                    onClick={() => setShowAddXpModal(true)}
                                    className="flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-600 text-white py-1 px-2 rounded-lg transition-colors"
                                >
                                    <Plus className="w-3 h-3" />
                                    <span>Add XP</span>
                                </button>
                            </div>
                            
                            <div className="mb-2">
                                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    <span>{currentXp} XP</span>
                                    <span>{xpNeededForNextLevel} XP</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-amber-400 to-orange-500 h-2.5 rounded-full relative overflow-hidden"
                                        style={{ width: `${progressPercentage}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600 dark:text-gray-400">{xpNeededForNextLevel - currentXp} XP to next level</span>
                                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{progressPercentage.toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-start gap-2">
                    <button className="px-4 h-10 rounded-full bg-white dark:bg-[#333333] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition inline-flex items-center gap-2 shadow-sm">
                        <Share className="w-4 h-4" /><span className="text-sm font-medium">Share</span>
                    </button>
                    <div className="inline-flex items-center gap-2 bg-white dark:bg-[#333333] border border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded-full text-gray-700 dark:text-gray-300">
                        <Eye className="h-4 w-4" /><span className="font-medium">{compactNumber(video.videoViews)}</span>
                    </div>
                    <VideoReactions avgRating={video.averageRating} videoRatings={video.videoRatings} onRate={onRate} viewerRating={video.user.viewerRating}/>
                </div>
            </div>

            {/* COMMENTS PANEL */}
            <motion.div
                className="comments-panel rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#333333] backdrop-blur-md overflow-hidden shadow-sm"
                initial={false}
                animate={{ height: commentsOpen ? '45vh' : collapsedPx }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
                {commentsOpen ? (
                    <style>{`
                        @media (max-width: 768px){
                            .comments-panel{ height: 50vh !important; }
                        }
                    `}</style>
                ) : null}

                <CommentsSection
                    home
                    videoId={video.id}
                    openComments={commentsOpen}
                    onOpenChange={setCommentsOpen}
                />
            </motion.div>
        </div>
    );
};