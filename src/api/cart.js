import { apiFetch } from './client.js'

// All /api/v1/cart routes require the logged-in customer's bearer token
// (see app/api/deps.py::get_current_customer on the backend) and always
// return the full CartOut (see app/schemas/cart.py), so every call here
// resolves to the same up-to-date snapshot of the customer's cart.
function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

// GET /api/v1/cart — fetches (and lazily creates) the current customer's cart.
export function fetchCart(token) {
  return apiFetch('/api/v1/cart', {
    headers: authHeaders(token),
  })
}

// POST /api/v1/cart/items — CartItemAdd -> CartOut (201).
export function addCartItem(token, productId, quantity = 1) {
  return apiFetch('/api/v1/cart/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ product_id: productId, quantity }),
  })
}

// PATCH /api/v1/cart/items/{item_id} — CartItemUpdateQuantity -> CartOut.
export function updateCartItemQuantity(token, itemId, quantity) {
  return apiFetch(`/api/v1/cart/items/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ quantity }),
  })
}

// DELETE /api/v1/cart/items/{item_id} -> CartOut.
export function removeCartItem(token, itemId) {
  return apiFetch(`/api/v1/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}

// DELETE /api/v1/cart -> CartOut (emptied).
export function clearCart(token) {
  return apiFetch('/api/v1/cart', {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}
