"use client";

import { trpc } from "@/trpc/client";
import { cn } from "@/lib/utils";
import { getTitleGradient } from "@/constants";

interface UserTitleProps {
    userId: string;
    className?: string;
    size?: "default" | "sm" | "lg" | "md" | "xs";
}

export const UserTitle = ({ userId, className, size = "default" }: UserTitleProps) => {
    const { data: equippedTitle } = trpc.users.getEquippedTitle.useQuery(
        { userId },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            staleTime: 0,
        }
    );

    if (!equippedTitle) {
        return null;
    }

    const textSize = {
        default: "text-xs",
        lg: "text-sm",
        sm: "text-[10px]",
        md: "text-xs",
        xs: "text-[10px]",
    }[size];

    return (
        <span className={cn("font-bold bg-clip-text text-transparent bg-gradient-to-r", getTitleGradient(equippedTitle.name), textSize, className)}>
            {equippedTitle.name}
        </span>
    );
};
