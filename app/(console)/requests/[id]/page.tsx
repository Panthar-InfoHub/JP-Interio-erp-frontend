import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { RequestDetailScreen } from "@/components/requests/detail/RequestDetailScreen";

export const metadata: Metadata = { title: "Request" };

// The request id comes from the address (useParams), so the screen sits in Suspense.
export default function RequestDetailPage() {
  return (
    <RequirePermission anyOf={["requests.view"]}>
      <Suspense>
        <RequestDetailScreen />
      </Suspense>
    </RequirePermission>
  );
}
