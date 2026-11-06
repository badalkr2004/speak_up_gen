import Link from "next/link";
import { SignOutButton } from "@/app/components/auth/sign-out-button";

const LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/apply", label: "Apply" },
  { href: "/dashboard/approvals", label: "Approvals", leadOnly: true },
  { href: "/dashboard/org", label: "Organisation", leadOnly: true },
] as const;

export function DashboardNav({
  isLead,
  userName,
}: {
  isLead: boolean;
  userName: string;
}) {
  return (
    <header className="border-b-2 border-ink/10 bg-paper/95">
      <div className="container-x flex flex-wrap items-center justify-between gap-4 py-4">
        <div>
          <Link href="/" className="text-xs font-semibold uppercase tracking-[0.16em] text-leaf">
            Speak Up Gen
          </Link>
          <p className="mt-1 text-sm text-ink-soft">Signed in as {userName}</p>
        </div>
        <nav className="flex flex-wrap items-center gap-2 sm:gap-3" aria-label="Dashboard">
          {LINKS.filter((l) => !("leadOnly" in l && l.leadOnly) || isLead).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full border-2 border-ink/15 px-3 py-1.5 text-sm font-medium hover:border-ink hover:bg-lime/40"
            >
              {l.label}
            </Link>
          ))}
          <SignOutButton />
        </nav>
      </div>
    </header>
  );
}
