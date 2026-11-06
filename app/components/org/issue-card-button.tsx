"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { issueIdCardAction } from "@/lib/org/actions";

export function IssueCardButton({ membershipId }: { membershipId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending}
        className="btn btn-ink disabled:opacity-60"
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await issueIdCardAction(membershipId);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            router.refresh();
          });
        }}
      >
        {pending ? "Issuing…" : "Re-issue ID card record"}
      </button>
      {error ? (
        <p className="text-sm text-coral" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
