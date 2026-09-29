import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchOrders } from '../api/orders.js'
import { ApiError } from '../api/client.js'
import { ProductsError, ProductsLoading } from '../components/ProductsStatus.jsx'
import OrderStatusBadge from '../components/OrderStatusBadge.jsx'
import { BoxIcon, ChevronRightIcon } from '../components/icons.jsx'
import { formatINR } from '../utils/pricing.js'

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function formatDate(value) {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '' : dateFormatter.format(d)
}

// Customer order history: GET /api/v1/orders, newest first (no line items --
// see OrderSummaryOut). Requires a logged-in customer; matches the
// auth-gating pattern used by Wishlist.jsx / Cart.jsx / Account.jsx.
export default function Orders() {
  const { token, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
    }
  }, [authLoading, isAuthenticated, navigate, location.pathname])

  const load = useCallback(() => {
    if (!token) return
    setLoading(true)
    setError('')
    fetchOrders(token)
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Something went wrong while loading your orders.')
      })
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    if (isAuthenticated && token) load()
  }, [isAuthenticated, token, load])

  if (authLoading || !isAuthenticated) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-sm text-gray-500 sm:px-6">Loading…</div>
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-1 font-display text-2xl font-bold text-cracker-navy">My Orders</h1>
      <p className="mb-6 text-sm text-gray-500">Your past orders, newest first.</p>

      {loading && <ProductsLoading label="Loading your orders…" />}

      {!loading && error && <ProductsError message={error} onRetry={load} />}

      {!loading && !error && orders.length === 0 && (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-cracker-orange">
            <BoxIcon className="h-9 w-9" />
          </div>
          <h2 className="font-display text-lg font-bold text-cracker-navy">No orders yet</h2>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            When you place an order, it will show up here.
          </p>
          <Link to="/shop" className="btn-primary mt-6 inline-block">Start Shopping</Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                to={`/orders/${order.id}`}
                className="card flex items-center justify-between gap-4 p-4 transition-shadow hover:shadow-md sm:p-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-sm font-bold text-cracker-navy sm:text-base">
                      {order.order_number}
                    </span>
                    <OrderStatusBadge value={order.status} kind="status" />
                    <OrderStatusBadge value={order.payment_status} kind="payment" />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                    {formatDate(order.created_at)} · {order.total_items} item{order.total_items === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-bold text-cracker-red">{formatINR(order.total_amount)}</span>
                  <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
