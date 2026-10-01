import Link from "next/link";
import { Icon, iconNames } from "@/components/Icons";
import { ProductCard } from "@/components/ProductCard";
import { SanityImage } from "@/components/SanityImage";
import { formatEventDate } from "@/lib/format";
import { getProducts, getSettings, getUpcomingEvents } from "@/lib/sanity";

export default async function Home() {
  const [settings, products, events] = await Promise.all([getSettings(), getProducts(), getUpcomingEvents()]);
  // Reihenfolge wie im Studio gewählt; gelöschte Produkte fallen weg
  const featured = (settings.featuredProducts ?? []).flatMap((ref) => products.filter((p) => p._id === ref._ref));
  const nextEvent = events[0];

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
        <div className="flex flex-col items-center gap-5 text-center md:items-start md:text-left">
          <h1 className="flex flex-col gap-1 font-serif leading-tight">
            {settings.heroTitle && <span className="text-3xl italic text-muted sm:text-4xl">{settings.heroTitle}</span>}
            <span className="text-6xl font-medium sm:text-7xl">{settings.siteName}</span>
          </h1>
          {settings.heroSubtitle && <p className="font-serif text-2xl text-ink sm:text-3xl">{settings.heroSubtitle}</p>}
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href="/shop" className="rounded-full bg-accent px-6 py-3 text-white hover:bg-accent-dark">
              Zum Shop
            </Link>
            <Link
              href="/ueber-mich"
              className="rounded-full border border-accent px-6 py-3 text-accent hover:bg-accent hover:text-white"
            >
              Über mich
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
          <SanityImage image={settings.heroImage} alt="" sizes="(min-width: 768px) 560px, 100vw" priority />
        </div>
      </section>

      {settings.heroText && (
        <section className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="whitespace-pre-line font-serif text-2xl leading-relaxed text-muted">{settings.heroText}</p>
        </section>
      )}

      {settings.highlights && settings.highlights.length > 0 && (
        <section className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
          {settings.highlights.map((h) => (
            <Link
              key={h._key}
              href={h.link ?? "/shop"}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3]">
                <SanityImage image={h.image} alt={h.title} sizes="(min-width: 1024px) 380px, 100vw" />
              </div>
              <div className="flex flex-col gap-2 p-6">
                <h2 className="font-serif text-2xl font-medium group-hover:text-accent">{h.title}</h2>
                {h.text && <p className="text-sm text-muted">{h.text}</p>}
              </div>
            </Link>
          ))}
        </section>
      )}

      {featured.length > 0 && (
        <section className="mx-auto mt-20 max-w-6xl px-4">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="font-serif text-4xl font-medium">Lieblingsstücke</h2>
            <Link href="/shop" className="text-sm text-accent hover:text-accent-dark">
              Zum ganzen Shop →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {(nextEvent || settings.instagram) && (
        <section className="mx-auto mt-20 grid max-w-6xl gap-6 px-4 md:grid-cols-2">
          {nextEvent && (
            <Link href="/maerkte-events" className="group flex flex-col gap-2 rounded-2xl bg-mint/40 p-8">
              <p className="text-sm uppercase tracking-wide text-accent">Nächster Markt</p>
              <h2 className="font-serif text-3xl font-medium group-hover:text-accent">{nextEvent.title}</h2>
              <p className="text-muted">
                {formatEventDate(nextEvent)}
                {nextEvent.time && ` · ${nextEvent.time}`}
                {nextEvent.location && ` · ${nextEvent.location}`}
              </p>
              <span className="mt-auto pt-2 text-sm text-accent">Alle Termine →</span>
            </Link>
          )}
          {settings.instagram && (
            <a
              href={settings.instagram}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col gap-2 rounded-2xl bg-sand/60 p-8"
            >
              <p className="flex items-center gap-2 text-sm uppercase tracking-wide text-accent">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="size-5" aria-hidden>
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
                </svg>
                Instagram
              </p>
              <h2 className="font-serif text-3xl font-medium group-hover:text-accent">Folge mir auf Instagram</h2>
              <p className="text-muted">Neue Ideen, Einblicke in meine Werkstatt und die nächsten Märkte.</p>
              <span className="mt-auto pt-2 text-sm text-accent">Zu Instagram →</span>
            </a>
          )}
        </section>
      )}

      {settings.values && settings.values.length > 0 && (
        <section className="mx-auto mt-16 max-w-6xl px-4">
          <ul className="grid gap-6 border-y border-sand py-8 sm:grid-cols-2 lg:grid-cols-4">
            {settings.values.map((value, i) => (
              <li key={value} className="flex items-center gap-3 text-sm uppercase tracking-wide text-muted">
                <Icon name={iconNames[i % iconNames.length]} className="size-8 shrink-0 text-accent" />
                {value}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
