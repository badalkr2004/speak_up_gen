import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MemberLanyard } from "@/app/components/id-card/member-lanyard";
import { requireSession } from "@/lib/auth/session";
import { getMembershipCardContext } from "@/lib/org/queries";
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
  if (ctx.userId !== session.user.id) notFound();

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <Link
        href="/dashboard"
        className="absolute left-4 top-4 z-20 text-sm font-medium text-white/50 transition hover:text-white"
      >
        ← Back
      </Link>
      <MemberLanyard
        member={{
          name: ctx.userName,
          memberCode: ctx.memberCode ?? "PENDING",
          role: ctx.roleKey,
          unitName: ctx.unitName,
          kindLabel: ctx.kindLabel,
          photoUrl: ctx.photoUrl,
          userImage: ctx.userImage,
        }}
      />
    </div>
  );
}

export default function IdCardPage({ params }: { params: Params }) {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 grid place-items-center bg-black text-white/40">
          Loading…
        </div>
      }
    >
      <IdCardContent params={params} />
    </Suspense>
  );
}
