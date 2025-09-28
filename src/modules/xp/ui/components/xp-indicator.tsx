import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {  Boxes } from "lucide-react";
import Link from "next/link";

// XP indicator with loading state and tooltip
export const XpIndicator = ({
  xp,
  isLoading = false,
}: {
  xp: number,
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-10" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 text-sm font-medium border border-blue-100 dark:border-blue-800/30 cursor-help">
            <Link href={"/market"} className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <Boxes className="h-4 w-4 text-purple-400 " />
                {/* <Image
                src="/xpicon.png"
                alt="Experience Points"
                width={32}
                height={32}
                className="text-blue-500"
              /> */}
              </div>
              <span className="text-purple-500 dark:text-purple-300 font-semibold">
                {xp.toLocaleString()} XP
              </span>
            </Link>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Your total experience in the platform</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};