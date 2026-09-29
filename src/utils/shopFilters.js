// Pure helpers for the Shop page filters (price slider + availability).
export const PRICE_MIN = 0
export const PRICE_MAX = 1999

// Handle at the far right means "no upper limit" (Flipkart shows "₹1,999+").
export const isFullPriceRange = (min, max) => min <= PRICE_MIN && max >= PRICE_MAX

export function matchesPrice(price, min, max) {
  const p = Number(price) || 0
  if (p < min) return false
  return max >= PRICE_MAX ? true : p <= max
}

// Both boxes ticked or both empty = no availability filter (Flipkart behaviour).
export function matchesStock(inStock, showInStock, showOutOfStock) {
  if (showInStock === showOutOfStock) return true
  return inStock ? showInStock : showOutOfStock
}

// If the two values are the wrong way round (e.g. Min ₹400, Max ₹100), swap them
// so the range is always min <= max instead of matching nothing.
export function normalizeRange(a, b) {
  const x = Number(a)
  const y = Number(b)
  return x <= y ? [x, y] : [y, x]
}
