"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export function CartButton() {
  const count = useCart().reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link href="/bestellen" className="relative flex items-center text-muted hover:text-ink" aria-label={`Warenkorb (${count})`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden>
        <path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-2 -top-1.5 flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-medium text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
