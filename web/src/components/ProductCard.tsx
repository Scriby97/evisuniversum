import { formatPrice, imageUrl, type Product } from "@/lib/sanity";
import { AddToCart } from "./AddToCart";
import { ProductGallery } from "./ProductGallery";

export function ProductCard({ product, symbols }: { product: Product; symbols: string[] }) {
  const images = (product.images ?? []).flatMap((image) => {
    const src = imageUrl(image);
    return src ? [{ src, alt: image.alt || product.name }] : [];
  });

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="relative">
        <ProductGallery images={images} sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" />
        {!product.available && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs text-white">
            Ausverkauft
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-serif text-xl font-medium">{product.name}</h3>
          <span className="shrink-0 text-muted">{formatPrice(product.price)}</span>
        </div>
        {(product.personalizable || product.digital) && (
          <div className="flex gap-2 text-xs">
            {product.personalizable && (
              <span className="rounded-full bg-mint/60 px-2 py-0.5 text-ink">personalisierbar</span>
            )}
            {product.digital && <span className="rounded-full bg-sand px-2 py-0.5 text-ink">digital</span>}
          </div>
        )}
        {product.description && (
          <p className="whitespace-pre-line text-sm text-muted">{product.description}</p>
        )}
        {product.available && (
          <AddToCart slug={product.slug} personalizable={product.personalizable} symbols={symbols} />
        )}
      </div>
    </article>
  );
}
