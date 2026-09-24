import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Sacramento } from "next/font/google";
import { ComingSoonGate } from "@/components/ComingSoonGate";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getSettings, type SiteSettings } from "@/lib/sanity";
import "./globals.css";

const heading = Cormorant_Garamond({ variable: "--font-heading", subsets: ["latin"], weight: ["400", "500", "600"] });
const body = Inter({ variable: "--font-body", subsets: ["latin"] });
const script = Sacramento({ variable: "--font-script", subsets: ["latin"], weight: "400" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteName = settings.siteName ?? "evi’s universum";
  return {
    title: { default: siteName, template: `%s | ${siteName}` },
    description: settings.heroSubtitle,
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
      className={`${heading.variable} ${body.variable} ${script.variable} h-full antialiased`}
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
      </body>
    </html>
  );
}
