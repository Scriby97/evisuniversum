"use client";

// Übersicht nach einer Bestellung/Anfrage: die Kundin kann sie sich selbst mailen oder ausdrucken.
// (Eine automatisch verschickte Bestätigung gibt es nur im bezahlten Web3Forms-Plan.)
export function ConfirmationCopy({
  email,
  subject,
  summary,
}: {
  email: string;
  subject: string;
  summary: string;
}) {
  const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-sand bg-cream p-4 text-sm leading-relaxed whitespace-pre-line text-ink">
        {summary}
      </div>
      <div className="flex flex-wrap gap-2 print:hidden">
        <a
          href={mailto}
          className="rounded-full bg-accent px-5 py-2.5 text-sm text-white hover:bg-accent-dark"
        >
          Bestätigung an mich mailen
        </a>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full border border-accent px-5 py-2.5 text-sm text-accent hover:bg-accent hover:text-white"
        >
          Drucken / als PDF speichern
        </button>
      </div>
      <p className="text-xs text-muted print:hidden">
        «Bestätigung an mich mailen» öffnet dein E-Mail-Programm mit einer
        fertigen Nachricht an {email} – einfach absenden, dann hast du alles in
        deinem Postfach.
      </p>
    </div>
  );
}
