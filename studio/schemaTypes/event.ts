import {defineField, defineType} from 'sanity'

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
    defineField({name: 'description', title: 'Beschreibung', type: 'text', rows: 3}),
    defineField({name: 'link', title: 'Link zum Event', type: 'url'}),
  ],
  orderings: [{title: 'Datum', name: 'date', by: [{field: 'date', direction: 'asc'}]}],
  preview: {
    select: {title: 'title', date: 'date', location: 'location'},
    prepare: ({title, date, location}) => ({
      title,
      subtitle: [date && new Date(date).toLocaleDateString('de-CH'), location].filter(Boolean).join(' · '),
    }),
  },
})
