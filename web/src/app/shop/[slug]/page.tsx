import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductOptions } from "@/components/AddToCart";
import { ProductGallery } from "@/components/ProductGallery";
import { formatPrice, getProducts, getSettings, imageUrl } from "@/lib/sanity";

// Statischer Export: nur die beim Build bekannten Produkte gibt es als Seite
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

async function findProduct(slug: string) {
  return (await getProducts()).find((p) => p.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await findProduct((await params).slug);
  return product ? { title: product.name, description: product.description } : {};
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
          </div>
          {product.description && <p className="whitespace-pre-line text-lg text-muted">{product.description}</p>}
          {product.available ? (
            <ProductOptions
              product={{
                slug: product.slug,
                colors: product.colors,
                sizes: product.sizes,
                extras: product.extras,
                personalizable: product.personalizable,
                withSymbols: product.withSymbols,
                onRequest: product.onRequest,
              }}
              symbols={symbols}
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
          <p className="whitespace-pre-line leading-relaxed text-muted">{product.details}</p>
        </section>
      )}
    </div>
  );
}
