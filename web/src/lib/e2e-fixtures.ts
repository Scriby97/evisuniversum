import type { Category, Event, Product, SiteSettings } from "./sanity";

// Feste Testdaten für die automatischen Tests (E2E=1, siehe e2e/). Jedes Produkt deckt einen Fall ab,
// der schon einmal kaputt war oder leicht kaputtgehen kann. Nicht für die echte Website.

export const e2eSettings: SiteSettings = {
  siteName: "evi’s universum",
  heroTitle: "Willkommen bei",
  heroSubtitle: "Testdaten",
  notePlaceholder: "z. B. Blauer Flamingo",
  namePlaceholder: "z. B. Alina",
  motifs: [
    { _key: "m1", name: "Herz" },
    { _key: "m2", name: "Panda" },
  ],
  shippingOptions: [
    { _key: "s1", name: "Economy", price: 9 },
    { _key: "s2", name: "Priority", price: 10.5 },
  ],
  freeShippingFrom: 100,
  giftWrapPrice: 5,
  twintQr: { _type: "image", asset: { _type: "reference", _ref: "image-e2etwint-100x150-png" } },
  ownerName: "Test Inhaberin",
  address: "Teststrasse 1\n3600 Thun",
  email: "shop@example.ch",
};

const product = (p: Partial<Product> & Pick<Product, "_id" | "name" | "price">): Product => {
  const full: Product = {
    slug: p._id,
    personalizable: false,
    withSymbols: true,
    withNote: true,
    withName: false,
    onRequest: false,
    stock: null,
    digital: false,
    available: true,
    ...p,
  };
  // Wie die Abfrage in sanity.ts: Bestand 0 → automatisch «Auf Anfrage»
  return { ...full, onRequest: full.onRequest || (typeof full.stock === "number" && full.stock <= 0) };
};

export const e2eProducts = {
  /** Pflichtauswahl Farbe/Grösse, Zusatzoption, Symbol, Namenwunsch; Lagerfeld leer (null) */
  socken: product({
    _id: "test-socken",
    name: "Testsocken",
    price: 25,
    colors: ["Weiss", "Schwarz"],
    sizes: ["35–38", "39–42"],
    extras: [{ _key: "x1", name: "Beidseitig", price: 5 }],
    personalizable: true,
    withName: true,
  }),
  /** Ohne Auswahl, 2 an Lager → direkt in den Warenkorb, Bestand wird abgezogen */
  tasche: product({ _id: "test-tasche", name: "Testtasche", price: 39, stock: 2 }),
  /** Ausdrücklich auf Anfrage, mit Namenwunsch */
  saeckli: product({
    _id: "test-saeckli",
    name: "Testsäckli",
    price: 19,
    onRequest: true,
    personalizable: true,
    withName: true,
  }),
  /** Lager 0 → automatisch auf Anfrage */
  leer: product({ _id: "test-leer", name: "Leeres Lagerprodukt", price: 15, stock: 0 }),
  /** Ausgeschaltet → ausverkauft */
  weg: product({ _id: "test-weg", name: "Ausverkauftes Produkt", price: 12, available: false }),
  /** Digital → keine Adresse, kein Versand */
  vorlage: product({ _id: "test-vorlage", name: "Testvorlage", price: 9, digital: true }),
};

export const e2eCategories: Category[] = [
  {
    _id: "c1",
    title: "Testprodukte",
    slug: "test",
    products: [e2eProducts.socken, e2eProducts.tasche, e2eProducts.saeckli, e2eProducts.leer, e2eProducts.weg],
  },
  { _id: "c2", title: "Testvorlagen", slug: "vorlagen", products: [e2eProducts.vorlage] },
];

export const e2eEvents: Event[] = [];
