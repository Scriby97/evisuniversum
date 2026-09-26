import {defineField, defineType} from 'sanity'

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
      name: 'sizes',
      title: 'Grössen',
      description: 'Wählbare Grössen, z. B. 39–42. Leer lassen, wenn es keine Grössen gibt.',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),
    defineField({name: 'description', title: 'Beschreibung', type: 'text', rows: 5}),
    defineField({
      name: 'images',
      title: 'Bilder',
      description: 'Das erste Bild wird als Hauptbild angezeigt.',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [defineField({name: 'alt', title: 'Bildbeschreibung', type: 'string'})],
        },
      ],
    }),
    defineField({
      name: 'personalizable',
      title: 'Personalisierbar',
      description: 'Kundinnen können ein Motiv oder einen Text wählen.',
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
