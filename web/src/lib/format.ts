// Ohne Abhängigkeiten, damit Browser-Komponenten nicht den Sanity-Client mitladen
export function formatPrice(price: number) {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(price);
}
