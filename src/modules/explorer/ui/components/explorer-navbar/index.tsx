"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchInput } from "./search-input";
import { AuthButton } from "@/modules/auth/ui/components/auth-button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Gift, Rocket } from "lucide-react";
import { trpc } from "@/trpc/client";
import { useAuth, useClerk } from "@clerk/nextjs";

// XP indicator with loading state and tooltip
const XpIndicator = ({
  xp,
  isLoading = false,
}: {
  xp: number;
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
                <Gift className="h-4 w-4 text-purple-700 " />
                {/* <Image
                src="/xpicon.png"
                alt="Experience Points"
                width={32}
                height={32}
                className="text-blue-500"
              /> */}
              </div>
              <span className="text-purple-700 dark:text-purple-600 font-semibold">
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

// Navigation item component to avoid repetition
const NavItem = ({
  href,
  children,
  userId,
  clerk,
}: {
  href: string;
  children: React.ReactNode;
  userId: string | undefined;
  clerk: any;
}) => {
  if (!userId) {
    return (
      <button
        onClick={() => clerk.openSignIn()}
        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {children}
      </button>
    );
  } else {
    return (
      <Link
        href={href}
        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {children}
      </Link>
    );
  }
};

export const ExplorerNavBar = () => {
  const [myXp, setMyXp] = useState(2450);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Simulate loading XP data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Add scroll effect to navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const { userId: clerkUserId } = useAuth();
  const  clerk  = useClerk();
  const { data: user } = trpc.users.getByClerkId.useQuery({
    clerkId: clerkUserId,
  });
  const userId = user?.id;
  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-[#212121]/80 backdrop-blur-md flex items-center px-4 z-50 border-b border-gray-200/50 dark:border-gray-700/50 transition-all ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="flex items-center justify-between w-full">
        {/* Menu and logo */}
        <div className="flex items-center flex-shrink-0">
          <SidebarTrigger />
          <Link
            href="/"
            className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={30}
                height={30}
                className="mr-2"
              />
              <Image
                src="/BoosterLongLogo.svg"
                alt="Booster"
                width={150}
                height={30}
                className="hidden sm:block"
              />
            </div>
          </Link>
        </div>

        {/* Search bar */}
        <div className="flex-1 flex justify-center max-w-[600px] mx-4">
          <SearchInput />
        </div>

        {/* XP indicator + right controls */}
        <div className="flex-shrink-0 items-center flex gap-3">
          {/* Desktop navigation */}
          <NavItem clerk={clerk} userId={userId} href={`/users/${userId}`}>
            My community
          </NavItem>

          <XpIndicator xp={myXp} isLoading={isLoading} />
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};
