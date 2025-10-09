//layout for this (home) group only

import { SidebarProvider } from "@/components/ui/sidebar";
import { ExplorerNavBar, } from "../components/explorer-navbar";
import { ExplorerSidebar, } from "../components/explorer-sidebar";


interface HomeLayoutProps {
    children: React.ReactNode;
}

export const ExplorerLayout= ({children}: HomeLayoutProps) => {
    return (
        <SidebarProvider>
            <div className='w-full'>
                <ExplorerNavBar />
                    <ExplorerSidebar collapsible="icon" variant="floating"/>
                <div className="flex -ml-2 min-h-screen pt-[4rem] bg-background">
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}

