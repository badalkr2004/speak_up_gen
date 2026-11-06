import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthShell } from "@/app/components/auth/auth-shell";
import { SignUpForm } from "@/app/components/auth/sign-up-form";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ next?: string }>;

function safeNextPath(raw: string | undefined) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard";
  }
  return raw;
}

function AuthFormFallback() {
  return <p className="text-sm text-ink-soft">Loading…</p>;
}

async function SignUpContent({ searchParams }: { searchParams: SearchParams }) {
  const session = await getSession();
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);

  if (session) {
    redirect(nextPath);
  }

  return <SignUpForm nextPath={nextPath} />;
}

export default function SignUpPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <AuthShell
      title="Join the roster."
      subtitle="Create an account, then apply to a local team. Local leads approve members."
    >
      <Suspense fallback={<AuthFormFallback />}>
        <SignUpContent searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}
