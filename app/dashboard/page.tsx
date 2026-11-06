import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SignOutButton } from "@/app/components/auth/sign-out-button";
import { listLeadMemberships } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

function DashboardFallback() {
  return (
    <main className="min-h-dvh bg-paper">
      <div className="container-x py-10 sm:py-14">
        <p className="eyebrow text-leaf">Member dashboard</p>
        <p className="mt-4 text-ink-soft">Loading your space…</p>
      </div>
    </main>
  );
}

async function DashboardContent() {
  const session = await requireSession();
  const leadMemberships = await listLeadMemberships(session.user.id).catch(
    () => [],
  );

  return (
    <main className="min-h-dvh bg-paper">
      <div className="container-x py-10 sm:py-14">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-leaf">Member dashboard</p>
            <h1 className="display mt-3 text-[clamp(2.2rem,7vw,3.4rem)]">
              Hey, {session.user.name.split(" ")[0]}.
            </h1>
            <p className="mt-3 max-w-xl text-ink-soft">
              You are signed in. Membership applications, local team tools, and ID
              cards land here as we roll them out.
            </p>
          </div>
          <SignOutButton />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <section className="rounded-[1.25rem] border-2 border-ink bg-lime/40 p-5">
            <h2 className="font-semibold">Your account</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-ink-soft">Name</dt>
                <dd>{session.user.name}</dd>
              </div>
              <div>
                <dt className="text-ink-soft">Email</dt>
                <dd>{session.user.email}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[1.25rem] border-2 border-ink bg-sky/50 p-5">
            <h2 className="font-semibold">Next steps</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-soft">
              <li>Apply to a local team (coming soon on /apply).</li>
              <li>Local leads approve members for their unit.</li>
              <li>Approved members get a verifiable ID card.</li>
            </ul>
            {leadMemberships.length > 0 ? (
              <p className="mt-4 text-sm font-medium text-leaf">
                You have lead access on {leadMemberships.length} unit
                {leadMemberships.length === 1 ? "" : "s"}.
              </p>
            ) : null}
          </section>
        </div>

        <p className="mt-10 text-sm text-ink-soft">
          <Link href="/" className="font-semibold text-leaf underline-offset-2 hover:underline">
            ← Back to Speak Up Gen
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent />
    </Suspense>
  );
}
