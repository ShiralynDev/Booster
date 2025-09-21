'use client'

import { useState, useEffect } from "react"
import { UserAvatar } from "@/components/user-avatar"
import { trpc } from "@/trpc/client"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { compactDate } from "@/lib/utils"
import { EyeIcon } from "lucide-react"

interface Props {
  userId: string
}

export const UsersView = ({ userId }: Props) => {
  const [user] = trpc.users.getByUserId.useSuspenseQuery({ userId })
  const [userVideos] = trpc.users.getVideosByUserId.useSuspenseQuery({ userId })

  console.log(userVideos)

  const [currentXp, setCurrentXp] = useState(3250)
  const [xpForNextLevel] = useState(5000)
  const [showXpPopup, setShowXpPopup] = useState(false)
  const [selectedXpValue, setSelectedXpValue] = useState(100)
  const [activeTab, setActiveTab] = useState("videos")

  // XP values for the slider/options
  const xpValues = [10, 20, 50, 75, 100, 500, 1000]

  // Calculate XP bar percentage
  const xpPercentage = Math.max(0, Math.min(100, (currentXp / xpForNextLevel) * 100))

  // Handle adding XP
  const handleAddXp = () => {
    setCurrentXp(prev => prev + selectedXpValue)
    setShowXpPopup(false)
    
    // Check for level up (simplified)
    if (currentXp + selectedXpValue >= xpForNextLevel) {
      // In a real app, you'd update the level in your database
      alert("Level Up!")
    }
  }

  // Sample video data - in a real app, this would come from your database
 

  return (
    <div className="min-h-screen bg-[#212121] text-white">
     
      <div className="container mx-auto p-4">
        {/* Channel Header */}
        <div className="bg-[#282828] rounded-xl border border-gray-700 mt-6 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ffca55] via-[#FFA100] to-[#ffca55]"></div>
          
          <div className="flex flex-col md:flex-row p-6">
            <div className="flex flex-col items-center md:items-start md:w-1/3 mb-6 md:mb-0">
              <UserAvatar
                size="xl"
                imageUrl={user?.imageUrl || undefined}
                name={user?.name || 'Unknown user'}
                className="w-40 h-40 border-4 border-gray-600 hover:border-[#ffca55] transition-all duration-300 mb-4"
              />
              
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ffca55] to-[#FFA100] bg-clip-text text-transparent flex items-center justify-center md:justify-start">
                  {user?.name || 'Unknown User'} 
                  <span className="ml-2 text-[#ffca55]">✓</span>
                </h1>
                
                <div className="flex flex-wrap gap-3 my-4 justify-center md:justify-start">
                  <div className="bg-[#ffffff0d] p-3 rounded-lg border border-gray-700 text-center min-w-[90px] hover:translate-y-[-5px] transition-transform">
                    <div className="text-[#ffca55] font-bold text-lg">100</div>
                    <div className="text-gray-400 text-xs uppercase">Videos</div>
                  </div>
                  <div className="bg-[#ffffff0d] p-3 rounded-lg border border-gray-700 text-center min-w-[90px] hover:translate-y-[-5px] transition-transform">
                    <div className="text-[#ffca55] font-bold text-lg">25.9K</div>
                    <div className="text-gray-400 text-xs uppercase">Community</div>
                  </div>
                  <div className="bg-[#ffffff0d] p-3 rounded-lg border border-gray-700 text-center min-w-[90px] hover:translate-y-[-5px] transition-transform">
                    <div className="text-[#ffca55] font-bold text-lg">10.7M</div>
                    <div className="text-gray-400 text-xs uppercase">Views</div>
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm mt-3">Individuo que sube videos</p>
              </div>
            </div>
            
            {/* XP Section */}
            <div className="md:w-2/3 md:pl-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-[#ffca55] to-[#FFA100] bg-clip-text text-transparent">
                  Channel Booster
                </h2>
                <div className="text-[#00fbff] font-bold">Level 1</div>
              </div>
              
              <div className="w-full h-6 bg-[#ffffff1a] rounded-full overflow-hidden border border-gray-700 mb-2">
                <div 
                  className="h-full bg-gradient-to-r from-[#ffca55] to-[#FFA100] rounded-full relative overflow-hidden"
                  style={{ width: `${xpPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#ffffff40] mix-blend-overlay"></div>
                </div>
              </div>
              
              <div className="flex justify-between text-gray-400 text-sm mb-4">
                <span>{currentXp.toLocaleString()} XP</span>
                <span>{xpForNextLevel.toLocaleString()} XP for next level</span>
              </div>
              
              <Button 
                onClick={() => setShowXpPopup(true)}
                className="bg-gradient-to-r from-[#ffca55] to-[#FFA100] text-gray-900 font-bold py-2 px-6 rounded-full hover:opacity-90 transition-all"
              >
                + Add XP
              </Button>
              
              <div className="mt-6">
                <h3 className="text-[#ffca55] font-semibold mb-3">Unlocked Rewards</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="text-[#ffca55] mr-2">🏆</span>
                    <span>Custom Emotes for Live Streams</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-[#ffca55] mr-2">🏆</span>
                    <span>Extended Video Upload Length</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-[#ffca55] mr-2">🏆</span>
                    <span>Priority Channel Verification</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Tabs */}
        <div className="flex flex-wrap gap-2 my-6 bg-[#323232] p-2 rounded-xl border border-gray-700 w-fit">
          {["videos", "shorts", "live", "playlists", "community", "about"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-[#ffca55] to-[#FFA100] text-gray-900"
                  : "text-gray-300 hover:bg-[#ffffff1a]"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {userVideos.userVideos.map((video) => (
            <Card key={video.id} className="bg-[#323232] border-gray-700 overflow-hidden hover:translate-y-[-5px] transition-transform cursor-pointer">
              <div className="h-48 relative">
                <Image
                  src={video.thumbnailUrl}
                  alt={video.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold line-clamp-2 mb-2">{video.title}</h3>
                <div className="flex justify-between text-gray-400 text-sm">
                  <span className="flex items-center gap-2"><EyeIcon className="size-4"/> 31{video.views} views</span>
                  <span>{compactDate(video.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* XP Popup */}
      {showXpPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#222] border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-[#ffca55] text-center mb-4">Add XP</h3>
            
            <div className="mb-6">
              <input
                type="range"
                min="0"
                max="6"
                value={xpValues.indexOf(selectedXpValue)}
                onChange={(e) => setSelectedXpValue(xpValues[parseInt(e.target.value)])}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ffca55]"
              />
              <div className="text-center text-[#ffca55] font-semibold mt-2">
                {selectedXpValue.toLocaleString()} XP
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {xpValues.map((value) => (
                <button
                  key={value}
                  onClick={() => setSelectedXpValue(value)}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    selectedXpValue === value
                      ? "bg-gradient-to-r from-[#ffca55] to-[#FFA100] text-gray-900"
                      : "bg-[#ffffff0d] text-gray-300 border border-gray-600"
                  }`}
                >
                  {value} XP
                </button>
              ))}
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setShowXpPopup(false)}
                variant="outline"
                className="border-gray-600 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddXp}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white"
              >
                Add XP
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}