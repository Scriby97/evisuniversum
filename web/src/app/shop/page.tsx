import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { SanityImage } from "@/components/SanityImage";
import { getCategories, getSettings } from "@/lib/sanity";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage() {
  const [settings, allCategories] = await Promise.all([getSettings(), getCategories()]);
  const categories = allCategories.filter((c) => c.products.length > 0);
  const symbols = (settings.motifs ?? []).map((m) => m.name);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-6 font-script text-6xl">Shop</h1>

      <nav className="mb-12 flex flex-wrap gap-2 text-sm">
        {categories.map((c) => (
          <a key={c._id} href={`#${c.slug}`} className="rounded-full bg-sand px-4 py-1.5 hover:bg-accent hover:text-white">
            {c.title}
          </a>
        ))}
        <a href="#personalisierung" className="rounded-full bg-mint/60 px-4 py-1.5 hover:bg-accent hover:text-white">
          Personalisierung
        </a>
      </nav>

      {categories.length === 0 && <p className="text-muted">Bald gibt es hier Produkte zu entdecken.</p>}

      {categories.map((c) => (
        <section key={c._id} id={c.slug} className="mb-16">
          <h2 className="font-serif text-4xl">{c.title}</h2>
          {c.description && <p className="mt-2 text-muted">{c.description}</p>}
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {c.products.map((product) => (
              <ProductCard key={product._id} product={product} symbols={symbols} />
            ))}
          </div>
        </section>
      ))}

      <section id="personalisierung" className="rounded-3xl bg-sand/60 p-8 sm:p-12">
        <h2 className="font-serif text-4xl">{settings.personalizationTitle ?? "Personalisierung"}</h2>
        {settings.personalizationText && (
          <p className="mt-4 max-w-3xl whitespace-pre-line text-muted">{settings.personalizationText}</p>
        )}
        {settings.motifs && settings.motifs.length > 0 && (
          <>
            <h3 className="mt-8 font-serif text-2xl">Motive & Symbole</h3>
            <ul className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {settings.motifs.map((m) => (
                <li key={m._key} className="flex flex-col items-center gap-2 text-center text-sm">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white">
                    <SanityImage image={m.image} alt={m.name} sizes="160px" />
                  </div>
                  {m.name}
                </li>
              ))}
            </ul>
          </>
        )}

      </section>
    </div>
  );
}
