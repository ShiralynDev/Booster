import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { FlagIcon, MoreVerticalIcon, Share2, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { VideoReportModal } from "./video-report-modal";

interface VideoMenuProps {
    videoId: string;
    variant?: "ghost" | "secondary";
    onRemove?: () => void;
}

export const VideoMenu = ({
    videoId,
    variant,
    onRemove,
}: VideoMenuProps) => {
    const [isReportOpen, setIsReportOpen] = useState(false);

    const onShare = () => {
        //TODO: Change if deploying outside vercel
        const fullUrl = `${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/videos/${videoId}`

        navigator.clipboard.writeText(fullUrl);
        toast.success("Link Copied!")
    }
    return (
        <>
            <VideoReportModal 
                videoId={videoId}
                open={isReportOpen}
                onOpenChange={setIsReportOpen}
            />
            <div className="flex items-center gap-2">
                <Button variant={variant} size='icon' className="rounded-full" onClick={onShare}>
                    <Share2 />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={variant} size='icon' className="rounded-full">
                            <MoreVerticalIcon />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => setIsReportOpen(true)}>
                            <FlagIcon className="mr-2 size-4" />
                            Report
                        </DropdownMenuItem>
                        {onRemove && (
                            <DropdownMenuItem onClick={onRemove}>
                                <TrashIcon className="mr-2 size-4" />
                                Remove
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    )
}
