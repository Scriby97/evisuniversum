"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { addToCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/sanity";
import { inputClass } from "@/lib/web3forms";

export type CartProduct = Pick<
  Product,
  "slug" | "colors" | "sizes" | "extras" | "personalizable" | "withSymbols" | "onRequest"
>;

export function needsChoice(p: CartProduct) {
  return Boolean(p.colors?.length || p.sizes?.length || p.extras?.length || p.personalizable);
}

const buttonLabel = (p: CartProduct) => (p.onRequest ? "Auf Anfrage" : "In den Warenkorb");

// Knopf auf dem Produktbild im Shop: direkt hinzufügen oder zur Auswahl auf der Produktseite
export function QuickAdd({ product }: { product: CartProduct }) {
  const [added, setAdded] = useState(false);
  const className =
    "flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm text-white shadow-md hover:bg-accent-dark";

  if (needsChoice(product)) {
    return (
      <Link href={`/shop/${product.slug}#auswahl`} className={className}>
        <BagIcon />
        {buttonLabel(product)}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => {
        addToCart({ slug: product.slug });
        setAdded(true);
      }}
      className={className}
    >
      <BagIcon />
      {added ? "✓ Im Warenkorb" : buttonLabel(product)}
    </button>
  );
}

// Vollständige Auswahl auf der Produktseite
export function ProductOptions({ product, symbols }: { product: CartProduct; symbols: string[] }) {
  const [added, setAdded] = useState(false);
  const showSymbols = product.personalizable && product.withSymbols && symbols.length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "").trim() || undefined;
    const extras = form.getAll("extras").map(String);
    addToCart({
      slug: product.slug,
      color: value("color"),
      size: value("size"),
      extras: extras.length ? extras : undefined,
      symbol: value("symbol"),
      text: value("text"),
    });
    setAdded(true);
  }

  return (
    <form id="auswahl" onSubmit={handleSubmit} onChange={() => setAdded(false)} className="flex flex-col gap-4">
      {product.colors?.length ? <Choice name="color" label="Farbe" options={product.colors} /> : null}
      {product.sizes?.length ? <Choice name="size" label="Grösse" options={product.sizes} /> : null}
      {product.extras?.length ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm">Zusatzoptionen</legend>
          {product.extras.map((extra) => (
            <label key={extra._key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="extras" value={extra.name} className="size-4 accent-accent" />
              {extra.name} <span className="text-muted">+ {formatPrice(extra.price)}</span>
            </label>
          ))}
        </fieldset>
      ) : null}
      {showSymbols && (
        <label className="flex flex-col gap-1 text-sm">
          Symbol
          <select name="symbol" className={inputClass} defaultValue="">
            <option value="">Kein Symbol</option>
            {symbols.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Link href="/shop#personalisierung" className="text-xs text-accent hover:text-accent-dark">
            Alle Symbole ansehen
          </Link>
        </label>
      )}
      {product.personalizable && (
        <label className="flex flex-col gap-1 text-sm">
          Bemerkung oder Wunsch (optional)
          <textarea name="text" rows={3} maxLength={300} className={inputClass} placeholder="z. B. Name «Alina»" />
          <span className="text-xs text-muted">Bei Rückfragen melde ich mich direkt bei dir.</span>
        </label>
      )}
      {product.onRequest && (
        <p className="rounded-lg bg-mint/40 p-3 text-sm">
          Dieses Produkt fertige ich auf Anfrage an. Nach deiner Bestellung prüfe ich, ob ich deinen Wunsch
          umsetzen kann, und melde mich bei dir.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button type="submit" className="flex items-center gap-1.5 rounded-full bg-accent px-6 py-3 text-white hover:bg-accent-dark">
          <BagIcon />
          {buttonLabel(product)}
        </button>
        {added && (
          <span className="text-sm text-muted">
            ✓ Hinzugefügt ·{" "}
            <Link href="/bestellen" className="text-accent hover:text-accent-dark">
              Zum Warenkorb
            </Link>
          </span>
        )}
      </div>
    </form>
  );
}

function Choice({ name, label, options }: { name: string; label: string; options: string[] }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <select name={name} required className={inputClass} defaultValue="">
        <option value="" disabled>
          Bitte wählen
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
      <path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
