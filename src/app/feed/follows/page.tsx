import { FollowList } from "@/modules/follows/ui/components/FollowList";
import { trpc } from "@/trpc/server"

export const dynamic='force-dynamic'

const FollowsPage = () => {
    void trpc.follows.getMany.prefetch();
    return(
        <div>
            <FollowList />
        </div>
    )
}

export default FollowsPage