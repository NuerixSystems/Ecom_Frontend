// Client-side product/category search over the data in products.js.
// Relevance order: exact name > partial name > category > keywords > description.
export const normalize = (value) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const categoryNameOf = (categories, id) => categories.find((c) => c.id === id)?.name ?? ''

// Score a product against one search term (0 = no match).
function scoreTerm(term, { name, category, keywords, desc }) {
  if (name === term) return 1000 // exact name
  if (name.startsWith(term)) return 900 // partial name (prefix)
  if (name.includes(term)) return 800 // partial name (anywhere)
  if (category.includes(term)) return 600
  if (keywords.some((k) => k.includes(term))) return 400
  if (desc.includes(term)) return 200
  return 0
}

export function scoreProduct(product, categories, query) {
  const q = normalize(query)
  if (!q) return 0
  const fields = {
    name: normalize(product.name),
    category: normalize(`${categoryNameOf(categories, product.category)} ${product.category}`),
    keywords: (product.keywords || []).map(normalize),
    desc: normalize(product.desc),
  }
  const phrase = scoreTerm(q, fields)
  if (phrase > 0) return phrase
  // Multi-word queries ("sky rocket"): every word must match somewhere.
  const words = q.split(' ')
  if (words.length < 2) return 0
  const scores = words.map((w) => scoreTerm(w, fields))
  return scores.every((s) => s > 0) ? Math.min(...scores) / 10 : 0
}

// Matching products, best first (ties keep the original data order).
export function searchProducts(products, categories, query) {
  return products
    .map((product, index) => ({ product, index, score: scoreProduct(product, categories, query) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
}

// Matching categories, prefix matches first.
export function searchCategories(categories, query) {
  const q = normalize(query)
  if (!q) return []
  return categories
    .map((category, index) => {
      const name = normalize(category.name)
      const score = name.startsWith(q) ? 2 : name.includes(q) || normalize(category.id).includes(q) ? 1 : 0
      return { category, index, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((r) => r.category)
}
