import { VideoView } from "@/modules/studio/ui/views/video-views";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = 'force-dynamic'; //IMPORTANT: WE DON'T AWAIT. BUT RATHER WE PREFETCH

interface PageProps {
    params: Promise<{ videoId: string }>;
}

const Page = async ({ params }: PageProps) => {
    const { videoId } = await params; //To get the video ID in the route. The folder should be called [videoId] the same as the variable name
    console.log("videoID", videoId)
    void trpc.studio.getOne.prefetch({ id: videoId }); //z object receives an input which is an id of type string uuid
    void trpc.categories.getMany.prefetch();



    return (
        <HydrateClient>
            {/* <VideoView videoId={videoId} /> */}
            <VideoView videoId={videoId} />

        </HydrateClient>
    );
}

export default Page;
