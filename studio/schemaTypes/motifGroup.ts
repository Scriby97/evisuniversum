import {defineArrayMember, defineField, defineType} from 'sanity'

// Eine Motiv-Sammlung = ein Raster unter «Personalisierung» im Shop (z. B. kleine Motive für Socken,
// grössere für Taschen oder T-Shirts). Produkte wählen, welche Sammlungen zur Auswahl stehen.
export const motifGroup = defineType({
  name: 'motifGroup',
  title: 'Motiv-Sammlung',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      description: 'Steht im Shop über dem Raster, z. B. «Motive für Socken» oder «Motive für Taschen & T-Shirts».',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'description',
      title: 'Kurzer Text (optional)',
      description: 'Erscheint unter dem Titel, z. B. «Ca. 3 cm gross – ideal für Socken».',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Reihenfolge',
      description: 'Kleinere Zahl = weiter oben, z. B. 10, 20, 30.',
      type: 'number',
    }),
    defineField({
      name: 'motifs',
      title: 'Motive',
      description: 'Sammlungen ohne Motive erscheinen nicht auf der Website.',
      type: 'array',
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
  ],
  orderings: [{title: 'Reihenfolge', name: 'sortOrder', by: [{field: 'sortOrder', direction: 'asc'}]}],
  preview: {
    select: {title: 'title', motifs: 'motifs', media: 'motifs.0.image'},
    prepare: ({title, motifs, media}) => ({
      title,
      subtitle: motifs?.length ? `${motifs.length} Motive` : 'Noch keine Motive – erscheint nicht im Shop',
      media,
    }),
  },
})
