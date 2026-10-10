import {defineField, defineType} from 'sanity'
import {altText} from './altText'

export const event = defineType({
  name: 'event',
  title: 'Markt / Event',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'date', title: 'Datum', type: 'date', validation: (r) => r.required()}),
    defineField({
      name: 'endDate',
      title: 'Enddatum',
      description: 'Nur bei mehrtägigen Events.',
      type: 'date',
    }),
    defineField({name: 'time', title: 'Uhrzeit', description: 'z. B. 10–17 Uhr', type: 'string'}),
    defineField({name: 'location', title: 'Ort', type: 'string'}),
    defineField({
      name: 'image',
      title: 'Bild',
      description:
        'Erscheint oben auf der Event-Karte (Querformat wirkt am schönsten). Mit dem Stift-Symbol wählst du, welcher Bildteil sichtbar bleibt.',
      type: 'image',
      options: {hotspot: true},
      fields: [altText],
    }),
    defineField({name: 'description', title: 'Beschreibung', type: 'text', rows: 3}),
    defineField({name: 'link', title: 'Link zum Event', type: 'url'}),
  ],
  orderings: [{title: 'Datum', name: 'date', by: [{field: 'date', direction: 'asc'}]}],
  preview: {
    select: {title: 'title', date: 'date', location: 'location', media: 'image'},
    prepare: ({title, date, location, media}) => ({
      title,
      media,
      subtitle: [date && new Date(date).toLocaleDateString('de-CH'), location].filter(Boolean).join(' · '),
    }),
  },
})
