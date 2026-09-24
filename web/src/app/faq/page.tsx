import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/sanity";

export const metadata: Metadata = { title: "FAQ" };

export default async function FaqPage() {
  const settings = await getSettings();
  const faqs = settings.faqs ?? [];

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-10 font-script text-6xl">Häufige Fragen</h1>
      <div className="flex flex-col gap-3">
        {faqs.map((faq) => (
          <details key={faq._key} className="group rounded-2xl bg-white p-5 shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-xl font-medium">
              {faq.question}
              <span className="text-accent transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 whitespace-pre-line text-muted">{faq.answer}</p>
          </details>
        ))}
      </div>
      <p className="mt-10 text-muted">
        Deine Frage ist nicht dabei?{" "}
        <Link href="/kontakt" className="text-accent hover:text-accent-dark">
          Schreib mir
        </Link>
        .
      </p>
    </section>
  );
}
