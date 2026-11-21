import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { PartnerDetailScreen } from "@/components/partners/detail/PartnerDetailScreen";

export const metadata: Metadata = { title: "Partner" };

// The partner id comes from the address (useParams), so the screen sits in Suspense.
export default function PartnerPage() {
  return (
    <RequirePermission anyOf={["partners.view"]}>
      <Suspense>
        <PartnerDetailScreen />
      </Suspense>
    </RequirePermission>
  );
}
