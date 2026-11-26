import type { Metadata } from "next";

import { RequirePermission } from "@/components/common/RequirePermission";
import { SubAdminsScreen } from "@/components/sub-admins/SubAdminsScreen";

export const metadata: Metadata = { title: "Sub-Admins" };

export default function SubAdminsPage() {
  return (
    <RequirePermission anyOf={["sub_admins.manage"]}>
      <SubAdminsScreen />
    </RequirePermission>
  );
}
