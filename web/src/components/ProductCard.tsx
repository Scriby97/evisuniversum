import Link from "next/link";
import { formatPrice, type Product } from "@/lib/sanity";
import { QuickAdd } from "./AddToCart";
import { SanityImage } from "./SanityImage";

export function ProductCard({ product }: { product: Product }) {
  const href = `/shop/${product.slug}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="relative aspect-square">
        <Link href={href} aria-label={product.name} className="absolute inset-0">
          <SanityImage
            image={product.images?.[0]}
            alt={product.name}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          />
        </Link>
        {!product.available && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs text-white">
            Ausverkauft
          </span>
        )}
        {product.available && (
          <div className="absolute bottom-3 right-3">
            <QuickAdd
              product={{
                slug: product.slug,
                colors: product.colors,
                sizes: product.sizes,
                extras: product.extras,
                customFields: product.customFields,
                personalizable: product.personalizable,
                withSymbols: product.withSymbols,
                onRequest: product.onRequest,
              }}
            />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-serif text-xl font-medium leading-snug">
            <Link href={href} className="hover:text-accent">
              {product.name}
            </Link>
          </h3>
          <span className="text-muted">{formatPrice(product.price)}</span>
        </div>
        {(product.personalizable || product.digital || product.onRequest) && (
          <div className="flex flex-wrap gap-2 text-xs">
            {product.personalizable && <span className="rounded-full bg-mint/60 px-2 py-0.5">personalisierbar</span>}
            {product.digital && <span className="rounded-full bg-sand px-2 py-0.5">digital</span>}
            {product.onRequest && <span className="rounded-full bg-sand px-2 py-0.5">auf Anfrage</span>}
          </div>
        )}
        {product.description && <p className="line-clamp-3 text-sm text-muted">{product.description}</p>}
        <Link href={href} className="mt-auto self-start pt-1 text-sm text-accent hover:text-accent-dark">
          Mehr erfahren →
        </Link>
      </div>
    </article>
  );
}
