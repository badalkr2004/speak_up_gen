import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthShell } from "@/app/components/auth/auth-shell";
import { SignInForm } from "@/app/components/auth/sign-in-form";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in",
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

async function SignInContent({ searchParams }: { searchParams: SearchParams }) {
  const session = await getSession();
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);

  if (session) {
    redirect(nextPath);
  }

  return <SignInForm nextPath={nextPath} />;
}

export default function SignInPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <AuthShell
      title="Welcome back."
      subtitle="Sign in to your Speak Up Gen member space."
    >
      <Suspense fallback={<AuthFormFallback />}>
        <SignInContent searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}
