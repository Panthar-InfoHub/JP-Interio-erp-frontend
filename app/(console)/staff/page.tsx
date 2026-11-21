import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { StaffScreen } from "@/components/staff/StaffScreen";

export const metadata: Metadata = { title: "Staff" };

// The list keeps its filters in the address (useSearchParams), so it sits in Suspense.
export default function StaffPage() {
  return (
    <RequirePermission anyOf={["users.view"]}>
      <Suspense>
        <StaffScreen />
      </Suspense>
    </RequirePermission>
  );
}
