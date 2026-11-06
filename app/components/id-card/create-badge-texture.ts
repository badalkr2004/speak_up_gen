export type BadgeTextureInput = {
  name: string;
  memberCode: string;
  role: string;
  unitName: string;
  kindLabel?: string | null;
  photoUrl?: string | null;
  userImage?: string | null;
};

const C = {
  bg: "#0c0c0c",
  ink: "#ffffff",
  mute: "#8a8a82",
  line: "#262626",
  lime: "#d6f45c",
  leaf: "#1e6a44",
};

const MONO = "'JetBrains Mono', Consolas, 'SFMono-Regular', monospace";

let brandFamily = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

function font() {
  return brandFamily;
}

/** Canvas can only use a webfont once it has loaded; Archivo comes from next/font in the root layout. */
export async function loadBrandFont() {
  const family = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-archivo")
    .trim();
  if (!family) return;
  brandFamily = `${family}, Arial, sans-serif`;
  await Promise.all(
    ["600", "700", "800"].map((w) => document.fonts.load(`${w} 40px ${family}`)),
  ).catch(() => undefined);
}

/** Logical card size; the canvas is rendered at 2x for crisp text. */
export const BADGE_W = 1024;
export const BADGE_H = 1434;
/** Distance from the card top to the slot centre, in logical px. */
export const BADGE_SLOT_Y = 52;

export function createBadgeTextureSync(data: BadgeTextureInput): HTMLCanvasElement {
  return paintBadge(data, null);
}

export async function createBadgeTexture(
  data: BadgeTextureInput,
): Promise<HTMLCanvasElement> {
  const [photo] = await Promise.all([
    loadFace(data.photoUrl, data.userImage),
    loadBrandFont(),
  ]);
  return paintBadge(data, photo);
}

function paintBadge(
  data: BadgeTextureInput,
  photo: HTMLImageElement | null,
): HTMLCanvasElement {
  const W = BADGE_W;
  const H = BADGE_H;
  const SCALE = 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);
  ctx.imageSmoothingQuality = "high";

  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W * 0.15, H * 0.05, 0, W * 0.15, H * 0.05, W);
  glow.addColorStop(0, "rgba(214,244,92,0.10)");
  glow.addColorStop(1, "rgba(214,244,92,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Punched slot the metal ring passes through
  roundRect(ctx, W / 2 - 80, BADGE_SLOT_Y - 16, 160, 32, 16);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.strokeStyle = "#2c2c2c";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Header row
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = C.ink;
  ctx.font = `800 30px ${font()}`;
  spaced(ctx, "4px");
  ctx.fillText("SPEAK UP GEN", 72, 170);
  ctx.fillStyle = C.lime;
  ctx.textAlign = "right";
  ctx.fillText("MEMBER", W - 72, 170);
  ctx.textAlign = "left";
  spaced(ctx, "0px");

  ctx.fillStyle = C.line;
  ctx.fillRect(72, 206, W - 144, 2);

  // Portrait
  const cx = W / 2;
  const cy = 480;
  const r = 180;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  if (photo) drawCover(ctx, photo, cx - r, cy - r, r * 2, r * 2);
  else drawInitials(ctx, data.name, cx - r, cy - r, r * 2);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, r + 10, 0, Math.PI * 2);
  ctx.strokeStyle = C.lime;
  ctx.lineWidth = 6;
  ctx.stroke();

  // Name
  ctx.textAlign = "center";
  ctx.fillStyle = C.ink;
  let size = 92;
  ctx.font = `800 ${size}px ${font()}`;
  const name = data.name || "Member";
  while (ctx.measureText(name).width > W - 144 && size > 54) {
    size -= 4;
    ctx.font = `800 ${size}px ${font()}`;
  }
  ctx.fillText(name, cx, 790);

  // Role pill
  const role = (data.role || "member").replaceAll("_", " ").toUpperCase();
  ctx.font = `800 26px ${font()}`;
  spaced(ctx, "3px");
  const pillW = ctx.measureText(role).width + 64;
  roundRect(ctx, cx - pillW / 2, 830, pillW, 56, 28);
  ctx.fillStyle = C.lime;
  ctx.fill();
  ctx.fillStyle = "#0c0c0c";
  ctx.fillText(role, cx, 868);
  spaced(ctx, "0px");

  // Chapter
  ctx.fillStyle = C.mute;
  ctx.font = `600 32px ${font()}`;
  const chapter = data.kindLabel
    ? `${data.unitName} · ${data.kindLabel}`
    : data.unitName || "";
  if (chapter) ctx.fillText(truncate(ctx, chapter, W - 144), cx, 950);

  // Footer: member code
  ctx.fillStyle = C.line;
  ctx.fillRect(72, 1080, W - 144, 2);

  ctx.textAlign = "left";
  ctx.fillStyle = C.mute;
  ctx.font = `700 22px ${font()}`;
  spaced(ctx, "4px");
  ctx.fillText("MEMBER ID", 72, 1150);
  spaced(ctx, "0px");
  ctx.fillStyle = C.ink;
  ctx.font = `700 52px ${MONO}`;
  ctx.fillText(truncate(ctx, data.memberCode || "PENDING", W - 144), 72, 1222);

  ctx.fillStyle = C.mute;
  ctx.font = `600 26px ${font()}`;
  ctx.fillText("Speak today. Shape the way.", 72, 1340);

  ctx.fillStyle = C.lime;
  ctx.fillRect(W - 72 - 56, 1326, 56, 8);

  return canvas;
}

/** Strap fabric. MeshLine maps U along the strap, V across it. */
/** One label per tile, so the strap repeat never cuts a word at the seam. */
export function createBandTexture(): HTMLCanvasElement {
  const h = 256;
  const label = "SPEAK UP GEN";
  const gap = 140;

  const measure = document.createElement("canvas").getContext("2d")!;
  setBandFont(measure);
  const lw = Math.ceil(measure.measureText(label).width);
  const w = lw + gap;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#101010";
  ctx.fillRect(0, 0, w, h);

  // Subtle weave
  for (let y = 0; y < h; y += 6) {
    ctx.fillStyle = y % 12 === 0 ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.22)";
    ctx.fillRect(0, y, w, 3);
  }
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.fillRect(0, 18, w, 3);
  ctx.fillRect(0, h - 21, w, 3);

  setBandFont(ctx);
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(label, gap / 2, h / 2 + 4);

  ctx.fillStyle = "#d6f45c";
  ctx.beginPath();
  ctx.arc(w - 1, h / 2, 9, 0, Math.PI * 2);
  ctx.arc(1, h / 2, 9, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

function setBandFont(ctx: CanvasRenderingContext2D) {
  ctx.font = `800 120px ${font()}`;
  if ("fontStretch" in ctx) {
    (ctx as CanvasRenderingContext2D & { fontStretch: string }).fontStretch = "condensed";
  }
  spaced(ctx, "6px");
}

function spaced(ctx: CanvasRenderingContext2D, value: string) {
  if ("letterSpacing" in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = value;
  }
}

function truncate(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > max) t = t.slice(0, -1);
  return `${t}…`;
}

async function loadFace(
  photoUrl?: string | null,
  userImage?: string | null,
): Promise<HTMLImageElement | null> {
  for (const url of [userImage, photoUrl].filter(Boolean) as string[]) {
    const u = url.toLowerCase();
    if (u.includes("/brand/") || u.includes("logo")) continue;
    const img = await loadImage(url);
    if (!img || looksLikeLogo(img)) continue;
    return img;
  }
  return null;
}

/** Mostly-white images are logo stickers, not portraits. */
function looksLikeLogo(img: HTMLImageElement) {
  const c = document.createElement("canvas");
  c.width = 32;
  c.height = 32;
  const ctx = c.getContext("2d");
  if (!ctx) return false;
  ctx.drawImage(img, 0, 0, 32, 32);
  const { data } = ctx.getImageData(0, 0, 32, 32);
  let bright = 0;
  let n = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3]! < 20) continue;
    n++;
    if ((data[i]! + data[i + 1]! + data[i + 2]!) / 3 > 195) bright++;
  }
  return n > 0 && bright / n > 0.4;
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const ir = img.width / img.height;
  const tr = w / h;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;
  if (ir > tr) {
    sw = img.height * tr;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / tr;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function drawInitials(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  size: number,
) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  const g = ctx.createLinearGradient(x, y, x + size, y + size);
  g.addColorStop(0, C.leaf);
  g.addColorStop(1, "#0a2a1c");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = C.lime;
  ctx.font = `800 ${Math.round(size * 0.36)}px ${font()}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials || "SUG", x + size / 2, y + size / 2 + 6);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
