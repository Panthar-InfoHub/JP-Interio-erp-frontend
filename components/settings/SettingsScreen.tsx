"use client";

import { Lock, Pencil } from "lucide-react";
import { useState } from "react";

import { ErrorState } from "@/components/common/StateMessages";
import { PageHeader } from "@/components/layout/PageHeader";
import { EditSettingDialog } from "@/components/settings/EditSettingDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/hooks/settings/useSettings";
import type { Setting } from "@/lib/api/settings.api";
import { formatDateTime } from "@/lib/format/date";
import { groupSettings, withUnit } from "@/lib/settings/settingGroups";

function SettingRow({ setting, onEdit }: { setting: Setting; onEdit: () => void }) {
  // Only whole-number settings can be edited here (every current one is).
  const editable = !setting.readOnly && setting.type === "int";
  const range =
    setting.min !== null && setting.max !== null
      ? `${withUnit(setting.key, setting.min)} – ${withUnit(setting.key, setting.max)}`
      : null;

  return (
    <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm wrap-break-word">{setting.description}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {range ? `Allowed ${range} · ` : ""}default {withUnit(setting.key, setting.default)}
          {" · "}
          {setting.updatedBy
            ? `changed by ${setting.updatedBy.name ?? "Admin"} on ${formatDateTime(setting.updatedAt)}`
            : "never changed"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-lg font-semibold tabular-nums">
          {withUnit(setting.key, setting.value)}
        </span>
        {editable ? (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil data-icon="inline-start" />
            Edit
          </Button>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="size-3.5" aria-hidden />
            Can&apos;t be changed
          </span>
        )}
      </div>
    </li>
  );
}

/**
 * System settings (Admin only, `settings.manage`, DEC-054, DEC-301): groups of rows with the
 * current value, limits, default and last change; Edit opens a pop-up. `otp.length` is
 * shown but locked (DEC-036). Changes apply straight away.
 */
export function SettingsScreen() {
  const settings = useSettings();
  const [editing, setEditing] = useState<Setting | null>(null);

  return (
    <>
      <PageHeader
        title="Settings"
        description="Business numbers you can change without a new app version. A change applies straight away for everyone."
      />

      {settings.isPending ? (
        <div className="grid gap-4" aria-busy="true" aria-label="Loading the settings">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : settings.isError ? (
        <div className="rounded-xl border bg-card shadow-sm">
          <ErrorState error={settings.error} onRetry={() => void settings.refetch()} />
        </div>
      ) : (
        <div className="grid gap-4">
          {groupSettings(settings.data).map((group) => (
            <section
              key={group.id}
              aria-label={group.title}
              className="rounded-xl border bg-card p-4 shadow-sm sm:p-6"
            >
              <h2 className="mb-4 text-base">{group.title}</h2>
              <ul className="divide-y">
                {group.settings.map((setting) => (
                  <SettingRow
                    key={setting.key}
                    setting={setting}
                    onEdit={() => setEditing(setting)}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {editing ? (
        <EditSettingDialog
          setting={editing}
          open
          onOpenChange={(next) => !next && setEditing(null)}
        />
      ) : null}
    </>
  );
}
