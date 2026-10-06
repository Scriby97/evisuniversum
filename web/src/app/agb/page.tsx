import type { Metadata } from "next";
import { RichText } from "@/components/RichText";
import { getSettings } from "@/lib/sanity";

export const metadata: Metadata = { title: "AGB" };

export default async function TermsPage() {
  const settings = await getSettings();

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 font-serif text-5xl">Allgemeine Geschäftsbedingungen</h1>
      <RichText value={settings.agbText} className="text-muted" />
    </section>
  );
}
