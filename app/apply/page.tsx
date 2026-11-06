import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ApplyForm } from "@/app/components/org/apply-form";
import { AuthShell } from "@/app/components/auth/auth-shell";
import { getSession } from "@/lib/auth/session";
import { listJoinableUnits } from "@/lib/org/queries";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Apply to join",
  robots: { index: false, follow: false },
};

async function ApplyContent() {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in?next=/apply");
  }

  const units = await listJoinableUnits().catch(() => []);

  return (
    <ApplyForm
      defaultName={session.user.name}
      units={units.map((u) => ({
        id: u.id,
        name: u.name,
        kindLabel: u.kindLabel,
        cityName: u.cityName,
        stateName: u.stateName,
      }))}
    />
  );
}

export default function ApplyPage() {
  return (
    <AuthShell
      title="Apply to a team."
      subtitle="Pick a local Speak Up Gen team. Your local lead reviews and approves membership."
    >
      <Suspense fallback={<p className="text-sm text-ink-soft">Loading teams…</p>}>
        <ApplyContent />
      </Suspense>
      <p className="mt-6 text-center text-sm text-ink-soft">
        <Link href="/dashboard" className="font-semibold text-leaf underline-offset-2 hover:underline">
          Back to dashboard
        </Link>
      </p>
    </AuthShell>
  );
}
