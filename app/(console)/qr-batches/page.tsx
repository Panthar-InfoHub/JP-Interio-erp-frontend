import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { QrBatchesScreen } from "@/components/qr-batches/QrBatchesScreen";

export const metadata: Metadata = { title: "QR batches" };

// The list keeps its filters in the address (useSearchParams), so it sits in Suspense.
export default function QrBatchesPage() {
  return (
    <RequirePermission anyOf={["qr.view"]}>
      <Suspense>
        <QrBatchesScreen />
      </Suspense>
    </RequirePermission>
  );
}
