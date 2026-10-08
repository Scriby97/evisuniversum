import type { Metadata } from "next";
import { RichText } from "@/components/RichText";
import { privacyDefault } from "@/lib/privacy-default";
import { getSettings } from "@/lib/sanity";

export const metadata: Metadata = { title: "Datenschutz" };

export default async function PrivacyPage() {
  const settings = await getSettings();
  const hasText = Array.isArray(settings.privacyText) ? settings.privacyText.length > 0 : Boolean(settings.privacyText);

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 font-serif text-5xl">Datenschutzerklärung</h1>
      <div className="flex flex-col gap-6 text-muted">
        {/* Immer aktuell aus den Kontaktangaben im Studio */}
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-2xl font-medium text-ink">Verantwortlich</h2>
          <p className="whitespace-pre-line">
            {[settings.siteName, settings.ownerName, settings.address, settings.email].filter(Boolean).join("\n")}
          </p>
        </div>
        <RichText value={hasText ? settings.privacyText : privacyDefault} />
      </div>
    </section>
  );
}
