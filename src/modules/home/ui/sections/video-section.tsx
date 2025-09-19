'use client';

import { useState } from 'react';
import { compactDate, compactNumber } from '@/lib/utils';
import { VideoGetOneOutput } from '@/modules/videos/types';
import { VideoPlayer } from '@/modules/videos/ui/components/video-player';
import { CommentsSection } from '@/modules/videos/ui/sections/comments-section';
import { Eye, Calendar, ThumbsUp, Share, Download, Save, ChevronDown, ChevronUp, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Video = VideoGetOneOutput;

interface Props {
  video: Video;
}

export const VideoSection = ({ video }: Props) => {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      {/* Video Container (glassy card, like sample) */}
      <div className="relative rounded-2xl overflow-hidden bg-black ring-1 ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
        {/* Keep the frame strictly 16:9 like the sample video */}
        <div className="relative aspect-video group">
          <VideoPlayer
            autoPlay
            playbackId={video.muxPlaybackId}
            thumbnailUrl={video.thumbnailUrl}
          />

          {/* Title on hover (top-left) */}
          <div className="pointer-events-none absolute top-5 left-5 opacity-0 group-hover:opacity-100 transition-opacity">
            <h1 className="text-xl sm:text-2xl font-semibold drop-shadow">
              {video.title}
            </h1>
          </div>

          {/* Controls bar on hover (bottom gradient) – visual match to sample */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="px-4 py-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying((v) => !v)}
                  className="pointer-events-auto h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 transition inline-flex items-center justify-center"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>

                {/* Progress bar (static visual like sample; wire up to real time if you want) */}
                <div className="flex-1 h-1.5 rounded bg-white/30 overflow-hidden cursor-pointer">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff00cc] to-[#3333ff]"
                    style={{ width: '35%' }}
                  />
                </div>

                <div className="ml-3 text-sm text-white/80">2:45 / 10:30</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats + actions row (like sample) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm">
          <div className="inline-flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>{video.videoViews}</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{compactDate(video.createdAt)}</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <ThumbsUp className="h-4 w-4" />
            <span>{compactNumber(video.averageRating)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="inline-flex items-center gap-2 px-5 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur transition">
            <Share className="h-4 w-4" />
            <span className="text-sm">Share</span>
          </button>
          <button className="inline-flex items-center gap-2 px-5 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur transition">
            <Download className="h-4 w-4" />
            <span className="text-sm">Download</span>
          </button>
          <button className="inline-flex items-center gap-2 px-5 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:opacity-90 transition">
            <Save className="h-4 w-4" />
            <span className="text-sm font-medium">Save</span>
          </button>
        </div>
      </div>

      {/* Comments section (collapsible like sample) */}
      <div className="rounded-2xl overflow-hidden bg-[rgba(20,20,35,0.95)] border border-white/10 shadow-[0_5px_25px_rgba(0,0,0,0.3)] backdrop-blur">
        <button
          onClick={() => setCommentsOpen((v) => !v)}
          className="w-full h-[70px] px-5 flex items-center justify-between border-b border-white/10"
        >
          <span className="text-base font-semibold inline-flex items-center gap-2">
            {/* Fake comment count for layout; wire up your count if you have it */}
            Comments
          </span>
          <span className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 inline-flex items-center justify-center transition">
            {commentsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {commentsOpen && (
            <motion.div
              key="comments"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: '40vh', opacity: 1 }} // similar to sample’s expanded height
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="p-4">
                <CommentsSection videoId={video.id} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
