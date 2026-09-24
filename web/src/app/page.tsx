import Link from "next/link";
import { Icon, iconNames } from "@/components/Icons";
import { SanityImage } from "@/components/SanityImage";
import { getSettings } from "@/lib/sanity";

export default async function Home() {
  const settings = await getSettings();

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <SanityImage image={settings.heroImage} alt="" sizes="100vw" priority />
          <div className="absolute inset-0 bg-cream/70" />
        </div>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 py-24 text-center sm:py-32">
          <h1 className="flex flex-col gap-3 font-script leading-none">
            {settings.heroTitle && <span className="text-4xl sm:text-5xl">{settings.heroTitle}</span>}
            <span className="text-7xl sm:text-8xl">{settings.siteName}</span>
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
