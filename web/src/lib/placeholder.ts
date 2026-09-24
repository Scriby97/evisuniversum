import type { Category, Event, Product, SiteSettings } from "./sanity";

// Wird nur angezeigt, solange kein Sanity-Projekt verbunden ist.
// Diese Texte können als Startinhalt ins Studio übernommen werden.

export const placeholderSettings: SiteSettings = {
  siteName: "evi’s universum",
  heroTitle: "Willkommen bei",
  heroSubtitle: "Kreative Geschenkideen zum Selbermachen & liebevoll bestickte Lieblingsstücke.",
  heroText:
    "Hier findest du DIY-Geschenkideen mit Vorlagen und Anleitungen, bestickte Socken und Taschen sowie personalisierte Einzelstücke – für Hochzeiten, Reisen, Geburtstage oder einfach für einen Lieblingsmenschen.",
  highlights: [
    {
      _key: "h1",
      title: "DIY-Geschenkideen",
      text: "Vorlagen und Anleitungen, mit denen du ganz einfach persönliche Geschenke selbst gestaltest.",
      link: "/shop",
    },
    {
      _key: "h2",
      title: "Bestickte Socken & Taschen",
      text: "Von Hand bestickte Lieblingsstücke – für dich oder als Geschenk.",
      link: "/shop",
    },
    {
      _key: "h3",
      title: "Personalisierte Produkte",
      text: "Mit deinem Wunschmotiv, Namen oder passend für Gruppen und besondere Anlässe.",
      link: "/shop#personalisierung",
    },
  ],
  values: [
    "Geschenkideen für jeden Anlass",
    "Persönlich & einzigartig",
    "Mit Liebe gestaltet",
    "Inspiration für grosse & kleine Momente",
  ],
  personalizationTitle: "Personalisierung",
  personalizationText:
    "Viele Socken und Taschen kann ich nach deinen Wünschen besticken – mit einem Motiv, einem Namen oder einem kurzen Text.\n\nSo funktioniert’s: Wähle unten ein Motiv aus und schreib deinen Wunsch beim Bestellen ins Feld «Personalisierung». Ich melde mich bei dir, falls etwas unklar ist. Auch Bestellungen für Gruppen oder besondere Anlässe sind möglich – schreib mir einfach.",
  motifs: [
    { _key: "m1", name: "Herz" },
    { _key: "m2", name: "Stadtwappen" },
    { _key: "m3", name: "Panda" },
    { _key: "m4", name: "Flugzeug" },
    { _key: "m5", name: "Blumen" },
    { _key: "m6", name: "Initialen" },
  ],
  aboutTitle: "Hallo, ich bin Evi ♡",
  aboutText: `Hinter evi’s universum steckt meine Freude daran, kreativ zu sein und aus kleinen Ideen persönliche Geschenke zu machen.

Ich liebe es, Dinge selbst zu gestalten, zu basteln, zu nähen und zu besticken. Besonders schön finde ich Geschenke, bei denen man merkt: Da hat sich jemand Gedanken gemacht.

Genau daraus ist evi’s universum entstanden.

Hier findest du kreative DIY-Geschenkideen, die du mit meinen Vorlagen und Anleitungen ganz einfach selbst umsetzen und persönlich gestalten kannst. Viele meiner Ideen entstehen rund um besondere Momente wie Hochzeiten, Reisen, Geburtstage, Ruhestand oder einfach als kleine Aufmerksamkeit für einen Lieblingsmenschen.

Neben meinen DIY-Projekten entstehen bei mir auch liebevoll bestickte Socken, Taschen und individuelle Einzelstücke. Viele davon können personalisiert oder passend für Gruppen und besondere Anlässe gestaltet werden.

Mir ist wichtig, dass ein Geschenk nicht perfekt oder teuer sein muss. Viel schöner ist es, wenn es persönlich ist und zu dem Menschen passt, der es bekommt.

Schön, dass du in meinem kleinen Universum vorbeischaust. ♡`,
  orderInfo:
    "1. Wähle deine Produkte und fülle das Formular aus.\n2. Du erhältst innerhalb von 1–2 Tagen eine Rechnung per E-Mail.\n3. Sobald die Zahlung eingegangen ist, mache ich mich an die Arbeit und verschicke deine Bestellung. Digitale Vorlagen erhältst du per E-Mail.",
  shippingInfo: "Versand mit der Schweizerischen Post: CHF 9.00 pro Bestellung (Platzhalter).",
  faqs: [
    { _key: "f1", question: "Wie lange dauert die Lieferung?", answer: "Antwort folgt." },
    { _key: "f2", question: "Was kostet der Versand?", answer: "Antwort folgt." },
    { _key: "f3", question: "Welche Motive kann ich für die Personalisierung wählen?", answer: "Antwort folgt." },
    { _key: "f4", question: "Welche Sockengrössen gibt es?", answer: "Antwort folgt." },
    { _key: "f5", question: "Wie erhalte ich digitale DIY-Vorlagen?", answer: "Antwort folgt." },
  ],
  ownerName: "Eva-Maria Doyon",
  address: "Strasse Nr. (fehlt noch)\n3645 Gwatt (Thun)",
  email: "evis.universum@gmx.ch",
  agbText: `## Geltungsbereich
Diese AGB gelten für alle Bestellungen bei evi’s universum. (VORLAGE – vor dem Livegang prüfen und anpassen.)

## Bestellung und Vertragsabschluss
Mit dem Absenden des Bestellformulars gibst du eine verbindliche Bestellung ab. Der Vertrag kommt zustande, sobald du die Rechnung per E-Mail erhältst.

## Preise und Zahlung
Alle Preise in CHF. Die Bezahlung erfolgt per Rechnung im Voraus. Die Ware wird nach Zahlungseingang hergestellt bzw. verschickt.

## Personalisierte und digitale Produkte
Personalisierte Produkte werden individuell angefertigt und sind vom Umtausch ausgeschlossen. Digitale Vorlagen sind nur für den privaten Gebrauch bestimmt und dürfen nicht weitergegeben oder verkauft werden.

## Versand und Lieferung
Der Versand erfolgt mit der Schweizerischen Post innerhalb der Schweiz.

## Gewährleistung
Alle Produkte sind von Hand gemacht – kleine Abweichungen sind Teil ihres Charmes. Bei Mängeln melde dich bitte innerhalb von 14 Tagen nach Erhalt.`,
};

const product = (p: Partial<Product> & Pick<Product, "_id" | "name" | "price">): Product => ({
  slug: p._id,
  personalizable: false,
  digital: false,
  available: true,
  ...p,
});

export const placeholderCategories: Category[] = [
  {
    _id: "c1",
    title: "Bestickte Socken",
    slug: "socken",
    description: "Von Hand bestickt – auch mit deinem Wunschmotiv.",
    products: [
      product({ _id: "socken-thun", name: "Socken «Thun»", price: 29, personalizable: true }),
      product({ _id: "socken-herz", name: "Socken mit Herz", price: 25, personalizable: true }),
    ],
  },
  {
    _id: "c2",
    title: "Bestickte Taschen",
    slug: "taschen",
    description: "Stofftaschen mit Stickerei für jeden Tag.",
    products: [product({ _id: "tasche-panda", name: "Tasche «Panda»", price: 39, personalizable: true })],
  },
  {
    _id: "c3",
    title: "Digitale DIY-Vorlagen",
    slug: "diy-vorlagen",
    description: "Vorlagen und Anleitungen zum Herunterladen – für persönliche Geschenke zum Selbermachen.",
    products: [
      product({ _id: "vorlage-reise", name: "Vorlage «Boarding Pass»", price: 9, digital: true }),
      product({ _id: "vorlage-hochzeit", name: "Vorlage «Hochzeitsgeschenk»", price: 12, digital: true }),
    ],
  },
];

export const placeholderEvents: Event[] = [
  {
    _id: "e1",
    title: "Beispiel: Weihnachtsmarkt Thun",
    date: "2026-12-05",
    time: "10–18 Uhr",
    location: "Thun",
    description: "Platzhalter – Events werden im Studio unter «Märkte & Events» erfasst.",
  },
];
