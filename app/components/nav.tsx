"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logoInk from "../../public/brand/logo-ink.png";
import { WHATSAPP_URL } from "../lib/content";

const HOME_LINKS = [
  { href: "/#story", label: "Story" },
  { href: "/#what-we-do", label: "What we do" },
  { href: "/#try", label: "Try a drive" },
  { href: "/team", label: "Team" },
  { href: "/#join", label: "Join" },
];

export function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setSolid(y > 24);
      if (Math.abs(y - last) > 8) {
        setHidden(y > last && y > 480);
        last = y;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,box-shadow] duration-500 ease-(--ease-soft) ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${solid || !onHome ? "bg-paper/92 shadow-[0_1px_0_rgb(23_23_19/0.08)]" : "bg-transparent"}`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-6 sm:h-[4.5rem]">
        <Link href="/" className="group flex items-center" aria-label="Speak Up Gen — home">
          <Image
            src={logoInk}
            alt="Speak Up Gen"
            preload
            className="h-12 w-auto transition-transform duration-500 ease-(--ease-spring) group-hover:-rotate-3 group-hover:scale-105 sm:h-14"
          />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {HOME_LINKS.map((l) => {
            const active = l.href === "/team" && pathname === "/team";
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`group relative text-sm font-medium ${active ? "text-leaf" : ""}`}
              >
                {l.label}
                <span
                  className={`absolute -bottom-1 left-0 h-[1.5px] w-full bg-current transition-transform duration-400 ease-(--ease-soft) ${
                    active
                      ? "origin-left scale-x-100"
                      : "origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ink !px-4 !py-2.5 text-sm">
          <span className="h-2 w-2 rounded-full bg-lime" />
          Join us
        </a>
      </div>
      <div className="scroll-progress h-[2px] bg-leaf" />
    </header>
  );
}
