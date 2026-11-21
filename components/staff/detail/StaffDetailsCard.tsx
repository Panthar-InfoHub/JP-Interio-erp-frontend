import Link from "next/link";

import { DetailList, DetailRow } from "@/components/common/DetailList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { areaLabel } from "@/lib/auth/roles";
import { formatDateTime } from "@/lib/format/date";
import type { SubAdminArea } from "@/types/auth";
import type { StaffDetail } from "@/types/staff";

/** Managers below the Admin have their own staff page; the Admin has none to open. */
function managerLink(parent: NonNullable<StaffDetail["parent"]>) {
  const label = `${parent.name ?? "Unnamed"} (${parent.role.name})`;
  if (parent.role.key === "admin") return label;
  return (
    <Link href={`/staff/${parent.id}`} className="font-semibold text-primary hover:underline">
      {label}
    </Link>
  );
}

/** Everything the server sends about this person, as a label / value list. */
export function StaffDetailsCard({ member }: { member: StaffDetail }) {
  const isSubAdmin = member.role.key === "sub_admin";

  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-6" aria-label="Details">
      <h2 className="mb-4 text-lg">Details</h2>
      <DetailList>
        <DetailRow label="Role">{member.role.name}</DetailRow>
        <DetailRow label="Zone">
          {member.zone ? (
            <span className="inline-flex flex-wrap items-center gap-2">
              {member.zone.name} ({member.zone.code})
              {member.zone.status === "inactive" ? (
                <StatusBadge tone="neutral">Zone inactive</StatusBadge>
              ) : null}
            </span>
          ) : member.role.key === "zonal_head" ? (
            "No zone yet"
          ) : (
            "—"
          )}
        </DetailRow>
        <DetailRow label="Reports to">{member.parent ? managerLink(member.parent) : "—"}</DetailRow>
        {isSubAdmin ? (
          <DetailRow label="Areas">
            {member.areas.length === 0 ? (
              "No areas yet"
            ) : (
              <span className="flex flex-wrap gap-1.5">
                {member.areas.map((area) => (
                  <StatusBadge key={area} tone="info">
                    {areaLabel(area as SubAdminArea)}
                  </StatusBadge>
                ))}
              </span>
            )}
          </DetailRow>
        ) : null}
        <DetailRow label="Added">{formatDateTime(member.createdAt)}</DetailRow>
        <DetailRow label="Last changed">{formatDateTime(member.updatedAt)}</DetailRow>
      </DetailList>
    </section>
  );
}
