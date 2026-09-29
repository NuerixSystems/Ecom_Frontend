import { apiFetch } from './client.js'

// All /api/v1/orders routes require the logged-in customer's bearer token
// (see app/api/deps.py::get_current_customer on the backend). Order
// creation sends only the chosen payment method -- price/subtotal/total are
// always computed server-side from the customer's current backend cart,
// never sent by the client (see app/crud/order.py create_order_from_cart).
function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

// POST /api/v1/orders — creates an order from the current customer's
// backend cart and clears that cart on success -> OrderDetailOut (201).
// `paymentMethod` is validated by the backend ("cod", or "upi_qr" once the
// owner's UPI details are configured). For "upi_qr" the customer's 12-digit
// UTR is sent as `transactionId`; the order is then created as
// "awaiting_verification" (never paid). 400 if the method/UTR is missing,
// invalid or unavailable, the cart is empty, or a cart line's product has
// gone out of stock since it was added.
export function createOrder(token, paymentMethod, transactionId) {
  const body = { payment_method: paymentMethod }
  if (paymentMethod === 'upi_qr') body.transaction_id = transactionId
  return apiFetch('/api/v1/orders', {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// GET /api/v1/orders/payment-options — which payment methods checkout may
// offer, plus the owner's UPI ID / QR image (from backend config).
// -> { enabled_methods: string[], upi_id: string|null, upi_qr_image: string|null }
export function fetchPaymentOptions(token) {
  return apiFetch('/api/v1/orders/payment-options', {
    headers: authHeaders(token),
  })
}

// GET /api/v1/orders — the current customer's order history, newest
// first -> OrderSummaryOut[] (no line items).
export function fetchOrders(token) {
  return apiFetch('/api/v1/orders', {
    headers: authHeaders(token),
  })
}

// GET /api/v1/orders/{id} — full detail (including the immutable line-item
// snapshot) for one of the current customer's own orders -> OrderDetailOut.
// 404 for an unknown id or an order belonging to another customer.
export function fetchOrder(token, orderId) {
  return apiFetch(`/api/v1/orders/${orderId}`, {
    headers: authHeaders(token),
  })
}
