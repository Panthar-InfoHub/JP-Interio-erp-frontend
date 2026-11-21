import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { ZonesScreen } from "@/components/zones/ZonesScreen";

export const metadata: Metadata = { title: "Zones" };

// The list keeps its filters in the address (useSearchParams), so it sits in Suspense.
export default function ZonesPage() {
  return (
    <RequirePermission anyOf={["zones.manage"]}>
      <Suspense>
        <ZonesScreen />
      </Suspense>
    </RequirePermission>
  );
}
