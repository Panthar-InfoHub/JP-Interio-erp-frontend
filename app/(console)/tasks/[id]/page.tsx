import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { TaskDetailScreen } from "@/components/tasks/detail/TaskDetailScreen";

export const metadata: Metadata = { title: "Task" };

// Shared by the team list and My tasks, so it also works without a zone (DEC-292).
// The task id comes from the address (useParams), so the screen sits in Suspense.
export default function TaskDetailPage() {
  return (
    <RequirePermission anyOf={["tasks.view", "tasks.complete"]} zoneFree>
      <Suspense>
        <TaskDetailScreen />
      </Suspense>
    </RequirePermission>
  );
}
