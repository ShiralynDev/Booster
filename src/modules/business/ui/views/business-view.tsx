"use client"

import { trpc } from "@/trpc/client"
import { useAuth } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Video, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const BusinessView = () => {
    const { userId: clerkUserId } = useAuth()
    const { data: user } = trpc.users.getByClerkId.useQuery({ clerkId: clerkUserId })
    const { data: videosData } = trpc.users.getVideosByUserId.useQuery(
        { userId: user?.id! },
        { enabled: !!user?.id }
    )

    if (!user || user.accountType !== 'business') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">This page is only available for business accounts.</p>
                <Button asChild>
                    <Link href="/">Go Home</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Business Dashboard</h1>
                <p className="text-muted-foreground">Manage your brand presence and track performance.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Featured Videos</CardTitle>
                        <Video className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{videosData?.userVideos.length || 0}</div>
                        <p className="text-xs text-muted-foreground">All your videos are automatically featured</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {videosData?.userVideos.reduce((acc, curr) => acc + (curr.videoViews || 0), 0) || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Across all your content</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {videosData?.userVideos.length ? 
                                ((videosData.userVideos.reduce((acc, curr) => acc + (curr.averageRating || 0), 0) / videosData.userVideos.length).toFixed(1)) 
                                : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Average rating</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="videos" className="w-full">
                <TabsList>
                    <TabsTrigger value="videos">Your Videos</TabsTrigger>
                    <TabsTrigger value="tools">Business Tools</TabsTrigger>
                </TabsList>
                <TabsContent value="videos" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {videosData?.userVideos.map((video) => (
                            <Card key={video.id}>
                                <CardHeader>
                                    <CardTitle className="line-clamp-1">{video.title}</CardTitle>
                                    <CardDescription>{new Date(video.createdAt).toLocaleDateString()}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="aspect-video relative bg-muted rounded-md overflow-hidden mb-2">
                                        {/* Placeholder for thumbnail */}
                                        {video.thumbnailUrl ? (
                                            <img src={video.thumbnailUrl} alt={video.title} className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-muted-foreground">No Thumbnail</div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 text-xs rounded-full">
                                            Featured
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>{video.videoViews || 0} views</span>
                                        <span>{video.averageRating?.toFixed(1) || 0} ★</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {videosData?.userVideos.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                No videos uploaded yet. Upload a video to see it here.
                            </div>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="tools">
                    <Card>
                        <CardHeader>
                            <CardTitle>Promotional Tools</CardTitle>
                            <CardDescription>Tools to help you reach more customers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 border rounded-lg">
                                <h3 className="font-semibold mb-2">Ad Campaign Manager</h3>
                                <p className="text-sm text-muted-foreground mb-4">Create and manage ad campaigns to boost your visibility further.</p>
                                <Button variant="outline" disabled>Coming Soon</Button>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <h3 className="font-semibold mb-2">Audience Insights</h3>
                                <p className="text-sm text-muted-foreground mb-4">Deep dive into your audience demographics and behavior.</p>
                                <Button variant="outline" disabled>Coming Soon</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
