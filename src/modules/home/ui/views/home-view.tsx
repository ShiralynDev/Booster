'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Bell, User, Search, Home, TrendingUp, History } from 'lucide-react';
import { trpc } from '@/trpc/client';
import { VideoSection } from '../sections/video-section';

export const HomeView = () => {
  const [video] = trpc.home.getOne.useSuspenseQuery({
    id: 'e4a0a1cd-4737-4c5d-9986-4d46f75067dd',
  });

  const [videoIndex, setVideoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Keyboard navigation
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
    <div className="min-h-96 flex flex-col bg-gradient-to-br from-amber-50 to-orange-50 text-gray-900 overflow-hidden">

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-amber-200 shadow-lg p-4">
              <div className="mb-6">
                <div className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  VidFlow
                </div>
              </div>
              
              <nav className="space-y-1">
                <button 
                  className={`flex items-center w-full p-3 rounded-lg text-left transition-colors ${activeTab === 'home' ? 'bg-amber-100 text-amber-700' : 'hover:bg-amber-50'}`}
                  onClick={() => setActiveTab('home')}
                >
                  <Home size={20} className="mr-3 text-amber-600" />
                  <span>Home</span>
                </button>
                
                <button 
                  className={`flex items-center w-full p-3 rounded-lg text-left transition-colors ${activeTab === 'trending' ? 'bg-amber-100 text-amber-700' : 'hover:bg-amber-50'}`}
                  onClick={() => setActiveTab('trending')}
                >
                  <TrendingUp size={20} className="mr-3 text-amber-600" />
                  <span>Trending</span>
                </button>
                
                <button 
                  className={`flex items-center w-full p-3 rounded-lg text-left transition-colors ${activeTab === 'history' ? 'bg-amber-100 text-amber-700' : 'hover:bg-amber-50'}`}
                  onClick={() => setActiveTab('history')}
                >
                  <History size={20} className="mr-3 text-amber-600" />
                  <span>History</span>
                </button>
              </nav>
            </div>
          </div>
        )}

        

        {/* Main content with side nav buttons + centered video */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex items-center justify-center gap-4 md:gap-6 max-w-6xl mx-auto">
            {/* Left nav button */}
            <button
              aria-label="Previous"
              onClick={() => setVideoIndex((i) => Math.max(0, i - 1))}
              className="hidden md:flex h-16 w-14 items-center justify-center rounded-xl
                         bg-white hover:bg-amber-50 border border-amber-200 text-amber-700 hover:text-amber-800
                         shadow-sm transition"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Center content */}
            <div className="w-full max-w-4xl">
              <VideoSection video={video} />
            </div>

            {/* Right nav button */}
            <button
              aria-label="Next"
              onClick={() => setVideoIndex((i) => i + 1)}
              className="hidden md:flex h-16 w-14 items-center justify-center rounded-xl
                         bg-white hover:bg-amber-50 border border-amber-200 text-amber-700 hover:text-amber-800
                         shadow-sm transition"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </main>
      </div>

      {/* Mobile navigation buttons */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-4 md:hidden z-10 px-4">
        <button
          onClick={() => setVideoIndex((i) => Math.max(0, i - 1))}
          className="h-14 w-14 bg-white rounded-full shadow-lg border border-amber-200 flex items-center justify-center text-amber-700 hover:bg-amber-50 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => setVideoIndex((i) => i + 1)}
          className="h-14 w-14 bg-white rounded-full shadow-lg border border-amber-200 flex items-center justify-center text-amber-700 hover:bg-amber-50 transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};