import {defineField} from 'sanity'

// Alternativtext: wird blinden und sehbehinderten Menschen vom Screenreader vorgelesen
export const altText = defineField({
  name: 'alt',
  title: 'Alternativtext (Bildbeschreibung)',
  description:
    'Was ist auf dem Bild zu sehen? Wird blinden und sehbehinderten Menschen vorgelesen. Kurz und konkret, z. B. «Weisse Socke mit gesticktem rosa Flamingo auf Holztisch».',
  type: 'string',
  validation: (r) => r.max(200),
})
