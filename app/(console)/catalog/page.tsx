import type { Metadata } from "next";
import { Suspense } from "react";

import { AppCatalogScreen } from "@/components/app-catalog/AppCatalogScreen";
import { RequirePermission } from "@/components/common/RequirePermission";

export const metadata: Metadata = { title: "App catalog" };

// Zone-free: the catalog is the same for everyone (DEC-271). Filters live in the address,
// so the screen sits in Suspense.
export default function AppCatalogPage() {
  return (
    <RequirePermission anyOf={["catalog.view"]} zoneFree>
      <Suspense>
        <AppCatalogScreen />
      </Suspense>
    </RequirePermission>
  );
}
