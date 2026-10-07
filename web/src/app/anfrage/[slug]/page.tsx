import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InquiryForm } from "@/components/InquiryForm";
import { SanityImage } from "@/components/SanityImage";
import { formatPrice, getProducts, getSettings } from "@/lib/sanity";

// Statischer Export: für jedes Produkt eine Anfrageseite (verlinkt wird sie nur bei «Auf Anfrage»)
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

async function findProduct(slug: string) {
  return (await getProducts()).find((p) => p.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await findProduct((await params).slug);
  return product ? { title: `Anfrage: ${product.name}`, robots: { index: false } } : {};
}

export default async function InquiryPage({ params }: { params: Promise<{ slug: string }> }) {
  const [product, settings] = await Promise.all([findProduct((await params).slug), getSettings()]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href={`/shop/${product.slug}`} className="text-sm text-accent hover:text-accent-dark">
        ← Zurück zum Produkt
      </Link>
      <h1 className="mt-6 font-serif text-4xl font-medium sm:text-5xl">Anfrage</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Dieses Produkt fertige ich auf Anfrage an. Schreib mir, was du dir wünschst – ich prüfe, ob ich es umsetzen
        kann, und melde mich bei dir.
      </p>

      <div className="mt-8 grid gap-10 md:grid-cols-[2fr_3fr]">
        <div className="self-start overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="relative aspect-square">
            <SanityImage image={product.images?.[0]} alt={product.name} sizes="(min-width: 768px) 380px, 100vw" />
          </div>
          <div className="p-5">
            <p className="font-serif text-xl font-medium">{product.name}</p>
            <p className="text-muted">{formatPrice(product.price)}</p>
            {product.description && <p className="mt-2 text-sm text-muted">{product.description}</p>}
          </div>
        </div>
        <InquiryForm
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
          productName={product.name}
          price={product.price}
          symbols={(settings.motifs ?? []).map((m) => m.name)}
          notePlaceholder={settings.notePlaceholder || "z. B. Blauer Flamingo"}
          namePlaceholder={settings.namePlaceholder || "z. B. Alina"}
        />
      </div>
    </div>
  );
}
