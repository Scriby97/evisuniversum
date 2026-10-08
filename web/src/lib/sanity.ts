import { createClient } from "@sanity/client";
import type { PortableTextBlock } from "@portabletext/react";
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { placeholderCategories, placeholderEvents, placeholderSettings } from "./placeholder";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

// Ohne Project-ID (lokal, bevor Sanity eingerichtet ist) werden Platzhalter angezeigt
const client = projectId
  ? createClient({ projectId, dataset, apiVersion: "2026-09-01", useCdn: false })
  : null;

const builder = projectId ? createImageUrlBuilder({ projectId, dataset }) : null;

export type SanityImage = SanityImageSource & { alt?: string };

/** Text aus dem Studio-Editor (Blöcke) – oder älterer reiner Text */
export type RichTextValue = string | PortableTextBlock[];

export type SiteSettings = {
  comingSoon?: boolean;
  comingSoonText?: string;
  previewPassword?: string;
  siteName?: string;
  logo?: SanityImage;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: SanityImage;
  heroText?: string;
  highlights?: { _key: string; title: string; text?: string; image?: SanityImage; link?: string }[];
  values?: string[];
  featuredProducts?: { _ref: string }[];
  personalizationTitle?: string;
  personalizationText?: RichTextValue;
  notePlaceholder?: string;
  namePlaceholder?: string;
  motifs?: { _key: string; name: string; image?: SanityImage }[];
  aboutTitle?: string;
  aboutText?: RichTextValue;
  aboutImage?: SanityImage;
  orderInfo?: RichTextValue;
  shippingInfo?: RichTextValue;
  shippingOptions?: { _key: string; name: string; price: number }[];
  /** alt: einzelner Versandpreis vor den Versandarten */
  shippingCost?: number;
  giftWrapPrice?: number;
  twintQr?: SanityImage;
  freeShippingFrom?: number;
  faqs?: { _key: string; question: string; answer: RichTextValue }[];
  ownerName?: string;
  address?: string;
  email?: string;
  instagram?: string;
  agbText?: RichTextValue;
  privacyText?: RichTextValue;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  colors?: string[];
  sizes?: string[];
  extras?: { _key: string; name: string; price: number }[];
  customFields?: CustomField[];
  description?: string;
  details?: RichTextValue;
  images?: SanityImage[];
  personalizable: boolean;
  withSymbols: boolean;
  withNote: boolean;
  withName: boolean;
  onRequest: boolean;
  /** Anzahl an Lager; null = Bestand wird nicht gezählt (Sanity liefert leere Felder als null) */
  stock?: number | null;
  digital: boolean;
  available: boolean;
};

export type CustomField = {
  _key: string;
  label: string;
  kind: "select" | "text";
  options?: string[];
  required?: boolean;
};

export type Category = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  products: Product[];
};

export type Event = {
  _id: string;
  title: string;
  date: string;
  endDate?: string;
  time?: string;
  location?: string;
  description?: string;
  link?: string;
};

export async function getSettings(): Promise<SiteSettings> {
  if (!client) return placeholderSettings;
  return (await client.fetch<SiteSettings | null>(`*[_id == "siteSettings"][0]`)) ?? {};
}

export async function getCategories(): Promise<Category[]> {
  if (!client) return placeholderCategories;
  return client.fetch<Category[]>(
    `*[_type == "category" && defined(slug.current)] | order(sortOrder asc, title asc) {
      _id, title, "slug": slug.current, description,
      "products": *[_type == "product" && references(^._id) && defined(slug.current)]
        | order(sortOrder asc, name asc) {
          _id, name, "slug": slug.current, price, colors, sizes, extras, customFields, description, details, images,
          "personalizable": coalesce(personalizable, false),
          "withSymbols": coalesce(withSymbols, true),
          "withNote": coalesce(withNote, true),
          "withName": coalesce(withName, false),
          // Bestand 0 → automatisch «Auf Anfrage»
          "onRequest": coalesce(onRequest, false) || (defined(stock) && stock <= 0),
          stock,
          "digital": coalesce(digital, false),
          "available": coalesce(available, true)
        }
    }`,
  );
}

export async function getProducts(): Promise<Product[]> {
  return (await getCategories()).flatMap((c) => c.products);
}

// Vergangene Events fallen beim nächsten Build (= nächste Änderung im Studio) weg
export async function getUpcomingEvents(): Promise<Event[]> {
  const today = new Date().toISOString().slice(0, 10);
  if (!client) return placeholderEvents;
  return client.fetch<Event[]>(
    `*[_type == "event" && coalesce(endDate, date) >= $today] | order(date asc) {
      _id, title, date, endDate, time, location, description, link
    }`,
    { today },
  );
}

export function imageUrl(image?: SanityImage): string | null {
  if (!builder || !image) return null;
  return builder.image(image).url();
}

export { formatPrice } from "./format";

// Vorschaubild beim Teilen (WhatsApp, Facebook, …): 1200×630, Ausschnitt nach dem Hotspot im Studio
export const ogImageSize = { width: 1200, height: 630 };
export function ogImageUrl(image?: SanityImage): string | null {
  if (!builder || !image) return null;
  return builder.image(image).width(ogImageSize.width).height(ogImageSize.height).fit("crop").format("jpg").quality(80).url();
}
