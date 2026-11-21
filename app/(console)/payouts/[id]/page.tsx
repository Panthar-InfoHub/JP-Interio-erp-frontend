import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { PayoutDetailScreen } from "@/components/payouts/detail/PayoutDetailScreen";

export const metadata: Metadata = { title: "Payout" };

// The payout id comes from the address (useParams), so the screen sits in Suspense.
export default function PayoutDetailPage() {
  return (
    <RequirePermission anyOf={["payouts.view"]}>
      <Suspense>
        <PayoutDetailScreen />
      </Suspense>
    </RequirePermission>
  );
}
