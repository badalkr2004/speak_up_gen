import { TEAM } from "../lib/content";
import { absoluteUrl, siteConfig } from "../lib/site";

export function JsonLd() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: siteConfig.name,
    alternateName: "SpeakUpGen",
    url: siteConfig.url,
    logo: absoluteUrl("/brand/logo-badge.png"),
    image: absoluteUrl("/opengraph-image"),
    description: siteConfig.description,
    slogan: siteConfig.tagline,
    sameAs: [siteConfig.social.instagram],
    foundingDate: "2024",
    areaServed: "IN",
    knowsAbout: [
      "Social awareness",
      "Environmental action",
      "Youth volunteering",
      "Community campaigns",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "community",
      url: siteConfig.social.whatsapp,
    },
    member: TEAM.map((m) => ({
      "@type": "Person",
      name: m.name,
      jobTitle: m.role,
      image: absoluteUrl(m.image),
      ...(m.phone
        ? {
            telephone: m.phone.replace(/\s+/g, ""),
          }
        : {}),
    })),
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en-IN",
    publisher: {
      "@type": "NGO",
      name: siteConfig.name,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
