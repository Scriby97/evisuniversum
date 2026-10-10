import { createClient } from "@sanity/client";
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { defineQuery } from "groq";
import type { CATEGORIES_QUERY_RESULT, EVENTS_QUERY_RESULT, RichText, SETTINGS_QUERY_RESULT } from "../sanity.types";
import { e2eCategories, e2eEvents, e2eSettings } from "./e2e-fixtures";
import { placeholderCategories, placeholderEvents, placeholderSettings } from "./placeholder";

// E2E=1: feste Testdaten für die automatischen Tests (npm run test:e2e), unabhängig von Evis Inhalten
const e2e = process.env.E2E === "1";
const projectId = e2e ? undefined : process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

// Ohne Project-ID (lokal, bevor Sanity eingerichtet ist) werden Platzhalter angezeigt
const client = projectId
  ? createClient({ projectId, dataset, apiVersion: "2026-09-01", useCdn: false })
  : null;

// In den Tests zeigen Bild-URLs auf ein Fantasie-Projekt; die Tests beantworten diese Anfragen selbst
const builder = projectId || e2e ? createImageUrlBuilder({ projectId: projectId ?? "e2etest", dataset }) : null;

export type SanityImage = SanityImageSource & { alt?: string | null };

/** Text aus dem Studio-Editor (Blöcke) – oder reiner Text (Platzhalter, Standard-Datenschutztext) */
export type RichTextValue = string | RichText;

// Die Abfragen sind mit defineQuery markiert: `npm run typegen` im Ordner studio/ erzeugt daraus
// src/sanity.types.ts – die Typen unten passen dadurch immer zu Schema und Abfrage.
const SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings" && _id == "siteSettings"][0]`);

const CATEGORIES_QUERY = defineQuery(`*[_type == "category" && defined(slug.current)] | order(sortOrder asc, title asc) {
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
}`);

const EVENTS_QUERY = defineQuery(`*[_type == "event" && coalesce(endDate, date) >= $today] | order(date asc) {
  _id, title, date, endDate, time, location, description, link, image
}`);

type SettingsDocument = Omit<NonNullable<SETTINGS_QUERY_RESULT>, "_id" | "_type" | "_createdAt" | "_updatedAt" | "_rev">;
type RichTextKeys = { [K in keyof SettingsDocument]-?: NonNullable<SettingsDocument[K]> extends RichText ? K : never }[keyof SettingsDocument];
type Faq = NonNullable<SettingsDocument["faqs"]>[number];

/**
 * Website-Einstellungen ohne die Systemfelder des Dokuments. Lange Texte dürfen zusätzlich reiner Text sein,
 * damit Platzhalter und Testdaten sie ohne Editor-Blöcke liefern können.
 */
export type SiteSettings = Omit<SettingsDocument, RichTextKeys | "faqs"> & {
  [K in RichTextKeys]?: RichTextValue;
} & { faqs?: (Omit<Faq, "answer"> & { answer: RichTextValue })[] };
export type Category = CATEGORIES_QUERY_RESULT[number];
export type Product = Category["products"][number];
export type CustomField = NonNullable<Product["customFields"]>[number];
export type Event = EVENTS_QUERY_RESULT[number];

export async function getSettings(): Promise<SiteSettings> {
  if (e2e) return e2eSettings;
  if (!client) return placeholderSettings;
  return (await client.fetch(SETTINGS_QUERY)) ?? {};
}

export async function getCategories(): Promise<Category[]> {
  if (e2e) return e2eCategories;
  if (!client) return placeholderCategories;
  return client.fetch(CATEGORIES_QUERY);
}

export async function getProducts(): Promise<Product[]> {
  return (await getCategories()).flatMap((c) => c.products);
}

// Vergangene Events fallen beim nächsten Build (= nächste Änderung im Studio) weg
export async function getUpcomingEvents(): Promise<Event[]> {
  const today = new Date().toISOString().slice(0, 10);
  if (e2e) return e2eEvents;
  if (!client) return placeholderEvents;
  return client.fetch(EVENTS_QUERY, { today });
}

/** Bild-URL; mit `crop` schneidet Sanity auf dieses Seitenverhältnis zu – nach dem Bildausschnitt (Hotspot) im Studio */
export function imageUrl(image?: SanityImage | null, crop?: { width: number; height: number }): string | null {
  if (!builder || !image) return null;
  const img = builder.image(image);
  return (crop ? img.width(crop.width).height(crop.height).fit("crop") : img).url();
}

export { formatPrice } from "./format";

// Vorschaubild beim Teilen (WhatsApp, Facebook, …): 1200×630, ganzes Foto auf Creme-Hintergrund – so wird das Motiv nie abgeschnitten
export const ogImageSize = { width: 1200, height: 630 };
export function ogImageUrl(image?: SanityImage): string | null {
  if (!builder || !image) return null;
  return builder.image(image).ignoreImageParams().width(ogImageSize.width).height(ogImageSize.height).fit("fill").bg("f8f3ec").format("jpg").quality(80).url();
}
