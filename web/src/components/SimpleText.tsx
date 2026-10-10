// Reiner Text aus dem Studio mit **fett** (so schreibt Evi Hervorhebungen in einfache Textfelder)
export function SimpleText({ text }: { text: string }) {
  return text.split(/\*\*([^*]+)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-ink">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}
