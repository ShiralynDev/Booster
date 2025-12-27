import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
    post: {
        id: string;
        title: string;
        content: string;
        createdAt: Date;
        likes: number;
        commentCount: number;
    };
    user: {
        id: string;
        name: string;
        imageUrl: string;
        username: string | null;
    };
}

export const PostCard = ({ post, user }: PostCardProps) => {
    return (
        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-2 p-4 pb-2">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user.imageUrl} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-xs">
                    <span className="font-semibold hover:underline cursor-pointer">
                        u/{user.username || user.name}
                    </span>
                    <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                    {post.content}
                </p>
            </CardContent>
            <CardFooter className="p-2 bg-muted/30 flex items-center gap-2">
                <Button variant="ghost" size="sm" className="rounded-full gap-1 text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <ThumbsUp className="h-4 w-4" />
                    {post.likes}
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full gap-1 text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <MessageSquare className="h-4 w-4" />
                    {post.commentCount} Comments
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full gap-1 text-muted-foreground hover:text-primary hover:bg-primary/10 ml-auto">
                    <Share2 className="h-4 w-4" />
                    Share
                </Button>
            </CardFooter>
        </Card>
    );
};
