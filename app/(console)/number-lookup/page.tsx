import type { Metadata } from "next";

import { RequirePermission } from "@/components/common/RequirePermission";
import { NumberLookupScreen } from "@/components/partners/lookup/NumberLookupScreen";

export const metadata: Metadata = { title: "Number lookup" };

// Admin only (`partners.remove_draft`). Company-wide, so it works without a zone.
export default function NumberLookupPage() {
  return (
    <RequirePermission anyOf={["partners.remove_draft"]}>
      <NumberLookupScreen />
    </RequirePermission>
  );
}
