"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { changeEvent, useCart } from "@/lib/cart";

// Zählt nur Produkte, die es im Shop noch gibt (veraltete Einträge im Browser-Speicher nicht)
export function CartButton({ orderableSlugs }: { orderableSlugs: string[] }) {
  const count = useCart()
    .filter((item) => orderableSlugs.includes(item.slug))
    .reduce((sum, item) => sum + item.quantity, 0);
  const icon = useRef<HTMLSpanElement>(null);
  const badge = useRef<HTMLSpanElement>(null);

  // Kurzer Hüpfer, wenn etwas in den Warenkorb kommt – als Bestätigung, dass es geklappt hat.
  // Nur bei Änderungen in diesem Fenster, nicht beim Laden der Seite.
  useEffect(() => {
    const bump = () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      icon.current?.animate(
        [{ transform: "none" }, { transform: "translateY(-5px) scale(1.15) rotate(-8deg)" }, { transform: "translateY(0) scale(0.95)" }, { transform: "none" }],
        { duration: 550, easing: "cubic-bezier(.2,.7,.2,1)" },
      );
      // Die Zahl erst nach dem Neuzeichnen (beim ersten Artikel gibt es sie vorher noch nicht)
      requestAnimationFrame(() =>
        badge.current?.animate([{ transform: "scale(0.4)" }, { transform: "scale(1.3)" }, { transform: "none" }], { duration: 450, easing: "ease-out" }),
      );
    };
    window.addEventListener(changeEvent, bump);
    return () => window.removeEventListener(changeEvent, bump);
  }, []);

  return (
    <Link href="/bestellen" className="relative flex items-center text-muted hover:text-ink" aria-label={`Warenkorb (${count})`}>
      <span ref={icon} className="flex">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden>
          <path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
      </span>
      {count > 0 && (
        <span ref={badge} className="absolute -right-2 -top-1.5 flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-medium text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
