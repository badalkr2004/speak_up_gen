import Image from "next/image";
import Link from "next/link";
import logoInk from "../../../public/brand/logo-ink.png";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 12% 18%, #d6f45c55, transparent 42%), radial-gradient(circle at 88% 12%, #b9def088, transparent 36%), radial-gradient(circle at 70% 80%, #1e6a4422, transparent 40%)",
        }}
      />
      <div className="container-x relative flex min-h-dvh flex-col py-10 sm:py-14">
        <Link href="/" className="w-fit" aria-label="Speak Up Gen — home">
          <Image src={logoInk} alt="Speak Up Gen" className="h-12 w-auto sm:h-14" />
        </Link>

        <div className="mx-auto mt-12 w-full max-w-md sm:mt-16">
          <p className="eyebrow text-leaf">Member access</p>
          <h1 className="display mt-3 text-[clamp(2.4rem,8vw,3.6rem)] leading-[0.9]">
            {title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-soft">{subtitle}</p>
          <div className="mt-8 rounded-[1.5rem] border-2 border-ink bg-paper/90 p-6 shadow-[8px_8px_0_#171713] sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
