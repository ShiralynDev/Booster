'use client';

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { trpc } from "@/trpc/client";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

export const SettingsSection = () => {
    const { userId: clerkUserId } = useAuth();
    const { data: user } = trpc.users.getByClerkId.useQuery({ clerkId: clerkUserId });
    const utils = trpc.useUtils();
    
    const toggleVerticalVideosMutation = trpc.users.toggleVerticalVideos.useMutation({
        onMutate: async ({ enabled }) => {
            await utils.users.getByClerkId.cancel({ clerkId: clerkUserId });
            const previousUser = utils.users.getByClerkId.getData({ clerkId: clerkUserId });

            if (previousUser) {
                utils.users.getByClerkId.setData({ clerkId: clerkUserId }, {
                    ...previousUser,
                    verticalVideosEnabled: enabled,
                });
            }

            return { previousUser };
        },
        onError: (err, variables, context) => {
            toast.error("Failed to update settings");
            if (context?.previousUser) {
                utils.users.getByClerkId.setData({ clerkId: clerkUserId }, context.previousUser);
            }
        },
        onSettled: () => {
            utils.users.getByClerkId.invalidate({ clerkId: clerkUserId });
            utils.explorer.getMany.invalidate();
            utils.explorer.aiSearch.invalidate();
        },
        onSuccess: () => {
            toast.success("Settings updated");
        },
    });

    const handleVerticalVideosToggle = (checked: boolean) => {
        toggleVerticalVideosMutation.mutate({ enabled: checked });
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>
            <div className="bg-card rounded-lg p-6 shadow-sm border space-y-6">
                <div>
                    <h3 className="text-xl font-bold mb-4">Content Preferences</h3>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                            <Label className="text-base">Vertical Videos</Label>
                            <p className="text-sm text-muted-foreground">
                                Show vertical videos (Shorts/Reels style) in the explorer
                            </p>
                        </div>
                        <Switch
                            checked={user?.verticalVideosEnabled ?? true}
                            onCheckedChange={handleVerticalVideosToggle}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
