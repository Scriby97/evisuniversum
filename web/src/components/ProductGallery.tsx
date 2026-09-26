"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";

export type GalleryImage = { src: string; alt: string };

// Hauptbild mit Vorschaubildern; Klick aufs Hauptbild öffnet es gross (mit Blättern)
export function ProductGallery({ images, sizes }: { images: GalleryImage[]; sizes: string }) {
  const [active, setActive] = useState(0);
  // Grosses Bild erst beim Öffnen laden (nicht 33 grosse Bilder beim Seitenaufruf)
  const [zoomed, setZoomed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const current = images[active];
  const many = images.length > 1;

  function step(delta: number) {
    setActive((i) => (i + delta + images.length) % images.length);
  }

  function handleKey(event: KeyboardEvent) {
    if (event.key === "ArrowRight") step(1);
    if (event.key === "ArrowLeft") step(-1);
  }

  return (
    <>
      <div className="relative aspect-square">
        {current ? (
          <button
            type="button"
            onClick={() => {
              setZoomed(true);
              dialog.current?.showModal();
            }}
            className="absolute inset-0 cursor-zoom-in"
            aria-label={`${current.alt} gross anzeigen`}
          >
            <Image src={current.src} alt={current.alt} fill sizes={sizes} className="object-cover" />
          </button>
        ) : (
          <div className="absolute inset-0 bg-sand" aria-hidden />
        )}
      </div>

      {many && (
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

      {current && (
        <dialog
          ref={dialog}
          onKeyDown={handleKey}
          onClose={() => setZoomed(false)}
          // Klick auf den abgedunkelten Hintergrund schliesst
          onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
          className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-ink/90"
        >
          <div className="relative h-[85vh] w-[92vw] max-w-5xl">
            {zoomed && (
              <Image src={current.src} alt={current.alt} fill sizes="92vw" loading="eager" className="object-contain" />
            )}
          </div>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="fixed right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-2xl text-ink hover:bg-white"
            aria-label="Schliessen"
          >
            ×
          </button>
          {many && (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                className="fixed left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl text-ink hover:bg-white"
                aria-label="Vorheriges Bild"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                className="fixed right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl text-ink hover:bg-white"
                aria-label="Nächstes Bild"
              >
                ›
              </button>
              <p className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-sm text-ink">
                {active + 1} / {images.length}
              </p>
            </>
          )}
        </dialog>
      )}
    </>
  );
}
