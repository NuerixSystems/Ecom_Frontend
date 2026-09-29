import { apiFetch } from './client.js'

// POST /api/v1/enquiries/ — matches the backend's EnquiryCreate schema
// (name, mobile, whatsapp?, email?, address?, items[], subtotal).
// items must be { product_id, name, qty, price } per EnquiryItem, mirroring
// CartContext's item shape ({ id, name, qty, price, ... }).
export function createEnquiry({ name, mobile, whatsapp, email, address, items, subtotal }) {
  return apiFetch('/api/v1/enquiries/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      mobile,
      whatsapp: whatsapp || null,
      email: email || null,
      address: address || null,
      items,
      subtotal,
    }),
  })
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

// POST /api/v1/enquiries/from-cart — "Place Enquiry". Only the contact details
// are sent: the backend builds the items/prices from the logged-in customer's
// server-side cart, saves the enquiry and empties the cart.
export function createEnquiryFromCart(token, { name, mobile, whatsapp, email, address }) {
  return apiFetch('/api/v1/enquiries/from-cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({
      name,
      mobile,
      whatsapp: whatsapp || null,
      email: email || null,
      address: address || null,
    }),
  })
}

// GET /api/v1/enquiries/mine — the logged-in customer's enquiry history.
export function fetchMyEnquiries(token) {
  return apiFetch('/api/v1/enquiries/mine', { headers: authHeaders(token) })
}
