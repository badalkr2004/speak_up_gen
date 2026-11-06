import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireSession } from "@/lib/auth/session";
import { dashboardSummary } from "@/lib/org/queries";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

async function DashboardContent() {
  const session = await requireSession();
  const summary = await dashboardSummary(session.user.id).catch(() => ({
    memberships: [],
    applications: [],
    isLead: false,
    isNationalAdmin: false,
    scopeRoots: [] as { id: string; name: string; level: string }[],
    leads: [],
    pendingCount: 0,
  }));

  const active = summary.memberships.filter((m) => m.status === "active");

  return (
    <div className="container-x py-10 sm:py-12">
      <p className="eyebrow text-leaf">Member dashboard</p>
      <h1 className="display mt-3 text-[clamp(2.2rem,7vw,3.4rem)]">
        Hey, {session.user.name.split(" ")[0]}.
      </h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Apply by location, track approvals, and manage your territory if you
        lead a chapter.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/apply" className="btn btn-ink">
          Apply to a team
        </Link>
        {summary.isLead ? (
          <Link
            href="/dashboard/approvals"
            className="btn border-2 border-ink bg-sky"
          >
            Approvals
            {summary.pendingCount > 0 ? ` (${summary.pendingCount})` : ""}
          </Link>
        ) : null}
        {summary.isLead ? (
          <Link
            href="/dashboard/org"
            className="btn border-2 border-ink bg-lime"
          >
            Organisation
          </Link>
        ) : null}
        {summary.isLead ? (
          <Link
            href="/dashboard/people"
            className="btn border-2 border-ink bg-paper"
          >
            People
          </Link>
        ) : null}
      </div>

      {summary.scopeRoots.length > 0 ? (
        <section className="mt-8 rounded-[1.25rem] border-2 border-ink bg-lime/25 p-5">
          <h2 className="font-semibold">Your management scope</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {summary.scopeRoots.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/dashboard/org/${r.id}`}
                  className="inline-block rounded-full border-2 border-ink bg-paper px-3 py-1 text-sm font-medium hover:bg-lime/50"
                >
                  {r.name} · {r.level}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[1.25rem] border-2 border-ink bg-paper p-5">
          <h2 className="font-semibold">Memberships</h2>
          {active.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">
              No active memberships yet. Submit an application to get started.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {active.map((m) => (
                <li
                  key={m.id}
                  className="rounded-xl bg-lime/30 px-3 py-3 text-sm"
                >
                  <p className="font-medium">{m.unitName}</p>
                  <p className="text-ink-soft">
                    {m.roleKey.replaceAll("_", " ")}
                    {m.memberCode ? ` · ${m.memberCode}` : ""}
                    {m.unitLevel ? ` · ${m.unitLevel}` : ""}
                  </p>
                  {m.memberCode ? (
                    <Link
                      href={`/dashboard/id-card/${m.id}`}
                      className="mt-2 inline-block font-semibold text-leaf underline-offset-2 hover:underline"
                    >
                      View ID card
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[1.25rem] border-2 border-ink bg-sky/40 p-5">
          <h2 className="font-semibold">Applications</h2>
          {summary.applications.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">No applications yet.</p>
          ) : (
            <ul className="mt-3 space-y-3 text-sm">
              {summary.applications.map((a) => (
                <li key={a.id} className="rounded-xl bg-paper/80 px-3 py-3">
                  <p className="font-medium">{a.unitName}</p>
                  <p className="capitalize text-ink-soft">{a.status}</p>
                  {a.reviewNote ? (
                    <p className="mt-1 text-ink-soft">{a.reviewNote}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="container-x py-10 text-ink-soft">
          Loading your space…
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
