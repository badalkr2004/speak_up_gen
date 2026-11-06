import { Suspense } from "react";
import { DashboardNav } from "@/app/components/dashboard/dashboard-nav";
import { dashboardSummary } from "@/lib/org/queries";
import { requireSession } from "@/lib/auth/session";

async function DashboardChrome({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const summary = await dashboardSummary(session.user.id).catch(() => ({
    isLead: false,
    isNationalAdmin: false,
    memberships: [],
    applications: [],
  }));

  return (
    <div className="min-h-dvh bg-paper">
      <DashboardNav isLead={summary.isLead} userName={session.user.name} />
      {children}
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-paper">
          <div className="container-x py-10 text-ink-soft">Loading dashboard…</div>
        </div>
      }
    >
      <DashboardChrome>{children}</DashboardChrome>
    </Suspense>
  );
}
