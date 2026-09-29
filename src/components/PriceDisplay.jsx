import { formatINR, getDiscountPercent } from '../utils/pricing.js'

// MRP (struck through) + selling price + "NN% OFF". Falls back to just the price
// when a product has no valid MRP. size: 'sm' (cards, cart) | 'lg' (product page).
export default function PriceDisplay({ mrp, price, size = 'sm', className = '' }) {
  const discount = getDiscountPercent(mrp, price)
  const isLg = size === 'lg'
  return (
    <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${className}`}>
      {discount > 0 && (
        <span className={`text-gray-400 line-through ${isLg ? 'text-lg' : 'text-xs'}`}>
          <span className="sr-only">MRP </span>{formatINR(mrp)}
        </span>
      )}
      <span className={`font-bold text-cracker-red ${isLg ? 'text-3xl' : 'text-base'}`}>{formatINR(price)}</span>
      {discount > 0 && (
        <span className={`font-semibold text-green-600 ${isLg ? 'text-base' : 'text-xs'}`}>{discount}% OFF</span>
      )}
    </div>
  )
}
