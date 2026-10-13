import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// Alles erlaubt; auch im Wartungsmodus bleibt die Seite für Google lesbar
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://evisuniversum.ch/sitemap.xml",
  };
}
