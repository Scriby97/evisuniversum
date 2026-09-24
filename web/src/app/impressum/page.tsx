import type { Metadata } from "next";
import { getSettings } from "@/lib/sanity";

export const metadata: Metadata = { title: "Impressum" };

export default async function ImprintPage() {
  const settings = await getSettings();

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 font-serif text-5xl">Impressum</h1>
      <div className="flex flex-col gap-1 text-muted">
        <p className="text-ink">{settings.siteName}</p>
        <p>Inhaberin: {settings.ownerName}</p>
        {settings.address && <p className="whitespace-pre-line">{settings.address}</p>}
        {settings.email && (
          <p>
            E-Mail:{" "}
            <a href={`mailto:${settings.email}`} className="text-accent hover:text-accent-dark">
              {settings.email}
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
