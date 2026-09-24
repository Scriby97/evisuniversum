import Image from "next/image";
import { imageUrl, type SanityImage as SanityImageType } from "@/lib/sanity";

// Füllt den umgebenden Container (der braucht `relative` und eine Grösse)
export function SanityImage({
  image,
  alt,
  sizes,
  priority,
}: {
  image?: SanityImageType;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  const src = imageUrl(image);
  if (!src) return <div className="absolute inset-0 bg-sand" aria-hidden />;
  return (
    <Image
      src={src}
      alt={image?.alt || alt}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
    />
  );
}
