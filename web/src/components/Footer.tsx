import Link from "next/link";
import type { SiteSettings } from "@/lib/sanity";

const legalLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "/agb", label: "AGB" },
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
];

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-20 border-t border-sand bg-sand/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-muted sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-script text-3xl text-ink">Schön, dass du da bist ♡</span>
          {settings.email && (
            <a href={`mailto:${settings.email}`} className="hover:text-ink">
              {settings.email}
            </a>
          )}
          {settings.instagram && (
            <a href={settings.instagram} target="_blank" rel="noreferrer" className="hover:text-ink">
              Instagram
            </a>
          )}
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-1">
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
