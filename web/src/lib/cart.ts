"use client";

import { useSyncExternalStore } from "react";

// Warenkorb im Browser (localStorage) – es gibt keinen Server, bestellt wird per Formular
export type CartItem = {
  id: string;
  slug: string;
  quantity: number;
  color?: string;
  size?: string;
  extras?: string[];
  /** Eigene Auswahlfelder: Bezeichnung → Wert */
  custom?: { label: string; value: string }[];
  symbol?: string;
  /** «Namenwunsch» */
  name?: string;
  /** «Bemerkung oder Wunsch» */
  text?: string;
};

// Gleicher Artikel mit gleicher Auswahl → eine Zeile mit höherer Menge
function sameChoice(a: Omit<CartItem, "id" | "quantity">, b: Omit<CartItem, "id" | "quantity">) {
  return (
    a.slug === b.slug &&
    a.color === b.color &&
    a.size === b.size &&
    a.symbol === b.symbol &&
    a.text === b.text &&
    a.name === b.name &&
    (a.extras ?? []).join("|") === (b.extras ?? []).join("|") &&
    JSON.stringify(a.custom ?? []) === JSON.stringify(b.custom ?? [])
  );
}

const storageKey = "evisuniversum-cart";
const changeEvent = "evisuniversum-cart-change";
const empty: CartItem[] = [];

let cachedRaw: string | null = null;
let cachedItems: CartItem[] = empty;

function read(): CartItem[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(storageKey);
  } catch {}
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedItems = raw ? JSON.parse(raw) : empty;
    } catch {
      cachedItems = empty;
    }
  }
  return cachedItems;
}

function write(items: CartItem[]) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
  } catch {}
  window.dispatchEvent(new Event(changeEvent));
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(changeEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(changeEvent, onChange);
  };
}

export function useCart() {
  return useSyncExternalStore(subscribe, read, () => empty);
}

export function addToCart(item: Omit<CartItem, "id" | "quantity">) {
  const items = read();
  const same = items.find((i) => sameChoice(i, item));
  write(
    same
      ? items.map((i) => (i === same ? { ...i, quantity: Math.min(99, i.quantity + 1) } : i))
      : [...items, { ...item, id: crypto.randomUUID(), quantity: 1 }],
  );
}

export function setQuantity(id: string, quantity: number) {
  write(
    quantity <= 0
      ? read().filter((i) => i.id !== id)
      : read().map((i) => (i.id === id ? { ...i, quantity: Math.min(99, quantity) } : i)),
  );
}

export function clearCart() {
  write(empty);
}
