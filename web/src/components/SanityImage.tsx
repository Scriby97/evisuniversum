import Image from "next/image";
import { imageUrl, type SanityImage as SanityImageType } from "@/lib/sanity";

// Füllt den umgebenden Container (der braucht `relative` und eine Grösse)
export function SanityImage({
  image,
  alt,
  sizes,
  priority,
  decorative,
  crop,
}: {
  image?: SanityImageType | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** Rein schmückend (z. B. Name steht daneben): Screenreader überspringen das Bild */
  decorative?: boolean;
  /** Auf dem Server zuschneiden (respektiert den Bildausschnitt aus dem Studio), z. B. { width: 1600, height: 900 } */
  crop?: { width: number; height: number };
}) {
  const src = imageUrl(image, crop);
  if (!src) return <div className="absolute inset-0 bg-sand" aria-hidden />;
  return (
    <Image
      src={src}
      alt={decorative ? "" : image?.alt || alt}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
    />
  );
}
