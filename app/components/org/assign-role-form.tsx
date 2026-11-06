"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { assignRoleAction } from "@/lib/org/actions";

const ROLE_LABELS: Record<string, string> = {
  member: "Member",
  volunteer: "Volunteer",
  unit_lead: "Unit lead",
  city_lead: "City lead",
  state_lead: "State lead",
  national_admin: "National admin",
};

export function AssignRoleForm({
  userId,
  targetOrgUnitId,
  sourceMembershipId,
  currentRole,
  allowedRoles,
}: {
  userId: string;
  targetOrgUnitId: string;
  sourceMembershipId?: string;
  currentRole: string;
  allowedRoles: string[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (allowedRoles.length === 0) {
    return (
      <span className="text-xs uppercase tracking-wide text-ink-soft">
        {ROLE_LABELS[currentRole] ?? currentRole}
      </span>
    );
  }

  const options = Array.from(
    new Set([currentRole, ...allowedRoles].filter(Boolean)),
  );

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const form = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await assignRoleAction({
            userId,
            targetOrgUnitId,
            roleKey: String(form.get("roleKey") || ""),
            sourceMembershipId,
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          router.refresh();
        });
      }}
    >
      <select
        name="roleKey"
        defaultValue={
          allowedRoles.includes(currentRole) ? currentRole : allowedRoles[0]
        }
        className="rounded-lg border-2 border-ink bg-paper px-2 py-1 text-xs"
      >
        {options.map((r) => (
          <option key={r} value={r} disabled={!allowedRoles.includes(r) && r !== currentRole}>
            {ROLE_LABELS[r] ?? r}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border-2 border-ink bg-lime px-2 py-1 text-xs font-semibold disabled:opacity-60"
      >
        Save
      </button>
      {error ? <span className="text-xs text-coral">{error}</span> : null}
    </form>
  );
}
