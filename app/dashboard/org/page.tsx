import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CreateStateForm } from "@/app/components/org/create-state-form";
import { requireSession } from "@/lib/auth/session";
import { can, getScopedOrgRoots } from "@/lib/org/access";
import { ensureGeoAndKinds, ensureNationalUnit } from "@/lib/org/bootstrap";
import {
  listChildUnits,
  listGeoStates,
} from "@/lib/org/queries";

export const metadata: Metadata = {
  title: "Organisation",
  robots: { index: false, follow: false },
};

async function OrgHomeContent() {
  const session = await requireSession();
  await ensureGeoAndKinds().catch(() => undefined);
  await ensureNationalUnit(session.user.id).catch(() => undefined);

  const scoped = await getScopedOrgRoots(session.user.id);
  const geoStates = await listGeoStates();
  const canCreateState =
    scoped.roots[0] &&
    (await can(session.user.id, "create_state", scoped.roots[0].id));

  if (scoped.roots.length === 0) {
    return (
      <div className="container-x py-10 sm:py-12">
        <p className="eyebrow text-leaf">Hierarchy</p>
        <h1 className="display mt-3 text-[clamp(2rem,6vw,3rem)]">Organisation</h1>
        <p className="mt-4 max-w-xl text-ink-soft">
          You do not have lead access on any chapter yet. Ask a national or state
          lead to appoint you, or run the admin seed if you are bootstrapping.
        </p>
      </div>
    );
  }

  // National: show states under national. State/city/unit: show that root + children.
  const primary = scoped.roots[0];
  const children =
    primary.level === "unit"
      ? []
      : await listChildUnits(primary.id);

  return (
    <div className="container-x py-10 sm:py-12">
      <p className="eyebrow text-leaf">Your scope</p>
      <h1 className="display mt-3 text-[clamp(2rem,6vw,3rem)]">Organisation</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        {scoped.isNationalAdmin
          ? "National view — manage states, cities, and teams across India."
          : `Managing from ${primary.name} (${primary.level}). You control this territory and its descendants.`}
      </p>

      {scoped.roots.length > 1 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {scoped.roots.map((r) => (
            <Link
              key={r.id}
              href={`/dashboard/org/${r.id}`}
              className="rounded-full border-2 border-ink/20 px-3 py-1 text-sm font-medium hover:bg-lime/40"
            >
              {r.name}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{primary.name}</h2>
            {primary.level !== "national" ? (
              <Link
                href={`/dashboard/org/${primary.id}`}
                className="text-sm font-semibold text-leaf underline-offset-2 hover:underline"
              >
                Open chapter →
              </Link>
            ) : null}
          </div>

          {primary.level === "unit" ? (
            <p className="mt-4 text-sm text-ink-soft">
              You lead this local team. Open it to manage members and approvals.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {children.length === 0 ? (
                <li className="text-sm text-ink-soft">No child chapters yet.</li>
              ) : (
                children.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/dashboard/org/${s.id}`}
                      className="block rounded-xl border-2 border-ink bg-paper px-4 py-3 font-medium hover:bg-lime/30"
                    >
                      {s.name}
                      {s.stateCode ? (
                        <span className="ml-2 text-xs uppercase tracking-wide text-ink-soft">
                          {s.stateCode}
                        </span>
                      ) : null}
                      {s.kindLabel ? (
                        <span className="ml-2 text-xs text-ink-soft">
                          {s.kindLabel}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          )}
        </section>

        {canCreateState && primary.level === "national" ? (
          <CreateStateForm states={geoStates} />
        ) : (
          <p className="text-sm text-ink-soft">
            Use People to assign leads. Create cities/teams inside each chapter
            page when your role allows it.
          </p>
        )}
      </div>
    </div>
  );
}

export default function OrgPage() {
  return (
    <Suspense
      fallback={
        <div className="container-x py-10 text-ink-soft">Loading organisation…</div>
      }
    >
      <OrgHomeContent />
    </Suspense>
  );
}
