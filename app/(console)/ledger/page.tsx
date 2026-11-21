import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { LedgerScreen } from "@/components/ledger/LedgerScreen";

export const metadata: Metadata = { title: "Points ledger" };

// The list keeps its filters in the address (useSearchParams): Suspense.
export default function LedgerPage() {
  return (
    <RequirePermission anyOf={["ledger.view"]}>
      <Suspense>
        <LedgerScreen />
      </Suspense>
    </RequirePermission>
  );
}
