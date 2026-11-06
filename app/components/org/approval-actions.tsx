"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { reviewApplicationAction } from "@/lib/org/actions";

export function ApprovalActions({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function review(decision: "approved" | "rejected") {
    setError(null);
    startTransition(async () => {
      const result = await reviewApplicationAction({
        applicationId,
        decision,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => review("approved")}
          className="btn btn-ink !py-2 text-sm disabled:opacity-60"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => review("rejected")}
          className="btn border-2 border-ink bg-paper !py-2 text-sm disabled:opacity-60"
        >
          Reject
        </button>
      </div>
      {error ? (
        <p className="text-sm text-coral" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
