import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

interface Props {
    userId: string;
    isFollowing: boolean;
    fromVideoId: string
    home: boolean;
}

export const useFollow = ({ userId, isFollowing, fromVideoId,home }: Props) => {
    const clerk = useClerk();
    const utils = trpc.useUtils();
    const follow = trpc.follows.create.useMutation({
        onMutate: async ({ userId }) => {
            if(!home){ 
                await utils.videos.getOne.cancel({ id: fromVideoId });
                const previous = (home ? utils.home.getMany.getData({ limit: DEFAULT_LIMIT }) : utils.videos.getOne.getData({ id: fromVideoId }));
                utils.videos.getOne.setData({ id: fromVideoId }, (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        user: {
                            ...old.user,
                            viewerIsFollowing: true,
                            followsCount: (old.user.followsCount ?? 0) + (old.user.viewerIsFollowing ? 0 : 1),
                        },
                    };
                });
                return { previous };
            }

        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.previous && !home) utils.videos.getOne.setData({ id: fromVideoId }, ctx.previous);
            if (ctx?.previous && home) utils.home.getMany.setData({limit: DEFAULT_LIMIT}, ctx.previous);
            clerk.openSignIn();
        },
        onSettled: () => {
            if(!home) utils.videos.getOne.invalidate({ id: fromVideoId });
            else utils.home.getMany.invalidate({ limit:DEFAULT_LIMIT });
        },
        onSuccess: () =>{
            if(home){
                utils.home.getMany.invalidate({limit:DEFAULT_LIMIT})
            }
        }
    });

    const unfollow = trpc.follows.delete.useMutation({
        onMutate: async ({ userId }) => {
            if (!home) {
                await utils.videos.getOne.cancel({ id: fromVideoId });
                const previous = (home ? utils.home.getMany.getData({ limit: DEFAULT_LIMIT }) : utils.videos.getOne.getData({ id: fromVideoId }));
                utils.videos.getOne.setData({ id: fromVideoId }, (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        user: {
                            ...old.user,
                            viewerIsFollowing: false,
                            followsCount: (old.user.followsCount ?? 0) - (old.user.viewerIsFollowing ? 1 : 0),
                        },
                    };
                });
                return { previous };
            } 

        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.previous) utils.videos.getOne.setData({ id: fromVideoId }, ctx.previous);
            if (ctx?.previous) utils.home.getMany.setData({ limit: DEFAULT_LIMIT}, ctx.previous);
            toast.error("something went wrong");
            clerk.openSignIn();
        },
        onSettled: () => {
            utils.videos.getOne.invalidate({ id: fromVideoId });
        },
        onSuccess: () =>{
            if(home){
                utils.home.getMany.invalidate({limit:DEFAULT_LIMIT})
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