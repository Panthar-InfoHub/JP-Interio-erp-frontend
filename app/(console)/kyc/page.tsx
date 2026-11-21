import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { KycQueueScreen } from "@/components/kyc/KycQueueScreen";

export const metadata: Metadata = { title: "KYC review" };

// The queue keeps its tab and filters in the address (useSearchParams): Suspense.
export default function KycPage() {
  return (
    <RequirePermission anyOf={["kyc.verify"]}>
      <Suspense>
        <KycQueueScreen />
      </Suspense>
    </RequirePermission>
  );
}
