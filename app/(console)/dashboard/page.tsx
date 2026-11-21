import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { DashboardScreen } from "@/components/dashboard/DashboardScreen";

export const metadata: Metadata = { title: "Dashboard" };

// DashboardScreen reads ?period= / ?rank= (useSearchParams), so it sits in Suspense.
export default function DashboardPage() {
  return (
    <RequirePermission anyOf={["dashboard.view"]}>
      <Suspense>
        <DashboardScreen />
      </Suspense>
    </RequirePermission>
  );
}
