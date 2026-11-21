import type { Metadata } from "next";
import { Suspense } from "react";

import { BrandsScreen } from "@/components/brands/BrandsScreen";
import { RequirePermission } from "@/components/common/RequirePermission";

export const metadata: Metadata = { title: "Brands" };

// The list keeps its filters in the address (useSearchParams), so it sits in Suspense.
export default function BrandsPage() {
  return (
    <RequirePermission anyOf={["products.manage"]}>
      <Suspense>
        <BrandsScreen />
      </Suspense>
    </RequirePermission>
  );
}
