import { DEFAULT_LIMIT } from "@/constants";
import { SearchView } from "@/modules/search/ui/views/search-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic='force-dynamic'

interface Props{
    searchParams: Promise<{
        query: string | undefined;
    }>
}

const Page = async ({searchParams}: Props) => {


    const {query} = await searchParams;

    void trpc.search.getManyByQuery.prefetchInfinite({limit: DEFAULT_LIMIT, query})

    return (
        <HydrateClient>
            <SearchView query={query} />
        </HydrateClient>
    )
}

export default Page;