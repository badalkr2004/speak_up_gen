"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import { isGoogleAuthConfiguredClient } from "@/lib/public-config";
import { signUpSchema } from "@/lib/validations/auth";

export function SignUpForm({ nextPath = "/dashboard" }: { nextPath?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const googleEnabled = isGoogleAuthConfiguredClient();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details.");
      return;
    }

    startTransition(async () => {
      const { error: authError } = await authClient.signUp.email({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        callbackURL: nextPath,
      });

      if (authError) {
        setError(authError.message || "Could not create your account.");
        return;
      }

      router.push(nextPath);
      router.refresh();
    });
  }

  async function onGoogle() {
    setError(null);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: nextPath,
    });
  }

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Full name
          </span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            required
            className="w-full rounded-xl border-2 border-ink bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-leaf"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Email
          </span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-xl border-2 border-ink bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-leaf"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Password
          </span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="w-full rounded-xl border-2 border-ink bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-leaf"
          />
          <span className="text-xs text-ink-soft">At least 8 characters.</span>
        </label>

        {error ? (
          <p className="rounded-lg bg-coral/15 px-3 py-2 text-sm text-coral" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="btn btn-ink w-full justify-center disabled:opacity-60"
        >
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      {googleEnabled ? (
        <>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-ink-soft">
            <span className="h-px flex-1 bg-ink/20" />
            or
            <span className="h-px flex-1 bg-ink/20" />
          </div>
          <button
            type="button"
            onClick={onGoogle}
            disabled={pending}
            className="btn w-full justify-center border-2 border-ink bg-sky text-ink disabled:opacity-60"
          >
            Continue with Google
          </button>
        </>
      ) : null}

      <p className="text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-leaf underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
