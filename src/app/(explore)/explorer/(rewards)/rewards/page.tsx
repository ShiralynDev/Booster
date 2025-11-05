import { RewardsView } from "@/modules/rewards/views/rewards-views";
import { HydrateClient } from "@/trpc/server";

const Page = () => {
    return (
        <HydrateClient>
            <RewardsView />
        </HydrateClient>
    )
}

export default Page;
