import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { TicketDetailScreen } from "@/components/tickets/detail/TicketDetailScreen";

export const metadata: Metadata = { title: "Support ticket" };

// The ticket id comes from the address (useParams), so the screen sits in Suspense.
export default function TicketDetailPage() {
  return (
    <RequirePermission anyOf={["tickets.handle"]}>
      <Suspense>
        <TicketDetailScreen />
      </Suspense>
    </RequirePermission>
  );
}
