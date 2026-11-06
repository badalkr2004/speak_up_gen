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
  }));

  const active = summary.memberships.filter((m) => m.status === "active");

  return (
    <div className="container-x py-10 sm:py-12">
      <p className="eyebrow text-leaf">Member dashboard</p>
      <h1 className="display mt-3 text-[clamp(2.2rem,7vw,3.4rem)]">
        Hey, {session.user.name.split(" ")[0]}.
      </h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Apply to a local team, track approvals, and open your member ID when
        you are active.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/apply" className="btn btn-ink">
          Apply to a team
        </Link>
        {summary.isLead ? (
          <Link href="/dashboard/approvals" className="btn border-2 border-ink bg-sky">
            Review applications
          </Link>
        ) : null}
        {summary.isLead ? (
          <Link href="/dashboard/org" className="btn border-2 border-ink bg-lime">
            Manage organisation
          </Link>
        ) : null}
      </div>

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
                <li key={m.id} className="rounded-xl bg-lime/30 px-3 py-3 text-sm">
                  <p className="font-medium">{m.unitName}</p>
                  <p className="text-ink-soft">
                    {m.roleKey.replaceAll("_", " ")}
                    {m.memberCode ? ` · ${m.memberCode}` : ""}
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
        <div className="container-x py-10 text-ink-soft">Loading your space…</div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
