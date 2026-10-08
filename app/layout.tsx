import type { Metadata, Viewport } from "next";
import { Archivo, Caveat } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Speak Up Gen — Your Voice. Your Ideas. Your Action.",
  description:
    "Speak Up Gen is a youth-driven initiative where young minds come together to spread awareness, share ideas and take meaningful action — from clean-up drives to conversations that matter.",
  keywords: [
    "Speak Up Gen",
    "youth initiative",
    "clean-up drive",
    "social awareness",
    "environmental awareness",
    "volunteering",
    "Gen Z",
  ],
  openGraph: {
    title: "Speak Up Gen",
    description: "Your Voice. Your Ideas. Your Action. A youth-driven initiative for social & environmental change.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f3ede2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
