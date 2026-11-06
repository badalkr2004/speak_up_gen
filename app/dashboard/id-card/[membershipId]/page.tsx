import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { IssueCardButton } from "@/app/components/org/issue-card-button";
import { requireSession } from "@/lib/auth/session";
import { getAppUrl } from "@/lib/env";
import {
  getLatestIdCard,
  getMembershipCardContext,
} from "@/lib/org/queries";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "ID card",
  robots: { index: false, follow: false },
};

type Params = Promise<{ membershipId: string }>;

async function IdCardContent({ params }: { params: Params }) {
  const session = await requireSession();
  const { membershipId } = await params;
  const ctx = await getMembershipCardContext(membershipId);
  if (!ctx || ctx.status !== "active") notFound();

  if (ctx.userId !== session.user.id) {
    // Leads can still open via org tools later; for now owner-only view
    notFound();
  }

  const card = await getLatestIdCard(membershipId);
  const verifyUrl = ctx.memberCode
    ? `${getAppUrl()}/verify/${ctx.memberCode}`
    : null;

  return (
    <div className="container-x py-10 sm:py-12">
      <Link
        href="/dashboard"
        className="text-sm font-semibold text-leaf underline-offset-2 hover:underline"
      >
        ← Dashboard
      </Link>
      <h1 className="display mt-6 text-[clamp(2rem,6vw,3rem)]">ID card</h1>

      <div className="mt-8 max-w-md overflow-hidden rounded-[1.5rem] border-2 border-ink bg-leaf-deep text-paper shadow-[10px_10px_0_#171713]">
        <div className="bg-lime px-5 py-3 text-ink">
          <p className="text-xs font-semibold uppercase tracking-[0.16em]">
            Speak Up Gen
          </p>
          <p className="font-hand text-xl text-leaf-deep">Member identity</p>
        </div>
        <div className="space-y-3 p-5">
          <p className="text-2xl font-semibold">{ctx.userName}</p>
          <p className="text-sm text-sky">
            {ctx.unitName}
            {ctx.kindLabel ? ` · ${ctx.kindLabel}` : ""}
          </p>
          <p className="text-xs uppercase tracking-[0.14em] text-lime">
            {ctx.roleKey.replaceAll("_", " ")}
          </p>
          <p className="font-mono text-lg tracking-wide text-lime">
            {ctx.memberCode ?? "Pending code"}
          </p>
          {verifyUrl ? (
            <p className="break-all text-xs text-paper/70">Verify: {verifyUrl}</p>
          ) : null}
          {card ? (
            <p className="text-xs text-paper/60">Card version {card.version}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        <IssueCardButton membershipId={membershipId} />
      </div>
    </div>
  );
}

export default function IdCardPage({ params }: { params: Params }) {
  return (
    <Suspense
      fallback={
        <div className="container-x py-10 text-ink-soft">Loading ID card…</div>
      }
    >
      <IdCardContent params={params} />
    </Suspense>
  );
}
