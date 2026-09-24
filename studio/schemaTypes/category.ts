import {defineField, defineType} from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Kategorie',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Name', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      title: 'Kurzname (für Links)',
      type: 'slug',
      options: {source: 'title', maxLength: 64},
      validation: (r) => r.required(),
    }),
    defineField({name: 'description', title: 'Kurze Beschreibung', type: 'text', rows: 3}),
    defineField({
      name: 'sortOrder',
      title: 'Reihenfolge',
      description: 'Kleinere Zahl = weiter vorne.',
      type: 'number',
      initialValue: 10,
    }),
  ],
  orderings: [{title: 'Reihenfolge', name: 'sortOrder', by: [{field: 'sortOrder', direction: 'asc'}]}],
})
