import type { Metadata } from "next";

import { CategoriesScreen } from "@/components/categories/CategoriesScreen";
import { RequirePermission } from "@/components/common/RequirePermission";

export const metadata: Metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <RequirePermission anyOf={["products.manage"]}>
      <CategoriesScreen />
    </RequirePermission>
  );
}
