"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createStateChapterAction } from "@/lib/org/actions";

export function CreateStateForm({
  states,
}: {
  states: { code: string; name: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3 rounded-[1.25rem] border-2 border-ink bg-lime/30 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const form = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await createStateChapterAction({
            stateCode: String(form.get("stateCode") || ""),
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          router.refresh();
        });
      }}
    >
      <h3 className="font-semibold">Add state chapter</h3>
      <select
        name="stateCode"
        required
        className="w-full rounded-xl border-2 border-ink bg-paper px-3 py-2 text-sm"
        defaultValue=""
      >
        <option value="" disabled>
          Select state
        </option>
        {states.map((s) => (
          <option key={s.code} value={s.code}>
            {s.name}
          </option>
        ))}
      </select>
      {error ? <p className="text-sm text-coral">{error}</p> : null}
      <button type="submit" disabled={pending} className="btn btn-ink !py-2 text-sm disabled:opacity-60">
        {pending ? "Creating…" : "Create state"}
      </button>
    </form>
  );
}
