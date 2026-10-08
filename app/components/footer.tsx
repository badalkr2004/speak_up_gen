import Image from "next/image";
import logoBadge from "../../public/brand/logo-badge.png";
import { HASHTAGS, INSTAGRAM_HANDLE, INSTAGRAM_URL, WHATSAPP_URL } from "../lib/content";

const MATTERS = ["voice", "ideas", "action"];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink pt-20 text-paper sm:pt-28">
      <div className="container-x">
        <ul className="space-y-1" aria-label="What matters">
          {MATTERS.map((m) => (
            <li key={m} className="group display text-[clamp(2.6rem,8vw,6.5rem)] text-paper/25 transition-colors duration-500 hover:text-paper">
              Your{" "}
              <span className="inline-block text-paper transition-[color,transform] duration-500 ease-(--ease-spring) group-hover:-rotate-2 group-hover:text-lime">
                {m}
              </span>{" "}
              {m === "ideas" ? "matter." : "matters."}
            </li>
          ))}
        </ul>

        <div className="mt-16 grid gap-10 border-t border-paper/15 pt-10 sm:mt-24 md:grid-cols-3">
          <div>
            <a href="#top" className="inline-block" aria-label="Speak Up Gen — back to top">
              <Image src={logoBadge} alt="Speak Up Gen" sizes="7rem" className="wiggle-hover h-28 w-28 -rotate-6 rounded-full" />
            </a>
            <p className="mt-5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-lime wide">
              Aware. Think. Speak. Change.
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-paper/60">
              A youth-driven initiative for social &amp; environmental change. Run by students, open to every young
              person who wants to show up.
            </p>
          </div>

          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-paper/50 wide">Find us</p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="link-u pb-0.5">
                  WhatsApp group
                </a>
              </li>
              <li>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="link-u pb-0.5">
                  Instagram {INSTAGRAM_HANDLE}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-paper/50 wide">Tag along</p>
            <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 text-sm text-paper/70">
              {HASHTAGS.map((t) => (
                <li key={t} className="transition-colors hover:text-lime">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="container-x mt-16 flex flex-col gap-3 pb-8 text-xs text-paper/45 sm:flex-row sm:items-center sm:justify-between">
        <p>Made by Gen Z, for everyone. 🌍</p>
        <a href="#top" className="group inline-flex items-center gap-2 self-start hover:text-paper sm:self-auto">
          Back to the top
          <span className="transition-transform duration-500 ease-(--ease-spring) group-hover:-translate-y-1">↑</span>
        </a>
      </div>

      <p
        aria-hidden="true"
        className="display pointer-events-none -mb-[0.16em] select-none whitespace-nowrap text-center text-[16vw] leading-[0.8] text-paper/[0.06]"
      >
        speak up gen
      </p>
    </footer>
  );
}
