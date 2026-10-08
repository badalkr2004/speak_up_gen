import type { PillarIcon } from "../lib/content";

export function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true" fill="none">
      <path d="M4 10h11m-4.5-5L15 10l-4.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const paths: Record<PillarIcon, React.ReactNode> = {
  megaphone: (
    <>
      <path d="M5 13v6h4l11 6V7L9 13H5z" />
      <path d="M9 19l2 6h3l-1.5-5" />
      <path d="M24 12.5c1.4 1 2.2 2.2 2.2 3.5s-.8 2.5-2.2 3.5" />
    </>
  ),
  leaf: (
    <>
      <path d="M6 26C6 13 14 6 27 6c0 13-7 20-18 20" />
      <path d="M6 26c5-6 9-9 14-12" />
    </>
  ),
  mind: (
    <>
      <path d="M11 27v-4.5C7.7 20.6 6 17.6 6 14 6 8.5 10.5 5 16 5s10 3.7 10 9.2c0 1.3-.2 2.2-.7 3.1L27 21h-3v3c0 1.5-1.2 2.5-2.6 2.5H19V27" />
      <path d="M13 13.5c1-1.8 4-1.8 5 0s4 1.8 5 0" />
    </>
  ),
  hands: (
    <>
      <path d="M3 17l5-5 4 1 4-3 4 3 4-1 5 5" />
      <path d="M8 12l7 8c1 1.2 2.6 1.2 3.6 0" />
      <path d="M12 18l-2.5 2.5M14.5 21l-2 2M24 12l-6.5 7.5" />
    </>
  ),
  brush: (
    <>
      <path d="M26 5L14 17" />
      <path d="M14 17c-3-1-6 1-6 4 0 2-1 4-3 5 4 1 9 0 10.5-3 1-2 .5-4.5-1.5-6z" />
      <path d="M19 9l4 4" />
    </>
  ),
  bulb: (
    <>
      <path d="M12 22c0-2.5-4-4.5-4-9.5a8 8 0 0 1 16 0c0 5-4 7-4 9.5v1.5h-8V22z" />
      <path d="M13 27.5h6" />
      <path d="M16 3V1.5M5 6.5 4 5.5M27 6.5l1-1" />
    </>
  ),
};

export function PillarGlyph({ name, className }: { name: PillarIcon; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
