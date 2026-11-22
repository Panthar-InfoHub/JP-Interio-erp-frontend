import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { QrBatchDetailScreen } from "@/components/qr-batches/detail/QrBatchDetailScreen";

export const metadata: Metadata = { title: "QR batch" };

// The batch id (useParams) and the codes list's filters (useSearchParams) come from the address.
export default function QrBatchDetailPage() {
  return (
    <RequirePermission anyOf={["qr.view"]}>
      <Suspense>
        <QrBatchDetailScreen />
      </Suspense>
    </RequirePermission>
  );
}
