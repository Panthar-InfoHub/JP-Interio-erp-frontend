import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { MyTasksScreen } from "@/components/my-tasks/MyTasksScreen";

export const metadata: Metadata = { title: "My tasks" };

// Works for a Zonal Head with no zone (DEC-238). The tab is kept in the address
// (useSearchParams), so the screen sits in Suspense.
export default function MyTasksPage() {
  return (
    <RequirePermission anyOf={["tasks.complete"]} zoneFree>
      <Suspense>
        <MyTasksScreen />
      </Suspense>
    </RequirePermission>
  );
}
