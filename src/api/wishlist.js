import { apiFetch } from './client.js'

// All /api/v1/wishlist routes require the logged-in customer's bearer token
// (see app/api/deps.py::get_current_customer on the backend) and always
// return the full WishlistOut (see app/schemas/wishlist.py), so every call
// here resolves to the same up-to-date snapshot of the customer's wishlist.
function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

// GET /api/v1/wishlist — fetches (and lazily creates) the current customer's wishlist.
export function fetchWishlist(token) {
  return apiFetch('/api/v1/wishlist', {
    headers: authHeaders(token),
  })
}

// POST /api/v1/wishlist/items — WishlistItemAdd -> WishlistOut (201).
export function addWishlistItem(token, productId) {
  return apiFetch('/api/v1/wishlist/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ product_id: productId }),
  })
}

// DELETE /api/v1/wishlist/items/{item_id} -> WishlistOut.
export function removeWishlistItem(token, itemId) {
  return apiFetch(`/api/v1/wishlist/items/${itemId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}

// DELETE /api/v1/wishlist/items/by-product/{product_id} -> WishlistOut.
// Convenience for callers (ProductCard's heart toggle, ProductDetails) that
// only know the product id, not the wishlist item id.
export function removeWishlistItemByProduct(token, productId) {
  return apiFetch(`/api/v1/wishlist/items/by-product/${productId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}
