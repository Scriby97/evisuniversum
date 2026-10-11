// Ohne Abhängigkeiten, damit Browser-Komponenten nicht den Sanity-Client mitladen
export function formatPrice(price: number) {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(price);
}

/** Preis wie im Shop angezeigt: «CHF 19.00», «ab CHF 19.00» oder «Preis auf Anfrage» */
export function formatProductPrice({ price, priceMode }: { price: number; priceMode?: string | null }) {
  if (priceMode === "request") return "Preis auf Anfrage";
  if (priceMode === "from") return `ab ${formatPrice(price)}`;
  return formatPrice(price);
}

const dateFormat = new Intl.DateTimeFormat("de-CH", { weekday: "short", day: "numeric", month: "long", year: "numeric" });

export function formatEventDate({ date, endDate }: { date: string; endDate?: string | null }) {
  const start = dateFormat.format(new Date(date));
  return endDate && endDate !== date ? `${start} – ${dateFormat.format(new Date(endDate))}` : start;
}
