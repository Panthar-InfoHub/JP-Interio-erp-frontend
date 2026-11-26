import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { TicketsScreen } from "@/components/tickets/TicketsScreen";

export const metadata: Metadata = { title: "Support tickets" };

// The queue keeps its tab and filters in the address (useSearchParams), so it sits in Suspense.
export default function TicketsPage() {
  return (
    <RequirePermission anyOf={["tickets.handle"]}>
      <Suspense>
        <TicketsScreen />
      </Suspense>
    </RequirePermission>
  );
}
