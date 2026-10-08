import Image from "next/image";
import Link from "next/link";
import { imageUrl, type SanityImage } from "@/lib/sanity";
import { CartButton } from "./CartButton";
import { MobileMenu } from "./MobileMenu";

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
    <header className="relative border-b border-sand print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-x-8 px-4 py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          {logoSrc && <Image src={logoSrc} alt="" width={134} height={100} className="h-11 w-auto" priority />}
          <span className="truncate font-serif text-3xl font-medium">{siteName}</span>
        </Link>
        <nav aria-label="Hauptmenü" className="hidden items-center gap-x-6 text-sm lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-muted hover:text-ink">
              {link.label}
            </Link>
          ))}
          <CartButton />
        </nav>
        <div className="flex shrink-0 items-center gap-3 lg:hidden">
          <CartButton />
          <MobileMenu links={links} />
        </div>
      </div>
    </header>
  );
}
