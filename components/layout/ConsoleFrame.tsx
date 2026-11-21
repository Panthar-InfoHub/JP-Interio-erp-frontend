import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { UserMenu } from "@/components/layout/UserMenu";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

/** The frame around every panel page: sidebar menu, top bar, page area. */
export function ConsoleFrame({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background/90 px-3 backdrop-blur sm:px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger aria-label="Show or hide the menu" />
            <Separator orientation="vertical" className="h-5" />
          </div>
          <UserMenu />
        </header>
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
