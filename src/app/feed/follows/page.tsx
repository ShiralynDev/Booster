import { FollowList } from "@/modules/follows/ui/components/FollowList";
import { trpc } from "@/trpc/server"

const FollowsPage = () => {
    void trpc.follows.getMany.prefetch();
    return(
        <div>
            <FollowList />
        </div>
    )
}

export default FollowsPage