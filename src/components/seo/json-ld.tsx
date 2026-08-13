import { brand, publicAppUrl } from "@/lib/config";

export function SiteJsonLd() {
  const origin = publicAppUrl();
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        name: brand.name,
        url: origin,
        slogan: brand.tagline,
        logo: `${origin}/brand/ratequip-logo.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        name: brand.name,
        url: origin,
        publisher: { "@id": `${origin}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${origin}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
