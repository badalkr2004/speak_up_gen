import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ApplyForm } from "@/app/components/org/apply-form";
import { AuthShell } from "@/app/components/auth/auth-shell";
import { getSession } from "@/lib/auth/session";
import {
  listCitiesWithChapters,
  listStatesWithChapters,
} from "@/lib/org/queries";

export const metadata: Metadata = {
  title: "Apply to join",
  robots: { index: false, follow: false },
};

async function ApplyContent() {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in?next=/apply");
  }

  const states = await listStatesWithChapters().catch(() => []);
  const citiesByState: Record<
    string,
    { cityId: string; cityName: string; chapterId: string }[]
  > = {};

  await Promise.all(
    states.map(async (s) => {
      citiesByState[s.stateCode] = await listCitiesWithChapters(s.stateCode).catch(
        () => [],
      );
    }),
  );

  return (
    <ApplyForm
      defaultName={session.user.name}
      states={states.map((s) => ({
        stateCode: s.stateCode,
        stateName: s.stateName,
        chapterId: s.chapterId,
      }))}
      initialCitiesByState={citiesByState}
    />
  );
}

export default function ApplyPage() {
  return (
    <AuthShell
      title="Apply to a team."
      subtitle="Choose your state and city, then search for a local Speak Up Gen team. Your local lead reviews membership."
    >
      <Suspense fallback={<p className="text-sm text-ink-soft">Loading…</p>}>
        <ApplyContent />
      </Suspense>
      <p className="mt-6 text-center text-sm text-ink-soft">
        <Link
          href="/dashboard"
          className="font-semibold text-leaf underline-offset-2 hover:underline"
        >
          Back to dashboard
        </Link>
      </p>
    </AuthShell>
  );
}
