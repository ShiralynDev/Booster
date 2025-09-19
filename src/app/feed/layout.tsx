import { ExplorerLayout } from "@/modules/explorer/ui/layouts/explorer-layout";
import React from "react";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({children}: LayoutProps) => {
    return ( 
        <div>
            <ExplorerLayout>
                {children}
            </ExplorerLayout>
        </div>
     );
}
 
export default Layout;