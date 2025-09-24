'use client';

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { EarthIcon, FlameIcon, HomeIcon, PlayIcon, PlaySquareIcon, ShieldQuestionIcon, ShoppingCart, Sidebar, Users, Users2 } from "lucide-react";

import { useAuth, useClerk } from "@clerk/nextjs";

import Link from "next/link";


const items = [
    {
        title: "Next Up",
        url: "/",
        icon: PlayIcon,
    },
    {
        title: "Explorer",
        url: "/explorer",
        icon: EarthIcon
    },
    {
        title: "Following",
        url: "/feed/follows",
        icon: Users,
        auth:true,
    },
    {
        title: "Trending",
        url: "/feed/trending",
        icon: FlameIcon,
    }, 
    {
        title: "Market",
        url: "/market",
        icon: ShoppingCart,
    },
    {
        title: "About",
        url: "/about",
        icon: ShieldQuestionIcon,
    }

]

export const MainSection = () => {

    const {userId, isSignedIn}= useAuth();
    const clerk = useClerk();

    return (
        <SidebarGroup>
            <SidebarGroupContent>
               <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                tooltip={item.title}
                                asChild
                                isActive={false}
                                onClick={(e)=>{
                                    if(!isSignedIn && item.auth){
                                        e.preventDefault();
                                        return clerk.openSignIn();
                                    }
                                }}
                            >
                                <Link href={item.url} className='flex items-center gap-4'>
                                    <item.icon />
                                    <span className='text-sm'>{item.title}</span>
                                </Link>

                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
               </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}