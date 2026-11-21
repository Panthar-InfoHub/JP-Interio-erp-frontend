import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { PartnersScreen } from "@/components/partners/PartnersScreen";

export const metadata: Metadata = { title: "Partners" };

// The list keeps its filters in the address (useSearchParams), so it sits in Suspense.
export default function PartnersPage() {
  return (
    <RequirePermission anyOf={["partners.view"]}>
      <Suspense>
        <PartnersScreen />
      </Suspense>
    </RequirePermission>
  );
}
