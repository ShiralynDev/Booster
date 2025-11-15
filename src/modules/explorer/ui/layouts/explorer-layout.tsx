"use client";

import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ExplorerNavBar } from "../components/explorer-navbar";
import { ExplorerSidebar } from "../components/explorer-sidebar";
import { useParams } from "next/navigation";

export const ExplorerLayout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(true);
  const [variant, setVariant] = useState<"sidebar" | "floating" | "inset">(
    "sidebar"
  );
  const [collapsible, setCollapsible] = useState<"icon" | "offcanvas" | "none">(
    "icon"
  );

  // read params at top-level (hooks must be called at top-level)
  const params = useParams();
  const video = params?.videoId;

  // react to changes in the route param; only update state when `video` changes
  useEffect(() => {
    if (video) {
      setOpen(false);
      setVariant("floating");
      setCollapsible("offcanvas");
    } else {
      // revert to defaults when leaving a video route
      setOpen(true);
      setVariant("sidebar");
      setCollapsible("icon");
    }
  }, [video]);

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <div className="w-full">
        <ExplorerNavBar />
        <div className={`${video ? "" : "flex"} -ml-2 min-h-screen pt-[4rem] bg-background relative`}
        >

          {/* overlay for offcanvas/floating sidebar to close when clicking outside */}
          {variant === "floating" && collapsible === "offcanvas" && open && (
            <div
              className="fixed inset-0 z-40 bg-black/30"
              onClick={() => setOpen(false)}
              aria-hidden
            />
          )}
          <ExplorerSidebar collapsible={collapsible} variant={variant} />

          <main className="flex-1 relative z-30 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
