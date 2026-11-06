"use client";

import dynamic from "next/dynamic";
import type { BadgeTextureInput } from "@/app/components/id-card/create-badge-texture";

const LanyardScene = dynamic(
  () =>
    import("@/app/components/id-card/lanyard-scene").then((m) => m.LanyardScene),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-dvh w-full place-items-center bg-black text-sm text-white/40">
        Dropping your lanyard…
      </div>
    ),
  },
);

export function MemberLanyard(props: { member: BadgeTextureInput }) {
  return <LanyardScene member={props.member} />;
}
