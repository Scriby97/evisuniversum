import {defineArrayMember, defineType} from 'sanity'

// Text mit Werkzeugleiste: Fett, Kursiv, Unterstrichen, grössere Schrift, Aufzählungen, Links
export const richText = defineType({
  name: 'richText',
  title: 'Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'Gross', value: 'h3'},
        {title: 'Sehr gross', value: 'h2'},
      ],
      lists: [
        {title: 'Aufzählung', value: 'bullet'},
        {title: 'Nummeriert', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Fett', value: 'strong'},
          {title: 'Kursiv', value: 'em'},
          {title: 'Unterstrichen', value: 'underline'},
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'Adresse',
                validation: (r) => r.uri({scheme: ['http', 'https', 'mailto', 'tel']}),
              },
            ],
          },
        ],
      },
    }),
  ],
})
