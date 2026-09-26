"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Aufklappbares Menü für schmale Bildschirme; die Desktop-Leiste steht im Header
export function MobileMenu({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Menü schliessen" : "Menü öffnen"}
        className="flex size-10 items-center justify-center rounded-full text-ink hover:bg-sand"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="size-6" aria-hidden>
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      {open && (
        <nav id="mobile-menu" className="absolute inset-x-0 top-full z-40 border-b border-sand bg-cream shadow-sm">
          <ul className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className="block border-b border-sand/60 py-3 text-lg last:border-0 aria-[current=page]:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
