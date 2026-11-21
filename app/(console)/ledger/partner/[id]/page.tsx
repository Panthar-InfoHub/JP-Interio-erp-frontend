import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { PartnerPointsScreen } from "@/components/ledger/partner/PartnerPointsScreen";

export const metadata: Metadata = { title: "Partner points" };

// The partner id and the tab / filters come from the address: Suspense.
export default function PartnerPointsPage() {
  return (
    <RequirePermission anyOf={["ledger.view"]}>
      <Suspense>
        <PartnerPointsScreen />
      </Suspense>
    </RequirePermission>
  );
}
