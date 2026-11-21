import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { ProductsScreen } from "@/components/products/ProductsScreen";

export const metadata: Metadata = { title: "Products" };

// The list keeps its filters in the address (useSearchParams), so it sits in Suspense.
export default function ProductsPage() {
  return (
    <RequirePermission anyOf={["products.manage"]}>
      <Suspense>
        <ProductsScreen />
      </Suspense>
    </RequirePermission>
  );
}
