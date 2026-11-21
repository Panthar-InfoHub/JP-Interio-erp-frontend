import { StatusBadge } from "@/components/common/StatusBadge";
import { StaffActionsMenu } from "@/components/staff/actions/StaffActionsMenu";
import { formatPhone } from "@/lib/format/phone";
import { STAFF_STATUS } from "@/lib/labels/staff";
import type { StaffDetail } from "@/types/staff";

/** Name, role, status and the main facts of one staff member. */
export function StaffHeader({ member }: { member: StaffDetail }) {
  const status = STAFF_STATUS[member.status];

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl wrap-break-word">{member.name ?? "Unnamed"}</h1>
          <p className="text-sm text-muted-foreground">{member.role.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
          <StaffActionsMenu member={member} />
        </div>
      </div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs text-muted-foreground">Mobile</dt>
          <dd>{formatPhone(member.phone)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Email</dt>
          <dd className="wrap-break-word">{member.email ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Zone</dt>
          <dd>{member.zone?.name ?? (member.role.key === "zonal_head" ? "No zone yet" : "—")}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Reports to</dt>
          <dd>
            {member.parent
              ? `${member.parent.name ?? "Unnamed"} (${member.parent.role.name})`
              : "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
