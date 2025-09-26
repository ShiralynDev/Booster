import { DEFAULT_LIMIT } from "@/constants";
import { ExplorerView } from "@/modules/explorer/ui/views/explorer-view"
import { trpc } from "@/trpc/server"
import { HydrateClient } from "@/trpc/server"

export const dynamic = 'force-dynamic'; //IMPORTANT: WE DON'T AWAIT. BUT RATHER WE PREFETCH

const Page = () => {
    void trpc.explorer.getMany.prefetchInfinite({limit: DEFAULT_LIMIT * 2});
    return (
        <HydrateClient>
            <ExplorerView />
        </HydrateClient>
    )
}
export default Page