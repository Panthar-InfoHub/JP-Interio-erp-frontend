import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { TasksScreen } from "@/components/tasks/TasksScreen";

export const metadata: Metadata = { title: "Tasks" };

// The list keeps its filters in the address (useSearchParams), so it sits in Suspense.
export default function TasksPage() {
  return (
    <RequirePermission anyOf={["tasks.view"]}>
      <Suspense>
        <TasksScreen />
      </Suspense>
    </RequirePermission>
  );
}
