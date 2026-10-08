"use client";

import { useEffect, useRef, useState } from "react";

const LINES = [
  { text: "It starts as a thought at the back of a classroom.", level: "whisper", size: "text-[clamp(1.6rem,4.2vw,3rem)]" },
  { text: "Then someone finally says it out loud.", level: "voice", size: "text-[clamp(2rem,5.4vw,4.2rem)]" },
  { text: "A friend leans over and says — “me too.”", level: "conversation", size: "text-[clamp(2.3rem,6.4vw,5.2rem)]" },
  { text: "By Sunday, a whole group shows up. Gloves on. Bags in hand.", level: "crowd", size: "text-[clamp(2.4rem,7vw,6rem)]" },
  { text: "That’s what a generation sounds like when it speaks up.", level: "chorus", size: "text-[clamp(2.6rem,8vw,7.4rem)]" },
];

const LAST = LINES.length - 1;

export function Story() {
  const ref = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / total));
      el.style.setProperty("--p", p.toFixed(4));
      setStep(Math.min(LAST, Math.floor(p * LINES.length * 0.999)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
      } else {
        window.removeEventListener("scroll", onScroll);
      }
    });
    io.observe(el);
    window.addEventListener("resize", onScroll);

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const loud = step === LAST;

  return (
    <section
      id="story"
      ref={ref}
      aria-label="Our story"
      className={`relative h-[460svh] transition-colors duration-700 ease-(--ease-soft) ${
        loud ? "bg-leaf-deep text-paper" : "bg-paper text-ink"
      }`}
    >
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden">
        <div className="container-x flex items-center justify-between pt-24 sm:pt-28">
          <span className="eyebrow">Chapter 01 — the story</span>
          <span className="font-hand text-xl tabular-nums sm:text-2xl">
            {String(step + 1).padStart(2, "0")} / {String(LINES.length).padStart(2, "0")}
          </span>
        </div>

        <div className="container-x flex-1">
          <div className="relative h-full">
          {LINES.map((line, i) => {
            const state = i === step ? "now" : i < step ? "past" : "next";
            const words = line.text.split(" ");
            return (
              <p
                key={i}
                className={`story-line display !leading-[0.95] ${line.size}`}
                data-state={state}
                aria-hidden={state !== "now"}
              >
                <span className="block max-w-[16ch]">
                  {words.map((w, wi) => {
                    const accent = i === LAST && (w === "speaks" || w === "up.");
                    return (
                      <span key={wi}>
                        <span
                          className={`w ${accent ? "text-lime" : ""}`}
                          style={{ "--wi": wi } as React.CSSProperties}
                        >
                          {w}
                        </span>{" "}
                      </span>
                    );
                  })}
                </span>
              </p>
            );
          })}
          </div>
        </div>

        <div className="container-x pb-8 sm:pb-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] opacity-60 wide">Volume</p>
              <p key={step} className="word-pop font-hand text-3xl sm:text-4xl">
                {LINES[step].level}
              </p>
            </div>
            <div className="flex h-14 items-end gap-1.5 sm:h-16" aria-hidden="true">
              {LINES.map((_, i) => (
                <span
                  key={i}
                  className={`w-3 rounded-sm transition-[background-color,transform] duration-500 ease-(--ease-spring) sm:w-4 ${
                    i <= step ? (loud ? "bg-lime" : "bg-leaf") : "bg-current opacity-15"
                  }`}
                  style={{
                    height: `${(i + 1) * 20}%`,
                    transform: i === step ? "scaleY(1.08)" : "none",
                    transformOrigin: "bottom",
                  }}
                />
              ))}
            </div>
          </div>
          <div className="mt-5 h-[2px] w-full overflow-hidden bg-current/15">
            <div className="h-full origin-left bg-current" style={{ transform: "scaleX(var(--p, 0))" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
