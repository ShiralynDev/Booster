import { CommunitiesView } from "@/modules/community/ui/views/communities-explore-view";
import { HydrateClient } from "@/trpc/server";

export const dynamic = 'force-dynamic'; //IMPORTANT: WE DON'T AWAIT. BUT RATHER WE PREFETCH

interface Props{
    searchParams: Promise<{
        categoryId: string | undefined;
    }>
}

const Page = async ({searchParams}:Props) => {    

    const {categoryId} = await searchParams;

    //todo: prefetch communities
    
    
    return (
        <HydrateClient>
            <CommunitiesView categoryId={categoryId}/>
        </HydrateClient>
    )
}

export default  Page;