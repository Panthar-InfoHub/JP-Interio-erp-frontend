import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { PointsLiabilityScreen } from "@/components/liability/PointsLiabilityScreen";

export const metadata: Metadata = { title: "Points liability" };

// The chosen day is kept in the address (useSearchParams): Suspense.
export default function PointsLiabilityPage() {
  return (
    <RequirePermission anyOf={["reports.points_liability"]}>
      <Suspense>
        <PointsLiabilityScreen />
      </Suspense>
    </RequirePermission>
  );
}
