import { DEFAULT_LIMIT } from "@/constants";
import { ExplorerView } from "@/modules/explorer/ui/views/explorer-view"
import { trpc } from "@/trpc/server"
import { HydrateClient } from "@/trpc/server"

export const dynamic = 'force-dynamic'; //IMPORTANT: WE DON'T AWAIT. BUT RATHER WE PREFETCH


interface Props{
    searchParams: Promise<{
        categoryId: string | undefined;
    }>
}

const Page = async ({searchParams}: Props) => {

    const {categoryId} = await searchParams;

    void trpc.explorer.getMany.prefetchInfinite({limit: DEFAULT_LIMIT * 2, categoryId});
    
    return (
        <HydrateClient>
            <ExplorerView categoryId={categoryId} />
        </HydrateClient>
    )
}
export default Page