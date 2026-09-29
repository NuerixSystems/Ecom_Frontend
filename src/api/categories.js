import { apiFetch } from './client.js'

// GET /api/v1/categories — the live category list (id + name; images aren't
// hosted by the API yet, see CategoriesContext for how those are kept).
export function fetchCategories() {
  return apiFetch('/api/v1/categories')
}
