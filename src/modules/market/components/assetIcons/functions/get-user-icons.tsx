"use client";

import { trpc } from "@/trpc/client";
import { Zap, Users, Star } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatedPlanetIcon } from "../planet-animated-icon";
import { JSX } from "react";

const assetIconSmall = new Map<number, JSX.Element>([
    [1, <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" key={1} />],
    [2, <Users className="w-4 h-4 text-blue-500 fill-blue-500" key={2} />],
    [3, <Star className="w-4 h-4 text-purple-500 fill-purple-500" key={3} />],
    [4, <AnimatedPlanetIcon size={6} key={4} className="text-amber-400" />],
])

const assetIconMedium = new Map<number, JSX.Element>([
    [1, <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" key={1} />],
    [2, <Users className="w-6 h-6 text-blue-500 fill-blue-500" key={2} />],
    [3, <Star className="w-6 h-6 text-purple-500 fill-purple-500" key={3} />],
    [4, <AnimatedPlanetIcon size={8} key={4} className="text-amber-400" />],
])

const assetIconBig = new Map<number, JSX.Element>([
    [1, <Zap className="w-10 h-10 text-yellow-500 fill-yellow-500" key={1} />],
    [2, <Users className="w-10 h-10 text-blue-500 fill-blue-500" key={2} />],
    [3, <Star className="w-10 h-10 text-purple-500 fill-purple-500" key={3} />],
    [4, <AnimatedPlanetIcon size={10} key={4} className="text-amber-400" />],
])



const renderIcon = (index: number, size: number) => {
    if(size >= 10){
        return assetIconBig.get(index)
    }else if(size >= 5)
        return assetIconMedium.get(index);
    else{
        return assetIconSmall.get(index);
    }
}

interface UserIconProps {
    userId: string;
    size: number;
    className?: string;
}

export const UserIcon = ({ userId, size, className }: UserIconProps) => {
    // Only fetch the equipped asset instead of all owned assets
    // Add refetchOnWindowFocus and refetchOnMount to ensure updates are caught
    const { data: equippedAsset } = trpc.users.getEquippedAsset.useQuery(
        { userId: userId },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            staleTime: 0, // Consider data stale immediately to allow refetch
        }
    );

    // Only render if user has an equipped asset
    if (!equippedAsset) {
        return null;
    }

    console.log("Size in UserIcon:", size);

    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={`${className} cursor-help hover:scale-110 transition-transform duration-200`}>
                        {renderIcon(equippedAsset.iconNumber, size)}
                    </div>
                </TooltipTrigger>
                <TooltipContent className="bg-black/80 border-border text-white">
                    <p className="font-bold text-sm">{equippedAsset.name}</p>
                    <p className="text-xs text-gray-300">{equippedAsset.description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

// Deprecated: Use <UserIcon /> component instead
export const getUserIcons = (userId: string, size:number) => {
    return <UserIcon userId={userId} size={size} />
};