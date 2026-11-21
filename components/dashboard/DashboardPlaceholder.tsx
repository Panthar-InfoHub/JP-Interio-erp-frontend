"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { useAuthStore } from "@/stores/auth.store";

/** Temporary landing page after login; the real dashboard is area F3. */
export function DashboardPlaceholder() {
  const name = useAuthStore((state) => state.user?.name);

  return (
    <>
      <PageHeader title={name ? `Welcome, ${name}` : "Welcome"} />
      <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        You are logged in. The dashboard comes in the next steps.
      </div>
    </>
  );
}
