"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { assignRoleAction } from "@/lib/org/actions";

type Target = {
  id: string;
  name: string;
  level: string;
  roles: string[];
};

type Candidate = {
  userId: string;
  name: string;
  email: string;
  membershipId: string;
};

export function PromoteLeadForm({
  targets,
  candidates,
}: {
  targets: Target[];
  candidates: Candidate[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [targetId, setTargetId] = useState(targets[0]?.id ?? "");

  const target = targets.find((t) => t.id === targetId) ?? targets[0];
  const uniqueCandidates = Array.from(
    new Map(candidates.map((c) => [c.userId, c])).values(),
  );

  if (!target || uniqueCandidates.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        Promote someone after they appear in your people directory.
      </p>
    );
  }

  return (
    <form
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const form = new FormData(e.currentTarget);
        const userId = String(form.get("userId") || "");
        const roleKey = String(form.get("roleKey") || "");
        const chapterId = String(form.get("targetOrgUnitId") || "");
        const candidate = uniqueCandidates.find((c) => c.userId === userId);

        startTransition(async () => {
          const result = await assignRoleAction({
            userId,
            targetOrgUnitId: chapterId,
            roleKey,
            sourceMembershipId: candidate?.membershipId,
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
        name="userId"
        required
        className="rounded-xl border-2 border-ink bg-paper px-3 py-2 text-sm"
        defaultValue=""
      >
        <option value="" disabled>
          Select person
        </option>
        {uniqueCandidates.map((c) => (
          <option key={c.userId} value={c.userId}>
            {c.name} ({c.email})
          </option>
        ))}
      </select>

      <select
        name="targetOrgUnitId"
        required
        value={targetId}
        onChange={(e) => setTargetId(e.target.value)}
        className="rounded-xl border-2 border-ink bg-paper px-3 py-2 text-sm"
      >
        {targets.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} ({t.level})
          </option>
        ))}
      </select>

      <select
        name="roleKey"
        required
        className="rounded-xl border-2 border-ink bg-paper px-3 py-2 text-sm"
        defaultValue={target.roles[0]}
        key={target.id}
      >
        {target.roles.map((r) => (
          <option key={r} value={r}>
            {r.replaceAll("_", " ")}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={pending}
        className="btn btn-ink !py-2 text-sm disabled:opacity-60"
      >
        {pending ? "Saving…" : "Assign lead"}
      </button>

      {error ? (
        <p className="sm:col-span-2 lg:col-span-4 text-sm text-coral" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
