import { createOgImage, ogContentType, ogSize } from "../lib/og";
import { siteConfig } from "../lib/site";

export const alt = `Our Team — ${siteConfig.name}`;
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return createOgImage({
    title: "Faces behind the voice.",
    subtitle: "Meet the crew running Speak Up Gen",
    eyebrow: "Our team",
  });
}
