"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandMark } from "@/components/brand/BrandMark";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { findNavItem, NAVIGATION } from "@/config/navigation";
import { hasAnyPermission } from "@/lib/auth/permissions";
import { useAuthStore } from "@/stores/auth.store";

/** Left menu: only the items this person may use; a slide-out sheet on phones. */
export function AppSidebar() {
  const pathname = usePathname();
  const permissions = useAuthStore((state) => state.permissions);
  const { isMobile, setOpenMobile } = useSidebar();
  const activeHref = findNavItem(pathname)?.href;

  const groups = NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter((item) => hasAnyPermission(permissions, item.anyOf)),
  })).filter((group) => group.items.length > 0);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center border-b px-4 group-data-[collapsible=icon]:px-2">
        <Link href="/dashboard" className="truncate text-lg">
          <BrandMark className="group-data-[collapsible=icon]:hidden" />
          <span className="hidden font-semibold text-primary group-data-[collapsible=icon]:inline">
            JP
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={item.href === activeHref}
                      tooltip={item.label}
                      render={
                        <Link
                          href={item.href}
                          onClick={() => {
                            if (isMobile) setOpenMobile(false);
                          }}
                        />
                      }
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
