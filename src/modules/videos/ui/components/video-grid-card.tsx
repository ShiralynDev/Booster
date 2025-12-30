import Link from "next/link";
import { VideoThumbnail } from "./video-thumbnail";
import { UserAvatar } from "@/components/user-avatar";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoGridCardProps {
  data: {
    video: {
      id: string;
      title: string;
      thumbnailUrl: string | null;
      previewUrl: string | null;
      duration: number;
      createdAt: Date;
      isAi: boolean;
      // views: number;
    };
    user: {
      id: string;
      name: string;
      imageUrl: string;
    };
  };
  onRemove?: () => void;
}

export const VideoGridCard = ({ data, onRemove }: VideoGridCardProps) => {
  return (
    <div className="flex flex-col gap-2 group relative">
      <Link href={`/videos/${data.video.id}`}>
        <VideoThumbnail
          imageUrl={data.video.thumbnailUrl}
          previewUrl={data.video.previewUrl}
          title={data.video.title}
          duration={data.video.duration}
          isAi={data.video.isAi}
        />
      </Link>
      {onRemove && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      <div className="flex gap-3 items-start">
        <Link href={`/users/${data.user.id}`}>
          <UserAvatar
                      userId={data.user.id}
                      imageUrl={data.user.imageUrl}
                      name={data.user.name}
                      size="sm"
          />
        </Link>
        <div className="flex flex-col min-w-0">
          <Link href={`/videos/${data.video.id}`}>
            <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
              {data.video.title}
            </h3>
          </Link>
          <Link href={`/users/${data.user.id}`}>
            <p className="text-sm text-muted-foreground line-clamp-1 hover:text-foreground transition-colors">
              {data.user.name}
            </p>
          </Link>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {/* <span>{data.video.views} views</span>
            <span>•</span> */}
            <span>{formatDistanceToNow(new Date(data.video.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
