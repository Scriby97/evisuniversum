import type { Metadata } from "next";
import { SanityImage } from "@/components/SanityImage";
import { getSettings } from "@/lib/sanity";

export const metadata: Metadata = { title: "Über mich" };

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[2fr_3fr]">
      <div className="relative aspect-[4/5] self-start overflow-hidden rounded-3xl">
        <SanityImage image={settings.aboutImage} alt="" sizes="(min-width: 768px) 440px, 100vw" />
      </div>
      <div className="flex flex-col gap-5">
        <h1 className="font-script text-6xl">{settings.aboutTitle ?? "Über mich"}</h1>
        {settings.aboutText && (
          <p className="whitespace-pre-line text-lg leading-relaxed text-muted">{settings.aboutText}</p>
        )}
      </div>
    </section>
  );
}
