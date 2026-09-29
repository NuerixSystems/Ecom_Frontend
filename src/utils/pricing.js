// Shared pricing helpers. Discount % is always derived from mrp + price, never stored.
const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

// 1299 -> "₹1,299"
export const formatINR = (amount) => `₹${inr.format(Math.round(Number(amount) || 0))}`

// Whole-number discount percentage; 0 when there is no valid discount.
export const getDiscountPercent = (mrp, price) => {
  if (!(mrp > 0) || !(price >= 0) || price >= mrp) return 0
  return Math.round(((mrp - price) / mrp) * 100)
}
