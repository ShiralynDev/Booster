'use client'

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Coins, ShoppingCart, Search, Filter, Crown, Palette, Sparkles, BadgeCheck, Zap, Star, Heart, Rocket, Lock, Check, Boxes, Box, Landmark, X, Video, CreditCard } from "lucide-react"
import { XpIndicator } from "@/modules/xp/ui/components/xp-indicator"
import { trpc } from "@/trpc/client"
import { useAuth } from "@clerk/nextjs"
import { AnimatedPlanetIcon } from "../components/assetIcons/animated-planet-icon"
import { FloatingSparkles, SparkleEffect } from "../components/background/sparkles"
import { ErrorBoundary } from "react-error-boundary"
import { Spinner } from "@/components/ui/shadcn-io/spinner"



export const MarketSection = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <MarketSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

export const MarketSectionSuspense = () => {
  const [activeAssets] = trpc.assets.getMany.useSuspenseQuery();
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showXpPopup, setShowXpPopup] = useState(false)

  const { userId: clerkUserId } = useAuth();
  const { data: user } = trpc.users.getByClerkId.useQuery({
    clerkId: clerkUserId,
  });
  const userId = user?.id;
  const { data: myXp } = trpc.xp.getXpByUserId.useQuery(
    { userId: userId! },
    { enabled: !!userId, staleTime: 60_000, refetchOnWindowFocus: false }
  );

  const [ownedItems] = trpc.assets.getAssetsByUser.useSuspenseQuery();

  const utils = trpc.useUtils();

  const userCoins = myXp?.xp || 0;

  const assetIcon = new Map([
    [0, <AnimatedPlanetIcon size={24} key={0} />],
  ])

  const filteredItems = activeAssets.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })


  // handle

  const { mutate: buy, isPending } = trpc.xp.buyById.useMutation({
    onSuccess: () => {
      utils.xp.getXpByUserId.invalidate({ userId });
      utils.assets.getAssetsByUser.invalidate();
    }
  })



  const buyXp = trpc.xp.buyXp.useMutation();

  const handlePurchase = (assetId: string, price: number) => {
    if (userCoins >= price) {
      buy({ price, assetId });
    } else {
      setShowXpPopup(true);
    }
  }

  const handlePurchaseXp = async (lookupKey: "xp_500" | "xp_1200" | "xp_2500" | "xp_5500" | "xp_10000" | "xp_50000") => {
    const { url } = await buyXp.mutateAsync({ priceLookupKey: lookupKey });
    window.location.href = url!;
  };

  const xpPackages: { amount: number; price: number; popular: boolean; lookup: "xp_500" | "xp_1200" | "xp_2500" | "xp_5500" | "xp_10000" | "xp_50000" }[] = [
    { amount: 500, price: 1.99, popular: false, lookup: "xp_500" },
    { amount: 1200, price: 3.99, popular: false, lookup: "xp_1200" },
    { amount: 2500, price: 7.99, popular: true, lookup: "xp_2500" },
    { amount: 5500, price: 15.99, popular: false, lookup: "xp_5500" },
    { amount: 10000, price: 25.99, popular: false, lookup: "xp_10000" },
    { amount: 50000, price: 70.99, popular: false, lookup: "xp_50000" },
  ]

  const categories = [
    { id: "all", name: "All Items", icon: <Sparkles className="h-4 w-4" /> },
    { id: "icons", name: "Icons", icon: <Star className="h-4 w-4" /> },
    { id: "badges", name: "Badges", icon: <BadgeCheck className="h-4 w-4" /> },
    { id: "backgrounds", name: "Backgrounds", icon: <Palette className="h-4 w-4" /> },
    { id: "effects", name: "Effects", icon: <Zap className="h-4 w-4" /> },
    { id: "colors", name: "Colors", icon: <Palette className="h-4 w-4" /> },
    { id: "frames", name: "Frames", icon: <Heart className="h-4 w-4" /> },
    { id: "themes", name: "Themes", icon: <Sparkles className="h-4 w-4" /> },
  ]

  // Add CSS animations to your global CSS or CSS-in-JS
  useEffect(() => {
    // Inject custom animations
    const style = document.createElement('style')
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-8px) rotate(3deg); }
      }
      @keyframes float-sparkle {
        0%, 100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0; }
        50% { transform: translateY(-20px) translateX(10px) scale(1.2); opacity: 1; }
        100% { transform: translateY(-40px) translateX(20px) scale(0.8); opacity: 0; }
      }
      @keyframes ping-once {
        0% { transform: scale(1); opacity: 0.7; }
        100% { transform: scale(2); opacity: 0; }
      }
      .animate-float { animation: float 4s ease-in-out infinite; }
      .animate-float-sparkle { animation: float-sparkle linear infinite; }
      .animate-ping-once { animation: ping-once 0.6s ease-out; }
      .animate-spin-slow { animation: spin 8s linear infinite; }
      .animate-spin-slow-reverse { animation: spin 12s linear infinite reverse; }
      .animate-pulse-slow { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      .animate-pulse-slower { animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const owned = (assetId: string): boolean => {
    let ans: boolean = false;
    ownedItems.map((item) => {
      if (item.assetId === assetId) {
        ans = true;
      }
    })
    return ans;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1a1a1a] text-white p-6 ml-16 relative overflow-hidden">
      {/* Background Animated Stars */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="relative">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ffca55] to-[#FFA100] bg-clip-text text-transparent animate-pulse-slow">
              Customization Marketplace
            </h1>
            <p className="text-gray-400 mt-2">Personalize your profile with exclusive items</p>
            <SparkleEffect className="top-0 -right-6" />
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0 relative">
            <XpIndicator xp={userCoins} />
            <Button
              className="flex rounded-full bg-gradient-to-r from-[#ffca55] to-[#FFA100] text-gray-900 font-semibold hover:opacity-90 hover:scale-105 transition-transform duration-200 group relative overflow-hidden"
              onClick={() => setShowXpPopup(true)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <Landmark className="h-4 w-4 mr-2 relative z-10" />
              <span className="relative z-10">Get More XP</span>
            </Button>
          </div>
        </div>

        {/* XP Popup Modal */}
        {showXpPopup && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e1e1e] rounded-2xl border border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto relative overflow-hidden">
              <FloatingSparkles />
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700 relative">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#ffca55] to-[#FFA100] bg-clip-text text-transparent">
                  Get More XP
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowXpPopup(false)}
                  className="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Current Balance */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Current Balance:</span>
                  <div className="flex items-center gap-2 animate-pulse-slow">
                    <Boxes className="h-5 w-5 text-purple-500" />
                    <span className="text-xl font-bold">{Intl.NumberFormat("en").format(userCoins)} XP</span>
                  </div>
                </div>
              </div>

              {/* Free Option - Rewarded Ads */}
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Video className="h-5 w-5 text-blue-400 animate-pulse" />
                  Free XP - Watch Ads
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Watch a short video ad to earn 35 XP for free!
                </p>
                <Button
                  // onClick={handleWatchAd}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 hover:scale-105 transition-transform duration-200 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <div className="flex items-center gap-2 relative z-10">
                    <Video className="h-5 w-5" />
                    Watch Ad & Get 100 XP
                  </div>
                </Button>
              </div>

              {/* Paid Options */}
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-400 animate-pulse" />
                  Buy XP Packages
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Get instant XP with these premium packages
                </p>

                <div className="space-y-3">
                  {xpPackages.map((pkg, index) => (
                    <div
                      key={index}
                      className={`relative p-4 rounded-xl border-2 transition-all hover:scale-105 cursor-pointer group overflow-hidden ${pkg.popular
                        ? "border-purple-500 bg-gradient-to-r from-purple-700/10 to-purple-100/10"
                        : "border-gray-600 bg-[#252525] hover:border-gray-500"
                        }`}
                      onClick={() => handlePurchaseXp(pkg.lookup)}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <span className="bg-purple-500 text-gray-900 text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                            MOST POPULAR
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                          <Boxes className="h-6 w-6 text-purple-500 group-hover:scale-110 transition-transform duration-200" />
                          <div>
                            <div className="font-semibold text-lg">{pkg.amount.toLocaleString()} XP</div>
                            <div className="text-gray-400 text-sm">Instant delivery</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">${pkg.price}</div>
                          <div className="text-gray-400 text-sm">
                            ${(pkg.price / (pkg.amount / 1000)).toFixed(2)} per 1K XP
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Security Note */}
                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Lock className="h-3 w-3" />
                    <span>Secure payment processing. Your transaction is safe and encrypted.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rest of your existing JSX remains the same, just add animation classes */}
        {/* Search and Filter Section */}
        <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 p-4 mb-8 relative overflow-hidden">
          <FloatingSparkles />
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full bg-[#252525] border border-gray-700 focus:border-[#ffca55] focus:outline-none transition-all duration-300"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Filter:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-full bg-[#252525] border border-gray-700 text-white px-3 py-2 text-sm focus:border-[#ffca55] focus:outline-none transition-all duration-300"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all hover:scale-105 ${selectedCategory === category.id
                  ? "bg-gradient-to-r from-[#ffca55] to-[#FFA100] text-gray-900"
                  : "bg-[#252525] text-gray-300 hover:bg-[#2d2d2d]"
                  }`}
              >
                {category.icon}
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Marketplace Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const isOwned = owned(item.assetId);


            return (
              <Card
                key={item.assetId}
                className="bg-[#1e1e1e] border border-gray-800 overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#ffca55]/10 group relative"
              >
                <FloatingSparkles />
                <CardContent className="p-0">
                  {/* Item Image */}
                  <div className="h-40 flex items-center justify-center bg-gradient-to-b from-[#2a2a2a] to-[#1e1e1e] relative">
                    <span className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
                      {assetIcon.get(item.iconNumber)}
                    </span>

                    {/* Owned Badge */}
                    {isOwned && (
                      <div className="absolute top-3 left-3 bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                        <Check className="h-3 w-3" />
                        Owned
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-[#ffca55] transition-colors duration-300">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {item.price < 500 ? (
                          <Box className="h-4 w-4 text-purple-400 mr-1 group-hover:scale-110 transition-transform duration-300" />
                        ) : (
                          <Boxes className="h-5 w-5 text-purple-600 mr-1 group-hover:scale-110 transition-transform duration-300" />
                        )}
                        <span className="font-semibold">{item.price}</span>
                      </div>

                      {isPending ? (
                        <>
                          <Spinner variant="circle" />
                        </>
                      ) : (
                        <>
                          {isOwned ? (
                            <Button
                              className="rounded-full bg-green-600 text-white text-sm hover:bg-green-700 transition-all duration-300"
                              disabled
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Owned
                            </Button>
                          ) : (
                            <Button
                              className="rounded-full bg-gradient-to-r from-[#ffca55] to-[#FFA100] text-gray-900 text-sm hover:opacity-90 hover:scale-105 transition-all duration-300 group relative overflow-hidden"
                              onClick={() => handlePurchase(item.assetId, item.price)}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                              <ShoppingCart className="h-4 w-4 mr-1 relative z-10" />
                              <span className="relative z-10">Buy Now</span>
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {
          filteredItems.length === 0 && (
            <div className="text-center py-16">
              <Search className="h-16 w-16 mx-auto mb-4 text-gray-400 animate-bounce" />
              <h3 className="text-xl font-semibold text-gray-300">No items found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
            </div>
          )
        }

        {/* Featured Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 animate-pulse-slow">
            <Crown className="h-6 w-6 text-[#ffca55]" />
            Featured Items
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-800 p-6 flex flex-col md:flex-row items-center gap-6 hover:scale-105 transition-transform duration-300 group relative overflow-hidden">
              <FloatingSparkles />
              <div className="text-6xl group-hover:scale-110 transition-transform duration-300">🌟</div>
              <div>
                <h3 className="text-xl font-bold">Premium Creator Pack</h3>
                <p className="text-gray-300 mt-2">Get access to exclusive items and special features</p>
                <div className="flex items-center mt-4">
                  <Coins className="h-5 w-5 text-[#ffca55] mr-2 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-semibold">2,500</span>
                  <Button className="ml-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 hover:scale-105 transition-all duration-300">
                    <Rocket className="h-4 w-4 mr-2" />
                    Unlock Now
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-xl border border-blue-800 p-6 flex flex-col md:flex-row items-center gap-6 hover:scale-105 transition-transform duration-300 group relative overflow-hidden">
              <FloatingSparkles />
              <div className="text-6xl group-hover:scale-110 transition-transform duration-300">⚡</div>
              <div>
                <h3 className="text-xl font-bold">Weekly Special Offer</h3>
                <p className="text-gray-300 mt-2">Limited time offer - 50% off on all effects</p>
                <div className="flex items-center mt-4">
                  <Boxes className="h-5 w-5 text-[#ffca55] mr-2 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-semibold line-through text-gray-400">1,500</span>
                  <span className="font-semibold ml-2">750</span>
                  <Button className="ml-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90 hover:scale-105 transition-all duration-300">
                    <Zap className="h-4 w-4 mr-2" />
                    Claim Offer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
    </div >
  )
}