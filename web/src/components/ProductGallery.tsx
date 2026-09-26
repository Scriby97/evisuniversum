"use client";

import Image from "next/image";
import { useState } from "react";

export type GalleryImage = { src: string; alt: string };

// Hauptbild mit Vorschaubildern darunter, wenn ein Produkt mehrere Fotos hat
export function ProductGallery({ images, sizes }: { images: GalleryImage[]; sizes: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <>
      <div className="relative aspect-square">
        {current ? (
          <Image src={current.src} alt={current.alt} fill sizes={sizes} className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-sand" aria-hidden />
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto px-5 pt-3">
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Bild ${i + 1} anzeigen`}
              aria-current={i === active}
              className={`relative size-11 shrink-0 overflow-hidden rounded-md border-2 ${
                i === active ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={image.src} alt="" fill sizes="44px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
