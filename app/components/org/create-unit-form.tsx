"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createLocalUnitAction } from "@/lib/org/actions";

export function CreateUnitForm({
  parentCityUnitId,
  kinds,
}: {
  parentCityUnitId: string;
  kinds: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3 rounded-[1.25rem] border-2 border-ink bg-lime/35 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const form = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await createLocalUnitAction({
            parentCityUnitId,
            name: String(form.get("name") || ""),
            unitKindId: String(form.get("unitKindId") || ""),
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          router.refresh();
        });
      }}
    >
      <h3 className="font-semibold">Add local team</h3>
      <input
        name="name"
        required
        placeholder="Team name"
        className="w-full rounded-xl border-2 border-ink bg-paper px-3 py-2 text-sm"
      />
      <select
        name="unitKindId"
        required
        className="w-full rounded-xl border-2 border-ink bg-paper px-3 py-2 text-sm"
        defaultValue=""
      >
        <option value="" disabled>
          Team type
        </option>
        {kinds.map((k) => (
          <option key={k.id} value={k.id}>
            {k.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-sm text-coral">{error}</p> : null}
      <button type="submit" disabled={pending} className="btn btn-ink !py-2 text-sm disabled:opacity-60">
        {pending ? "Creating…" : "Create team"}
      </button>
    </form>
  );
}
