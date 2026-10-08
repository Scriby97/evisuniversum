import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { ComingSoonGate } from "@/components/ComingSoonGate";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getSettings, type SiteSettings } from "@/lib/sanity";
import "./globals.css";

// Token aus Cloudflare → Web Analytics (öffentlich, steht ohnehin im HTML). Leer = keine Statistik.
const analyticsToken = "aa3d4aa2bcd34abba86f4921c9576e12";

const heading = Cormorant_Garamond({ variable: "--font-heading", subsets: ["latin"], weight: ["400", "500", "600"] });
const body = Inter({ variable: "--font-body", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteName = settings.siteName ?? "evi’s universum";
  return {
    title: { default: siteName, template: `%s | ${siteName}` },
    description: settings.heroSubtitle,
    metadataBase: new URL("https://evisuniversum.ch"),
    // Vorschaubild beim Teilen des Links (WhatsApp, Facebook, …)
    openGraph: { images: [{ url: "/og.jpg", width: 689, height: 361 }], locale: "de_CH", siteName },
    // Solange die Seite im Aufbau ist, soll Google sie nicht aufnehmen
    robots: isComingSoon(settings) ? { index: false, follow: false } : undefined,
  };
}

function isComingSoon(settings: SiteSettings) {
  return settings.comingSoon === true && Boolean(settings.previewPassword);
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  const siteName = settings.siteName ?? "evi’s universum";
  const page = (
    <>
      <Header siteName={siteName} logo={settings.logo} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </>
  );
  return (
    <html
      lang="de-CH"
      className={`${heading.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {isComingSoon(settings) ? (
          <ComingSoonGate
            siteName={siteName}
            text={settings.comingSoonText ?? "Meine Homepage entsteht gerade und ist bald online."}
            password={settings.previewPassword!}
          >
            {page}
          </ComingSoonGate>
        ) : (
          page
        )}
        {analyticsToken && (
          // Cloudflare Web Analytics: ohne Cookies, zählt Seitenaufrufe (auch beim Wechsel zwischen Seiten)
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: analyticsToken })}
          />
        )}
      </body>
    </html>
  );
}
