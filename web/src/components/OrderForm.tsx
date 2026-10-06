"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { clearCart, setQuantity, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { inputClass, sendForm, web3formsKey } from "@/lib/web3forms";

export type OrderProduct = {
  slug: string;
  name: string;
  price: number;
  digital: boolean;
  onRequest: boolean;
  extras?: { name: string; price: number }[];
  stock?: number | null;
};
type Status = "idle" | "sending" | "success" | "error";
type Payment = "invoice" | "twint";
type Placed = { orderNo: string; total: number; payment: Payment; hasRequests: boolean };

// Kurze, gut lesbare Nummer, damit Evi Zahlungen (TWINT, QR-Rechnung) zuordnen kann
function newOrderNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear() % 100}`.padStart(2, "0") + `${d.getMonth() + 1}`.padStart(2, "0") + `${d.getDate()}`.padStart(2, "0");
  return `EU-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function OrderForm({
  products,
  shippingOptions,
  freeShippingFrom,
  giftWrapPrice,
  twintQrUrl,
}: {
  products: OrderProduct[];
  shippingOptions: { name: string; price: number }[];
  freeShippingFrom?: number;
  giftWrapPrice?: number;
  twintQrUrl?: string;
}) {
  const cart = useCart();
  const [status, setStatus] = useState<Status>("idle");
  const [giftWrap, setGiftWrap] = useState(false);
  const [otherAddress, setOtherAddress] = useState(false);
  const [shippingIndex, setShippingIndex] = useState(0);
  const [payment, setPayment] = useState<Payment>("invoice");
  const [placed, setPlaced] = useState<Placed | null>(null);

  // Aktuelle Namen und Preise aus Sanity; ausverkaufte/gelöschte Produkte fallen weg
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const counted = new Map<string, number>();
  const lines = cart.flatMap((item) => {
    const product = bySlug.get(item.slug);
    if (!product) return [];
    // Aufpreise der gewählten Zusatzoptionen nach aktuellem Stand in Sanity
    const extras = (product.extras ?? []).filter((e) => item.extras?.includes(e.name));
    const unitPrice = product.price + extras.reduce((sum, e) => sum + e.price, 0);
    // Mehr bestellt als an Lager (über alle Zeilen desselben Produkts) → diese Zeile auf Anfrage
    const before = counted.get(item.slug) ?? 0;
    counted.set(item.slug, before + item.quantity);
    const overStock = typeof product.stock === "number" && before + item.quantity > product.stock;
    return [{ ...item, product, extras, unitPrice, overStock, onRequest: product.onRequest || overStock }];
  });
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const needsShipping = lines.some((l) => !l.product.digital);
  const freeShipping = freeShippingFrom !== undefined && subtotal >= freeShippingFrom;
  const shippingOption = shippingOptions[shippingIndex] ?? shippingOptions[0];
  // «Gratisversand ab» gilt für die erste (Standard-)Versandart
  const shipping = !needsShipping || (freeShipping && shippingIndex === 0) ? 0 : shippingOption.price;
  const canGiftWrap = needsShipping && giftWrapPrice !== undefined;
  const wrapping = canGiftWrap && giftWrap ? giftWrapPrice : 0;
  const total = subtotal + shipping + wrapping;
  const hasRequests = lines.some((l) => l.onRequest);
  const dropped = cart.length - lines.length;
  // TWINT nur mit hinterlegtem QR-Code und ohne Produkte auf Anfrage (dort steht der Preis noch nicht fest)
  const canTwint = Boolean(twintQrUrl) && !hasRequests;
  const paymentMethod: Payment = canTwint ? payment : "invoice";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    const orderNo = newOrderNumber();
    const order = lines
      .map((l) => {
        const details = [
          l.onRequest && (l.overStock ? "AUF ANFRAGE – mehr bestellt als an Lager" : "AUF ANFRAGE – Verfügbarkeit prüfen"),
          l.color && `Farbe ${l.color}`,
          l.size && `Grösse ${l.size}`,
          ...(l.custom ?? []).map((c) => `${c.label}: ${c.value}`),
          ...l.extras.map((e) => `${e.name} (+${formatPrice(e.price)})`),
          l.symbol && `Symbol ${l.symbol}`,
          l.name && `Namenwunsch: «${l.name}»`,
          l.text && `Bemerkung/Wunsch: «${l.text}»`,
        ]
          .filter(Boolean)
          .map((d) => `\n    → ${d}`)
          .join("");
        return `${l.quantity} × ${l.product.name} à ${formatPrice(l.unitPrice)}${l.product.digital ? " (digital)" : ""}${details}`;
      })
      .join("\n");

    try {
      await sendForm({
        subject: `${hasRequests ? "Neue Bestellung/Anfrage" : "Neue Bestellung"} ${orderNo} von ${form.get("name")}`,
        botcheck: form.get("botcheck"),
        Bestellnummer: orderNo,
        Zahlungsart:
          paymentMethod === "twint"
            ? "TWINT – Kundin bezahlt direkt nach der Bestellung per QR-Code (Zahlungseingang prüfen)"
            : "QR-Rechnung per E-Mail",
        Name: form.get("name"),
        email: form.get("email"),
        Adresse: form.get("address") || "–",
        Versandadresse: !needsShipping
          ? "– (nur digitale Produkte)"
          : otherAddress
            ? form.get("shippingAddress")
            : "wie Adresse",
        Bestellung: order,
        Zwischentotal: formatPrice(subtotal),
        Versand: needsShipping ? `${shippingOption.name}: ${formatPrice(shipping)}` : "– (nur digitale Produkte)",
        Geschenkverpackung: wrapping ? `Ja (+${formatPrice(wrapping)})` : "Nein",
        Total: formatPrice(total),
        Nachricht: form.get("message") || "–",
      });
      setPlaced({ orderNo, total, payment: paymentMethod, hasRequests });
      // Lagerbestand abziehen (Cloudflare-Worker); scheitert das, ist die Bestellung trotzdem verschickt
      const tracked = lines.filter((l) => typeof l.product.stock === "number");
      if (tracked.length) {
        fetch("/api/stock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: tracked.map((l) => ({ slug: l.slug, quantity: l.quantity })) }),
          keepalive: true,
        }).catch(() => {});
      }
      clearCart();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success" && placed) {
    if (placed.payment === "twint" && twintQrUrl) {
      return (
        <div className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h2 className="mb-2 font-serif text-3xl">Vielen Dank für deine Bestellung! ♡</h2>
            <p className="text-muted">
              Bestellnummer <strong className="text-ink">{placed.orderNo}</strong> – jetzt nur noch mit TWINT bezahlen:
            </p>
          </div>
          <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
            <div className="relative mx-auto aspect-[1026/1591] w-56">
              <Image
                src={twintQrUrl}
                alt="TWINT-QR-Code von evi’s universum"
                fill
                sizes="224px"
                loading="eager"
                className="object-contain"
              />
            </div>
            <ol className="flex list-decimal flex-col gap-2 pl-5 text-muted">
              <li>TWINT-App öffnen und den QR-Code scannen.</li>
              <li>
                Betrag eingeben: <strong className="text-lg text-ink">{formatPrice(placed.total)}</strong>
              </li>
              <li>
                Falls TWINT eine Mitteilung erlaubt: Bestellnummer <strong className="text-ink">{placed.orderNo}</strong>{" "}
                angeben.
              </li>
              <li>Zahlung bestätigen – fertig! Sobald sie eingegangen ist, mache ich mich an die Arbeit.</li>
            </ol>
          </div>
          <p className="text-sm text-muted">
            Bestellst du auf dem Handy? Dann scanne den Code von einem zweiten Gerät aus. Klappt es nicht, schreib mir
            einfach – dann schicke ich dir eine QR-Rechnung.
          </p>
        </div>
      );
    }
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-2 font-serif text-3xl">Vielen Dank für deine Bestellung! ♡</h2>
        <p className="mb-2 text-muted">
          Bestellnummer <strong className="text-ink">{placed.orderNo}</strong>
        </p>
        <p className="text-muted">
          {placed.hasRequests
            ? "Bei Produkten auf Anfrage prüfe ich zuerst, ob ich deinen Wunsch umsetzen kann, und melde mich bei dir. Danach erhältst du eine QR-Rechnung per E-Mail."
            : "Du erhältst in den nächsten Tagen eine QR-Rechnung per E-Mail. Sobald die Zahlung eingegangen ist, mache ich mich an die Arbeit."}
        </p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-muted">Dein Warenkorb ist noch leer.</p>
        <Link href="/shop" className="rounded-full bg-accent px-6 py-3 text-white hover:bg-accent-dark">
          Zum Shop
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {!web3formsKey && (
        <p className="rounded-lg bg-yellow-100 p-3 text-sm text-yellow-900">
          NEXT_PUBLIC_WEB3FORMS_KEY fehlt – das Formular kann noch nicht versendet werden.
        </p>
      )}

      <section className="flex flex-col gap-3">
        <ul className="flex flex-col gap-3">
          {lines.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-4 rounded-lg bg-white px-4 py-3">
              <div className="min-w-0">
                <p>
                  {l.product.name}
                  {l.onRequest && (
                    <span className="ml-2 rounded-full bg-mint/60 px-2 py-0.5 text-xs">auf Anfrage</span>
                  )}
                </p>
                {l.overStock && !l.product.onRequest && (
                  <p className="text-xs text-accent">
                    Nur noch {l.product.stock} an Lager – den Rest fertige ich auf Anfrage an.
                  </p>
                )}
                <p className="text-sm text-muted">
                  {[
                    formatPrice(l.unitPrice),
                    l.color,
                    l.size && `Grösse ${l.size}`,
                    ...(l.custom ?? []).map((c) => `${c.label}: ${c.value}`),
                    ...l.extras.map((e) => e.name),
                    l.symbol && `Symbol ${l.symbol}`,
                    l.name && `Name «${l.name}»`,
                    l.text && `«${l.text}»`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setQuantity(l.id, l.quantity - 1)}
                  className="size-8 rounded-full border border-sand hover:border-accent"
                  aria-label={`${l.product.name}: eins weniger`}
                >
                  −
                </button>
                <span className="w-7 text-center" aria-label="Anzahl">
                  {l.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(l.id, l.quantity + 1)}
                  className="size-8 rounded-full border border-sand hover:border-accent"
                  aria-label={`${l.product.name}: eins mehr`}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setQuantity(l.id, 0)}
                  className="ml-2 text-sm text-muted hover:text-red-700"
                >
                  Entfernen
                </button>
              </div>
            </li>
          ))}
        </ul>
        {dropped > 0 && (
          <p className="text-sm text-muted">Nicht mehr verfügbare Artikel werden nicht mitbestellt.</p>
        )}
        {needsShipping && shippingOptions.length > 1 && (
          <fieldset className="ml-auto flex w-full max-w-xs flex-col gap-1 text-sm">
            <legend className="mb-1">Versandart</legend>
            {shippingOptions.map((option, i) => (
              <label key={option.name} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="shippingOption"
                    checked={shippingIndex === i}
                    onChange={() => setShippingIndex(i)}
                    className="size-4 accent-accent"
                  />
                  {option.name}
                </span>
                <span className="text-muted">
                  {freeShipping && i === 0 ? "gratis" : formatPrice(option.price)}
                </span>
              </label>
            ))}
          </fieldset>
        )}
        <dl className="ml-auto grid w-full max-w-xs grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-sm">
          <dt className="text-muted">Zwischentotal</dt>
          <dd className="text-right">{formatPrice(subtotal)}</dd>
          {needsShipping && (
            <>
              <dt className="text-muted">{shippingOptions.length > 1 ? shippingOption.name : "Versand"}</dt>
              <dd className="text-right">{shipping === 0 ? "gratis" : formatPrice(shipping)}</dd>
            </>
          )}
          {wrapping > 0 && (
            <>
              <dt className="text-muted">Geschenkverpackung</dt>
              <dd className="text-right">{formatPrice(wrapping)}</dd>
            </>
          )}
          <dt className="border-t border-sand pt-1 text-base">Total</dt>
          <dd className="border-t border-sand pt-1 text-right text-base font-semibold">{formatPrice(total)}</dd>
        </dl>
        {needsShipping && freeShippingFrom !== undefined && !freeShipping && (
          <p className="text-right text-xs text-muted">Gratisversand ab {formatPrice(freeShippingFrom)}</p>
        )}
        <Link href="/shop" className="self-start text-sm text-accent hover:text-accent-dark">
          ← Weiter einkaufen
        </Link>
      </section>

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
          <>
            <label className="flex flex-col gap-1 text-sm">
              Deine Adresse
              <textarea
                name="address"
                required
                rows={3}
                autoComplete="street-address"
                placeholder={"Strasse Nr.\nPLZ Ort"}
                className={inputClass}
              />
            </label>
            {canGiftWrap && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  className="size-4 accent-accent"
                />
                Als Geschenk verpacken <span className="text-muted">+ {formatPrice(giftWrapPrice)}</span>
              </label>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={otherAddress}
                onChange={(e) => setOtherAddress(e.target.checked)}
                className="size-4 accent-accent"
              />
              An eine andere Adresse senden (z. B. direkt an die beschenkte Person)
            </label>
            {otherAddress && (
              <label className="flex flex-col gap-1 text-sm">
                Versandadresse
                <textarea
                  name="shippingAddress"
                  required
                  rows={3}
                  placeholder={"Vorname Name\nStrasse Nr.\nPLZ Ort"}
                  className={inputClass}
                />
              </label>
            )}
          </>
        )}
        <label className="flex flex-col gap-1 text-sm">
          Nachricht (optional)
          <textarea name="message" rows={3} className={inputClass} />
        </label>
        {/* Spam-Schutz: für Menschen unsichtbar, Bots füllen es aus */}
        <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />
      </fieldset>

      {twintQrUrl && (
        <fieldset className="flex flex-col gap-2 text-sm">
          <legend className="mb-3 font-serif text-2xl">Bezahlung</legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "invoice"}
              onChange={() => setPayment("invoice")}
              className="size-4 accent-accent"
            />
            QR-Rechnung per E-Mail
          </label>
          <label className={`flex items-center gap-2 ${canTwint ? "" : "text-muted"}`}>
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "twint"}
              onChange={() => setPayment("twint")}
              disabled={!canTwint}
              className="size-4 accent-accent"
            />
            TWINT – direkt nach der Bestellung bezahlen
          </label>
          {!canTwint && (
            <p className="text-xs text-muted">
              Bei Produkten auf Anfrage ist TWINT nicht möglich – du erhältst eine QR-Rechnung, sobald ich deinen
              Wunsch geprüft habe.
            </p>
          )}
        </fieldset>
      )}

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
        {paymentMethod === "twint"
          ? "Nach dem Absenden zeige ich dir den TWINT-QR-Code und den Betrag."
          : "Du bezahlst bequem per QR-Rechnung, die du nach der Bestellung per E-Mail erhältst."} Es gelten die{" "}
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
