// Small colour-coded pill for an order's `status` or `payment_status`.
// Purely presentational -- unknown/future values still render sensibly
// (capitalized, neutral grey) instead of breaking.

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700',
  processing: 'bg-blue-50 text-blue-700',
  shipped: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-cracker-red',
}

const PAYMENT_STYLES = {
  pending: 'bg-amber-50 text-amber-700',
  awaiting_verification: 'bg-blue-50 text-blue-700',
  paid: 'bg-green-50 text-green-700',
  failed: 'bg-red-50 text-cracker-red',
  rejected: 'bg-red-50 text-cracker-red',
  refunded: 'bg-gray-100 text-gray-600',
}

function labelize(value) {
  if (!value) return '—'
  const text = value.replace(/_/g, ' ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export default function OrderStatusBadge({ value, kind = 'status', className = '' }) {
  const styles = kind === 'payment' ? PAYMENT_STYLES : STATUS_STYLES
  const style = styles[value] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${style} ${className}`}>
      {labelize(value)}
    </span>
  )
}
