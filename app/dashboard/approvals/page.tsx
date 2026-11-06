import type { Metadata } from "next";
import { Suspense } from "react";
import { ApprovalActions } from "@/app/components/org/approval-actions";
import { requireSession } from "@/lib/auth/session";
import { listPendingApplicationsForLead } from "@/lib/org/queries";

export const metadata: Metadata = {
  title: "Approvals",
  robots: { index: false, follow: false },
};

async function ApprovalsContent() {
  const session = await requireSession();
  const apps = await listPendingApplicationsForLead(session.user.id).catch(
    () => [],
  );

  return (
    <div className="container-x py-10 sm:py-12">
      <p className="eyebrow text-leaf">Local lead desk</p>
      <h1 className="display mt-3 text-[clamp(2rem,6vw,3rem)]">Approvals</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Review membership applications for teams you lead. Approving creates an
        official member ID.
      </p>

      {apps.length === 0 ? (
        <p className="mt-10 rounded-[1.25rem] border-2 border-ink/15 bg-paper-2 p-6 text-sm text-ink-soft">
          No pending applications in your scope right now.
        </p>
      ) : (
        <ul className="mt-10 space-y-4">
          {apps.map((app) => (
            <li
              key={app.id}
              className="rounded-[1.25rem] border-2 border-ink bg-paper p-5 shadow-[6px_6px_0_#171713]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{app.fullName}</h2>
                  <p className="text-sm text-ink-soft">
                    {app.applicantEmail} · applying to{" "}
                    <span className="font-medium text-ink">{app.unitName}</span>
                  </p>
                  {app.phone ? (
                    <p className="mt-1 text-sm text-ink-soft">{app.phone}</p>
                  ) : null}
                  {app.motivation ? (
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed">
                      {app.motivation}
                    </p>
                  ) : null}
                </div>
                <ApprovalActions applicationId={app.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ApprovalsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-x py-10 text-ink-soft">Loading approvals…</div>
      }
    >
      <ApprovalsContent />
    </Suspense>
  );
}
