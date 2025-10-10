import { trpc } from "@/trpc/client";
import { AnimatedPlanetIcon } from "../animated-planet-icon";

const assetIconSmall = new Map([
    [0, <AnimatedPlanetIcon size={4} key={0}/>],
])

const assetIconMedium = new Map([
    [0, <AnimatedPlanetIcon size={6} key={0}/>],
])

const assetIconBig = new Map([
    [0, <AnimatedPlanetIcon size={10} key={0} />],
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

// Helper function to determine which icon to show based on user role/status
export const getUserIcons = (userId: string, size:number) => {

    const { data } = trpc.assets.getAssetsByUserId.useQuery({ userId: userId });

    return (
        <>
            {data?.map((icon) => (
                renderIcon(icon.iconNumber,size)
            ))
            }
        </>
    )
    // console.log(user,isCommentOwner)
    // return <Zap className="w-3 h-3 text-gray-400" />;
};