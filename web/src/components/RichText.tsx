import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { RichTextValue } from "@/lib/sanity";

const components: PortableTextComponents = {
  block: {
    // pre-line: Zeilenumbrüche innerhalb eines Absatzes bleiben sichtbar
    normal: ({ children }) => <p className="whitespace-pre-line">{children}</p>,
    h3: ({ children }) => <h3 className="font-serif text-2xl font-medium text-ink">{children}</h3>,
    h2: ({ children }) => <h2 className="font-serif text-3xl font-medium text-ink">{children}</h2>,
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
    underline: ({ children }) => <span className="underline">{children}</span>,
    link: ({ children, value }) => (
      <a href={value?.href} className="text-accent underline hover:text-accent-dark">
        {children}
      </a>
    ),
  },
};

// Zeigt Texte mit Formatierung aus dem Studio – oder ältere reine Texte (Absätze, «## »-Zwischentitel)
export function RichText({ value, className = "" }: { value?: RichTextValue; className?: string }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;

  if (typeof value === "string") {
    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        {value.split(/\n{2,}/).map((paragraph, i) => {
          const [first, ...rest] = paragraph.split("\n");
          if (!first.startsWith("## ")) {
            return (
              <p key={i} className="whitespace-pre-line">
                {paragraph}
              </p>
            );
          }
          return (
            <div key={i} className="flex flex-col gap-1">
              <h3 className="font-serif text-2xl font-medium text-ink">{first.slice(3)}</h3>
              {rest.length > 0 && <p className="whitespace-pre-line">{rest.join("\n")}</p>}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <PortableText value={value} components={components} />
    </div>
  );
}
