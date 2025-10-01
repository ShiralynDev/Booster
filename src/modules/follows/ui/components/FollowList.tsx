'use client'
import { UserAvatar } from "@/components/user-avatar";
import { trpc } from "@/trpc/client"
import { Users,   Crown,Search,  Sparkles, UserPlus,  Zap, ArrowRight  } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const FollowList = () => {
    const [followList] = trpc.follows.getMany.useSuspenseQuery();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredUsers = followList.filter(user => 
        user.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );


    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto">
                {/* Enhanced Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.03 }}
                    className="text-center mb-12 relative"
                >
                    {/* Background Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                            animate={{ 
                                rotate: 360,
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                                scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                            }}
                            className="absolute -top-20 left-1/4 w-32 h-32 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full blur-3xl"
                        />
                        <motion.div
                            animate={{ 
                                rotate: -360,
                                scale: [1.1, 1, 1.1]
                            }}
                            transition={{ 
                                rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                                scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                            }}
                            className="absolute -top-20 right-1/4 w-32 h-32 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-full blur-3xl"
                        />
                    </div>

                    <div className="relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-4 py-2 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 mb-4"
                        >
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span className="text-amber-600 dark:text-amber-400 font-semibold text-sm">
                                Your Communities
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 dark:from-amber-400 dark:via-orange-400 dark:to-yellow-400 bg-clip-text text-transparent  pb-3"
                        >
                            Following
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.2 }}
                            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
                        >
                            Manage and explore the amazing creators you follow
                        </motion.p>
                    </div>
                </motion.div>

                {/* Enhanced Search and Stats Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0, duration: 0.2 }}
                    className="relative mb-8"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur-xl transform scale-105" />
                    
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-amber-200/50 dark:border-amber-800/50">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                            {/* Enhanced Search */}
                            <div className="relative w-full lg:w-96">
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl blur-sm" />
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-500 h-5 w-5" />
                                    <input
                                        type="text"
                                        placeholder="Search people you follow..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white rounded-xl border border-amber-200 dark:border-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400"
                                    />
                                </div>
                            </div>
                            
                            {/* Enhanced Stats */}
                            <div className="flex flex-wrap gap-6">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="flex items-center gap-3 bg-white/50 dark:bg-gray-700/50 px-4 py-3 rounded-xl border border-amber-200 dark:border-amber-800 backdrop-blur-sm"
                                >
                                    <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                            {followList.length}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
                                    </div>
                                </motion.div>

                               

                                
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Enhanced User Cards Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={searchQuery}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                    >
                        {filteredUsers.map((user ) => (
                            <motion.div
                                key={user.user?.id}
                                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="relative group cursor-pointer"
                            >
                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-105 -z-10" />

                                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-amber-100 dark:border-amber-800 group-hover:border-amber-300 dark:group-hover:border-amber-600 transition-all duration-300 overflow-hidden">
                                    {/* Premium Badge for Top Creators */}
                                    {(user.user?.followsCount || 0) > 3 && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="absolute top-4 right-4"
                                        >
                                            <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                                <Crown className="h-3 w-3" />
                                                <span>Top</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* User Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                className="relative"
                                            >
                                                <UserAvatar
                                                    imageUrl={user.user?.imageUrl}
                                                    name={user.user?.name}
                                                    size='lg'
                                                    className="ring-2 ring-amber-400 group-hover:ring-amber-500 transition-all duration-300 shadow-lg"
                                                    userId={user.user?.id}
                                                />
                                                {/* Online Indicator */}
                                                {/* <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" /> */}
                                            </motion.div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                    {user.user?.name}
                                                </h3>
                                                <div className="flex items-center text-amber-600 dark:text-amber-400 text-sm mt-1">
                                                    <Users className="h-4 w-4 mr-1" />
                                                    <span>{formatCompactNumber(user.user?.followsCount || 0)} followers</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                       
                                    </div>
                                    
                                   

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4 border-t border-amber-200 dark:border-amber-800">
                                        <Link
                                            href={`/users/${user.user?.id}`}
                                            className="flex-1"
                                        >
                                            <motion.button
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-amber-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                                            >
                                                <UserPlus className="h-4 w-4" />
                                                View Profile
                                            </motion.button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* Enhanced Empty State */}
                {filteredUsers.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="text-center py-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-amber-200 dark:border-amber-800 relative overflow-hidden"
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
                                className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full blur-3xl"
                            />
                        </div>

                        <div className="relative z-10">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mx-auto h-24 w-24 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 flex items-center justify-center mb-6 border border-amber-200 dark:border-amber-800"
                            >
                                <Users className="h-12 w-12 text-amber-500" />
                            </motion.div>
                            
                            <motion.h3
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-3"
                            >
                                {searchQuery ? "No matches found" : "Your community awaits"}
                            </motion.h3>
                            
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-amber-600 dark:text-amber-400 max-w-md mx-auto mb-6 text-lg leading-relaxed"
                            >
                                {searchQuery 
                                    ? `No users found for "${searchQuery}". Try exploring our community to find amazing creators.`
                                    : "Start building your network by following creators who inspire you."
                                }
                            </motion.p>
                            
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Link 
                                    href="/explorer"
                                    className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-amber-500/25 transition-all duration-300 group"
                                >
                                    <Zap className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                    Discover Amazing Creators
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

// Helper function for compact number formatting
const formatCompactNumber = (number: number): string => {
    return Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(number);
};

// Add the ArrowRight icon import at the top with other icons
// Add: ArrowRight to the import from lucide-react