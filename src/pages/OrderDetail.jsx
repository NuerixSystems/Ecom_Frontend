import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchOrder } from '../api/orders.js'
import { ApiError } from '../api/client.js'
import { ProductsLoading } from '../components/ProductsStatus.jsx'
import OrderStatusBadge from '../components/OrderStatusBadge.jsx'
import { ChevronLeftIcon } from '../components/icons.jsx'
import { formatINR } from '../utils/pricing.js'
import { PAYMENT_METHOD_LABELS } from '../utils/payment.js'

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

function formatDate(value) {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '' : dateFormatter.format(d)
}

// Single order's full detail (including its immutable line-item snapshot):
// GET /api/v1/orders/{id}. A 404 covers both an unknown id and an order
// belonging to another customer -- the backend doesn't distinguish the two,
// so neither does this page.
export default function OrderDetail() {
  const { id } = useParams()
  const { token, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
    }
  }, [authLoading, isAuthenticated, navigate, location.pathname])

  const load = useCallback(() => {
    if (!token) return
    setLoading(true)
    setError('')
    setNotFound(false)
    fetchOrder(token, id)
      .then((data) => setOrder(data))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true)
        } else {
          setError(err instanceof ApiError ? err.message : 'Something went wrong while loading this order.')
        }
      })
      .finally(() => setLoading(false))
  }, [token, id])

  useEffect(() => {
    if (isAuthenticated && token) load()
  }, [isAuthenticated, token, load])

  if (authLoading || !isAuthenticated) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-sm text-gray-500 sm:px-6">Loading…</div>
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link to="/orders" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-cracker-navy hover:text-cracker-orange">
        <ChevronLeftIcon className="h-4 w-4" />
        Back to My Orders
      </Link>

      {loading && <ProductsLoading label="Loading order details…" />}

      {!loading && notFound && (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <h2 className="font-display text-lg font-bold text-cracker-navy">Order not found</h2>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            We couldn&apos;t find that order. It may not exist, or it may belong to a different account.
          </p>
          <Link to="/orders" className="btn-primary mt-5 text-sm">Back to My Orders</Link>
        </div>
      )}

      {!loading && !notFound && error && (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <h2 className="font-display text-lg font-bold text-cracker-navy">Couldn&apos;t load this order</h2>
          <p className="mt-1 max-w-sm text-sm text-gray-500">{error}</p>
          <button onClick={load} className="btn-primary mt-5 text-sm">Try Again</button>
        </div>
      )}

      {!loading && !notFound && !error && order && (
        <div className="card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h1 className="font-display text-lg font-bold text-cracker-navy sm:text-xl">{order.order_number}</h1>
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">Placed on {formatDate(order.created_at)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge value={order.status} kind="status" />
              <OrderStatusBadge value={order.payment_status} kind="payment" />
            </div>
          </div>

          <ul className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-800">{item.product_name}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {formatINR(item.unit_price)} × {item.quantity}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-cracker-navy">{formatINR(item.line_total)}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-1.5 border-t border-gray-100 pt-4 text-sm">
            {order.payment_method && (
              <div className="flex justify-between text-gray-600">
                <span>Payment</span>
                <span>{PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}</span>
              </div>
            )}
            {order.payment_method === 'upi_qr' && order.transaction_id && (
              <div className="flex justify-between text-gray-600">
                <span>UTR</span>
                <span className="font-mono">{order.transaction_id}</span>
              </div>
            )}
            {order.payment_method === 'upi_qr' && order.payment_status === 'awaiting_verification' && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                We&apos;ve received your transaction ID. Your payment will be confirmed once the shop verifies it.
              </p>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between font-display text-base font-bold text-cracker-navy">
              <span>Total</span>
              <span>{formatINR(order.total_amount)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
