import { VideoView } from "@/modules/videos/ui/views/video-view";

interface PageProps {
    params: Promise<{ videoId: string }>; //returns a promise with type videoId which is a string
}

//REMEMBER: await dynamic params

const Page = async ({params}: PageProps) => {

    const {videoId} = await params;

    return ( 
        <VideoView videoId={videoId} />
     );
}
 
export default Page;