import type { Metadata } from "next";
import { Nav } from "./components/nav";
import { Hero } from "./components/hero";
import { Story } from "./components/story";
import { Pillars } from "./components/pillars";
import { CleanupGame } from "./components/cleanup-game";
import { WhyJoin } from "./components/why-join";
import { WhoCanJoin } from "./components/who-can-join";
import { Manifesto } from "./components/manifesto";
import { Join } from "./components/join";
import { Footer } from "./components/footer";
import { Reveals } from "./components/reveals";
import { siteConfig } from "./lib/site";

export const metadata: Metadata = {
  title: {
    absolute: `${siteConfig.name} — ${siteConfig.tagline}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
};

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Story />
        <Pillars />
        <CleanupGame />
        <WhyJoin />
        <WhoCanJoin />
        <Manifesto />
        <Join />
      </main>
      <Footer />
      <Reveals />
    </>
  );
}
