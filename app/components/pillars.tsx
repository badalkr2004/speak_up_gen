"use client";

import { useState } from "react";
import { PILLARS } from "../lib/content";
import { PillarGlyph } from "./icons";

export function Pillars() {
  const [open, setOpen] = useState<number | null>(1);

  return (
    <section id="what-we-do" className="relative py-24 sm:py-36">
      <div className="container-x">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <span className="eyebrow text-leaf" data-reveal>
              Chapter 02 — what we do
            </span>
            <h2 className="display mt-5 text-[clamp(3rem,9vw,7.5rem)]" data-reveal style={{ "--d": 1 } as React.CSSProperties}>
              Six ways to
              <br />
              <span className="text-leaf">turn it up.</span>
            </h2>
          </div>
          <p className="max-w-sm text-lg leading-relaxed text-ink-soft md:col-span-5 md:justify-self-end" data-reveal style={{ "--d": 2 } as React.CSSProperties}>
            Pick one. Pick all six. Every member finds their own frequency —
            <span className="font-hand text-2xl text-ink"> tap any to open it up.</span>
          </p>
        </div>

        <ol className="mt-14 border-b border-ink/15 sm:mt-20">
          {PILLARS.map((p, i) => {
            const isOpen = open === i;
            return (
              <li key={p.title} className="border-t border-ink/15" data-reveal style={{ "--d": i } as React.CSSProperties}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`pillar-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="track-btn relative isolate grid w-full grid-cols-[2.25rem_1fr_auto] items-center gap-3 py-5 text-left transition-colors duration-500 sm:grid-cols-[4rem_1fr_auto_auto] sm:gap-6 sm:py-7"
                >
                  <span className="font-hand text-2xl sm:text-3xl">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span className="track-title block text-[clamp(1.5rem,4.4vw,3.2rem)] font-extrabold uppercase leading-none [font-stretch:72%]">
                      {p.title}
                    </span>
                    <span className="track-sub mt-1.5 block text-sm text-ink-soft transition-colors duration-500 sm:text-base">
                      {p.line}
                    </span>
                  </span>
                  <PillarGlyph name={p.icon} className="track-icon hidden h-10 w-10 sm:block" />
                  <span className="track-plus grid h-10 w-10 place-items-center rounded-full border border-current sm:h-12 sm:w-12" aria-hidden="true">
                    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M8 2v12M2 8h12" />
                    </svg>
                  </span>
                </button>

                <div id={`pillar-${i}`} className="track-panel" data-open={isOpen} role="region" aria-label={p.title}>
                  <div className="overflow-hidden">
                    <div className="grid gap-6 pb-8 pt-6 sm:grid-cols-[4rem_1fr] sm:gap-6 sm:pb-10">
                      <PillarGlyph name={p.icon} className="h-10 w-10 text-leaf sm:hidden" />
                      <div className="hidden sm:block" />
                      <div className="grid gap-6 lg:grid-cols-2 lg:gap-16">
                        <p className="max-w-xl text-lg leading-relaxed">{p.body}</p>
                        <ul className="flex flex-wrap content-start gap-2 lg:justify-end">
                          {p.tags.map((t) => (
                            <li key={t} className="rounded-full border border-ink/20 px-3.5 py-1.5 text-sm font-medium">
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
