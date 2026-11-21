import {
  BarChart3,
  Boxes,
  ClipboardCheck,
  ClipboardList,
  FileSpreadsheet,
  FolderTree,
  IdCard,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  MapPinned,
  Network,
  QrCode,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Tags,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { Capability } from "@/lib/auth/permissions";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Shown when the person has ANY of these actions. */
  anyOf: readonly Capability[];
  /** Plan area that builds the page (F3 – F13); shown on the "coming soon" page. */
  area: string;
}

export interface NavGroup {
  label: string;
  items: readonly NavItem[];
}

/**
 * The panel's menu (docs/Frontend Development Plan.md). Each item appears only for
 * people with one of its actions; the server still checks every request.
 */
export const NAVIGATION: readonly NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        anyOf: ["dashboard.view"],
        area: "F3",
      },
    ],
  },
  {
    label: "Partners",
    items: [
      { label: "Partners", href: "/partners", icon: Users, anyOf: ["partners.view"], area: "F4" },
      { label: "KYC review", href: "/kyc", icon: IdCard, anyOf: ["kyc.verify"], area: "F4" },
      {
        label: "Number lookup",
        href: "/number-lookup",
        icon: Search,
        anyOf: ["partners.remove_draft"],
        area: "F4",
      },
    ],
  },
  {
    label: "Rewards",
    items: [
      { label: "Payouts", href: "/payouts", icon: Wallet, anyOf: ["payouts.view"], area: "F5" },
      {
        label: "Points ledger",
        href: "/ledger",
        icon: ScrollText,
        anyOf: ["ledger.view"],
        area: "F5",
      },
      {
        label: "Points liability",
        href: "/points-liability",
        icon: BarChart3,
        anyOf: ["reports.points_liability"],
        area: "F5",
      },
    ],
  },
  {
    label: "Products",
    items: [
      { label: "Products", href: "/products", icon: Boxes, anyOf: ["products.manage"], area: "F7" },
      {
        label: "Categories",
        href: "/categories",
        icon: FolderTree,
        anyOf: ["products.manage"],
        area: "F7",
      },
      { label: "Brands", href: "/brands", icon: Tags, anyOf: ["products.manage"], area: "F7" },
      { label: "QR batches", href: "/qr-batches", icon: QrCode, anyOf: ["qr.view"], area: "F8" },
    ],
  },
  {
    label: "Work",
    items: [
      {
        label: "Tasks",
        href: "/tasks",
        icon: ClipboardList,
        anyOf: ["tasks.view", "tasks.assign"],
        area: "F10",
      },
      {
        label: "My tasks",
        href: "/my-tasks",
        icon: ListChecks,
        anyOf: ["tasks.complete"],
        area: "F10",
      },
      {
        label: "Requests",
        href: "/requests",
        icon: ClipboardCheck,
        anyOf: ["requests.view"],
        area: "F9",
      },
      {
        label: "Support tickets",
        href: "/tickets",
        icon: LifeBuoy,
        anyOf: ["tickets.handle"],
        area: "F11",
      },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Staff", href: "/staff", icon: UserCog, anyOf: ["users.view"], area: "F6" },
      { label: "Org chart", href: "/org-chart", icon: Network, anyOf: ["users.view"], area: "F6" },
      { label: "Zones", href: "/zones", icon: MapPinned, anyOf: ["zones.manage"], area: "F6" },
      {
        label: "Sub-Admins",
        href: "/sub-admins",
        icon: ShieldCheck,
        anyOf: ["sub_admins.manage"],
        area: "F13",
      },
    ],
  },
  {
    label: "Reports",
    items: [
      {
        label: "Reports",
        href: "/reports",
        icon: FileSpreadsheet,
        anyOf: ["reports.view"],
        area: "F12",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        anyOf: ["settings.manage"],
        area: "F13",
      },
    ],
  },
];

/** The menu item a path belongs to ("/payouts/123" → Payouts), or undefined. */
export function findNavItem(pathname: string): NavItem | undefined {
  let best: NavItem | undefined;
  for (const group of NAVIGATION) {
    for (const item of group.items) {
      const matches = pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (matches && (!best || item.href.length > best.href.length)) best = item;
    }
  }
  return best;
}
