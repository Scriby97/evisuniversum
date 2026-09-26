import {defineArrayMember, defineField, defineType} from 'sanity'

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
    {name: 'launch', title: 'Im Aufbau'},
    {name: 'home', title: 'Startseite', default: true},
    {name: 'shop', title: 'Shop & Personalisierung'},
    {name: 'about', title: 'Über mich'},
    {name: 'order', title: 'Bestellung & Versand'},
    {name: 'faq', title: 'FAQ'},
    {name: 'legal', title: 'Kontakt & Rechtliches'},
  ],
  fields: [
    defineField({
      name: 'comingSoon',
      title: 'Website noch im Aufbau',
      description:
        'Eingeschaltet: Besucher sehen nur die «Bald online»-Seite. Ausschalten, sobald die Website fertig ist.',
      type: 'boolean',
      initialValue: true,
      group: 'launch',
    }),
    defineField({
      name: 'comingSoonText',
      title: 'Text auf der «Bald online»-Seite',
      type: 'text',
      rows: 3,
      group: 'launch',
      hidden: ({document}) => document?.comingSoon === false,
    }),
    defineField({
      name: 'previewPassword',
      title: 'Passwort für die Vorschau',
      description: 'Damit kommst du (und wer es kennt) an der «Bald online»-Seite vorbei. Gross-/Kleinschreibung egal.',
      type: 'string',
      group: 'launch',
      hidden: ({document}) => document?.comingSoon === false,
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
    defineField({name: 'heroImage', title: 'Titelbild', type: 'image', options: {hotspot: true}, group: 'home'}),
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
            defineField({name: 'image', title: 'Bild', type: 'image', options: {hotspot: true}}),
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
      type: 'text',
      rows: 6,
      group: 'shop',
    }),
    defineField({
      name: 'motifs',
      title: 'Motive & Symbole',
      type: 'array',
      group: 'shop',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'name', title: 'Name', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'image', title: 'Bild', type: 'image'}),
          ],
          preview: {select: {title: 'name', media: 'image'}},
        }),
      ],
    }),

    defineField({name: 'aboutTitle', title: 'Titel', type: 'string', group: 'about'}),
    defineField({name: 'aboutText', title: 'Text', type: 'text', rows: 14, group: 'about'}),
    defineField({name: 'aboutImage', title: 'Bild', type: 'image', options: {hotspot: true}, group: 'about'}),

    defineField({name: 'orderInfo', title: 'So funktioniert die Bestellung', type: 'text', rows: 5, group: 'order'}),
    defineField({name: 'shippingInfo', title: 'Versandkosten & Lieferzeit', type: 'text', rows: 4, group: 'order'}),

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
            defineField({name: 'answer', title: 'Antwort', type: 'text', rows: 4, validation: (r) => r.required()}),
          ],
          preview: {select: {title: 'question', subtitle: 'answer'}},
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
      description: 'Absätze mit einer Leerzeile trennen. Zeilen, die mit «## » beginnen, werden zu Zwischentiteln.',
      type: 'text',
      rows: 20,
      group: 'legal',
    }),
  ],
  preview: {prepare: () => ({title: 'Website-Einstellungen'})},
})
