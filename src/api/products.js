import { apiFetch } from './client.js'

// GET /api/v1/products — the full product catalog. The backend supports
// search/category/price/sort query params, but Shop.jsx already does all of
// that client-side, so we simply fetch everything once and let the existing
// filtering logic keep working unchanged.
export function fetchProducts() {
  return apiFetch('/api/v1/products')
}
