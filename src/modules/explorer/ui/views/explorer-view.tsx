'use client'
import { motion, AnimatePresence } from "framer-motion";
import { CategoriesSection } from "../sections/categories-section";
import { Play, Eye, Clock, Star, TrendingUp, Sparkles, ArrowRight, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

interface HomeViewProps {
  categoryId?: string;
}

interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
  views: number;
  rating: number;
  user: {
    name: string;
    imageUrl: string;
  };
  category: string;
  isFeatured?: boolean;
}

export const ExplorerView = ({ categoryId }: HomeViewProps) => {
  const [selectedCategory, setSelectedCategory] = useState(categoryId || "all");
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load videos immediately
    setVideos(mockVideos);
    setIsLoading(false);
  }, [selectedCategory]);

  const filteredVideos = selectedCategory === "all" 
    ? videos 
    : videos.filter(video => video.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full mb-4">
          <Zap className="w-4 h-4" />
          <span className="text-sm font-medium">TRENDING NOW</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Discover Amazing Content
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore curated videos from talented creators around the world
        </p>
      </motion.div>

      {/* Categories Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <CategoriesSection 
          categoryId={selectedCategory} 
          onCategoryChange={setSelectedCategory}
        />
      </motion.div>

      {/* Featured Video Section */}
      {!isLoading && filteredVideos.some(video => video.isFeatured) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 rounded-3xl p-8 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Today</h2>
              <Sparkles className="w-5 h-5 text-amber-500 ml-2" />
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {filteredVideos.filter(v => v.isFeatured).slice(0, 1).map((video) => (
                <div key={video.id} className="relative group">
                  <div className="relative rounded-2xl ">
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      width={600}
                      height={256}
                      priority
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-amber-500 text-white px-3 py-1 rounded-lg text-sm font-medium inline-block mb-2">
                        Featured
                      </div>
                      <h3 className="text-xl font-bold text-white line-clamp-2">{video.title}</h3>
                    </div>
                    <div className="absolute top-4 right-4 bg-black/80 text-white px-2 py-1 rounded-lg text-sm">
                      {video.duration}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Why you'll love this:</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    Stunning cinematography and visuals
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    Expert storytelling techniques
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    Community rating: 4.8+ stars
                  </li>
                </ul>
                <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2">
                  Watch Now
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Video Grid Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedCategory === "all" ? "Popular Videos" : `${selectedCategory} Videos`}
            </h2>
          </div>
          <button className="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
            <span className="text-sm font-medium">View all</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl aspect-video mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredVideos.filter(v => !v.isFeatured).map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="relative  rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600 transition-all duration-300 hover:shadow-xl">
                    <div className="relative aspect-video ">
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 right-3 bg-black/80 text-white px-2 py-1 rounded-lg text-xs">
                        {video.duration}
                      </div>
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                        {video.category}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {video.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Image
                          src={video.user.imageUrl}
                          alt={video.user.name}
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {video.user.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{formatCompactNumber(video.views)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          <span>{video.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center py-12"
      >
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 rounded-3xl p-8 border border-amber-200 dark:border-amber-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to explore more?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Join thousands of viewers discovering amazing content every day
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 transform hover:-translate-y-0.5">
            Explore All Categories
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Helper function
const formatCompactNumber = (number: number): string => {
  return Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(number);
};

// Mock data
const mockVideos: Video[] = [
  {
    id: "1",
    title: "Amazing Mountain Landscape Timelapse",
    thumbnailUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    duration: "4:32",
    views: 1250000,
    rating: 4.8,
    user: {
      name: "NatureLover",
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
    },
    category: "Nature",
    isFeatured: true
  },
  {
    id: "2",
    title: "Urban City Life - Street Photography",
    thumbnailUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    duration: "7:15",
    views: 890000,
    rating: 4.6,
    user: {
      name: "CityExplorer",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
    },
    category: "Urban"
  },
  {
    id: "3",
    title: "Cooking Masterclass: Italian Cuisine",
    thumbnailUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    duration: "12:45",
    views: 2300000,
    rating: 4.9,
    user: {
      name: "ChefMarco",
      imageUrl: "https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
    },
    category: "Cooking"
  },
  {
    id: "4",
    title: "Sunset Beach Meditation Guide",
    thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    duration: "18:20",
    views: 560000,
    rating: 4.7,
    user: {
      name: "ZenMaster",
      imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
    },
    category: "Wellness"
  },
  {
    id: "5",
    title: "Wildlife Documentary: African Safari",
    thumbnailUrl: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    duration: "22:10",
    views: 1780000,
    rating: 4.8,
    user: {
      name: "WildlifeDoc",
      imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
    },
    category: "Nature"
  },
  {
    id: "6",
    title: "Tech Review: Latest Smartphone 2024",
    thumbnailUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    duration: "8:45",
    views: 920000,
    rating: 4.5,
    user: {
      name: "TechGuru",
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
    },
    category: "Technology"
  },
  {
    id: "7",
    title: "Morning Yoga Routine for Beginners",
    thumbnailUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    duration: "15:30",
    views: 670000,
    rating: 4.7,
    user: {
      name: "YogaMaster",
      imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
    },
    category: "Wellness"
  },
  {
    id: "8",
    title: "DIY Home Decor Ideas on a Budget",
    thumbnailUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    duration: "10:20",
    views: 430000,
    rating: 4.4,
    user: {
      name: "HomeDesigner",
      imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
    },
    category: "Lifestyle"
  }
];
