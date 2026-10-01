"use client";

import { Children, useState, type ReactNode } from "react";

// Zeigt zuerst `limit` Einträge; der Rest bleibt im HTML, ist aber bis zum Aufklappen ausgeblendet
export function ExpandableGrid({
  children,
  limit,
  moreLabel,
}: {
  children: ReactNode;
  limit: number;
  moreLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const items = Children.toArray(children);
  const hidden = items.length - limit;

  return (
    <>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item, i) => (
          <div key={i} className={!expanded && i >= limit ? "hidden" : "contents"}>
            {item}
          </div>
        ))}
      </div>
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="mx-auto mt-6 block rounded-full border border-accent px-6 py-2.5 text-accent hover:bg-accent hover:text-white"
        >
          {expanded ? "Weniger anzeigen" : moreLabel}
        </button>
      )}
    </>
  );
}
