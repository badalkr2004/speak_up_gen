"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { submitApplicationAction } from "@/lib/org/actions";

type StateOption = {
  stateCode: string;
  stateName: string;
  chapterId: string;
};

type CityOption = {
  cityId: string;
  cityName: string;
  chapterId: string;
};

type UnitOption = {
  id: string;
  name: string;
  kindLabel: string | null;
};

export function ApplyForm({
  states,
  defaultName,
  initialCitiesByState,
}: {
  states: StateOption[];
  defaultName: string;
  /** Preloaded cities keyed by stateCode for instant second step */
  initialCitiesByState: Record<string, CityOption[]>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [stateCode, setStateCode] = useState("");
  const [cityId, setCityId] = useState("");
  const [query, setQuery] = useState("");
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState("");

  const cities = stateCode ? initialCitiesByState[stateCode] ?? [] : [];

  useEffect(() => {
    setCityId("");
    setSelectedUnitId("");
    setUnits([]);
    setQuery("");
  }, [stateCode]);

  useEffect(() => {
    setSelectedUnitId("");
    if (!cityId) {
      setUnits([]);
      return;
    }

    let cancelled = false;
    const handle = setTimeout(async () => {
      setLoadingUnits(true);
      try {
        const params = new URLSearchParams({ cityId });
        if (query.trim()) params.set("q", query.trim());
        const res = await fetch(`/api/org/units?${params.toString()}`);
        const data = (await res.json()) as { units?: UnitOption[] };
        if (!cancelled) {
          setUnits(data.units ?? []);
        }
      } catch {
        if (!cancelled) setUnits([]);
      } finally {
        if (!cancelled) setLoadingUnits(false);
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [cityId, query]);

  if (states.length === 0) {
    return (
      <p className="rounded-xl border-2 border-ink/15 bg-paper-2 p-4 text-sm text-ink-soft">
        No state chapters are open yet. Check back after national leadership
        creates your state.
      </p>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    if (!selectedUnitId) {
      setError("Pick a local team from the list.");
      return;
    }

    startTransition(async () => {
      const result = await submitApplicationAction({
        targetOrgUnitId: selectedUnitId,
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
          State
        </span>
        <select
          required
          value={stateCode}
          onChange={(e) => setStateCode(e.target.value)}
          className="w-full rounded-xl border-2 border-ink bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-leaf"
        >
          <option value="" disabled>
            Select state
          </option>
          {states.map((s) => (
            <option key={s.stateCode} value={s.stateCode}>
              {s.stateName}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
          City
        </span>
        <select
          required
          value={cityId}
          disabled={!stateCode || cities.length === 0}
          onChange={(e) => setCityId(e.target.value)}
          className="w-full rounded-xl border-2 border-ink bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-leaf disabled:opacity-50"
        >
          <option value="" disabled>
            {stateCode && cities.length === 0
              ? "No city chapters in this state yet"
              : "Select city"}
          </option>
          {cities.map((c) => (
            <option key={c.cityId} value={c.cityId}>
              {c.cityName}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
          Search local teams
        </span>
        <input
          type="search"
          value={query}
          disabled={!cityId}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={cityId ? "Type to filter teams…" : "Pick a city first"}
          className="w-full rounded-xl border-2 border-ink bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-leaf disabled:opacity-50"
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
          Local team
        </legend>
        {!cityId ? (
          <p className="text-sm text-ink-soft">Select state and city first.</p>
        ) : loadingUnits ? (
          <p className="text-sm text-ink-soft">Loading teams…</p>
        ) : units.length === 0 ? (
          <p className="text-sm text-ink-soft">
            No local teams found in this city{query ? " for that search" : ""}.
          </p>
        ) : (
          <ul className="max-h-56 space-y-2 overflow-y-auto rounded-xl border-2 border-ink/15 p-2">
            {units.map((u) => (
              <li key={u.id}>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                    selectedUnitId === u.id ? "bg-lime/50" : "hover:bg-paper-2"
                  }`}
                >
                  <input
                    type="radio"
                    name="unit"
                    value={u.id}
                    checked={selectedUnitId === u.id}
                    onChange={() => setSelectedUnitId(u.id)}
                  />
                  <span>
                    <span className="font-medium">{u.name}</span>
                    {u.kindLabel ? (
                      <span className="text-ink-soft"> · {u.kindLabel}</span>
                    ) : null}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

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
        disabled={pending || !selectedUnitId}
        className="btn btn-ink disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
