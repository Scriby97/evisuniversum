import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// Solange die Seite im Aufbau ist, verhindert das «noindex» im HTML die Aufnahme bei Google
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://evisuniversum.ch/sitemap.xml",
  };
}
