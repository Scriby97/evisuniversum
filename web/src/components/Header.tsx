import Image from "next/image";
import Link from "next/link";
import { imageUrl, type SanityImage } from "@/lib/sanity";

const links = [
  { href: "/", label: "Startseite" },
  { href: "/shop", label: "Shop" },
  { href: "/ueber-mich", label: "Über mich" },
  { href: "/maerkte-events", label: "Märkte & Events" },
  { href: "/kontakt", label: "Kontakt" },
];

export function Header({ siteName, logo }: { siteName: string; logo?: SanityImage }) {
  const logoSrc = imageUrl(logo);
  return (
    <header className="border-b border-sand">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          {logoSrc && <Image src={logoSrc} alt="" width={134} height={100} className="h-11 w-auto" priority />}
          <span className="font-script text-4xl">{siteName}</span>
        </Link>
        <nav className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-muted hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
