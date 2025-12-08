'use client';
import { useState } from 'react';
import { ResponsiveModal } from '@/components/responsive-modal';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { StudioBunnyUploader } from './studio-bunny-uploader';
import { FormSection } from '@/modules/studio/ui/sections/form-section';

export const StudioUploadModal = () => {
    const [open, setOpen] = useState(false);
    const [videoId, setVideoId] = useState<string | null>(null);

    const handleOpen = () => {
        setOpen(true);
        setVideoId(null); // Reset state when opening
    };

    const handleUploadStarted = (id: string) => {
        setVideoId(id);
    };

    return (
        <>
            <Button variant="secondary" onClick={handleOpen}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Create
            </Button>

            <ResponsiveModal 
                open={open} 
                title={videoId ? 'Edit Video Details' : 'Upload video'} 
                onOpenChange={setOpen}
                className={videoId ? "max-w-screen-xl w-full max-h-[90vh] flex flex-col" : "max-w-lg w-full"}
            >
                <StudioBunnyUploader 
                    onUploadStarted={handleUploadStarted}
                    onSuccess={() => {}} // Optional: maybe close modal or show success message
                >
                    {videoId && <FormSection videoId={videoId} />}
                </StudioBunnyUploader>
            </ResponsiveModal>
        </>
    );
};
