"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { addToCart } from "@/lib/cart";
import { inputClass } from "@/lib/web3forms";

export function AddToCart({
  slug,
  personalizable,
  symbols,
}: {
  slug: string;
  personalizable: boolean;
  symbols: string[];
}) {
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);

  function add(symbol?: string, text?: string) {
    addToCart({ slug, ...(symbol && { symbol }), ...(text && { text }) });
    setOpen(false);
    setAdded(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    add(String(form.get("symbol") ?? ""), String(form.get("text") ?? "").trim());
  }

  if (open) {
    return (
      <form onSubmit={handleSubmit} className="mt-auto flex flex-col gap-2 rounded-xl bg-cream p-3 text-sm">
        {symbols.length > 0 && (
          <label className="flex flex-col gap-1">
            Symbol
            <select name="symbol" className={inputClass} defaultValue="">
              <option value="">Kein Symbol</option>
              {symbols.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="flex flex-col gap-1">
          Name oder Text (optional)
          <input name="text" maxLength={60} className={inputClass} placeholder="z. B. Alina" />
        </label>
        <Link href="/shop#personalisierung" className="text-xs text-accent hover:text-accent-dark">
          Alle Symbole ansehen
        </Link>
        <div className="flex gap-2">
          <button type="submit" className="rounded-full bg-accent px-4 py-2 text-white hover:bg-accent-dark">
            In den Warenkorb
          </button>
          <button type="button" onClick={() => setOpen(false)} className="rounded-full px-3 py-2 text-muted hover:text-ink">
            Abbrechen
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1">
      <button
        type="button"
        onClick={() => (personalizable ? setOpen(true) : add())}
        className="rounded-full bg-accent px-5 py-2 text-sm text-white hover:bg-accent-dark"
      >
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
  );
}
