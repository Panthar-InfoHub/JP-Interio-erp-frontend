import type { Metadata } from "next";

import { RequirePermission } from "@/components/common/RequirePermission";
import { OrgChartScreen } from "@/components/org-chart/OrgChartScreen";

export const metadata: Metadata = { title: "Org chart" };

export default function OrgChartPage() {
  return (
    <RequirePermission anyOf={["users.view"]}>
      <OrgChartScreen />
    </RequirePermission>
  );
}
