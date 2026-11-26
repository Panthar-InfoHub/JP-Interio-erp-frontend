"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { useCan } from "@/hooks/auth/usePermission";
import { formatCount } from "@/lib/format/number";
import type { StaffDetail } from "@/types/staff";

const PARTNER_HINT = "Not switched off; includes sign-ups not yet verified";

function query(params: Record<string, string>) {
  return new URLSearchParams(params).toString();
}

/**
 * Team and task numbers from the server (DEC-063, DEC-184). Team boxes open the matching
 * list: a Zonal Head's zone, an ASM's direct team, the partners they own or look after.
 * Task boxes open the Tasks list for that person (DEC-289). Links only for roles that may
 * open those lists.
 */
export function StaffSummary({ member }: { member: StaffDetail }) {
  const can = useCan();
  const canSeePartners = can("partners.view");
  const { counts, tasks } = member;
  const zoneId = member.zone?.id;
  const role = member.role.key;

  const partnersHref = (params: Record<string, string>) =>
    canSeePartners ? `/partners?${query(params)}` : undefined;
  // Task boxes open the matching Tasks list (DEC-289).
  const tasksHref = (params: Record<string, string>) =>
    can("tasks.view") ? `/tasks?${query(params)}` : undefined;

  const team: { label: string; value: number; hint?: string; href?: string }[] = [];
  if (counts && role === "zonal_head") {
    team.push(
      {
        label: "ASMs in the zone",
        value: counts.asms ?? 0,
        href: zoneId ? `/staff?${query({ zoneId, role: "asm" })}` : undefined,
      },
      {
        label: "Sales Executives",
        value: counts.salesExecutives ?? 0,
        href: zoneId ? `/staff?${query({ zoneId, role: "sales_executive" })}` : undefined,
      },
      {
        label: "Partners in the zone",
        value: counts.partners ?? 0,
        hint: PARTNER_HINT,
        href: zoneId ? partnersHref({ zoneId }) : undefined,
      },
    );
  } else if (counts && role === "asm") {
    team.push(
      {
        label: "Sales Executives",
        value: counts.salesExecutives ?? 0,
        href: `/staff?${query({ managerId: member.id })}`,
      },
      {
        label: "Partners owned",
        value: counts.partners ?? 0,
        hint: PARTNER_HINT,
        href: partnersHref({ asmId: member.id }),
      },
    );
  } else if (counts && role === "sales_executive") {
    team.push({
      label: "Partners looked after",
      value: counts.partners ?? 0,
      hint: PARTNER_HINT,
      href: partnersHref({ salesExecutiveId: member.id }),
    });
  }

  return (
    <section aria-label="Summary" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {team.map((box) => (
        <StatCard
          key={box.label}
          label={box.label}
          value={formatCount(box.value)}
          hint={box.hint}
          href={box.href}
        />
      ))}
      {tasks ? (
        <>
          <StatCard
            label="Tasks to do"
            value={formatCount(tasks.pending)}
            hint="Given to them, not finished"
            href={tasksHref({ assignedToId: member.id, status: "unfinished" })}
          />
          <StatCard
            label="Tasks overdue"
            value={formatCount(tasks.overdue)}
            hint="Due day has passed"
            attention={tasks.overdue > 0}
            href={tasksHref({ assignedToId: member.id, overdue: "true" })}
          />
          <StatCard
            label="Tasks they gave"
            value={formatCount(tasks.givenOpen)}
            hint="Still open"
            href={tasksHref({ assignedById: member.id, status: "unfinished" })}
          />
        </>
      ) : null}
    </section>
  );
}
