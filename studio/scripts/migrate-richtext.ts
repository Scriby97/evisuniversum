// Einmalige Umwandlung der langen Textfelder (reiner Text) in Editor-Text (Portable Text).
// Probelauf:  npx sanity exec scripts/migrate-richtext.ts --with-user-token
// Ausführen:  WRITE=1 npx sanity exec scripts/migrate-richtext.ts --with-user-token
// Wandelt nur Felder um, die noch reiner Text sind; Entwürfe werden mit umgewandelt.
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-09-01'})
const write = process.env.WRITE === '1'
let n = 0
const key = () => `k${(n++).toString(36)}${Math.random().toString(36).slice(2, 7)}`

const span = (text: string) => ({_type: 'span', _key: key(), text, marks: []})
const block = (text: string, extra: Record<string, unknown> = {}) => ({
  _type: 'block',
  _key: key(),
  style: 'normal',
  markDefs: [],
  children: [span(text)],
  ...extra,
})

const bullet = /^\s*[-•]\s+/

// Absätze (Leerzeile) → Blöcke; Zeilen mit «- » / «• » → echte Aufzählung; «## » → Zwischentitel
export function toBlocks(text: string) {
  const blocks: ReturnType<typeof block>[] = []
  for (const paragraph of text.replace(/\r\n/g, '\n').split(/\n{2,}/)) {
    const lines = paragraph.split('\n')
    let buffer: string[] = []
    const flush = () => {
      if (buffer.length) blocks.push(block(buffer.join('\n')))
      buffer = []
    }
    for (const line of lines) {
      if (bullet.test(line)) {
        flush()
        blocks.push(block(line.replace(bullet, ''), {listItem: 'bullet', level: 1}))
      } else if (line.startsWith('## ')) {
        flush()
        blocks.push(block(line.slice(3), {style: 'h3'}))
      } else if (line.trim()) {
        buffer.push(line)
      }
    }
    flush()
  }
  return blocks
}

const settingsFields = ['personalizationText', 'aboutText', 'orderInfo', 'shippingInfo', 'agbText']

async function run() {
  const docs = await client.fetch<any[]>(
    `*[_type in ["product", "siteSettings"]]`,
    {},
    {perspective: 'raw'},
  )
  let changedDocs = 0
  for (const doc of docs) {
    const set: Record<string, unknown> = {}
    const fields = doc._type === 'product' ? ['details'] : settingsFields
    for (const f of fields) if (typeof doc[f] === 'string') set[f] = toBlocks(doc[f])
    if (doc._type === 'siteSettings' && Array.isArray(doc.faqs) && doc.faqs.some((q: any) => typeof q.answer === 'string')) {
      set.faqs = doc.faqs.map((q: any) => (typeof q.answer === 'string' ? {...q, answer: toBlocks(q.answer)} : q))
    }
    if (!Object.keys(set).length) continue
    changedDocs++
    if (doc._id === 'product-tasche-panda' || (!write && changedDocs === 1)) {
      console.log(`Beispiel ${doc._id}:`)
      for (const b of (set.details ?? set.aboutText) as any[])
        console.log(`  [${b.listItem ? '•' : b.style}] ${b.children[0].text.replace(/\n/g, ' ⏎ ').slice(0, 90)}`)
    }
    // ifRevisionID: falls Evi das Dokument gerade ändert, wird nichts überschrieben
    if (write) await client.patch(doc._id).ifRevisionId(doc._rev).set(set).commit()
  }
  console.log(`${write ? 'Umgewandelt' : 'Würde umwandeln'}: ${changedDocs} Dokumente`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
