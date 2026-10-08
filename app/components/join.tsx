import { Arrow, Logo } from "./icons";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, WHATSAPP_URL } from "../lib/content";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

const TILES = [
  { bg: "bg-lime", text: "SPEAK\nUP.", cls: "text-ink" },
  { bg: "bg-leaf", text: "🌱", cls: "text-3xl" },
  { bg: "bg-coral", text: "TAKE\nACTION", cls: "text-ink" },
  { bg: "bg-ink", text: "#youth\nforchange", cls: "text-lime font-hand normal-case text-xl" },
  { bg: "bg-sky", text: "clean-up\nday ✿", cls: "text-ink font-hand normal-case text-xl" },
  { bg: "bg-paper-2", text: "YOUR\nVOICE", cls: "text-leaf" },
];

export function Join() {
  return (
    <section id="join" className="relative py-24 sm:py-36">
      <div className="container-x">
        <div className="max-w-4xl">
          <span className="eyebrow text-leaf" data-reveal>
            Chapter 06 — your turn
          </span>
          <h2 className="display mt-5 text-[clamp(2.7rem,9vw,8.5rem)]" data-reveal style={{ "--d": 1 } as Vars}>
            Small action.
            <br />
            <span className="text-leaf">Bigger change.</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl" data-reveal style={{ "--d": 2 } as Vars}>
            If you believe that even a small action can create a bigger change, come be a part of Speak Up Gen. Two
            doors in — pick either, or both. 💚
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:mt-20 md:grid-cols-2 md:gap-8">
          <div data-reveal className="flex">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="tilt-card group relative flex w-full flex-col overflow-hidden rounded-[1.75rem] border-2 border-ink bg-[#e7f3d9] p-6 shadow-[8px_8px_0_#171713] sm:p-8"
            style={{ transform: "rotate(-1.2deg)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] wide">WhatsApp group</span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-leaf">
                <span className="h-2 w-2 rounded-full bg-leaf" /> active now
              </span>
            </div>

            <div className="mt-6 flex flex-1 flex-col gap-3 rounded-2xl bg-paper/70 p-4 text-[0.95rem] sm:p-5" aria-hidden="true">
              <div className="bubble max-w-[85%] self-end rounded-2xl rounded-br-md bg-[#cfeeb5] px-4 py-2.5" style={{ "--at": "0.3s" } as Vars}>
                hey! is this where I join speak up gen? 👀
              </div>
              <div className="typing flex w-fit items-center gap-1 rounded-2xl rounded-bl-md bg-paper px-4 py-3.5 text-ink-soft">
                <i />
                <i />
                <i />
              </div>
              <div className="bubble flex max-w-[85%] items-start gap-2.5 rounded-2xl rounded-bl-md bg-paper px-4 py-2.5" style={{ "--at": "2.4s" } as Vars}>
                <Logo className="mt-0.5 h-5 w-5 shrink-0" />
                <span>yesss — welcome in 💚 say hi, tell us what you care about. next drive details are pinned!</span>
              </div>
            </div>

            <div className="mt-6 flex items-end justify-between gap-4">
              <p className="display text-4xl sm:text-5xl">
                Join the
                <br />
                group chat
              </p>
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-ink text-paper transition-transform duration-500 ease-(--ease-spring) group-hover:-rotate-45 group-hover:scale-110">
                <Arrow className="h-6 w-6" />
              </span>
            </div>
          </a>
          </div>

          <div data-reveal className="flex" style={{ "--d": 2 } as Vars}>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="tilt-card group relative flex w-full flex-col overflow-hidden rounded-[1.75rem] border-2 border-ink bg-paper p-6 shadow-[8px_8px_0_#171713] sm:p-8"
            style={{ transform: "rotate(1.2deg)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] wide">Instagram</span>
              <span className="text-xs font-medium text-ink-soft">{INSTAGRAM_HANDLE}</span>
            </div>

            <div className="mt-6 grid flex-1 grid-cols-3 gap-2" aria-hidden="true">
              {TILES.map((t, i) => (
                <div
                  key={i}
                  className={`grid aspect-square place-items-center rounded-xl p-2 text-center transition-transform duration-500 ease-(--ease-spring) group-hover:scale-[0.96] ${t.bg}`}
                  style={{ transitionDelay: `${i * 35}ms` }}
                >
                  <span className={`whitespace-pre-line text-sm font-extrabold uppercase leading-[0.95] [font-stretch:75%] sm:text-base ${t.cls}`}>
                    {t.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-end justify-between gap-4">
              <p className="display text-4xl sm:text-5xl">
                Follow
                <br />
                the story
              </p>
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-ink text-paper transition-transform duration-500 ease-(--ease-spring) group-hover:-rotate-45 group-hover:scale-110">
                <Arrow className="h-6 w-6" />
              </span>
            </div>
          </a>
          </div>
        </div>
      </div>
    </section>
  );
}
