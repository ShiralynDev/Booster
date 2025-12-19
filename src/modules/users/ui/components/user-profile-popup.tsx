"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/trpc/client";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { UserIcon } from "@/modules/market/components/assetIcons/functions/get-user-icons";
import { UserTitle } from "./user-title";
import { Progress } from "@/components/ui/progress";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface UserProfilePopupProps {
  userId: string;
  children: React.ReactNode;
  align?: "center" | "start" | "end";
  side?: "top" | "right" | "bottom" | "left";
  trigger?: "click" | "hover";
}

const f = (x: number) => {
  return Math.floor((x * x) / 1000);
};

export const UserProfilePopup = ({
  userId,
  children,
  align = "center",
  side = "bottom",
  trigger = "click",
}: UserProfilePopupProps) => {
  const [open, setOpen] = useState(false);
  
  const { data: user, isLoading } = trpc.users.getByUserId.useQuery(
    { userId },
    { enabled: open && !!userId } 
  );

  if (!userId) return <>{children}</>;

  const boostPoints = user?.boostPoints || 0;
  const channelLevel = Math.floor(
      Math.floor(Math.sqrt(boostPoints * 1000)) / 1000
  );

  const xpOnCurrentLevel = f(1000 * channelLevel);
  const xpForNextLevel = f(1000 * (channelLevel + 1));

  const progressPercentage = Math.max(0, Math.min(100, ((boostPoints - xpOnCurrentLevel) / (xpForNextLevel - xpOnCurrentLevel)) * 100));

  const content = isLoading ? (
        <div className="flex items-center justify-center p-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
    ) : user ? (
    <div className="flex flex-col">
        <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <Avatar className="size-16 border-2 border-background shadow-sm">
                    <AvatarImage src={user.imageUrl} alt={user.name} />
                </Avatar>
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-lg font-bold truncate">{user.name}</p>
                        <UserIcon userId={userId} size={4} />
                    </div>
                    <UserTitle userId={userId} size="sm" />
                    {user.username && <p className="text-sm text-muted-foreground truncate">@{user.username}</p>}
                </div>
            </div>
            
            {user.about && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {user.about}
                </p>
            )}
        </div>

        <Separator />
        
        {user.accountType !== 'business' && (
            <div className="p-4 bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Level {channelLevel}</span>
                    <span className="text-xs text-muted-foreground">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                    {boostPoints - xpOnCurrentLevel} / {xpForNextLevel - xpOnCurrentLevel} XP to next level
                </p>
            </div>
        )}

        <div className="p-4 pt-0">
            <Button asChild className="w-full" size="lg">
                <Link href={`/users/${user.id}`} onClick={() => setOpen(false)}>
                    View Full Profile
                </Link>
            </Button>
        </div>
    </div>
    ) : (
    <div className="p-8 text-center text-sm text-muted-foreground">
        User information not available
    </div>
    );

  if (trigger === "hover") {
    return (
        <HoverCard open={open} onOpenChange={setOpen}>
            <HoverCardTrigger asChild>
                <Link href={`/users/${userId}`}>
                    {children}
                </Link>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-0 overflow-hidden rounded-xl shadow-xl border-border/50" align={align} side={side}>
                {content}
            </HoverCardContent>
        </HoverCard>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 overflow-hidden rounded-xl shadow-xl border-border/50" align={align} side={side}>
        {content}
      </PopoverContent>
    </Popover>
  );
};
