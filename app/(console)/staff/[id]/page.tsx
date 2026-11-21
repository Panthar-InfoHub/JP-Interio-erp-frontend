import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { StaffDetailScreen } from "@/components/staff/detail/StaffDetailScreen";

export const metadata: Metadata = { title: "Staff member" };

// The staff id comes from the address (useParams), so the screen sits in Suspense.
export default function StaffMemberPage() {
  return (
    <RequirePermission anyOf={["users.view"]}>
      <Suspense>
        <StaffDetailScreen />
      </Suspense>
    </RequirePermission>
  );
}
