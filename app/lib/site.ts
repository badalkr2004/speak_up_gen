export const siteConfig = {
  name: "Speak Up Gen",
  shortName: "Speak Up Gen",
  tagline: "Speak today. Shape the way.",
  description:
    "Speak Up Gen is a youth-driven initiative where young minds come together to spread awareness, share ideas and take meaningful action — from clean-up drives to conversations that matter.",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000",
  locale: "en_IN",
  keywords: [
    "Speak Up Gen",
    "youth initiative",
    "Gen Z NGO",
    "clean-up drive",
    "social awareness",
    "environmental awareness",
    "youth volunteering",
    "community action",
    "mental health awareness",
    "student NGO India",
  ],
  social: {
    instagram: "https://www.instagram.com/speak_up_gen/",
    whatsapp: "https://chat.whatsapp.com/EoXX6cNmfCM8HisDiU77AX?s=cl&p=a&mlu=4&ilr=4",
  },
} as const;

export function absoluteUrl(path = "/") {
  const base = siteConfig.url;
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
