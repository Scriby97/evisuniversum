import type { Metadata } from "next";
import { RichText } from "@/components/RichText";
import { ExpandableGrid } from "@/components/ExpandableGrid";
import { ProductCard } from "@/components/ProductCard";
import { SanityImage } from "@/components/SanityImage";
import { getCategories, getMotifGroups, getSettings } from "@/lib/sanity";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage() {
  const [settings, allCategories, motifGroups] = await Promise.all([getSettings(), getCategories(), getMotifGroups()]);
  const categories = allCategories.filter((c) => c.products.length > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-6 font-serif text-5xl font-medium">Shop</h1>

      <nav aria-label="Kategorien" className="mb-12 flex flex-wrap gap-2 text-sm">
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
          <ExpandableGrid limit={8} moreLabel={`Alle ${c.products.length} Produkte anzeigen`}>
            {c.products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </ExpandableGrid>
        </section>
      ))}

      <section id="personalisierung" className="rounded-3xl bg-sand/60 p-8 sm:p-12">
        <h2 className="font-serif text-4xl">{settings.personalizationTitle ?? "Personalisierung"}</h2>
        <RichText value={settings.personalizationText} className="mt-4 max-w-3xl text-muted" />
        {/* Ein Raster pro Motiv-Sammlung (Titel und Reihenfolge aus dem Studio) */}
        {motifGroups.map((group) => (
          <div key={group._id}>
            <h3 className="mt-8 font-serif text-2xl">{group.title}</h3>
            {group.description && <p className="mt-1 text-sm text-muted">{group.description}</p>}
            <ul className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {(group.motifs ?? []).map((m) => (
                <li key={m._key} className="flex flex-col items-center gap-2 text-center text-sm">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white">
                    {/* Name steht darunter – Bild für Screenreader nicht doppelt vorlesen */}
                    <SanityImage image={m.image} alt="" decorative sizes="160px" />
                  </div>
                  {m.name}
                </li>
              ))}
            </ul>
          </div>
        ))}

      </section>
    </div>
  );
}
