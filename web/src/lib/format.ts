// Ohne Abhängigkeiten, damit Browser-Komponenten nicht den Sanity-Client mitladen
export function formatPrice(price: number) {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(price);
}

const dateFormat = new Intl.DateTimeFormat("de-CH", { weekday: "short", day: "numeric", month: "long", year: "numeric" });

export function formatEventDate({ date, endDate }: { date: string; endDate?: string | null }) {
  const start = dateFormat.format(new Date(date));
  return endDate && endDate !== date ? `${start} – ${dateFormat.format(new Date(endDate))}` : start;
}
