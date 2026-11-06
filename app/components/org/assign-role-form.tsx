"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { assignLeadAction } from "@/lib/org/actions";

const ROLES = [
  { value: "member", label: "Member" },
  { value: "volunteer", label: "Volunteer" },
  { value: "unit_lead", label: "Unit lead" },
  { value: "city_lead", label: "City lead" },
  { value: "state_lead", label: "State lead" },
  { value: "national_admin", label: "National admin" },
] as const;

export function AssignRoleForm({
  membershipId,
  currentRole,
}: {
  membershipId: string;
  currentRole: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const form = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await assignLeadAction({
            membershipId,
            roleKey: String(form.get("roleKey") || ""),
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
        defaultValue={currentRole}
        className="rounded-lg border-2 border-ink bg-paper px-2 py-1 text-xs"
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
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
