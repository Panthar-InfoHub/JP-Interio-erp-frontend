"use client";

import Link from "next/link";

import { useCan } from "@/hooks/auth/usePermission";
import { roleLabel } from "@/lib/auth/roles";
import type { TaskPerson } from "@/lib/api/tasks.api";

/**
 * A person on a task (doer, giver, canceller, flagged-to): their staff page link only for
 * people who may open Staff (`users.view`, DEC-292); a plain name otherwise.
 */
export function TaskPersonName({ person, showRole }: { person: TaskPerson; showRole?: boolean }) {
  const can = useCan();
  if (!person) return <span className="text-muted-foreground">—</span>;
  const name = person.name ?? "Unnamed";

  return (
    <>
      {can("users.view") ? (
        <Link href={`/staff/${person.id}`} className="font-semibold text-primary hover:underline">
          {name}
        </Link>
      ) : (
        <span className="font-semibold">{name}</span>
      )}
      {showRole ? <span className="text-muted-foreground"> · {roleLabel(person.role)}</span> : null}
    </>
  );
}
