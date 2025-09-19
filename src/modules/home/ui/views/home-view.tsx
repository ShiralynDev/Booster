'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Bell, User, Search } from 'lucide-react';
import { trpc } from '@/trpc/client';
import { VideoSection } from '../sections/video-section';

export const HomeView = () => {
  // Suspense query: don't destructure as array
  const [video] = trpc.home.getOne.useSuspenseQuery({
    id: 'e4a0a1cd-4737-4c5d-9986-4d46f75067dd',
  });

  const [videoIndex, setVideoIndex] = useState(0);

  // Keyboard nav like the sample
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setVideoIndex((i) => i + 1);
      if (e.key === 'ArrowLeft') setVideoIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!video) return null;

  return (
    <div className="min-h-dvh flex flex-col bg-[#0f0f1a] text-white overflow-hidden">
      {/* Header (matches sample look) */}
      <header className="h-[70px] px-4 md:px-8 flex items-center justify-between bg-[rgba(20,20,35,0.95)] border-b border-white/10 backdrop-blur">
        <div className="text-2xl font-bold bg-gradient-to-r from-[#ff00cc] to-[#3333ff] bg-clip-text text-transparent select-none">
          VidFlow
        </div>

        <div className="flex-1 max-w-[500px] mx-4 hidden sm:block">
          <label className="flex items-center gap-2 rounded-full px-4 py-2 bg-white/10 border border-white/10">
            <Search className="h-5 w-5 text-white/70" />
            <input
              className="w-full bg-transparent outline-none text-white placeholder:text-white/60"
              placeholder="Search for videos..."
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition inline-flex items-center justify-center">
            <Bell className="h-5 w-5" />
          </button>
          <button className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition inline-flex items-center justify-center">
            <User className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main content with side nav buttons + centered, capped video rail */}
      <main className="flex-1 px-4 md:px-8 py-4 md:py-6 overflow-hidden">
        <div className="grid grid-cols-[64px_minmax(0,1000px)_64px] items-center gap-4 md:gap-6 justify-center">
          {/* Left nav button (hidden on small screens, like sample) */}
          <button
            aria-label="Previous"
            onClick={() => setVideoIndex((i) => Math.max(0, i - 1))}
            className="hidden md:flex h-20 w-16 items-center justify-center rounded-2xl
                       bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white
                       backdrop-blur transition text-2xl"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>

          {/* Center rail (matches the smaller centered player) */}
          <div className="w-full mx-auto">
            <VideoSection video={video} />
          </div>

          {/* Right nav button */}
          <button
            aria-label="Next"
            onClick={() => setVideoIndex((i) => i + 1)}
            className="hidden md:flex h-20 w-16 items-center justify-center rounded-2xl
                       bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white
                       backdrop-blur transition text-2xl"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </div>
      </main>
    </div>
  );
};
