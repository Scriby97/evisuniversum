import type { Metadata } from "next";
import { RichText } from "@/components/RichText";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MailIcon, ProductOptions } from "@/components/AddToCart";
import { ProductGallery } from "@/components/ProductGallery";
import { formatPrice, getProducts, getSettings, imageUrl, ogImageSize, ogImageUrl } from "@/lib/sanity";

// Statischer Export: nur die beim Build bekannten Produkte gibt es als Seite
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

async function findProduct(slug: string) {
  return (await getProducts()).find((p) => p.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const [product, settings] = await Promise.all([findProduct((await params).slug), getSettings()]);
  if (!product) return {};
  const image = product.images?.[0];
  const ogImage = ogImageUrl(image);
  return {
    title: product.name,
    description: product.description,
    // Ersetzt das allgemeine Vorschaubild aus dem Layout durch das erste Produktfoto
    openGraph: ogImage
      ? {
          url: `/shop/${product.slug}`,
          siteName: settings.siteName ?? "evi’s universum",
          locale: "de_CH",
          images: [{ url: ogImage, ...ogImageSize, alt: image?.alt || product.name }],
        }
      : undefined,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const [product, settings] = await Promise.all([findProduct((await params).slug), getSettings()]);
  if (!product) notFound();

  const images = (product.images ?? []).flatMap((image) => {
    const src = imageUrl(image);
    return src ? [{ src, alt: image.alt || product.name }] : [];
  });
  const symbols = (settings.motifs ?? []).map((m) => m.name);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/shop" className="text-sm text-accent hover:text-accent-dark">
        ← Zurück zum Shop
      </Link>
      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="self-start overflow-hidden rounded-2xl bg-white pb-3 shadow-sm">
          <ProductGallery images={images} sizes="(min-width: 768px) 560px, 100vw" />
        </div>
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="font-serif text-4xl font-medium sm:text-5xl">{product.name}</h1>
            <p className="mt-2 text-xl text-muted">{formatPrice(product.price)}</p>
            {product.available && typeof product.stock === "number" && (
              <p className="mt-1 text-sm text-accent">
                {product.stock > 0
                  ? `Noch ${product.stock} an Lager`
                  : "Zurzeit nicht an Lager – gerne auf Anfrage"}
              </p>
            )}
          </div>
          {product.description && <p className="whitespace-pre-line text-lg text-muted">{product.description}</p>}
          {product.onRequest ? (
            <div className="flex flex-col items-start gap-3 rounded-2xl bg-mint/40 p-5">
              <p className="text-sm">
                Dieses Produkt fertige ich auf Anfrage an. Schreib mir deinen Wunsch – ich prüfe, ob ich ihn umsetzen
                kann, und melde mich bei dir.
              </p>
              <Link
                href={`/anfrage/${product.slug}`}
                className="flex items-center gap-1.5 rounded-full bg-accent px-6 py-3 text-white hover:bg-accent-dark"
              >
                <MailIcon />
                Anfrage stellen
              </Link>
            </div>
          ) : product.available ? (
            <ProductOptions
              product={{
                slug: product.slug,
                colors: product.colors,
                sizes: product.sizes,
                extras: product.extras,
                customFields: product.customFields,
                personalizable: product.personalizable,
                withSymbols: product.withSymbols,
                withNote: product.withNote,
                withName: product.withName,
                onRequest: product.onRequest,
              }}
              symbols={symbols}
              notePlaceholder={settings.notePlaceholder || "z. B. Blauer Flamingo"}
              namePlaceholder={settings.namePlaceholder || "z. B. Alina"}
            />
          ) : (
            <p className="rounded-lg bg-sand p-3 text-sm">Dieses Produkt ist im Moment leider ausverkauft.</p>
          )}
          {product.digital && (
            <p className="text-sm text-muted">Digitales Produkt – du erhältst es per E-Mail, ohne Versandkosten.</p>
          )}
        </div>
      </div>
      {product.details && (
        <section className="mt-12 max-w-3xl">
          <h2 className="mb-3 font-serif text-3xl font-medium">Details</h2>
          <RichText value={product.details} className="leading-relaxed text-muted" />
        </section>
      )}
    </div>
  );
}
