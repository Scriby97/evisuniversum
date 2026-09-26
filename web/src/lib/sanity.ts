import { createClient } from "@sanity/client";
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
  personalizationTitle?: string;
  personalizationText?: string;
  motifs?: { _key: string; name: string; image?: SanityImage }[];
  aboutTitle?: string;
  aboutText?: string;
  aboutImage?: SanityImage;
  orderInfo?: string;
  shippingInfo?: string;
  shippingCost?: number;
  freeShippingFrom?: number;
  faqs?: { _key: string; question: string; answer: string }[];
  ownerName?: string;
  address?: string;
  email?: string;
  instagram?: string;
  agbText?: string;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  sizes?: string[];
  description?: string;
  images?: SanityImage[];
  personalizable: boolean;
  digital: boolean;
  available: boolean;
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
          _id, name, "slug": slug.current, price, sizes, description, images,
          "personalizable": coalesce(personalizable, false),
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

export function formatPrice(price: number) {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(price);
}
