type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

const ROW_A = ["Speak up.", "Spread awareness.", "Take action."];
const ROW_B = ["Your voice matters.", "Your ideas matter.", "Your action matters."];

function Row({ words, reverse, speed, outline }: { words: string[]; reverse?: boolean; speed: string; outline?: boolean }) {
  return (
    <div className="overflow-hidden">
      <div className="marquee" data-reverse={reverse || undefined} style={{ "--speed": speed } as Vars}>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
            {[...words, ...words].map((w, i) => (
              <span key={i} className="flex items-center">
                <span
                  className={`display whitespace-nowrap px-5 text-[clamp(3.2rem,10vw,8.5rem)] sm:px-8 ${
                    outline ? "text-transparent [-webkit-text-stroke:1.5px_var(--color-lime)]" : ""
                  }`}
                >
                  {w}
                </span>
                <svg viewBox="0 0 40 40" className="h-8 w-8 shrink-0 text-lime sm:h-12 sm:w-12" aria-hidden="true">
                  <path d="M20 2l4 14 14 4-14 4-4 14-4-14-14-4 14-4z" fill="currentColor" />
                </svg>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Manifesto() {
  return (
    <section aria-label="Our manifesto" className="overflow-hidden bg-leaf-deep py-14 text-paper sm:py-20">
      <h2 className="sr-only">Speak up. Spread awareness. Take action.</h2>
      <div className="-rotate-2 space-y-2 sm:space-y-4">
        <Row words={ROW_A} speed="34s" />
        <Row words={ROW_B} speed="48s" reverse outline />
      </div>
    </section>
  );
}
