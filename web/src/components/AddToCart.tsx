"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { addToCart, type CartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/sanity";
import { inputClass } from "@/lib/web3forms";

export type CartProduct = Pick<
  Product,
  | "slug"
  | "colors"
  | "sizes"
  | "extras"
  | "customFields"
  | "personalizable"
  | "withSymbols"
  | "withNote"
  | "withName"
  | "onRequest"
>;

export function needsChoice(p: CartProduct) {
  return Boolean(
    p.colors?.length || p.sizes?.length || p.extras?.length || p.customFields?.length || p.personalizable,
  );
}

// Knopf auf dem Produktbild im Shop: Anfrage, direkt hinzufügen oder zur Auswahl auf der Produktseite
export function QuickAdd({ product }: { product: CartProduct }) {
  const [added, setAdded] = useState(false);
  const className =
    "flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm text-white shadow-md hover:bg-accent-dark";

  if (product.onRequest) {
    return (
      <Link href={`/anfrage/${product.slug}`} className={className}>
        <MailIcon />
        Auf Anfrage
      </Link>
    );
  }
  if (needsChoice(product)) {
    return (
      <Link href={`/shop/${product.slug}#auswahl`} className={className}>
        <BagIcon />
        In den Warenkorb
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
      {added ? "✓ Im Warenkorb" : "In den Warenkorb"}
    </button>
  );
}

export type ChoiceValues = Omit<CartItem, "id" | "quantity" | "slug">;

// Liest die gewählten Optionen aus einem Formular mit <OptionFields>
export function readChoices(form: FormData, product: CartProduct): ChoiceValues {
  const value = (name: string) => String(form.get(name) ?? "").trim() || undefined;
  const extras = form.getAll("extras").map(String);
  const custom = (product.customFields ?? []).flatMap((f) => {
    const v = value(`custom-${f._key}`);
    return v ? [{ label: f.label, value: v }] : [];
  });
  return {
    color: value("color"),
    size: value("size"),
    extras: extras.length ? extras : undefined,
    custom: custom.length ? custom : undefined,
    symbol: value("symbol"),
    name: value("nameWish"),
    text: value("text"),
  };
}

// Auswahlfelder eines Produkts – für den Warenkorb (mit Pflichtfeldern) und die Anfrage (alles freiwillig)
export function OptionFields({
  product,
  symbols,
  notePlaceholder,
  namePlaceholder,
  allOptional = false,
}: {
  product: CartProduct;
  symbols: string[];
  notePlaceholder: string;
  namePlaceholder: string;
  allOptional?: boolean;
}) {
  const showSymbols = product.personalizable && product.withSymbols && symbols.length > 0;
  const isRequired = (required?: boolean) => !allOptional && required !== false;

  return (
    <>
      {product.colors?.length ? (
        <Choice name="color" label="Farbe" options={product.colors} required={isRequired(true)} />
      ) : null}
      {product.sizes?.length ? (
        <Choice name="size" label="Grösse" options={product.sizes} required={isRequired(true)} />
      ) : null}
      {product.customFields?.map((field) =>
        field.kind === "text" ? (
          <label key={field._key} className="flex flex-col gap-1 text-sm">
            {isRequired(field.required) ? field.label : `${field.label} (optional)`}
            <input
              name={`custom-${field._key}`}
              required={isRequired(field.required)}
              maxLength={100}
              className={inputClass}
            />
          </label>
        ) : field.options?.length ? (
          <Choice
            key={field._key}
            name={`custom-${field._key}`}
            label={isRequired(field.required) ? field.label : `${field.label} (optional)`}
            options={field.options}
            required={isRequired(field.required)}
          />
        ) : null,
      )}
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
      {product.personalizable && product.withName && (
        <label className="flex flex-col gap-1 text-sm">
          Namenwunsch (optional)
          <input name="nameWish" maxLength={60} className={inputClass} placeholder={namePlaceholder} />
        </label>
      )}
      {/* Die Anfrage hat ein eigenes, grösseres Bemerkungsfeld */}
      {product.personalizable && product.withNote && !allOptional && (
        <label className="flex flex-col gap-1 text-sm">
          Bemerkung oder Wunsch (optional)
          <textarea name="text" rows={3} maxLength={300} className={inputClass} placeholder={notePlaceholder} />
          <span className="text-xs text-muted">Bei Rückfragen melde ich mich direkt bei dir.</span>
        </label>
      )}
    </>
  );
}

// Vollständige Auswahl auf der Produktseite (Warenkorb)
export function ProductOptions({
  product,
  symbols,
  notePlaceholder,
  namePlaceholder,
}: {
  product: CartProduct;
  symbols: string[];
  notePlaceholder: string;
  namePlaceholder: string;
}) {
  const [added, setAdded] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addToCart({ slug: product.slug, ...readChoices(new FormData(event.currentTarget), product) });
    setAdded(true);
  }

  return (
    <form id="auswahl" onSubmit={handleSubmit} onChange={() => setAdded(false)} className="flex flex-col gap-4">
      <OptionFields
        product={product}
        symbols={symbols}
        notePlaceholder={notePlaceholder}
        namePlaceholder={namePlaceholder}
      />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button type="submit" className="flex items-center gap-1.5 rounded-full bg-accent px-6 py-3 text-white hover:bg-accent-dark">
          <BagIcon />
          In den Warenkorb
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

function Choice({
  name,
  label,
  options,
  required = true,
}: {
  name: string;
  label: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <select name={name} required={required} className={inputClass} defaultValue="">
        <option value="" disabled={required}>
          {required ? "Bitte wählen" : "Keine Auswahl"}
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

export function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}
