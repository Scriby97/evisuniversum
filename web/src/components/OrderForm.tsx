"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formatPrice } from "@/lib/sanity";
import { inputClass, sendForm, web3formsKey } from "@/lib/web3forms";

export type OrderProduct = {
  slug: string;
  name: string;
  price: number;
  digital: boolean;
  personalizable: boolean;
};
type Status = "idle" | "sending" | "success" | "error";

export function OrderForm({ products }: { products: OrderProduct[] }) {
  const searchParams = useSearchParams();
  // Kommt man über "Bestellen" bei einem Produkt, ist dieses schon ausgewählt
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const preselected = searchParams.get("produkt");
    return preselected ? { [preselected]: 1 } : {};
  });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const selected = products.filter((p) => (quantities[p.slug] ?? 0) > 0);
  const total = selected.reduce((sum, p) => sum + p.price * quantities[p.slug], 0);
  const needsShipping = selected.some((p) => !p.digital);
  const hasPersonalizable = selected.some((p) => p.personalizable);

  function setQuantity(slug: string, value: number) {
    setQuantities((q) => ({ ...q, [slug]: Math.max(0, Math.min(99, value || 0)) }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selected.length === 0) {
      setError("Bitte wähle mindestens ein Produkt aus.");
      return;
    }
    setError("");
    setStatus("sending");

    const form = new FormData(event.currentTarget);
    const order = selected
      .map((p) => `${quantities[p.slug]} × ${p.name} à ${formatPrice(p.price)}${p.digital ? " (digital)" : ""}`)
      .join("\n");

    try {
      await sendForm({
        subject: `Neue Bestellung von ${form.get("name")}`,
        botcheck: form.get("botcheck"),
        Name: form.get("name"),
        email: form.get("email"),
        Lieferadresse: needsShipping ? form.get("address") : "– (nur digitale Produkte)",
        Bestellung: order,
        "Total (ohne Versand)": formatPrice(total),
        Personalisierung: form.get("personalization") || "–",
        Nachricht: form.get("message") || "–",
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-2 font-serif text-3xl">Vielen Dank für deine Bestellung! ♡</h2>
        <p className="text-muted">
          Du erhältst in den nächsten Tagen eine Rechnung per E-Mail. Sobald die Zahlung eingegangen ist,
          mache ich mich an die Arbeit.
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return <p className="text-muted">Im Moment sind leider keine Produkte verfügbar.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {!web3formsKey && (
        <p className="rounded-lg bg-yellow-100 p-3 text-sm text-yellow-900">
          NEXT_PUBLIC_WEB3FORMS_KEY fehlt – das Formular kann noch nicht versendet werden.
        </p>
      )}

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 font-serif text-2xl">Produkte</legend>
        {products.map((p) => (
          <label key={p.slug} className="flex items-center justify-between gap-4 rounded-lg bg-white px-4 py-3">
            <span>
              {p.name} <span className="text-sm text-muted">· {formatPrice(p.price)}</span>
            </span>
            <input
              type="number"
              min={0}
              max={99}
              value={quantities[p.slug] ?? 0}
              onChange={(e) => setQuantity(p.slug, e.target.valueAsNumber)}
              className="w-20 rounded-lg border border-sand px-2 py-1 text-right"
              aria-label={`Anzahl ${p.name}`}
            />
          </label>
        ))}
        <p className="text-right text-sm">
          Total {needsShipping && "ohne Versand"}: <strong>{formatPrice(total)}</strong>
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-3 font-serif text-2xl">Deine Angaben</legend>
        <label className="flex flex-col gap-1 text-sm">
          Name
          <input name="name" required autoComplete="name" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          E-Mail
          <input name="email" type="email" required autoComplete="email" className={inputClass} />
        </label>
        {needsShipping && (
          <label className="flex flex-col gap-1 text-sm">
            Lieferadresse
            <textarea
              name="address"
              required
              rows={3}
              autoComplete="street-address"
              placeholder={"Strasse Nr.\nPLZ Ort"}
              className={inputClass}
            />
          </label>
        )}
        {hasPersonalizable && (
          <label className="flex flex-col gap-1 text-sm">
            Personalisierung (Motiv, Name oder Text)
            <textarea
              name="personalization"
              rows={3}
              placeholder="z. B. Socken «Thun» mit den Initialen A. M."
              className={inputClass}
            />
            <Link href="/shop#personalisierung" className="text-xs text-accent hover:text-accent-dark">
              Welche Motive gibt es?
            </Link>
          </label>
        )}
        <label className="flex flex-col gap-1 text-sm">
          Nachricht (optional)
          <textarea name="message" rows={3} className={inputClass} />
        </label>
        {/* Spam-Schutz: für Menschen unsichtbar, Bots füllen es aus */}
        <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />
      </fieldset>

      {error && <p className="text-sm text-red-700">{error}</p>}
      {status === "error" && (
        <p className="text-sm text-red-700">
          Die Bestellung konnte nicht gesendet werden. Bitte versuche es nochmals oder schreib mir eine E-Mail.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending" || !web3formsKey}
        className="self-start rounded-full bg-accent px-6 py-3 text-white hover:bg-accent-dark disabled:opacity-50"
      >
        {status === "sending" ? "Wird gesendet …" : "Verbindlich bestellen"}
      </button>
      <p className="text-xs text-muted">
        Du bezahlst erst nach Erhalt der Rechnung. Es gelten die{" "}
        <Link href="/agb" className="underline">
          AGB
        </Link>{" "}
        und die{" "}
        <Link href="/datenschutz" className="underline">
          Datenschutzerklärung
        </Link>
        .
      </p>
    </form>
  );
}
