import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { getSettings } from "@/lib/sanity";

export const metadata: Metadata = { title: "Kontakt" };

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <section className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-[3fr_2fr]">
      <div>
        <h1 className="mb-4 font-script text-6xl">Kontakt</h1>
        <p className="mb-8 text-muted">
          Du hast eine Frage, einen besonderen Wunsch oder möchtest etwas für eine Gruppe bestellen? Schreib mir!
        </p>
        <ContactForm />
      </div>
      <aside className="flex flex-col gap-2 self-start rounded-2xl bg-sand/60 p-6 text-sm text-muted md:mt-24">
        <p className="font-serif text-xl text-ink">{settings.siteName}</p>
        <p>{settings.ownerName}</p>
        {settings.email && (
          <a href={`mailto:${settings.email}`} className="text-accent hover:text-accent-dark">
            {settings.email}
          </a>
        )}
        {settings.instagram && (
          <a href={settings.instagram} target="_blank" rel="noreferrer" className="text-accent hover:text-accent-dark">
            Instagram
          </a>
        )}
      </aside>
    </section>
  );
}
