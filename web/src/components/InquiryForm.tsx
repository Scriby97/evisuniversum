"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { formatPrice } from "@/lib/format";
import { inputClass, sendForm, web3formsKey } from "@/lib/web3forms";
import { OptionFields, readChoices, type CartProduct } from "./AddToCart";
import { ConfirmationCopy } from "./ConfirmationCopy";

type Status = "idle" | "sending" | "success" | "error";

function newInquiryNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear() % 100}`.padStart(2, "0") + `${d.getMonth() + 1}`.padStart(2, "0") + `${d.getDate()}`.padStart(2, "0");
  return `AN-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// Anfrage für ein Produkt «auf Anfrage»: geht wie eine Bestellung per Mail an Evi, aber ohne Warenkorb
export function InquiryForm({
  product,
  productName,
  price,
  symbols,
  notePlaceholder,
  namePlaceholder,
}: {
  product: CartProduct;
  productName: string;
  price: number;
  symbols: string[];
  notePlaceholder: string;
  namePlaceholder: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [sent, setSent] = useState<{ number: string; email: string; summary: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    const c = readChoices(form, product);
    const number = newInquiryNumber();
    const choices = [
      c.color && `Farbe: ${c.color}`,
      c.size && `Grösse: ${c.size}`,
      ...(c.custom ?? []).map((x) => `${x.label}: ${x.value}`),
      ...(c.extras ?? []).map((e) => `Zusatz: ${e}`),
      c.symbol && `Symbol: ${c.symbol}`,
      c.name && `Namenwunsch: «${c.name}»`,
    ].filter(Boolean);
    const message = String(form.get("message") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    // Kopie für die Kundin (Anzeige, Mail an sich selbst, Ausdruck)
    const summary = [
      `Anfragenummer: ${number}`,
      `Datum: ${new Date().toLocaleDateString("de-CH")}`,
      "",
      `Produkt: ${productName} (${formatPrice(price)})`,
      `Menge: ${form.get("quantity")}`,
      ...choices,
      message ? `Bemerkung / Wunsch: ${message}` : null,
      "",
      `Name: ${form.get("name")}`,
      `E-Mail: ${form.get("email")}`,
      phone ? `Telefon: ${phone}` : null,
      "",
      "Ich schaue mir deinen Wunsch an und melde mich so bald wie möglich per E-Mail bei dir. Die Anfrage ist unverbindlich.",
    ]
      .filter((line) => line !== null)
      .join("\n");

    try {
      await sendForm({
        subject: `Anfrage ${number} für «${productName}» von ${form.get("name")}`,
        botcheck: form.get("botcheck"),
        Anfragenummer: number,
        Produkt: `${productName} (${formatPrice(price)})`,
        "Link zum Produkt": `${window.location.origin}/shop/${product.slug}`,
        Menge: form.get("quantity"),
        Auswahl: choices.length ? choices.join("\n") : "–",
        "Bemerkung / Wunsch": form.get("message") || "–",
        Name: form.get("name"),
        email: form.get("email"),
        Telefon: form.get("phone") || "–",
      });
      setSent({ number, email: String(form.get("email")), summary });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success" && sent) {
    return (
      <div className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <h2 className="mb-2 font-serif text-3xl">Danke für deine Anfrage! ♡</h2>
          <p className="mb-2 text-muted">
            Anfragenummer <strong className="text-ink">{sent.number}</strong>
          </p>
          <p className="text-muted">
            Ich schaue mir deinen Wunsch an und melde mich so bald wie möglich per E-Mail bei dir.
          </p>
        </div>
        <ConfirmationCopy
          email={sent.email}
          subject={`Meine Anfrage ${sent.number} bei evi’s universum`}
          summary={sent.summary}
        />
        <Link href="/shop" className="self-start text-sm text-accent hover:text-accent-dark print:hidden">
          ← Zurück zum Shop
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {!web3formsKey && (
        <p className="rounded-lg bg-yellow-100 p-3 text-sm text-yellow-900">
          NEXT_PUBLIC_WEB3FORMS_KEY fehlt – das Formular kann noch nicht versendet werden.
        </p>
      )}
      <OptionFields
        product={product}
        symbols={symbols}
        notePlaceholder={notePlaceholder}
        namePlaceholder={namePlaceholder}
        allOptional
      />
      <label className="flex flex-col gap-1 text-sm">
        Menge
        <input name="quantity" type="number" min={1} max={99} defaultValue={1} required className={`${inputClass} w-28`} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Bemerkung oder Wunsch
        <textarea
          name="message"
          rows={5}
          maxLength={1000}
          className={inputClass}
          placeholder={`${notePlaceholder} – und alles, was ich für deine Anfrage wissen sollte`}
        />
      </label>

      <fieldset className="mt-2 flex flex-col gap-4">
        <legend className="mb-3 font-serif text-2xl">Deine Angaben</legend>
        <label className="flex flex-col gap-1 text-sm">
          Name
          <input name="name" required autoComplete="name" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          E-Mail
          <input name="email" type="email" required autoComplete="email" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Telefon (optional)
          <input name="phone" type="tel" autoComplete="tel" className={inputClass} />
        </label>
        {/* Spam-Schutz: für Menschen unsichtbar, Bots füllen es aus */}
        <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />
      </fieldset>

      {status === "error" && (
        <p className="text-sm text-red-700">
          Die Anfrage konnte nicht gesendet werden. Bitte versuche es nochmals oder schreib mir eine E-Mail.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending" || !web3formsKey}
        className="self-start rounded-full bg-accent px-6 py-3 text-white hover:bg-accent-dark disabled:opacity-50"
      >
        {status === "sending" ? "Wird gesendet …" : "Anfrage senden"}
      </button>
      <p className="text-xs text-muted">
        Die Anfrage ist unverbindlich. Es gilt die{" "}
        <Link href="/datenschutz" className="underline">
          Datenschutzerklärung
        </Link>
        .
      </p>
    </form>
  );
}
