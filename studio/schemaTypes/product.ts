import {defineField, defineType} from 'sanity'
import {altText} from './altText'

export const product = defineType({
  name: 'product',
  title: 'Produkt',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      title: 'Kurzname (für Links)',
      type: 'slug',
      options: {source: 'name', maxLength: 64},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'category',
      title: 'Kategorie',
      type: 'reference',
      to: [{type: 'category'}],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'price',
      title: 'Preis (CHF)',
      type: 'number',
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: 'colors',
      title: 'Farben',
      description: 'Wählbare Farben, z. B. Weiss, Schwarz. Leer lassen, wenn es nur eine Farbe gibt.',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'sizes',
      title: 'Grössen',
      description: 'Wählbare Grössen, z. B. 39–42. Leer lassen, wenn es keine Grössen gibt.',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'customFields',
      title: 'Eigene Auswahlfelder',
      description:
        'Weitere Felder für die Bestellung, z. B. «Schnitt» (Damen/Herren) bei T-Shirts oder «Initialen» bei Hüten. So viele wie nötig.',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Bezeichnung',
              description: 'So heisst das Feld beim Produkt, z. B. «Schnitt».',
              type: 'string',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'kind',
              title: 'Art',
              type: 'string',
              options: {
                list: [
                  {title: 'Auswahlliste', value: 'select'},
                  {title: 'Textfeld (freie Eingabe)', value: 'text'},
                ],
                layout: 'radio',
              },
              initialValue: 'select',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'options',
              title: 'Auswahlmöglichkeiten',
              description: 'Jede Möglichkeit eintippen und Enter drücken, z. B. Damen, Herren, Kinder.',
              type: 'array',
              of: [{type: 'string'}],
              options: {layout: 'tags'},
              hidden: ({parent}) => parent?.kind === 'text',
              validation: (r) =>
                r.custom((options, ctx) =>
                  (ctx.parent as {kind?: string})?.kind !== 'text' && !(options as string[] | undefined)?.length
                    ? 'Mindestens eine Auswahlmöglichkeit eintragen'
                    : true,
                ),
            }),
            defineField({
              name: 'required',
              title: 'Pflichtfeld',
              description: 'Kundinnen müssen das Feld ausfüllen, bevor das Produkt in den Warenkorb kommt.',
              type: 'boolean',
              initialValue: true,
            }),
          ],
          preview: {
            select: {title: 'label', kind: 'kind', options: 'options', required: 'required'},
            prepare: ({title, kind, options, required}) => ({
              title,
              subtitle: [
                kind === 'text' ? 'Textfeld' : (options ?? []).join(' / '),
                required === false ? 'optional' : 'Pflicht',
              ].join(' · '),
            }),
          },
        },
      ],
    }),
    defineField({
      name: 'extras',
      title: 'Zusatzoptionen',
      description: 'Ankreuzbare Extras mit Aufpreis, z. B. «Bestickung auf beiden Seiten» für CHF 5.',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'name', title: 'Bezeichnung', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'price', title: 'Aufpreis (CHF)', type: 'number', validation: (r) => r.required().min(0)}),
          ],
          preview: {
            select: {title: 'name', price: 'price'},
            prepare: ({title, price}) => ({title, subtitle: `+ CHF ${price ?? 0}`}),
          },
        },
      ],
    }),
    defineField({
      name: 'description',
      title: 'Kurzbeschreibung',
      description: 'Ein bis zwei Sätze – erscheint im Shop unter dem Produkt.',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'details',
      title: 'Ausführliche Beschreibung',
      description: 'Material, Pflegehinweise usw. – erscheint auf der Produktseite.',
      type: 'richText',
    }),
    defineField({
      name: 'images',
      title: 'Bilder',
      description: 'Das erste Bild wird als Hauptbild angezeigt.',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [altText],
        },
      ],
    }),
    defineField({
      name: 'personalizable',
      title: 'Personalisierbar',
      description: 'Danach wählst du unten, welche Felder es gibt: Symbolauswahl, «Bemerkung oder Wunsch», «Namenwunsch».',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'withSymbols',
      title: 'Symbolauswahl anbieten',
      description: 'Symbol aus der Symbol-Auswahl (F1–F18) wählen lassen.',
      type: 'boolean',
      initialValue: true,
      hidden: ({document}) => !document?.personalizable,
    }),
    defineField({
      name: 'withNote',
      title: 'Feld «Bemerkung oder Wunsch»',
      description: 'Freies Textfeld für Wünsche und Bemerkungen.',
      type: 'boolean',
      initialValue: true,
      hidden: ({document}) => !document?.personalizable,
    }),
    defineField({
      name: 'withName',
      title: 'Feld «Namenwunsch»',
      description: 'Eigenes Feld für den gewünschten Namen (z. B. für eine Bestickung).',
      type: 'boolean',
      initialValue: false,
      hidden: ({document}) => !document?.personalizable,
    }),
    defineField({
      name: 'onRequest',
      title: 'Auf Anfrage',
      description:
        'Statt «In den Warenkorb» steht «Auf Anfrage». Die Bestellung ist dann eine Anfrage – du prüfst, ob du das Produkt herstellen kannst.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'digital',
      title: 'Digitales Produkt',
      description: 'Wird per E-Mail geliefert (z. B. DIY-Vorlage) – kein Versand nötig.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'available',
      title: 'Verfügbar',
      description: 'Ausschalten, wenn das Produkt ausverkauft ist.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'stock',
      title: 'Anzahl an Lager',
      description:
        'Wird bei jeder Bestellung automatisch abgezogen. Bei 0 erscheint das Produkt als «Auf Anfrage». Leer lassen, wenn der Bestand nicht gezählt werden soll.',
      type: 'number',
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: 'sortOrder',
      title: 'Reihenfolge',
      description: 'Kleinere Zahl = weiter vorne.',
      type: 'number',
      initialValue: 10,
    }),
  ],
  orderings: [{title: 'Reihenfolge', name: 'sortOrder', by: [{field: 'sortOrder', direction: 'asc'}]}],
  preview: {
    select: {title: 'name', price: 'price', media: 'images.0', available: 'available', category: 'category.title'},
    prepare: ({title, price, media, available, category}) => ({
      title,
      subtitle: [category, `CHF ${price ?? '–'}`, available === false && 'ausverkauft'].filter(Boolean).join(' · '),
      media,
    }),
  },
})
