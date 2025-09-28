"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { trpc } from "@/trpc/client";
import { VideoSection } from "../sections/video-section";
import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { ErrorBoundary } from "react-error-boundary";

export const HomeView = () => {
  return (
    <Suspense fallback={<VideoSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Failed to load video :(</p>}>
        <HomeViewSuspense  />
      </ErrorBoundary>
    </Suspense>
  )
}

const VideoSectionSkeleton = () => {
  return (
    <div className="h-full w-full flex flex-col gap-4 overflow-hidden animate-pulse">
      {/* VIDEO AREA SKELETON */}
      <div className="relative group flex-1 rounded-2xl overflow-hidden bg-gray-300 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-sm">
        {/* Play button skeleton */}
        <div className="absolute inset-0 z-20 flex items-center justify-center -m-20">
          <div className="w-20 h-20 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-500 dark:bg-gray-500"></div>
          </div>
        </div>
      </div>

      {/* TOP ROW SKELETON */}
      <div className='flex items-start justify-between'>
        <div className="flex flex-col sm:items-start sm:justify-between gap-3 ml-2 flex-1">
          {/* Title skeleton */}
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded-lg w-3/4 max-w-md"></div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Channel Info Card Skeleton */}
            <div className="flex items-center bg-white dark:bg-[#333333] rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700 shadow-sm flex-1">
              <div className="flex items-center gap-3 w-full">
                <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                </div>
                <div className="w-20 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              </div>
            </div>

            {/* XP Progress Card Skeleton */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-4 border border-amber-500/20 flex items-center gap-3 min-w-48">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <div className="w-6 h-6 rounded bg-amber-500/30"></div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-amber-500/20 rounded w-20"></div>
                <div className="h-2 bg-amber-500/20 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="flex flex-wrap items-start gap-2">
          <div className="w-20 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div className="w-24 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full ml-1"></div>
        </div>
      </div>

      {/* COMMENTS PANEL SKELETON */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#333333] overflow-hidden shadow-sm h-[60px]">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
            </div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HomeViewSuspense = () => {
  const [data, query] = trpc.home.getMany.useSuspenseInfiniteQuery(
    { limit: DEFAULT_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );


  const videos = useMemo(() => {
    if (!data) return [];

    return data.pages.flatMap(
      (page) => Object.values(page.items).filter((item) => item)
    );
  }, [data]);



  const [videoIndex, setVideoIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const utils = trpc.useUtils();

  //prefetch video data for when required
  useEffect(() => {
    const ids = [videos[videoIndex]?.id, videos[videoIndex + 1]?.id].filter(Boolean) as string[];
    ids.forEach((id) => {
      utils.videos.getOne.prefetch({ id })
      utils.xp.getBoostByVideoId.prefetch({videoId:id})
  });
  }, [videoIndex, videos, utils]);


  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setDirection(1);
        if (videoIndex + 1 >= videos.length && !query.isFetchingNextPage) {
          query.fetchNextPage();
        }
        setVideoIndex((i) => Math.min(i + 1, videos.length));
      }
      if (e.key === "ArrowLeft") {
        setDirection(-1);
        setVideoIndex((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="h-dvh w-full flex flex-col overflow-hidden bg-[#f8f9fa] dark:bg-[#212121]">
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden gap-3">
       
        {/* Center content — no scrolling here */}
        <main className="flex-1 p-4 md:p-6 overflow-hidden">
          <div className="flex justify-center mx-auto max-w-full h-[95%]">
            {/* Left navigation button */}
            <div className="hidden md:flex h-full">
              <motion.button
                aria-label="Previous video"
                onClick={() => {
                  setDirection(-1);
                  setVideoIndex((i) => Math.max(0, i - 1));
                }}
                className="
                  w-20 rounded-2xl mr-4 flex items-center justify-center transition-all
                  border border-[rgba(255,202,85,0.3)]
                  text-[#FFA100]
                  shadow-[0_10px_30px_rgba(255,161,0,0.15)]
                  hover:bg-[#ffffdf45]
                  dark:hover:bg-[rgb(53,53,53)]
                  hover:shadow-[0_12px_35px_rgba(255,161,0,0.2)]
                  backdrop-blur-md
                  outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,202,85,0.35)]
                "
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ChevronLeft className="h-10 w-10" />
              </motion.button>
            </div>

            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={videoIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "tween", duration: 0.12, ease: "easeOut" }}
                className="w-full h-full"
              >
                {videoIndex < videos.length ? (
                  <VideoSection videoId={videos[videoIndex].id} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-gray-600 dark:text-gray-300">
                      No more videos
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Right navigation button */}
            <div className="hidden md:flex h-full">
              <motion.button
                aria-label="Next video"
                onClick={() => {
                  setDirection(1);
                  if (videoIndex + 1 >= videos.length && !query.isFetchingNextPage) {
                    query.fetchNextPage();
                  }
                  setVideoIndex((i) => Math.min(i + 1, videos.length));
                }}
                className="
                  w-20 rounded-2xl ml-4 flex items-center justify-center transition-all
                  border border-[rgba(255,202,85,0.3)]
                  text-[#FFA100]
                  shadow-[0_10px_30px_rgba(255,161,0,0.15)]
                  hover:bg-[#ffffdf45]
                  dark:hover:bg-[rgb(53,53,53)]
                  hover:shadow-[0_12px_35px_rgba(255,161,0,0.2)]
                  backdrop-blur-md
                  outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,202,85,0.35)]
                "
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ChevronRight className="h-10 w-10" />
              </motion.button>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile navigation buttons */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-6 md:hidden z-10 px-4 pointer-events-none">
        <motion.button
          onClick={() => {
            setDirection(-1);

            setVideoIndex((i) => Math.max(0, i - 1));
          }}
          className="
            pointer-events-auto h-14 w-14 rounded-full flex items-center justify-center transition-colors
            bg-[rgba(255,248,230,0.7)]
            border border-[rgba(255,202,85,0.3)]
            text-[#FFA100]
            shadow-[0_10px_30px_rgba(255,161,0,0.15)]
            hover:bg-[rgba(255,202,85,0.2)]
            hover:shadow-[0_12px_35px_rgba(255,161,0,0.2)]
            outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,202,85,0.35)]
          "
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft className="h-6 w-6" />
        </motion.button>
        <motion.button
          onClick={() => {
            setDirection(1);
            if (videoIndex + 1 >= videos.length && !query.isFetchingNextPage) {
              query.fetchNextPage();
            }
            setVideoIndex((i) => Math.min(i + 1, videos.length));
          }}
          className="
            pointer-events-auto h-14 w-14 rounded-full flex items-center justify-center transition-colors
            bg-[rgba(255,248,230,0.7)]
            border border-[rgba(255,202,85,0.3)]
            text-[#FFA100]
            shadow-[0_10px_30px_rgba(255,161,0,0.15)]
            hover:bg-[rgba(255,202,85,0.2)]
            hover:shadow-[0_12px_35px_rgba(255,161,0,0.2)]
            outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,202,85,0.35)]
          "
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight className="h-6 w-6" />
        </motion.button>
        <InfiniteScroll
          isManual
          hasNextPage={query.hasNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
          fetchNextPage={query.fetchNextPage}
        />
      </div>


    </div>
  );
};
