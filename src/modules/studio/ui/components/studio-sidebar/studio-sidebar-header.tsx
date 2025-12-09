import {
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { trpc } from "@/trpc/client";

export const StudioSidebarHeader = () => {
  const { user } = useUser();
  const { data: dbUser } = trpc.users.getByClerkId.useQuery({ clerkId: user?.id });

  const { state } = useSidebar(); //only inside a sidebar. StudioSidebarHeader is inside a sidebar

  if (!user)
    return (
      <SidebarHeader className="flex items-center justify-center pb-4">
        <Skeleton className="size-[112px] rounded-full" />
        <div className="flex flex-col items-center mt-2 gap-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
      </SidebarHeader>
    );

  if (state === "collapsed") {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton tooltip="Your profile" asChild>
          <Link href={dbUser ? `/users/${dbUser.id}` : "/users/current"}>
            <UserAvatar
              imageUrl={user?.imageUrl}
              name={user?.fullName || "User"}
              size="xs"
              userId={dbUser?.id}
            />
            <span className="text-sm">Your profile</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarHeader className="flex items-center justify-center pb-4">
      <Link href={dbUser ? `/users/${dbUser.id}` : "/users/current"}>
        <UserAvatar
          imageUrl={user?.imageUrl}
          name={user?.fullName || "User"}
          className="size-[112px] hover:opacity-80 transition-opacity"
          userId={dbUser?.id}
        />
      </Link>
      <div className="flex flex-col items-center mt-2 gap-y-1">
        <p className="text-sm font-medium">Your profile</p>
        <p className="text-xs text-muted-foreground">{user?.fullName}</p>
      </div>
    </SidebarHeader>
  );
};
