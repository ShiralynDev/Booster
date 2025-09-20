import { useState, useMemo } from "react";
import { Rating, RatingButton } from "@/components/ui/shadcn-io/rating";
import { Star, StarIcon, Heart, Users, HeartCrack } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useClerk } from "@clerk/nextjs";

interface Props {
    avgRating: number;
    videoRatings: number;
    onRate: (rating: number) => boolean;
}

export const VideoReactions = ({ avgRating, onRate, videoRatings }: Props) => {
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
        if (!onRate(numericValue)) {
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
        <div className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-lg gap-1 max-w-sm mx-auto">
            {/* Header */}
            <div className="text-center">
                <p className="font-bold text-lg text-gray-800 ">Rate this video</p>
            </div>

            {/* User Rating Interaction */}
            <div className="flex items-center gap-1  rounded-xl ">
                <Rating
                    value={userRating}
                    onValueChange={handleRatingChange}
                    className="flex gap-1"
                >
                    {Array.from({ length: 5 }).map((_, index) => (
                        <RatingButton
                            key={index}
                            className="w-4 h-4 text-yellow-300 hover:text-yellow-400 
                       hover:scale-110 transition-all duration-200 
                       data-[active]:text-yellow-400 data-[active]:scale-105
                       data-[active]:animate-pulse"
                        />
                    ))}
                </Rating>
            </div>

            {/* Rating Stats */}
            <div className="flex items-center justify-between gap-6 mt-1">
                {/* Average Rating */}
                <div className="flex flex-col items-center  w-full  ">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <p className="font-bold text-lg text-blue-800">{avgRating.toFixed(1)}</p>
                    </div>
                </div>

                {/* Total Ratings */}
                <div className="flex flex-col items-center w-full ">
                    <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-blue-600" />
                        <p className="font-bold text-lg text-blue-800">{compactRatings}</p>
                    </div>
                </div>
            </div>

          
        </div>
    );
}

//  {/* <button
//                     className="flex items-center gap-2 p-2.5 rounded-r-xl border  hover:bg-gray-100 
//                              transition-colors duration-200 group relative min-w-[80px]"
//                 >
//                     {isRated ? (
//                         <>
//                             <div className="flex justify-center gap-2">
//                                 {userRating < 3 ? (
//                                     <HeartCrack className="w-4 h-4 text-red-500" />
//                                 )
//                                     : (
//                                         <Heart className="w-4 h-4 text-red-500 fill-current" />
//                                     )
//                                 }
//                                 <span className="text-sm font-medium text-gray-700">{userRating}/5</span>
//                             </div>
//                         </>
//                     ) : (
//                         <>
//                             <div className="flex items-center gap-2"  >
//                                 <StarIcon className="w-4 h-4 text-yellow-400 group-hover:text-yellow-500" />
//                                 <span className="text-sm font-medium text-gray-700">Rate</span>
//                             </div>
//                         </>
//                     )}
//                 </button> */}