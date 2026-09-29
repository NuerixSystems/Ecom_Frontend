// Pure helpers for the backend-driven cart. Kept free of React so they can be
// unit-tested with `npm test` (node --test) -- see frontend/tests/cart.test.mjs.

// Backend CartItemOut (see app/schemas/cart.py) uses product_id / unit_price /
// quantity / product_* prefixed fields. Flattened here into the shape the
// Cart/Enquiry UI expects. `id` is the CART ITEM id (needed for update/remove
// calls); `productId` is the underlying product id (needed for product links
// and the enquiry payload).
export function normalizeItem(item) {
  return {
    id: item.id,
    productId: item.product_id,
    slug: item.product_slug,
    name: item.product_name,
    image: item.product_image,
    category: item.product_category,
    inStock: item.product_in_stock,
    price: item.unit_price,
    qty: item.quantity,
    lineTotal: item.line_total,
  }
}

export const EMPTY_CART = Object.freeze({ items: [], subtotal: 0, count: 0 })

export function normalizeCart(cart) {
  return {
    items: (cart?.items || []).map(normalizeItem),
    subtotal: cart?.subtotal ?? 0,
    count: cart?.total_items ?? 0,
  }
}

// Works out what an add-to-cart response means for the person, from the raw
// CartOut the backend returned. `merged` is true when the product was already
// in the cart and the backend added to the existing line instead of creating
// a new one (the API answers 200 instead of 201 in that case).
export function describeAdd(cartOut, productId, requestedQty) {
  const line = (cartOut?.items || []).find((i) => i.product_id === productId)
  const quantity = line ? line.quantity : requestedQty
  return { quantity, merged: Boolean(line) && line.quantity > requestedQty }
}

// Guards against out-of-order responses. Every cart request (initial load,
// add, update, remove, clear) takes a ticket when it STARTS; its result is
// only applied if no newer request has already been applied. Without this, a
// slow "GET /cart" that was answered before an add committed could land AFTER
// the add's response and overwrite the cart with stale (e.g. empty) contents
// -- the UI then shows an empty cart while the database holds the item, and
// the next add hits a false "already in your cart".
export function createLatestGate() {
  let issued = 0
  let applied = 0
  return {
    begin() {
      issued += 1
      return issued
    },
    accept(ticket) {
      if (ticket < applied) return false
      applied = ticket
      return true
    },
  }
}
