"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { assignRoleAction } from "@/lib/org/actions";

export function PromoteQuickButton({
  userId,
  targetOrgUnitId,
  sourceMembershipId,
  roleKey,
}: {
  userId: string;
  targetOrgUnitId: string;
  sourceMembershipId: string;
  roleKey: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        className="rounded-lg border-2 border-ink bg-lime/80 px-2 py-1 text-xs font-semibold disabled:opacity-60"
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await assignRoleAction({
              userId,
              targetOrgUnitId,
              roleKey,
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
        {pending ? "…" : `Make ${roleKey.replaceAll("_", " ")}`}
      </button>
      {error ? <p className="text-xs text-coral">{error}</p> : null}
    </div>
  );
}
