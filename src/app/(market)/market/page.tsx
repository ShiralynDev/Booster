import { MarketSection } from "@/modules/market/sections/market-section";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic='force-dynamic'


const Page = () => {
     
    void trpc.assets.getMany.prefetch();
    void trpc.assets.getAssetsByUser.prefetch();
     
    return (
        <HydrateClient>
            <MarketSection />
        </HydrateClient>
    )
}
export default Page;