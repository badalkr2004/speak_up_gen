import { Arrow } from "./icons";
import { HASHTAGS, WHATSAPP_URL } from "../lib/content";

const BARS = Array.from({ length: 56 }, (_, i) => {
  const h = 22 + Math.round(78 * Math.abs(Math.sin(i * 0.47) * Math.cos(i * 0.11 + 0.6)));
  return {
    h: `${h}%`,
    t: `${(0.9 + ((i * 37) % 9) / 10).toFixed(2)}s`,
    dl: `${(-((i * 53) % 17) / 10).toFixed(2)}s`,
  };
});

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

export function Hero() {
  return (
    <section id="top" className="relative pt-28 sm:pt-36">
      <div className="container-x relative">
        <p className="fade-up flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] wide" style={{ "--i": 0 } as Vars}>
          <span className="rec-dot" />
          Rec <span className="text-ink-soft">·</span>
          <span className="text-ink-soft">a youth-run initiative</span>
        </p>

        <h1 className="display mt-6 text-[clamp(2.9rem,15vw,13.5rem)] sm:mt-8">
          <span className="line-mask">
            <span style={{ "--i": 0 } as Vars}>
              Your{" "}
              <span className="highlight" style={{ "--sd": "0.95s" } as Vars}>
                voice.
              </span>
            </span>
          </span>
          <span className="line-mask">
            <span style={{ "--i": 1 } as Vars}>
              Your <span className="text-leaf">ideas.</span>
            </span>
          </span>
          <span className="line-mask">
            <span style={{ "--i": 2 } as Vars}>
              Your{" "}
              <span className="relative inline-block">
                action.
                <svg
                  className="scribble absolute -bottom-[0.06em] left-0 h-[0.18em] w-full overflow-visible"
                  viewBox="0 0 300 20"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  style={{ "--sd": "1.35s" } as Vars}
                >
                  <path
                    d="M4 14C60 6 140 4 296 9M30 17c70-5 150-6 240-3"
                    pathLength={1}
                    fill="none"
                    stroke="#ff6a3d"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </span>
          </span>
        </h1>

        <svg
          viewBox="0 0 120 120"
          className="fade-up absolute right-[clamp(1.25rem,4vw,3rem)] top-28 hidden h-40 w-40 xl:block"
          style={{ "--i": 5 } as Vars}
          aria-hidden="true"
        >
          <g className="spin-slow origin-center [transform-box:fill-box]">
            <defs>
              <path id="ring" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1-88 0" />
            </defs>
            <circle cx="60" cy="60" r="58" fill="#1e6a44" />
            <text fill="#f3ede2" fontSize="10.5" fontWeight="700">
              <textPath href="#ring" textLength="272" lengthAdjust="spacing">
                STUDENT-RUN • YOUTH-LED • FOR CHANGE •
              </textPath>
            </text>
          </g>
          <path d="M60 44v30M60 56c-1-6-6-9-12-8.5.4 6 5.3 9.6 12 8.5zM60 52c1-6 6-9.5 12-9-.3 6-5.4 10-12 9z" fill="#d6f45c" stroke="#d6f45c" strokeWidth="2" strokeLinecap="round" />
        </svg>

        <div className="mt-10 grid gap-8 sm:mt-14 md:grid-cols-12 md:items-end">
          <p className="fade-up max-w-xl text-lg leading-relaxed text-ink-soft md:col-span-6 sm:text-xl" style={{ "--i": 6 } as Vars}>
            Ever felt young people should do more than just <em className="not-italic text-ink">talk</em> about
            social and environmental issues? So did we.{" "}
            <strong className="font-semibold text-ink">Speak Up Gen</strong> is where young minds come together to
            spread awareness, share ideas and take real action in our communities.
          </p>

          <div className="fade-up flex flex-wrap items-center gap-x-6 gap-y-4 md:col-span-6 md:justify-end" style={{ "--i": 7 } as Vars}>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ink text-base">
              Join the initiative
              <Arrow className="arrow h-5 w-5" />
            </a>
            <a href="#story" className="link-u pb-0.5 font-medium">
              Hear our story
            </a>
          </div>
        </div>
      </div>

      <div className="container-x fade-up mt-14 sm:mt-20" style={{ "--i": 8 } as Vars}>
        <div className="wave" aria-hidden="true">
          {BARS.map((b, i) => (
            <i key={i} style={{ "--h": b.h, "--t": b.t, "--dl": b.dl } as Vars} />
          ))}
        </div>
        <p className="mt-3 flex justify-between font-hand text-lg text-ink-soft sm:text-xl">
          <span>↑ that&apos;s a generation, warming up</span>
          <span className="hidden sm:inline">scroll to turn it up ↓</span>
        </p>
      </div>

      <div className="marquee-wrap mt-12 overflow-hidden border-y border-ink/15 py-4 sm:mt-16">
        <div className="marquee" style={{ "--speed": "46s" } as Vars}>
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
              {HASHTAGS.map((tag) => (
                <span key={tag} className="flex items-center whitespace-nowrap text-sm font-semibold uppercase tracking-[0.12em] wide">
                  <span className="px-6">{tag}</span>
                  <span className="text-leaf">✺</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
