"use client";

import { useState } from "react";
import { Arrow } from "./icons";
import { WHATSAPP_URL } from "../lib/content";

type Kind = "bottle" | "can" | "chips" | "cup" | "bag" | "paper" | "wrapper";

const ITEMS: { kind: Kind; x: number; y: number; r: number; label: string }[] = [
  { kind: "bottle", x: 14, y: 78, r: -24, label: "plastic bottle" },
  { kind: "paper", x: 24, y: 64, r: 0, label: "crumpled paper" },
  { kind: "can", x: 31, y: 89, r: 16, label: "soda can" },
  { kind: "wrapper", x: 38, y: 74, r: 38, label: "candy wrapper" },
  { kind: "chips", x: 47, y: 66, r: -10, label: "chips packet" },
  { kind: "bottle", x: 53, y: 91, r: 72, label: "plastic bottle" },
  { kind: "cup", x: 60, y: 79, r: 22, label: "takeaway cup" },
  { kind: "bag", x: 72, y: 66, r: -14, label: "plastic bag" },
  { kind: "can", x: 8, y: 92, r: -32, label: "soda can" },
];

const stroke = { stroke: "#171713", strokeWidth: 2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

function Litter({ kind }: { kind: Kind }) {
  switch (kind) {
    case "bottle":
      return (
        <svg viewBox="0 0 24 50" className="h-12 w-6">
          <rect x="8" y="2" width="8" height="6" rx="1.5" fill="#d8432a" {...stroke} />
          <path d="M8 8h8l3 7v29a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V15l3-7z" fill="#b9def0" {...stroke} />
          <rect x="5" y="22" width="14" height="9" fill="#d6f45c" {...stroke} />
        </svg>
      );
    case "can":
      return (
        <svg viewBox="0 0 28 40" className="h-10 w-7">
          <rect x="3" y="4" width="22" height="33" rx="4" fill="#d8432a" {...stroke} />
          <ellipse cx="14" cy="6" rx="10" ry="2.5" fill="#e8dfcd" {...stroke} />
          <path d="M8 17h12M8 23h8" {...stroke} stroke="#f3ede2" />
        </svg>
      );
    case "chips":
      return (
        <svg viewBox="0 0 40 44" className="h-11 w-10">
          <path d="M5 5l5 2 5-2 5 2 5-2 5 2 5-2-2 34-5-2-5 2-5-2-5 2-5-2-5 2z" fill="#d6f45c" {...stroke} />
          <circle cx="20" cy="21" r="6" fill="#d8432a" {...stroke} />
        </svg>
      );
    case "cup":
      return (
        <svg viewBox="0 0 30 46" className="h-11 w-7">
          <path d="M19 2l-3 10" {...stroke} strokeWidth={3} stroke="#1e6a44" />
          <rect x="3" y="10" width="24" height="5" rx="2" fill="#171713" />
          <path d="M5 15h20l-3 28H8z" fill="#fbf8f1" {...stroke} />
          <path d="M7 25h16" {...stroke} stroke="#1e6a44" strokeWidth={4} />
        </svg>
      );
    case "bag":
      return (
        <svg viewBox="0 0 44 44" className="h-12 w-12">
          <path d="M12 14c0-6 3-10 5-10s3 4 3 8M24 12c0-5 2-8 4-8s4 4 4 10" fill="none" {...stroke} />
          <path d="M8 14h28l3 24c.3 2.5-1.4 4-4 4H9c-2.6 0-4.3-1.5-4-4z" fill="#fbf8f1" fillOpacity=".9" {...stroke} />
          <path d="M14 24c3 3 13 3 16 0" fill="none" {...stroke} strokeOpacity=".4" />
        </svg>
      );
    case "paper":
      return (
        <svg viewBox="0 0 36 36" className="h-9 w-9">
          <path d="M18 3l7 3 7 7-2 8 1 7-8 5-8-1-7-5-3-8 3-9z" fill="#fbf8f1" {...stroke} />
          <path d="M11 12l6 5 7-4M14 24l4-7 5 9" fill="none" {...stroke} strokeOpacity=".5" />
        </svg>
      );
    case "wrapper":
      return (
        <svg viewBox="0 0 48 24" className="h-7 w-12">
          <path d="M14 6h20v12H14z" fill="#1e6a44" {...stroke} />
          <path d="M14 6L3 2l3 10-3 10 11-4zM34 6l11-4-3 10 3 10-11-4z" fill="#d6f45c" {...stroke} />
        </svg>
      );
  }
}

function Flower({ hue }: { hue: string }) {
  return (
    <svg viewBox="0 0 30 44" className="h-11 w-8" aria-hidden="true">
      <path d="M15 43V20" stroke="#1e6a44" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M15 34c-6-1-9-5-9-9 5 0 8 3 9 9zM15 30c5-1 8-4 8-8-4 0-7 3-8 8z" fill="#1e6a44" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="15" cy="9" rx="4" ry="6" fill={hue} stroke="#171713" strokeWidth="1.5" transform={`rotate(${a} 15 15)`} />
      ))}
      <circle cx="15" cy="15" r="3.5" fill="#171713" />
    </svg>
  );
}

const HUES = ["#d8432a", "#d6f45c", "#fbf8f1", "#b9def0"];

export function CleanupGame() {
  const [picked, setPicked] = useState<ReadonlySet<number>>(new Set());
  const [round, setRound] = useState(0);
  const total = ITEMS.length;
  const count = picked.size;
  const done = count === total;

  const pick = (i: number) => {
    if (picked.has(i)) return;
    navigator.vibrate?.(10);
    setPicked((prev) => new Set(prev).add(i));
  };

  const reset = () => {
    setPicked(new Set());
    setRound((r) => r + 1);
  };

  return (
    <section id="try" className="relative bg-paper-2/60 py-24 sm:py-36">
      <div className="container-x">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <span className="eyebrow text-leaf" data-reveal>
              Chapter 03 — try it yourself
            </span>
            <h2 className="display mt-5 text-[clamp(2.6rem,8.5vw,7.5rem)]" data-reveal style={{ "--d": 1 } as React.CSSProperties}>
              A ten-second
              <br />
              clean-up drive.
            </h2>
          </div>
          <p className="max-w-sm text-lg leading-relaxed text-ink-soft md:col-span-5 md:justify-self-end" data-reveal style={{ "--d": 2 } as React.CSSProperties}>
            This is our favourite kind of Sunday. Tap every piece of litter in the park — every single one counts.
            <span className="font-hand text-2xl text-ink"> (that&apos;s kind of the whole point.)</span>
          </p>
        </div>

        <div className="mt-12 sm:mt-16" data-reveal style={{ "--d": 1 } as React.CSSProperties}>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft wide">Litter picked</p>
              <p className="display text-5xl tabular-nums sm:text-6xl" aria-live="polite">
                <span key={count} className="word-pop">{count}</span>
                <span className="text-ink/30">/{total}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              disabled={count === 0}
              className="btn btn-line !py-2.5 text-sm disabled:pointer-events-none disabled:opacity-30"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 10a6 6 0 1 0 2-4.5M4 3v3.5h3.5" />
              </svg>
              Reset park
            </button>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border-2 border-ink bg-sky sm:aspect-[16/9]" key={round}>
            <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <circle cx="800" cy="120" r="56" fill={done ? "#d6f45c" : "#f3ede2"} stroke="#171713" strokeWidth="3" style={{ transition: "fill .8s" }} />
              <path d="M150 140c0-22 40-26 52-8 18-14 48-2 46 18 22 0 26 30 4 32H160c-24 0-28-38-10-42z" fill="#fbf8f1" stroke="#171713" strokeWidth="3" />
              <path d="M0 360C120 290 240 300 360 330s260 10 380-30 200 0 260 30v300H0z" fill="#8fb36b" stroke="#171713" strokeWidth="3" />
              <path d="M0 400c160-40 340-20 520-6s340 4 480-20v226H0z" fill={done ? "#b8d97a" : "#a9bd7c"} stroke="#171713" strokeWidth="3" style={{ transition: "fill .8s" }} />
              <path d="M420 600c40-80 120-130 260-160" fill="none" stroke="#e8dfcd" strokeWidth="46" strokeLinecap="round" />
              <path d="M420 600c40-80 120-130 260-160" fill="none" stroke="#171713" strokeWidth="2" strokeDasharray="10 14" opacity=".35" />
              <rect x="318" y="300" width="22" height="110" rx="4" fill="#6b4f35" stroke="#171713" strokeWidth="3" />
              <circle cx="300" cy="270" r="58" fill="#1e6a44" stroke="#171713" strokeWidth="3" />
              <circle cx="370" cy="250" r="52" fill="#2a7d52" stroke="#171713" strokeWidth="3" />
              <circle cx="335" cy="205" r="50" fill="#1e6a44" stroke="#171713" strokeWidth="3" />
              <g stroke="#171713" strokeWidth="3" strokeLinecap="round">
                <rect x="520" y="360" width="160" height="14" rx="4" fill="#c98a52" />
                <rect x="520" y="336" width="160" height="12" rx="4" fill="#c98a52" />
                <path d="M538 374v36M662 374v36M532 348l-6 26M668 348l6 26" />
              </g>
              <g stroke="#171713" strokeWidth="3">
                <path d="M740 420V230" />
                <rect x="724" y="206" width="32" height="28" rx="6" fill={done ? "#d6f45c" : "#fbf8f1"} style={{ transition: "fill .8s" }} />
              </g>
            </svg>

            {done &&
              ITEMS.map((it, i) => (
                <span key={`f${i}`} className="sprout" style={{ "--x": `${it.x}%`, "--y": `${it.y}%`, "--k": i } as React.CSSProperties}>
                  <Flower hue={HUES[i % HUES.length]} />
                </span>
              ))}

            {ITEMS.map((it, i) => {
              const isPicked = picked.has(i);
              const pos = { "--x": `${it.x}%`, "--y": `${it.y}%`, "--r": `${it.r}deg` } as React.CSSProperties;
              return (
                <span key={i}>
                  <button
                    type="button"
                    className="litter grid h-14 w-14 cursor-pointer place-items-center"
                    style={pos}
                    data-picked={isPicked}
                    onClick={() => pick(i)}
                    aria-label={`Pick up ${it.label}`}
                    disabled={isPicked}
                  >
                    <Litter kind={it.kind} />
                  </button>
                  {isPicked && (
                    <span className="plus-one font-hand text-3xl font-bold text-ink" style={pos} aria-hidden="true">
                      +1
                    </span>
                  )}
                </span>
              );
            })}

            <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5" aria-hidden="true">
              <svg viewBox="0 0 64 80" className="h-20 w-16 sm:h-24 sm:w-20">
                <defs>
                  <clipPath id="bin-body">
                    <path d="M10 18h44l-5 58H15z" />
                  </clipPath>
                </defs>
                <path d="M10 18h44l-5 58H15z" fill="#fbf8f1" />
                <g clipPath="url(#bin-body)">
                  <rect className="bin-fill" x="0" y="18" width="64" height="58" fill="#1e6a44" style={{ transform: `scaleY(${count / total})`, transformBox: "fill-box" }} />
                </g>
                <path d="M10 18h44l-5 58H15z" fill="none" stroke="#171713" strokeWidth="3" strokeLinejoin="round" />
                <rect x="6" y="10" width="52" height="9" rx="3" fill="#171713" />
                <path d="M26 10V5h12v5" fill="none" stroke="#171713" strokeWidth="3" />
                <path d="M26 40l6-6 6 6M32 34v16" fill="none" stroke="#d6f45c" strokeWidth="3" strokeLinecap="round" opacity={count / total > 0.5 ? 1 : 0} />
              </svg>
            </div>

            {done && (
              <div className="absolute inset-x-3 top-3 sm:inset-x-auto sm:left-6 sm:top-6 sm:max-w-md">
                <div className="fade-up rounded-2xl border-2 border-ink bg-paper p-5 shadow-[6px_6px_0_#171713] sm:p-6">
                  <p className="display text-3xl sm:text-4xl">Spotless. ✿</p>
                  <p className="mt-2 leading-relaxed text-ink-soft">
                    That took you seconds. Now picture a whole group of us doing this on a Sunday morning — that&apos;s
                    a Speak Up Gen drive.
                  </p>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ink mt-4 text-sm">
                    Come to the next one
                    <Arrow className="arrow h-4 w-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
