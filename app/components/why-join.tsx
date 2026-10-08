import { REASONS } from "../lib/content";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

export function WhyJoin() {
  return (
    <section className="relative py-24 sm:py-36">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <span className="eyebrow text-leaf" data-reveal>
              Chapter 04 — why join
            </span>
            <h2 className="display mt-5 text-[clamp(3rem,9vw,7rem)]" data-reveal style={{ "--d": 1 } as Vars}>
              Class
              <br />
              doesn&apos;t end
              <br />
              <span className="text-leaf">at the bell.</span>
            </h2>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-ink-soft" data-reveal style={{ "--d": 2 } as Vars}>
              The most useful things we&apos;ve learned didn&apos;t come from a syllabus. They came from showing up.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div
            className="notebook relative rounded-[1.25rem] border border-ink/10 pb-6 pl-16 pr-5 pt-[calc(var(--rule)*1.5)] shadow-[0_30px_60px_-30px_rgb(23_23_19/0.35)] sm:pl-20 sm:pr-10"
            data-reveal
          >
            <p className="absolute left-5 top-4 font-hand text-xl text-coral sm:left-6">p. 1</p>
            <p className="font-hand text-[1.7rem] leading-[var(--rule)] text-leaf">things you walk away with —</p>
            <ul>
              {REASONS.map((r, i) => (
                <li key={r.text} className="relative py-[calc(var(--rule)*0.25)]" data-reveal style={{ "--d": i } as Vars}>
                  <svg viewBox="0 0 28 28" className="check absolute -left-11 top-[calc(var(--rule)*0.25+0.35rem)] h-7 w-7 sm:-left-12" aria-hidden="true" style={{ "--d": i } as Vars}>
                    <rect x="3" y="3" width="22" height="22" rx="5" fill="none" stroke="#171713" strokeWidth="1.8" />
                    <path d="M8 14.5l4.5 4.5L22 8" pathLength={1} fill="none" stroke="#1e6a44" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-[clamp(1.15rem,2.2vw,1.55rem)] font-semibold leading-[var(--rule)] tracking-tight">
                    {r.text}
                  </p>
                  {r.note && (
                    <p className="origin-right font-hand text-xl leading-[var(--rule)] text-coral sm:-rotate-2 sm:text-right">
                      ↳ {r.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="container-x mt-28 sm:mt-40">
        <div className="relative mx-auto max-w-5xl" data-reveal>
          <p className="eyebrow text-coral">Requirements to join</p>
          <ul className="mt-8 space-y-3 sm:space-y-4">
            <li className="display text-[clamp(2.4rem,7.5vw,6rem)] text-ink/40">
              <span className="strike" style={{ "--d": 0 } as Vars}>Be an expert.</span>
            </li>
            <li className="display text-[clamp(2.4rem,7.5vw,6rem)] text-ink/40">
              <span className="strike" style={{ "--d": 4 } as Vars}>Have experience.</span>
            </li>
            <li className="display relative text-[clamp(2.4rem,7.5vw,6rem)]">
              <span className="relative inline-block">
                Want to make
                <br className="sm:hidden" /> a difference.
                <svg className="circle-draw pointer-events-none absolute -inset-x-[6%] -inset-y-[22%] h-[144%] w-[112%] overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
                  <path
                    d="M210 8C110 4 18 22 10 60c-8 40 90 56 200 54s184-18 182-56C390 22 300 4 170 14"
                    pathLength={1}
                    fill="none"
                    stroke="#1e6a44"
                    strokeWidth="3"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </span>
            </li>
          </ul>
          <p className="mt-10 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">
            You don&apos;t need to be an expert. You don&apos;t need to have experience. You just need the willingness to
            participate, learn and make a difference.{" "}
            <span className="font-hand text-2xl text-leaf">that&apos;s it. really. 🌱</span>
          </p>
        </div>
      </div>
    </section>
  );
}
