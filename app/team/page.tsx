import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Nav } from "../components/nav";
import { Footer } from "../components/footer";
import { Reveals } from "../components/reveals";
import { Arrow } from "../components/icons";
import { TAGLINE, TEAM, WHATSAPP_URL } from "../lib/content";
import { siteConfig } from "../lib/site";

const teamDescription =
  "Meet the students running Speak Up Gen — founder, directors, presidents and the crew turning ideas into action.";

export const metadata: Metadata = {
  title: "Our Team",
  description: teamDescription,
  alternates: {
    canonical: "/team",
  },
  openGraph: {
    title: `Our Team · ${siteConfig.name}`,
    description: teamDescription,
    url: "/team",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Our Team · ${siteConfig.name}`,
    description: teamDescription,
  },
};

function phoneHref(phone: string) {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

export default function TeamPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="relative pt-28 sm:pt-36">
          <div className="container-x">
            <span className="eyebrow text-leaf" data-reveal>
              The crew
            </span>
            <h1
              className="display mt-5 text-[clamp(3rem,10vw,8rem)]"
              data-reveal
              style={{ "--d": 1 } as React.CSSProperties}
            >
              Faces behind
              <br />
              <span className="text-leaf">the voice.</span>
            </h1>
            <p
              className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl"
              data-reveal
              style={{ "--d": 2 } as React.CSSProperties}
            >
              Students. Not a boardroom. This is the team that runs Speak Up Gen — campaigns, clean-up
              drives, and every late-night idea that made it out of the group chat.
            </p>
            <p
              className="mt-4 font-hand text-2xl text-coral sm:text-3xl"
              data-reveal
              style={{ "--d": 3 } as React.CSSProperties}
            >
              {TAGLINE}
            </p>
          </div>

          <ol className="container-x mt-16 grid gap-8 sm:mt-24 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {TEAM.map((member, i) => (
              <li
                key={member.name}
                className="group relative"
                data-reveal
                style={{ "--d": Math.min(i, 5) } as React.CSSProperties}
              >
                <article className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border-2 border-ink bg-paper shadow-[6px_6px_0_#171713] transition-transform duration-500 ease-(--ease-spring) hover:-translate-y-1.5 hover:rotate-[-0.5deg]">
                  <div className="relative aspect-[4/5] overflow-hidden border-b-2 border-ink bg-paper-2">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-(--ease-soft) group-hover:scale-[1.04]"
                    />
                    <span className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full border-2 border-ink bg-lime font-hand text-lg font-bold text-ink">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
                    <div>
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-leaf wide">
                        {member.role}
                      </p>
                      <h2 className="mt-1.5 text-[clamp(1.35rem,3vw,1.75rem)] font-extrabold tracking-tight leading-tight">
                        {member.name}
                      </h2>
                    </div>
                    {member.phone ? (
                      <a
                        href={phoneHref(member.phone)}
                        className="mt-auto inline-flex items-center gap-2 self-start rounded-full border border-ink/20 bg-paper-2/80 px-3.5 py-2 text-sm font-medium transition-colors hover:border-ink hover:bg-lime"
                      >
                        <svg
                          viewBox="0 0 20 20"
                          className="h-4 w-4 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M4.5 3.5h3l1.5 4-2 1.2a10 10 0 0 0 4.3 4.3l1.2-2 4 1.5v3A1.5 1.5 0 0 1 15 16.5 12.5 12.5 0 0 1 3.5 5 1.5 1.5 0 0 1 4.5 3.5z" />
                        </svg>
                        {member.phone}
                      </a>
                    ) : (
                      <p className="mt-auto font-hand text-lg text-ink-soft">contact coming soon</p>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ol>

          <div
            className="container-x mt-20 flex flex-col items-start justify-between gap-6 border-t border-ink/15 py-16 sm:mt-28 sm:flex-row sm:items-center"
            data-reveal
          >
            <div>
              <p className="display text-[clamp(2rem,5vw,3.5rem)] !leading-[0.95]">Want in?</p>
              <p className="mt-2 max-w-md text-ink-soft">
                You don&apos;t need a title. Just the willingness to show up.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ink">
                Join the group
                <Arrow className="arrow h-5 w-5" />
              </a>
              <Link href="/#join" className="btn btn-line">
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <Reveals />
    </>
  );
}
