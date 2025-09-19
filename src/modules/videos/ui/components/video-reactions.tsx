import { useState, useMemo } from "react";
import { Rating, RatingButton } from "@/components/ui/shadcn-io/rating";
import { Star, StarIcon, Heart, Users, HeartCrack } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useClerk } from "@clerk/nextjs";

interface Props {
    compactViews: string;
    expandedViews: string;
    avgRating: number;
    videoRatings: number;
    onRate: (rating: number) => boolean;
}

export const VideoReactions = ({ compactViews, expandedViews, avgRating, onRate, videoRatings }: Props) => {
    const [userRating, setUserRating] = useState(0);
    const [isChoosing, setChoose] = useState(false);
    const [isRated, setIsRated] = useState(false);
    const [showThanks, setShowThanks] = useState(false);
    const [popRating, setPopRating] = useState(false);
    // const totalRatings = 128092;

    const { openSignIn } = useClerk();
    const handleRatingChange = (value: number) => {
        if (!value) return;
        const numericValue = Number(value)
        if (isNaN(numericValue)) return;      // ignore invalid values
        if(!onRate(numericValue)){
            openSignIn({
                
            });
            return;
        }
        setUserRating(value);
        setIsRated(true);
        console.log("val", value)


        if (value >= 4)
            setShowThanks(true);

        // setTimeout(() => {
        //     setChoose(false);
        //     setTimeout(() => setShowThanks(false), 200);
        // }, 900);
    };


    const compactRatings = useMemo(() => {
        return Intl.NumberFormat("en", {
            notation: "compact"
        }).format(videoRatings)
    }, [videoRatings])

    return (
        <div className="flex items-center bg-white rounded-l-full ">

            {/* Average Rating Display */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 p-2.5 border-yellow-200 border  rounded-l-full bg-amber-50"
            >
                <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold text-blue-800">{avgRating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-600" />
                    <span className="text-xs text-blue-700">{compactRatings} rating{videoRatings != 1 ? <>s</> : ""}</span>
                </div>
            </motion.div>

            {/* Separator */}

            {/* User Rating Interaction */}
            <div className="relative" onPointerEnter={() => setChoose(true)} onPointerLeave={()=>setChoose(false)} >
                <AnimatePresence>
                    {isChoosing && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            className="flex items-center gap-1 p-2 bg-white bg-gradient-to-l from-amber-500/20  to-white rounded-lg shadow-lg border border-gray-200 absolute -top-10 -left-7 z-10"
                        >
                            <Rating
                                value={userRating}
                                onValueChange={handleRatingChange}
                                className="flex gap-0.5"
                            >
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <RatingButton
                                        key={index}
                                        className="w-5 h-5 text-primary hover:text-yellow-500 
                                                  hover:scale-125 transition-all duration-150 
                                                  data-[active]:text-yellow-500 data-[active]:scale-110"
                                    />
                                ))}
                            </Rating>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 p-2.5 rounded-r-xl border bg-white bg-gradient-to-br from-amber-500/0 to-amber-500/20 hover:bg-gray-100 
                             transition-colors duration-200 group relative min-w-[80px]"
                    onClick={() => setChoose((prev) => !prev)}
                >
                    {isRated ? (
                        <>
                            <div className="flex justify-center gap-2">
                                {userRating < 3 ? (
                                    <HeartCrack className="w-4 h-4 text-red-500" />
                                )
                                    : (
                                        <Heart className="w-4 h-4 text-red-500 fill-current" />
                                    )
                                }
                                <span className="text-sm font-medium text-gray-700">{userRating}/5</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-2"  >
                                <StarIcon className="w-4 h-4 text-yellow-400 group-hover:text-yellow-500" />
                                <span className="text-sm font-medium text-gray-700">Rate</span>
                            </div>
                        </>
                    )}
                </motion.button>

                
            </div>

            
        </div>
    );
};
