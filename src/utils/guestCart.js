// Pure helpers for the no-login ("guest") cart, wishlist and sent-enquiry
// history. Kept free of React / Vite so they can be unit-tested with
// `npm test` (see frontend/tests/guestCart.test.mjs).
//
// The guest cart stores ONLY product ids + quantities in the browser. Names,
// photos, stock and prices are always taken from the live product list, so a
// price change on the backend shows up in the cart immediately.

export const MAX_QTY = 1000 // matches the backend's per-line limit for enquiries
export const MAX_LINES = 100 // matches the backend's max lines per enquiry
export const CART_KEY = 'karpaga-guest-cart'
export const WISHLIST_KEY = 'karpaga-guest-wishlist'
export const ENQUIRIES_KEY = 'karpaga-guest-enquiries'
const MAX_SENT_ENQUIRIES = 20

export class GuestCartLimitError extends Error {}

function defaultStorage() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

export function readJson(key, fallback, storage = defaultStorage()) {
  try {
    const raw = storage?.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writeJson(key, value, storage = defaultStorage()) {
  try {
    storage?.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or blocked: the cart still works for this tab */
  }
}

// Cleans whatever was in storage (it could be old, edited or corrupted).
export function sanitizeLines(raw) {
  if (!Array.isArray(raw)) return []
  const seen = new Set()
  const out = []
  for (const line of raw) {
    const productId = Number(line?.productId)
    const qty = Math.floor(Number(line?.qty))
    if (!Number.isInteger(productId) || productId <= 0) continue
    if (!Number.isFinite(qty) || qty <= 0 || seen.has(productId)) continue
    seen.add(productId)
    out.push({ productId, qty: Math.min(qty, MAX_QTY) })
    if (out.length >= MAX_LINES) break
  }
  return out
}

export function sanitizeIds(raw) {
  if (!Array.isArray(raw)) return []
  const ids = raw.map(Number).filter((n) => Number.isInteger(n) && n > 0)
  return [...new Set(ids)]
}

// Add-to-cart is an upsert, same as the backend cart: a new product gets a new
// line, a product already in the cart has the quantity added to its line.
export function addLine(lines, productId, qty = 1) {
  const id = Number(productId)
  const amount = Math.floor(Number(qty))
  if (!Number.isInteger(id) || id <= 0 || !Number.isFinite(amount) || amount <= 0) {
    throw new GuestCartLimitError('Invalid quantity')
  }
  const existing = lines.find((l) => l.productId === id)
  if (existing) {
    const quantity = existing.qty + amount
    if (quantity > MAX_QTY) throw new GuestCartLimitError(`You can add at most ${MAX_QTY} of a single product`)
    return { lines: lines.map((l) => (l === existing ? { ...l, qty: quantity } : l)), quantity, merged: true }
  }
  if (amount > MAX_QTY) throw new GuestCartLimitError(`You can add at most ${MAX_QTY} of a single product`)
  if (lines.length >= MAX_LINES) throw new GuestCartLimitError(`Your cart can hold at most ${MAX_LINES} different products`)
  return { lines: [...lines, { productId: id, qty: amount }], quantity: amount, merged: false }
}

export function setLineQty(lines, productId, qty) {
  const id = Number(productId)
  if (qty > MAX_QTY) throw new GuestCartLimitError(`You can add at most ${MAX_QTY} of a single product`)
  return lines.map((l) => (l.productId === id ? { ...l, qty } : l))
}

export function removeLine(lines, productId) {
  const id = Number(productId)
  return lines.filter((l) => l.productId !== id)
}

export function countLines(lines) {
  return lines.reduce((n, l) => n + l.qty, 0)
}

// Turns stored lines + the live product list into the same shape the
// backend-driven cart uses (see normalizeItem in utils/cart.js). `id` and
// `productId` are both the product id: a guest cart has one line per product.
export function buildGuestCart(lines, products) {
  const byId = new Map((products || []).map((p) => [Number(p.id), p]))
  const items = []
  let subtotal = 0
  let count = 0
  for (const line of lines) {
    const p = byId.get(line.productId)
    if (!p) continue // product no longer exists
    const price = Number(p.price) || 0
    const lineTotal = price * line.qty
    subtotal += lineTotal
    count += line.qty
    items.push({
      id: p.id,
      productId: p.id,
      slug: p.slug,
      name: p.name,
      image: p.image,
      category: p.category,
      inStock: p.inStock,
      price,
      qty: line.qty,
      lineTotal,
    })
  }
  return { items, subtotal, count }
}

// Newest first, capped, no duplicates by id.
export function addSentEnquiry(list, enquiry) {
  const rest = (Array.isArray(list) ? list : []).filter((e) => e?.id !== enquiry.id)
  return [enquiry, ...rest].slice(0, MAX_SENT_ENQUIRIES)
}
