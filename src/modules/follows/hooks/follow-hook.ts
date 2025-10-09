import { trpc } from "@/trpc/client";

interface Props {
    userId: string;
    isFollowing: boolean;
    fromVideoId?: string
}

export const useFollow = ({ userId, isFollowing, fromVideoId }: Props) => {
    const utils = trpc.useUtils();
    const follow = trpc.follows.create.useMutation({
        onSuccess: () =>{
            utils.follows.getFollowersByUserId.invalidate({ userId })
            if(fromVideoId) {
                utils.videos.getOne.invalidate({id:fromVideoId})
                utils.videos.getUserByVideoId.invalidate({ videoId: fromVideoId })
            }
        }
    });

    const unfollow = trpc.follows.delete.useMutation({
        onSuccess: () =>{
            utils.follows.getFollowersByUserId.invalidate({ userId })
            if(fromVideoId){
                utils.videos.getOne.invalidate({ id: fromVideoId })
                utils.videos.getUserByVideoId.invalidate({ videoId: fromVideoId })
            }
        }
    });

    const isPending = follow.isPending || unfollow.isPending
    const onClick = () => {
        console.log("isFollowing", isFollowing)
        if (isFollowing) {
            unfollow.mutate({
                userId
            })
        } else {
            follow.mutate({
                userId
            })
        }

    }

    return {
        isPending,
        isFollowing,
        onClick,
    }

}