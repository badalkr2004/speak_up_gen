"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitApplicationAction } from "@/lib/org/actions";

type UnitOption = {
  id: string;
  name: string;
  kindLabel: string | null;
  cityName: string | null;
  stateName: string | null;
};

export function ApplyForm({
  units,
  defaultName,
}: {
  units: UnitOption[];
  defaultName: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (units.length === 0) {
    return (
      <p className="rounded-xl border-2 border-ink/15 bg-paper-2 p-4 text-sm text-ink-soft">
        No local teams are open for applications yet. Ask a city or national lead
        to create a team first.
      </p>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await submitApplicationAction({
        targetOrgUnitId: String(form.get("targetOrgUnitId") || ""),
        fullName: String(form.get("fullName") || ""),
        phone: String(form.get("phone") || ""),
        motivation: String(form.get("motivation") || ""),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push("/dashboard?applied=1");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
          Local team
        </span>
        <select
          name="targetOrgUnitId"
          required
          className="w-full rounded-xl border-2 border-ink bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-leaf"
          defaultValue=""
        >
          <option value="" disabled>
            Select a team
          </option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
              {u.kindLabel ? ` · ${u.kindLabel}` : ""}
              {u.cityName ? ` · ${u.cityName}` : ""}
              {u.stateName ? `, ${u.stateName}` : ""}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
          Full name
        </span>
        <input
          name="fullName"
          required
          defaultValue={defaultName}
          className="w-full rounded-xl border-2 border-ink bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-leaf"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
          Phone (optional)
        </span>
        <input
          name="phone"
          type="tel"
          className="w-full rounded-xl border-2 border-ink bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-leaf"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
          Why do you want to join?
        </span>
        <textarea
          name="motivation"
          rows={4}
          className="w-full rounded-xl border-2 border-ink bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-leaf"
        />
      </label>

      {error ? (
        <p className="rounded-lg bg-coral/15 px-3 py-2 text-sm text-coral" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-ink disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
