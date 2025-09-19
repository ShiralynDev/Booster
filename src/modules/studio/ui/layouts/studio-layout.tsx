//layout for this (home) group only

import { SidebarProvider } from "@/components/ui/sidebar";
import { StudioNavBar } from "../components/studio-navbar";
import { StudioSidebar } from "../components/studio-sidebar";


interface StudioLayoutProps {
    children: React.ReactNode;
}

export const StudioLayout = ({children}: StudioLayoutProps) => {
    return (
        <SidebarProvider>
            <div className='w-full'>
                <StudioNavBar/>
                <div className="flex min-h-screen pt-[4rem]">
                    <StudioSidebar />
                    <main className="flex-1 ">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}

