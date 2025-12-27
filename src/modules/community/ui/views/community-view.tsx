
'use client';

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { PostCard } from "../components/post-card";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import { Users } from "lucide-react";

interface Props {
    communityId: string;
}

export const CommunityView = ({ communityId }: Props) => {
    return (
        <Suspense fallback={<CommunityViewSkeleton />}>
            <ErrorBoundary fallback={<p>Failed to load community.</p>}>
                <CommunityViewSuspense communityId={communityId} />
            </ErrorBoundary>
        </Suspense>
    );
};

const CommunityViewSkeleton = () => {
    return <div className="max-w-5xl mx-auto p-4">Loading...</div>;
};

const CommunityViewSuspense = ({ communityId }: Props) => {
    const utils = trpc.useUtils();
    const [community] = trpc.community.get.useSuspenseQuery({ id: communityId });
    const [posts, postsQuery] = trpc.community.getPosts.useSuspenseInfiniteQuery(
        { communityId, limit: 10 },
        { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

    const joinMutation = trpc.community.join.useMutation({
        onSuccess: () => {
            utils.community.get.invalidate({ id: communityId });
            toast.success("Joined community!");
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    const leaveMutation = trpc.community.leave.useMutation({
        onSuccess: () => {
            utils.community.get.invalidate({ id: communityId });
            toast.success("Left community.");
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    const handleJoinToggle = () => {
        if (community.isMember) {
            leaveMutation.mutate({ communityId });
        } else {
            joinMutation.mutate({ communityId });
        }
    };

    const allPosts = posts.pages.flatMap((page) => page.items);

    return (
        <div className="max-w-5xl mx-auto">
            {/* Banner */}
            <div className="h-32 md:h-48 bg-muted relative">
                {community.banner_url && (
                    <img 
                        src={community.banner_url} 
                        alt="Banner" 
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            <div className="px-4 pb-4">
                {/* Header Info */}
                <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-8 mb-6 relative z-10">
                    <Avatar className="h-24 w-24 border-4 border-background">
                        <AvatarImage src={community.icon_url || ""} />
                        <AvatarFallback className="text-2xl">{community.name[0]}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0 pt-2 md:pt-0">
                        <h1 className="text-3xl font-bold truncate">{community.name}</h1>
                        <p className="text-muted-foreground text-sm">c/{community.name.toLowerCase().replace(/\s+/g, '')}</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button 
                            variant={community.isMember ? "outline" : "default"}
                            className={`rounded-full px-8 ${!community.isMember ? "bg-orange-600 hover:bg-orange-700" : ""}`}
                            onClick={handleJoinToggle}
                            disabled={joinMutation.isPending || leaveMutation.isPending}
                        >
                            {community.isMember ? "Joined" : "Join"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Feed */}
                    <div className="md:col-span-2 space-y-4">
                        {/* Create Post Placeholder */}
                        <div className="bg-card border rounded-md p-4 flex items-center gap-2 mb-4">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <input 
                                type="text" 
                                placeholder="Create Post" 
                                className="flex-1 bg-muted/50 border-none rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        {allPosts.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                No posts yet. Be the first to post!
                            </div>
                        ) : (
                            allPosts.map((item) => (
                                <PostCard 
                                    key={item.post.id} 
                                    post={item.post} 
                                    user={item.user} 
                                />
                            ))
                        )}
                        
                        <InfiniteScroll
                            hasNextPage={postsQuery.hasNextPage}
                            isFetchingNextPage={postsQuery.isFetchingNextPage}
                            fetchNextPage={postsQuery.fetchNextPage}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="hidden md:block space-y-4">
                        <div className="bg-card border rounded-md p-4">
                            <h2 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wider">About Community</h2>
                            <p className="text-sm mb-4">{community.description_short || community.description_long || "No description provided."}</p>
                            
                            <Separator className="my-4" />
                            
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Users className="h-4 w-4" />
                                <span>{community.memberCount} Members</span>
                            </div>
                            
                            <Separator className="my-4" />
                            
                            <div className="text-xs text-muted-foreground">
                                Created {new Date(community.createdAt).toLocaleDateString()}
                            </div>
                        </div>

                        {community.rules && (
                            <div className="bg-card border rounded-md p-4">
                                <h2 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wider">Rules</h2>
                                <p className="text-sm whitespace-pre-wrap">{community.rules}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};