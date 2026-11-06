import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getPublicMemberByCode } from "@/lib/org/queries";

type Params = Promise<{ code: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Verify ${code}`,
    robots: { index: false, follow: false },
  };
}

async function VerifyContent({ params }: { params: Params }) {
  const { code } = await params;
  const member = await getPublicMemberByCode(decodeURIComponent(code)).catch(
    () => null,
  );

  return (
    <main className="min-h-dvh bg-paper">
      <div className="container-x py-14">
        <p className="eyebrow text-leaf">Member verification</p>
        <h1 className="display mt-4 text-[clamp(2.2rem,7vw,3.5rem)]">
          {member ? "Verified member" : "Not found"}
        </h1>

        {member ? (
          <div className="mt-8 max-w-lg rounded-[1.5rem] border-2 border-ink bg-lime/35 p-6 shadow-[8px_8px_0_#171713]">
            <p className="text-2xl font-semibold">{member.name}</p>
            <p className="mt-2 text-sm text-ink-soft">
              {member.unitName}
              {member.kindLabel ? ` · ${member.kindLabel}` : ""}
            </p>
            <p className="mt-4 font-mono text-lg tracking-wide text-leaf">
              {member.memberCode}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-ink-soft">
              {member.role.replaceAll("_", " ")} · {member.status}
            </p>
          </div>
        ) : (
          <p className="mt-6 max-w-md text-ink-soft">
            This member code is invalid, inactive, or not issued yet.
          </p>
        )}

        <p className="mt-10 text-sm">
          <Link href="/" className="font-semibold text-leaf underline-offset-2 hover:underline">
            ← Speak Up Gen
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function VerifyPage({ params }: { params: Params }) {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh bg-paper">
          <div className="container-x py-14 text-ink-soft">Checking…</div>
        </main>
      }
    >
      <VerifyContent params={params} />
    </Suspense>
  );
}
