'use client'
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button"
import { trpc } from "@/trpc/client";
import { Loader2Icon, PlusIcon } from "lucide-react"
import { toast } from "sonner";
import { StudioUploader } from "./studio-uploader";
import { useRouter } from "next/navigation";

export const StudioUploadModal = () => {
    //Use Mutation for modifiy/ create operations
    const router = useRouter();
    const utils = trpc.useContext();
    const create = trpc.videos.create.useMutation({
        onSuccess: ()=>{
            toast.success("Video uploaded!")
            utils.studio.getMany.invalidate();
            // Yes, utils.studio.getMany.invalidate(); invalidates the cache for the studio.getMany query in tRPC. This means the next time you fetch studio.getMany, it will refetch fresh data from the server instead of using cached results. This is useful after a mutation to ensure your UI shows the latest data.
        },
        onError: (err) => {
            toast.error(err.message || "Failed to upload video");
        }
    });

    const onSuccess = () => {
        if(!create.data?.video.id) return;
        create.reset();
        router.push(`/studio/videos/${create.data.video.id}`)
    }

    return (
        <>
            <ResponsiveModal
                title=""
                open={!!create.data?.url}
                onOpenChange={() => create.reset()}
            >

{/* TODO: onSuccess not workign */}
                {create.data?.url ? <StudioUploader endpoint={create.data.url} onSuccess={onSuccess}/> : <Loader2Icon />}

            </ResponsiveModal>
            <Button variant='secondary' onClick={()=>create.mutate()} disabled={create.isPending}>
                {create.isPending ? <Loader2Icon className="animate-spin"/> : <PlusIcon />}
                Create
            </Button>
        </>
    )
}