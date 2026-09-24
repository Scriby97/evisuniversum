import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Sacramento } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getSettings } from "@/lib/sanity";
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
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  return (
    <html
      lang="de-CH"
      className={`${heading.variable} ${body.variable} ${script.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Header siteName={settings.siteName ?? "evi’s universum"} logo={settings.logo} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
