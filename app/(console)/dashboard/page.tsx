import type { Metadata } from "next";

import { DashboardPlaceholder } from "@/components/dashboard/DashboardPlaceholder";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return <DashboardPlaceholder />;
}
