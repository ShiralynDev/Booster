import { DEFAULT_LIMIT } from "@/constants";
import { ExplorerView } from "@/modules/explorer/ui/views/explorer-view"
import { trpc } from "@/trpc/server"
import { HydrateClient } from "@/trpc/server"

const Page = () => {
    void trpc.explorer.getMany.prefetch({limit: DEFAULT_LIMIT * 2});
    return (
        <HydrateClient>
            <ExplorerView />
        </HydrateClient>
    )
}
export default Page