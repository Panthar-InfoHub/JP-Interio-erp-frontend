import type { Metadata } from "next";

import { RequirePermission } from "@/components/common/RequirePermission";
import { ReportsScreen } from "@/components/reports/ReportsScreen";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <RequirePermission anyOf={["reports.view"]}>
      <ReportsScreen />
    </RequirePermission>
  );
}
