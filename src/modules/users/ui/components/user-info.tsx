"use client";

import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent
} from "@/components/ui/tooltip"
import Link from "next/link";
import { UserIcon } from "@/modules/market/components/assetIcons/functions/get-user-icons";

const userInfoVariants = cva("flex items-center gap-1", {
    variants: {
        size: {
            default: "[&_p]:text-sm [&_svg]:size-4",
            lg: "[&_p]:text-base [&_svg]:size-5 [&_p]:font-medium",
            sm: "[&_p]:text-xs [&_svg]:size-3.5",
            md: "[&_p]:text-sm [&_svg]:size-4",
            xs: "[&_p]:text-xs [&_svg]:size-2.5",

        },
        defaultVariants: {
            size: "default"
        },
    }
})

interface UserInfoProps extends VariantProps<typeof userInfoVariants> {
    name: string;
    className?: string;
    userId: string;
}

export const UserInfo = ({
    name,
    className,
    size,
    userId,
}: UserInfoProps) => {

    console.log("Size in UserInfo:", size);

    return (
        <div className={cn(userInfoVariants({ size, className }))}>
            <div className="flex items-center gap-1">
                <Link href={`/users/${userId}`} className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <p className="text-gray-500 dark:text-gray-100 hover:text-gray-800 dark:hover:text-gray-200 line-clamp-1">
                                {name}
                            </p>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black/70 text-white dark:bg-white dark:text-black" align="center">
                            <p>{name}</p>
                        </TooltipContent>
                    </Tooltip>
                    <UserIcon userId={userId} size={size === 'lg' ?6 : 4} />
                </Link>
            </div>
        </div>
    )
}
