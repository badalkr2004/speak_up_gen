import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CreateStateForm } from "@/app/components/org/create-state-form";
import { requireSession } from "@/lib/auth/session";
import { ensureGeoAndKinds, ensureNationalUnit } from "@/lib/org/bootstrap";
import { isNationalAdmin } from "@/lib/org/permissions-org";
import {
  getNationalUnit,
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

  const national = await getNationalUnit();
  const states = national ? await listChildUnits(national.id) : [];
  const geoStates = await listGeoStates();
  const admin = await isNationalAdmin(session.user.id);

  return (
    <div className="container-x py-10 sm:py-12">
      <p className="eyebrow text-leaf">Hierarchy</p>
      <h1 className="display mt-3 text-[clamp(2rem,6vw,3rem)]">Organisation</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        National → State → City → Local team. Open a chapter to manage children
        and members.
      </p>

      {!national ? (
        <p className="mt-8 text-sm text-coral">
          National unit missing. Run{" "}
          <code className="rounded bg-paper-2 px-1">bun run db:seed-admin -- your@email.com</code>{" "}
          after migrating.
        </p>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <section>
            <h2 className="text-lg font-semibold">{national.name}</h2>
            <ul className="mt-4 space-y-2">
              {states.length === 0 ? (
                <li className="text-sm text-ink-soft">No state chapters yet.</li>
              ) : (
                states.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/dashboard/org/${s.id}`}
                      className="block rounded-xl border-2 border-ink bg-paper px-4 py-3 font-medium hover:bg-lime/30"
                    >
                      {s.name}
                      <span className="ml-2 text-xs uppercase tracking-wide text-ink-soft">
                        {s.stateCode}
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </section>

          {admin ? (
            <CreateStateForm states={geoStates} />
          ) : (
            <p className="text-sm text-ink-soft">
              State creation is limited to national admins.
            </p>
          )}
        </div>
      )}
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
