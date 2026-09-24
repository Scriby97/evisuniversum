import type { Metadata } from "next";
import { getSettings } from "@/lib/sanity";

export const metadata: Metadata = { title: "Datenschutz" };

// VORLAGE – vor dem Livegang prüfen und an die tatsächliche Situation anpassen
export default async function PrivacyPage() {
  const settings = await getSettings();

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 font-serif text-5xl">Datenschutzerklärung</h1>
      <div className="flex flex-col gap-6 text-muted [&_h2]:mb-2 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-ink">
        <div>
          <h2>Verantwortliche Stelle</h2>
          <p className="whitespace-pre-line">
            {[settings.siteName, settings.ownerName, settings.address, settings.email].filter(Boolean).join("\n")}
          </p>
        </div>
        <div>
          <h2>Bestell- und Kontaktformular</h2>
          <p>
            Wenn du das Bestell- oder Kontaktformular ausfüllst, werden deine Angaben (Name, E-Mail, Adresse, Bestellung,
            Nachricht) über den Dienst Web3Forms per E-Mail an uns übermittelt. Wir verwenden diese Daten
            ausschliesslich zur Abwicklung deiner Bestellung bzw. Anfrage und bewahren sie nur so lange auf, wie es für
            die Bestellung und gesetzliche Aufbewahrungspflichten nötig ist.
          </p>
        </div>
        <div>
          <h2>Hosting und Bilder</h2>
          <p>
            Diese Website wird bei Cloudflare gehostet. Bilder werden über das Content Delivery Network von
            Sanity ausgeliefert. Beim Aufruf der Seite verarbeiten diese Anbieter technisch notwendige Daten
            wie deine IP-Adresse. Es werden keine Tracking- oder Analyse-Cookies verwendet.
          </p>
        </div>
        <div>
          <h2>Deine Rechte</h2>
          <p>
            Du kannst jederzeit Auskunft über deine gespeicherten Daten verlangen sowie deren Berichtigung
            oder Löschung beantragen. Schreib uns dafür eine E-Mail.
          </p>
        </div>
      </div>
    </section>
  );
}
