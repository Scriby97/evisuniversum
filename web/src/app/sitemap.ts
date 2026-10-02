import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/sanity";

// Statischer Export: wird beim Build als out/sitemap.xml erzeugt
export const dynamic = "force-static";

const base = "https://evisuniversum.ch";
const pages = ["", "/shop", "/ueber-mich", "/maerkte-events", "/kontakt", "/faq", "/agb", "/impressum", "/datenschutz"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  return [
    ...pages.map((path) => ({ url: `${base}${path}` })),
    ...products.map((p) => ({ url: `${base}/shop/${p.slug}` })),
  ];
}
