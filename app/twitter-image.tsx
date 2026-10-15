import { createOgImage, ogContentType, ogSize } from "./lib/og";
import { siteConfig } from "./lib/site";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return createOgImage({
    title: "Your voice. Your ideas. Your action.",
    subtitle: siteConfig.tagline,
  });
}
