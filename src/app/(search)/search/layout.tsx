import { ExplorerLayout } from "@/modules/explorer/ui/layouts/explorer-layout"

interface LayoutProps{
    children: React.ReactNode;
}

const Page = ({children}: LayoutProps) => {
    return (
        <ExplorerLayout> 
            {children}
        </ExplorerLayout>
    )
}

export default Page;