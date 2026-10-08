"use client";

import { useState } from "react";
import { WANTS, WHATSAPP_URL } from "../lib/content";
import { Arrow } from "./icons";

function sentence(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function WhoCanJoin() {
  const [chosen, setChosen] = useState<string[]>(["raise my voice"]);

  const toggle = (w: string) =>
    setChosen((prev) => (prev.includes(w) ? prev.filter((x) => x !== w) : WANTS.filter((x) => x === w || prev.includes(x))));

  const all = chosen.length === WANTS.length;

  return (
    <section className="relative overflow-hidden bg-ink py-24 text-paper sm:py-36">
      <div className="container-x">
        <span className="eyebrow text-lime" data-reveal>
          Chapter 05 — who can join
        </span>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-paper/70" data-reveal style={{ "--d": 1 } as React.CSSProperties}>
          Students &amp; young people. That&apos;s the whole list. Finish the sentence and see for yourself.
        </p>

        <div className="mt-12 sm:mt-16" data-reveal style={{ "--d": 2 } as React.CSSProperties}>
          <p className="display text-[clamp(2.2rem,6.5vw,5.4rem)] !leading-[0.98]" aria-live="polite">
            I&apos;m young and I want to{" "}
            {chosen.length ? (
              <span key={chosen.join("|")} className="word-pop text-lime">
                {sentence(chosen)}.
              </span>
            ) : (
              <span className="inline-block min-w-[4ch] border-b-[0.08em] border-dashed border-paper/40">&nbsp;</span>
            )}
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-2.5 sm:mt-14 sm:gap-3" role="group" aria-label="What do you want to do?" data-reveal style={{ "--d": 3 } as React.CSSProperties}>
          {WANTS.map((w) => {
            const on = chosen.includes(w);
            return (
              <button
                key={w}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(w)}
                className="chip flex items-center gap-2 rounded-full px-4 py-2.5 text-[0.95rem] font-medium shadow-[inset_0_0_0_1.5px_rgb(243_237_226/0.35)] hover:shadow-[inset_0_0_0_1.5px_rgb(243_237_226/0.9)] sm:px-5 sm:py-3 sm:text-base"
              >
                <svg viewBox="0 0 16 16" className="tick h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 8.5l3 3L13 4.5" />
                </svg>
                {w}
              </button>
            );
          })}
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-paper/15 pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-hand text-3xl text-paper/90 sm:text-4xl">
            {chosen.length === 0
              ? "pick at least one — or all of them, no judgement."
              : all
                ? "okay, you're basically already one of us."
                : "then you belong here. 💚"}
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn bg-lime text-ink [--fill:var(--color-paper)] transition-opacity ${chosen.length ? "" : "pointer-events-none opacity-40"}`}
            aria-disabled={chosen.length === 0}
          >
            Count me in
            <Arrow className="arrow h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
