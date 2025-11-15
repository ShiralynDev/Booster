import { CommentsSection } from "../sections/comments-section";
import { SuggestionsSection } from "../sections/suggestions-section";
import { VideoSection } from "../sections/video-section";
import { VideoCreator } from "../components/video-creator";
import { SectionSelector } from "../components/section-selector";

interface VideoViewProps {
    videoId: string;
}

export const VideoView = ({ videoId }: VideoViewProps) => {


    return (
        <div className="w-full">
            {/* Main Video Content - Constrained Layout */}
            <div className="flex flex-col mx-auto pt-3.5 px-4 mb-10 w-full">
                <div className="flex flex-col xl:flex-row xl:items-start gap-6 md:ml-3">
                    <div className="min-w-0 min-h-screen flex-1">
                        <VideoSection videoId={videoId} />
                        {/* On mobile show selector in the area previously occupied by comments */}
                        <div className="xl:hidden block mt-4 sm:overflow-auto w-full">
                            <div className="h-[60vh] flex flex-col">
                                <SectionSelector videoId={videoId} />
                            </div>
                        </div>
                    </div>
                   <div className="hidden xl:block w-[26%] xl:z-20">
                        <div className="order-2 mb-6 ">
                            <VideoCreator videoId={videoId} />
                        </div>
     
                        <div className="h-[89vh] flex flex-col">
                            <SectionSelector videoId={videoId} />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Suggestions Section - Full Width, breaks out of layout */}
            {/* <div className="md:ml-16">
                <SuggestionsSection videoId={videoId} />
            </div> */}
        </div>
    )
}
