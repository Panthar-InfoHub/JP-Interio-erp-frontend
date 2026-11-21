import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { PayoutsScreen } from "@/components/payouts/PayoutsScreen";

export const metadata: Metadata = { title: "Payouts" };

// The list keeps its tab and filters in the address (useSearchParams): Suspense.
export default function PayoutsPage() {
  return (
    <RequirePermission anyOf={["payouts.view"]}>
      <Suspense>
        <PayoutsScreen />
      </Suspense>
    </RequirePermission>
  );
}
