import type { Metadata } from "next";
import { getSettings } from "@/lib/sanity";

export const metadata: Metadata = { title: "AGB" };

export default async function TermsPage() {
  const settings = await getSettings();
  // Zeilen mit "## " werden Zwischentitel, alle anderen Absätze
  const lines = (settings.agbText ?? "").split("\n").filter((line) => line.trim());

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 font-serif text-5xl">Allgemeine Geschäftsbedingungen</h1>
      <div className="flex flex-col gap-3 text-muted">
        {lines.map((line, i) =>
          line.startsWith("## ") ? (
            <h2 key={i} className="mt-4 font-serif text-2xl text-ink">
              {line.slice(3)}
            </h2>
          ) : (
            <p key={i}>{line}</p>
          ),
        )}
      </div>
    </section>
  );
}
