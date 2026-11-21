import type { Product, SiteSettings } from "./sanity";

export const siteUrl = "https://evisuniversum.ch";

type ShippingOption = { price?: number | null; envelope?: boolean | null };

/**
 * Produktdaten für Google (schema.org/Product als JSON-LD), unsichtbar im Quelltext der Produktseite.
 * Damit kann Google Preis und Verfügbarkeit im Suchergebnis zeigen und das Produkt später im Shopping-Tab
 * (Google Merchant Center) übernehmen. Alles kommt aus dem Studio – Preis- oder Bestandsänderungen gelten
 * beim nächsten Build.
 *
 * Kein JSON-LD für Produkte, die man nicht direkt kaufen kann (auf Anfrage, Ab-Preis, Preis auf Anfrage):
 * Google verlangt ein Angebot mit festem Preis.
 */
export function productJsonLd(product: Product, settings: SiteSettings, images: string[]) {
  const soldOutToOrder = typeof product.stock === "number" && product.stock <= 0; // Lager 0 = auf Anfrage
  if (product.onRequest || soldOutToOrder || product.priceMode !== "fixed" || !(product.price > 0)) return null;

  const url = `${siteUrl}/shop/${product.slug}`;
  const shippingOptions: ShippingOption[] = settings.shippingOptions ?? [];
  // Ein einzelnes Produkt passt immer in die Versandtasche, sofern es eine gibt – sonst die günstigste Versandart
  const envelopes = shippingOptions.filter((o) => o.envelope && typeof o.price === "number");
  const candidates = envelopes.length ? envelopes : shippingOptions.filter((o) => typeof o.price === "number");
  const shippingPrice = product.digital ? 0 : candidates.length ? Math.min(...candidates.map((o) => o.price as number)) : null;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    ...(images.length ? { image: images.slice(0, 5) } : {}),
    sku: product._id,
    brand: { "@type": "Brand", name: settings.siteName ?? "evi’s universum" },
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "CHF",
      price: product.price.toFixed(2),
      itemCondition: "https://schema.org/NewCondition",
      availability: product.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      ...(shippingPrice !== null
        ? {
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: { "@type": "MonetaryAmount", value: shippingPrice.toFixed(2), currency: "CHF" },
              shippingDestination: { "@type": "DefinedRegion", addressCountry: "CH" },
            },
          }
        : {}),
      // Personalisierte Produkte sind laut AGB vom Umtausch ausgeschlossen. Für die übrigen Produkte gibt es noch
      // keine festgelegte Rückgaberegel – darum dort keine Angabe.
      ...(product.personalizable
        ? {
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "CH",
              returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
            },
          }
        : {}),
    },
  };
}

/** JSON für ein <script type="application/ld+json">; «<» maskiert, damit Texte aus dem Studio kein HTML einschleusen */
export function jsonLdScript(data: object) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
