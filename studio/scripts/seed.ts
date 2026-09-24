// Überträgt die Platzhalter-Inhalte der Website als Startinhalt nach Sanity.
// Ausführen: npx sanity exec scripts/seed.ts --with-user-token
// Bestehende Dokumente werden nicht überschrieben (createIfNotExists).
import {getCliClient} from 'sanity/cli'
import {placeholderCategories, placeholderSettings} from '../../web/src/lib/placeholder'

const client = getCliClient({apiVersion: '2026-09-01'})

const slug = (current: string) => ({_type: 'slug', current})

async function seed() {
  const tx = client.transaction()

  tx.createIfNotExists({_id: 'siteSettings', _type: 'siteSettings', ...placeholderSettings})

  placeholderCategories.forEach((category, categoryIndex) => {
    const categoryId = `category-${category.slug}`
    tx.createIfNotExists({
      _id: categoryId,
      _type: 'category',
      title: category.title,
      slug: slug(category.slug),
      description: category.description,
      sortOrder: (categoryIndex + 1) * 10,
    })

    category.products.forEach((product, productIndex) => {
      tx.createIfNotExists({
        _id: `product-${product.slug}`,
        _type: 'product',
        name: product.name,
        slug: slug(product.slug),
        category: {_type: 'reference', _ref: categoryId},
        price: product.price,
        description: product.description,
        personalizable: product.personalizable,
        digital: product.digital,
        available: product.available,
        sortOrder: (productIndex + 1) * 10,
      })
    })
  })

  const result = await tx.commit()
  console.log(`Fertig: ${result.results.length} Dokumente geprüft/angelegt.`)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
