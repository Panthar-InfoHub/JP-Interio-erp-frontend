import type { Metadata } from "next";

import { RequirePermission } from "@/components/common/RequirePermission";
import { SettingsScreen } from "@/components/settings/SettingsScreen";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <RequirePermission anyOf={["settings.manage"]}>
      <SettingsScreen />
    </RequirePermission>
  );
}
