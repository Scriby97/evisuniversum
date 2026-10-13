import {defineArrayMember, defineField, defineType} from 'sanity'
import {altText} from './altText'

const pageLinks = [
  {title: 'Shop', value: '/shop'},
  {title: 'Shop – Personalisierung', value: '/shop#personalisierung'},
  {title: 'Über mich', value: '/ueber-mich'},
  {title: 'Märkte & Events', value: '/maerkte-events'},
  {title: 'Kontakt', value: '/kontakt'},
]

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Website-Einstellungen',
  type: 'document',
  groups: [
    {name: 'launch', title: 'Wartung'},
    {name: 'home', title: 'Startseite', default: true},
    {name: 'shop', title: 'Shop & Personalisierung'},
    {name: 'about', title: 'Über mich'},
    {name: 'order', title: 'Bestellung & Versand'},
    {name: 'faq', title: 'FAQ'},
    {name: 'legal', title: 'Kontakt & Rechtliches'},
  ],
  fields: [
    // Feldnamen stammen noch von der «Bald online»-Seite vor dem Start; heute ist es der Wartungsmodus
    defineField({
      name: 'comingSoon',
      title: 'Website vorübergehend sperren (Wartungsmodus)',
      description:
        'Eingeschaltet: Besucherinnen sehen nur die Wartungsseite mit deinem Text. Mit dem Passwort kommst du trotzdem auf die Website und kannst deine Änderungen prüfen. Danach ausschalten und Publish – nach 3–5 Minuten ist die Seite wieder für alle offen.',
      type: 'boolean',
      initialValue: false,
      group: 'launch',
    }),
    defineField({
      name: 'comingSoonText',
      title: 'Text auf der Wartungsseite',
      description: 'z. B. «Ich nehme gerade ein paar Änderungen vor – schau bald wieder vorbei!»',
      type: 'text',
      rows: 3,
      group: 'launch',
    }),
    defineField({
      name: 'previewPassword',
      title: 'Passwort, um trotzdem auf die Website zu kommen',
      description: 'Für dich (und wer es kennt), solange der Wartungsmodus an ist. Gross-/Kleinschreibung egal.',
      type: 'string',
      group: 'launch',
      validation: (r) =>
        r.custom((pw, {document}) =>
          document?.comingSoon && !pw ? 'Bitte ein Passwort eintragen, sonst kommst du selbst nicht mehr auf die Seite.' : true,
        ),
    }),

    defineField({name: 'siteName', title: 'Name der Website', type: 'string', group: 'home'}),
    defineField({
      name: 'logo',
      title: 'Logo-Symbol',
      description: 'Nur das Symbol ohne Schrift (am besten PNG mit transparentem Hintergrund) – der Name steht daneben.',
      type: 'image',
      group: 'home',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Begrüssung',
      description: 'Steht klein über dem Namen der Website, z. B. «Willkommen bei».',
      type: 'string',
      group: 'home',
    }),
    defineField({name: 'heroSubtitle', title: 'Untertitel', type: 'string', group: 'home'}),
    defineField({
      name: 'heroImage',
      title: 'Titelbild',
      type: 'image',
      options: {hotspot: true},
      fields: [altText],
      group: 'home',
    }),
    defineField({name: 'heroText', title: 'Kurze Vorstellung', type: 'text', rows: 4, group: 'home'}),
    defineField({
      name: 'highlights',
      title: 'Produktbereiche',
      description: 'Die wichtigsten Bereiche, die auf der Startseite als Kacheln erscheinen.',
      type: 'array',
      group: 'home',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'title', title: 'Titel', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'text', title: 'Text', type: 'text', rows: 3}),
            defineField({name: 'image', title: 'Bild', type: 'image', options: {hotspot: true}, fields: [altText]}),
            defineField({
              name: 'link',
              title: 'Verlinkt auf',
              type: 'string',
              options: {list: pageLinks},
              initialValue: '/shop',
            }),
          ],
          preview: {select: {title: 'title', media: 'image'}},
        }),
      ],
    }),
    defineField({
      name: 'featuredProducts',
      title: 'Lieblingsprodukte',
      description: 'Erscheinen auf der Startseite (am schönsten sind 4). Reihenfolge per Ziehen ändern.',
      type: 'array',
      group: 'home',
      of: [defineArrayMember({type: 'reference', to: [{type: 'product'}]})],
      validation: (r) => r.max(8).unique(),
    }),
    defineField({
      name: 'values',
      title: 'Leiste unten auf der Startseite',
      description: 'Kurze Stichworte, z. B. «Mit Liebe gestaltet». Ideal sind 4.',
      type: 'array',
      group: 'home',
      of: [defineArrayMember({type: 'string'})],
    }),

    defineField({name: 'personalizationTitle', title: 'Titel Personalisierung', type: 'string', group: 'shop'}),
    defineField({
      name: 'personalizationText',
      title: 'Erklärung Personalisierung',
      description: 'Wie funktioniert eine personalisierte Bestellung?',
      type: 'richText',
      group: 'shop',
    }),
    defineField({
      name: 'notePlaceholder',
      title: 'Beispieltext im Feld «Bemerkung oder Wunsch»',
      description: 'Erscheint grau im leeren Feld auf der Produktseite, z. B. «z. B. Blauer Flamingo».',
      type: 'string',
      group: 'shop',
    }),
    defineField({
      name: 'namePlaceholder',
      title: 'Beispieltext im Feld «Namenwunsch»',
      description: 'Erscheint grau im leeren Feld auf der Produktseite, z. B. «z. B. Alina».',
      type: 'string',
      group: 'shop',
    }),

    defineField({name: 'aboutTitle', title: 'Titel', type: 'string', group: 'about'}),
    defineField({name: 'aboutText', title: 'Text', type: 'richText', group: 'about'}),
    defineField({
      name: 'aboutImage',
      title: 'Bild',
      type: 'image',
      options: {hotspot: true},
      fields: [altText],
      group: 'about',
    }),

    defineField({name: 'orderInfo', title: 'So funktioniert die Bestellung', type: 'richText', group: 'order'}),
    defineField({name: 'shippingInfo', title: 'Versandkosten & Lieferzeit', type: 'richText', group: 'order'}),
    defineField({
      name: 'shippingOptions',
      title: 'Versandarten',
      description:
        'Im Warenkorb wählbar, sobald etwas verschickt werden muss. Versandarten mit Haken «Versandtasche» gelten für kleine Sendungen (siehe unten), die anderen für Pakete. Die erste passende ist vorausgewählt (und wird bei «Gratisversand ab» gratis).',
      type: 'array',
      group: 'order',
      validation: (r) => r.min(1).error('Mindestens eine Versandart eintragen, sonst wird kein Versand berechnet.'),
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'name', title: 'Bezeichnung', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'price', title: 'Preis (CHF)', type: 'number', validation: (r) => r.required().min(0)}),
            defineField({
              name: 'envelope',
              title: 'Versandtasche / Luftpolsterumschlag',
              description: 'Nur für kleine Sendungen ohne Geschenkverpackung (bis zur Anzahl Produkte unten).',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: {title: 'name', price: 'price', envelope: 'envelope'},
            prepare: ({title, price, envelope}) => ({
              title,
              subtitle: `CHF ${price ?? 0}${envelope ? ' · Versandtasche' : ' · Paket'}`,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'envelopeMaxItems',
      title: 'Versandtasche bis … Produkte',
      description:
        'Bis zu so vielen Produkten (ohne digitale) wird in der Versandtasche verschickt. Mehr Produkte oder mit Geschenkverpackung = Paket.',
      type: 'number',
      initialValue: 3,
      validation: (r) => r.min(1).integer(),
      group: 'order',
    }),
    defineField({
      name: 'twintQr',
      title: 'TWINT-QR-Code',
      description:
        'Dein Firmen-QR-Code. Ist er hinterlegt, können Kundinnen im Warenkorb «TWINT» wählen (nicht bei Produkten auf Anfrage). Leer lassen = nur QR-Rechnung.',
      type: 'image',
      group: 'order',
    }),
    defineField({
      name: 'giftWrapPrice',
      title: 'Geschenkverpackung (CHF)',
      description: 'Preis für «Als Geschenk verpacken» im Warenkorb. Leer lassen, um die Option auszublenden.',
      type: 'number',
      validation: (r) => r.min(0),
      group: 'order',
    }),
    defineField({
      name: 'freeShippingFrom',
      title: 'Gratisversand ab (CHF)',
      description: 'Optional: ab diesem Bestellwert entfallen die Versandkosten.',
      type: 'number',
      validation: (r) => r.min(0),
      group: 'order',
    }),

    defineField({
      name: 'faqs',
      title: 'Häufige Fragen',
      type: 'array',
      group: 'faq',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'question', title: 'Frage', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'answer', title: 'Antwort', type: 'richText', validation: (r) => r.required()}),
          ],
          preview: {select: {title: 'question'}},
        }),
      ],
    }),

    defineField({name: 'ownerName', title: 'Name (Inhaberin)', type: 'string', group: 'legal'}),
    defineField({name: 'address', title: 'Adresse', type: 'text', rows: 3, group: 'legal'}),
    defineField({name: 'email', title: 'E-Mail', type: 'string', group: 'legal'}),
    defineField({name: 'instagram', title: 'Instagram-Link', type: 'url', group: 'legal'}),
    defineField({
      name: 'agbText',
      title: 'AGB',
      description: 'Zwischentitel mit der Schriftgrösse «Gross» oder «Sehr gross» formatieren.',
      type: 'richText',
      group: 'legal',
    }),
    defineField({
      name: 'privacyText',
      title: 'Datenschutzerklärung',
      description:
        'Der Abschnitt «Verantwortliche Stelle» wird automatisch aus Name, Adresse und E-Mail oben erzeugt. Bitte aktuell halten, wenn neue Dienste dazukommen (z. B. Newsletter, Statistik).',
      type: 'richText',
      group: 'legal',
    }),
  ],
  preview: {prepare: () => ({title: 'Website-Einstellungen'})},
})
