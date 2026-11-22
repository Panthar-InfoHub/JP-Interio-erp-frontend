import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { RequestsScreen } from "@/components/requests/RequestsScreen";

export const metadata: Metadata = { title: "Requests" };

// The list keeps its tab and filters in the address (useSearchParams), so it sits in Suspense.
export default function RequestsPage() {
  return (
    <RequirePermission anyOf={["requests.view"]}>
      <Suspense>
        <RequestsScreen />
      </Suspense>
    </RequirePermission>
  );
}
