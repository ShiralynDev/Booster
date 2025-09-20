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
            if(!home) await utils.videos.getOne.cancel({ id: fromVideoId });
            else await utils.home.getOne.cancel({id:fromVideoId})

            const previous = (home ? utils.home.getOne.getData({id:fromVideoId}) : utils.videos.getOne.getData({ id: fromVideoId }));

            if(!home){
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
            }else{
                 utils.home.getOne.setData({ id: fromVideoId }, (old) => {
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
            }

            return { previous };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.previous && !home) utils.videos.getOne.setData({ id: fromVideoId }, ctx.previous);
            if (ctx?.previous && home) utils.home.getOne.setData({ id: fromVideoId }, ctx.previous);
            toast.error("something went wrong");
        },
        onSettled: () => {
            if(!home) utils.videos.getOne.invalidate({ id: fromVideoId });
            else utils.videos.getOne.invalidate({ id: fromVideoId });
        },
    });

    const unfollow = trpc.follows.delete.useMutation({
        onMutate: async ({ userId }) => {
            if (!home) await utils.videos.getOne.cancel({ id: fromVideoId });
            else await utils.home.getOne.cancel({id:fromVideoId})

            const previous = (home ? utils.home.getOne.getData({id:fromVideoId}) : utils.videos.getOne.getData({ id: fromVideoId }));

            if (!home) {
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
            } else {
                utils.home.getOne.setData({ id: fromVideoId }, (old) => {
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
            }

            return { previous };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.previous) utils.videos.getOne.setData({ id: fromVideoId }, ctx.previous);
            toast.error("something went wrong");
        },
        onSettled: () => {
            utils.videos.getOne.invalidate({ id: fromVideoId });
        },
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