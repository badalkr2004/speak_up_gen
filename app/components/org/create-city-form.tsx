"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createCityChapterAction } from "@/lib/org/actions";

export function CreateCityForm({
  parentStateUnitId,
  cities,
}: {
  parentStateUnitId: string;
  cities: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (cities.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        No seed cities available for this state yet.
      </p>
    );
  }

  return (
    <form
      className="space-y-3 rounded-[1.25rem] border-2 border-ink bg-sky/40 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const form = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await createCityChapterAction({
            parentStateUnitId,
            cityId: String(form.get("cityId") || ""),
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          router.refresh();
        });
      }}
    >
      <h3 className="font-semibold">Add city chapter</h3>
      <select
        name="cityId"
        required
        className="w-full rounded-xl border-2 border-ink bg-paper px-3 py-2 text-sm"
        defaultValue=""
      >
        <option value="" disabled>
          Select city
        </option>
        {cities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      {error ? <p className="text-sm text-coral">{error}</p> : null}
      <button type="submit" disabled={pending} className="btn btn-ink !py-2 text-sm disabled:opacity-60">
        {pending ? "Creating…" : "Create city"}
      </button>
    </form>
  );
}
