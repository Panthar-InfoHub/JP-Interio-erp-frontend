"use client";

import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { EmptyState, ErrorState } from "@/components/common/StateMessages";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { OrgNode } from "@/components/org-chart/OrgNode";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrgTree } from "@/hooks/staff/useStaff";
import type { OrgAsm, OrgPerson, OrgTree, OrgZone } from "@/types/org";

const staffHref = (person: OrgPerson) => `/staff/${person.id}`;
const nameOf = (person: OrgPerson) => person.name ?? "Unnamed";

function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

/** Every branch that can open (zones, Zonal Heads, ASMs, the "no zone" groups). */
function allNodeIds(tree: OrgTree): string[] {
  const ids: string[] = [];
  const asm = (item: OrgAsm) => {
    if (item.salesExecutives?.length) ids.push(item.id);
  };
  for (const zone of tree.zones) {
    ids.push(zone.id);
    if (zone.zonalHead?.asms?.length) ids.push(zone.zonalHead.id);
    zone.zonalHead?.asms?.forEach(asm);
    zone.otherAsms.forEach(asm);
  }
  if (tree.noZone) ids.push("no-zone");
  if (tree.team) ids.push(tree.team.id);
  return ids;
}

interface Toggle {
  open: Set<string>;
  toggle: (id: string) => void;
}

function AsmNode({ asm, state }: { asm: OrgAsm; state: Toggle }) {
  const ses = asm.salesExecutives ?? [];
  return (
    <OrgNode
      nodeId={asm.id}
      isOpen={state.open.has(asm.id)}
      onToggle={state.toggle}
      title={nameOf(asm)}
      href={staffHref(asm)}
      role="ASM"
      suspended={asm.status === "suspended"}
      counts={`${plural(asm.counts?.salesExecutives ?? 0, "SE")} · ${plural(asm.counts?.partners ?? 0, "partner")}`}
      badges={
        asm.noSalesExecutives ? <StatusBadge tone="neutral">No Sales Executives</StatusBadge> : null
      }
    >
      {ses.length > 0
        ? ses.map((se) => (
            <OrgNode
              key={se.id}
              title={nameOf(se)}
              href={staffHref(se)}
              role="Sales Executive"
              suspended={se.status === "suspended"}
              counts={plural(se.counts?.partners ?? 0, "partner")}
            />
          ))
        : null}
    </OrgNode>
  );
}

function ZoneNode({ zone, state }: { zone: OrgZone; state: Toggle }) {
  const head = zone.zonalHead;
  const asms = head?.asms ?? [];
  return (
    <OrgNode
      nodeId={zone.id}
      isOpen={state.open.has(zone.id)}
      onToggle={state.toggle}
      title={`${zone.name} (${zone.code})`}
      strong
      counts={`${plural(zone.counts.asms, "ASM")} · ${plural(zone.counts.salesExecutives, "SE")} · ${plural(zone.counts.partners, "partner")}`}
      badges={zone.noZonalHead ? <StatusBadge tone="warning">No Zonal Head</StatusBadge> : null}
    >
      {head ? (
        <OrgNode
          nodeId={asms.length > 0 ? head.id : undefined}
          isOpen={state.open.has(head.id)}
          onToggle={state.toggle}
          title={nameOf(head)}
          href={staffHref(head)}
          role="Zonal Head"
          suspended={head.status === "suspended"}
          badges={asms.length === 0 ? <StatusBadge tone="neutral">No ASMs</StatusBadge> : null}
        >
          {asms.length > 0
            ? asms.map((asm) => <AsmNode key={asm.id} asm={asm} state={state} />)
            : null}
        </OrgNode>
      ) : (
        <OrgNode title="No Zonal Head yet" role="Set one on the Zones page" />
      )}
      {/* ASMs whose manager is not this zone's Zonal Head (normally none). */}
      {zone.otherAsms.map((asm) => (
        <AsmNode key={asm.id} asm={asm} state={state} />
      ))}
    </OrgNode>
  );
}

function TreeSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4" aria-busy="true" aria-label="Loading the org chart">
      {[0, 1, 2, 3].map((index) => (
        <Skeleton key={index} className="h-8 w-full max-w-xl" />
      ))}
    </div>
  );
}

/**
 * Org chart (`users.view`, DEC-261): zone ▸ Zonal Head ▸ ASMs ▸ Sales Executives as a
 * folding list, with counts and "empty post" labels; names open the staff page. Admin sees
 * every active zone plus the people with no zone; a Zonal Head sees their zone. Only active
 * and suspended people. Zones start open, ASMs closed.
 */
export function OrgChartScreen() {
  const tree = useOrgTree();
  // null = not touched yet: start with every zone (and the ASM team) open.
  const [touched, setTouched] = useState<Set<string> | null>(null);

  const startOpen = (data: OrgTree) =>
    new Set<string>([
      ...data.zones.map((zone) => zone.id),
      ...(data.zones.length === 1 && data.zones[0].zonalHead ? [data.zones[0].zonalHead.id] : []),
      ...(data.team ? [data.team.id] : []),
    ]);

  const data = tree.data;
  const open = touched ?? (data ? startOpen(data) : new Set<string>());
  const state: Toggle = {
    open,
    toggle: (id) => {
      const next = new Set(open);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setTouched(next);
    },
  };

  const isEmpty =
    data &&
    data.zones.length === 0 &&
    !data.team &&
    !data.noZone?.subAdmins.length &&
    !data.noZone?.zonalHeads.length;

  return (
    <>
      <PageHeader
        title="Org chart"
        description="Who reports to whom. Switched-off people and inactive zones are not shown."
        actions={
          data && !isEmpty ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTouched(new Set(allNodeIds(data)))}
              >
                <ChevronsUpDown data-icon="inline-start" />
                Open all
              </Button>
              <Button variant="outline" size="sm" onClick={() => setTouched(new Set())}>
                <ChevronsDownUp data-icon="inline-start" />
                Close all
              </Button>
            </>
          ) : undefined
        }
      />

      <div className="rounded-xl border bg-card p-2 shadow-sm sm:p-4">
        {!data && !tree.isError ? (
          <TreeSkeleton />
        ) : !data ? (
          <ErrorState error={tree.error} onRetry={() => void tree.refetch()} />
        ) : isEmpty ? (
          <EmptyState
            title="No one to show yet"
            description="Add zones and staff to see the chart."
          />
        ) : (
          <ul aria-label="Org chart">
            {data.zones.map((zone) => (
              <ZoneNode key={zone.id} zone={zone} state={state} />
            ))}
            {data.team ? <AsmNode asm={data.team} state={state} /> : null}
            {data.noZone &&
            (data.noZone.subAdmins.length > 0 || data.noZone.zonalHeads.length > 0) ? (
              <OrgNode
                nodeId="no-zone"
                isOpen={open.has("no-zone")}
                onToggle={state.toggle}
                title="No zone"
                strong
                counts={`${plural(data.noZone.subAdmins.length, "Sub-Admin")} · ${plural(data.noZone.zonalHeads.length, "Zonal Head")}`}
              >
                {data.noZone.subAdmins.map((person) => (
                  <OrgNode
                    key={person.id}
                    title={nameOf(person)}
                    href={staffHref(person)}
                    role="Sub-Admin"
                    suspended={person.status === "suspended"}
                  />
                ))}
                {data.noZone.zonalHeads.map((person) => (
                  <OrgNode
                    key={person.id}
                    title={nameOf(person)}
                    href={staffHref(person)}
                    role="Zonal Head · no zone yet"
                    suspended={person.status === "suspended"}
                  />
                ))}
              </OrgNode>
            ) : null}
          </ul>
        )}
      </div>
    </>
  );
}
