import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import ProductImage from '../components/ProductImage.jsx'
import { fetchMyEnquiries } from '../api/enquiries.js'
import { LOGIN_ENABLED } from '../config/features.js'
import { ENQUIRIES_KEY, readJson } from '../utils/guestCart.js'
import { ApiError } from '../api/client.js'
import { formatINR } from '../utils/pricing.js'

const centered = 'max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center'

// "Your Enquiry List": the products currently in the cart (waiting to be sent)
// plus the enquiries already sent. With login on, those come from the backend
// (GET /enquiries/mine); with login off, from the copies kept in this browser.
export default function Enquiries() {
  const { token, canShop, loading: authLoading } = useAuth()
  const { items: cartItems, subtotal: cartSubtotal, loading: cartLoading } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !canShop) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
    }
  }, [authLoading, canShop, navigate, location.pathname])

  const load = useCallback(async () => {
    if (!LOGIN_ENABLED) {
      const saved = readJson(ENQUIRIES_KEY, [])
      setEnquiries(Array.isArray(saved) ? saved : [])
      setError('')
      setLoading(false)
      return
    }
    if (!token) return
    setLoading(true)
    setError('')
    try {
      setEnquiries(await fetchMyEnquiries(token))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load your enquiries. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!authLoading && canShop) load()
  }, [authLoading, canShop, load])

  if (authLoading || !canShop || loading || cartLoading) {
    return <div className={`${centered} text-sm text-gray-500`}>Loading your enquiries…</div>
  }

  if (error) {
    return (
      <div className={centered}>
        <h2 className="font-display text-xl font-bold text-cracker-navy mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">{error}</p>
        <button onClick={load} className="btn-primary inline-block mt-5">Try Again</button>
      </div>
    )
  }

  if (enquiries.length === 0 && cartItems.length === 0) {
    return (
      <div className={centered}>
        <h2 className="font-display text-xl font-bold text-cracker-navy mb-2">Your enquiry list is empty</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">Add crackers to your cart, then place an enquiry. Sent enquiries will show up here.</p>
        <Link to="/shop" className="btn-primary inline-block mt-5">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-cracker-navy mb-6">Your Enquiry List</h1>

      {cartItems.length > 0 && (
        <section className="mb-10" aria-labelledby="pending-heading">
          <h2 id="pending-heading" className="font-semibold text-gray-800 mb-3">Products to enquire ({cartItems.length})</h2>
          <div className="card p-5">
            <ul className="space-y-3">
              {cartItems.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 text-sm text-gray-600">
                  <span className="flex min-w-0 items-center gap-3">
                    <ProductImage product={item} className="h-10 w-14 shrink-0 rounded" />
                    <span className="min-w-0 truncate">{item.name}<span className="block text-xs text-gray-400">x{item.qty}</span></span>
                  </span>
                  <span className="shrink-0">{formatINR(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t pt-3 text-sm font-semibold text-gray-800">
              <span>Estimated value</span><span>{formatINR(cartSubtotal)}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/contact" className="btn-primary inline-block">Place Enquiry</Link>
              <Link to="/cart" className="inline-block rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-600 hover:border-cracker-orange hover:text-cracker-orange">Edit Cart</Link>
            </div>
          </div>
        </section>
      )}

      {enquiries.length > 0 && (
        <h2 className="font-semibold text-gray-800 mb-3">Sent enquiries ({enquiries.length})</h2>
      )}
      <div className="space-y-4">
        {enquiries.map((enquiry) => (
          <div key={enquiry.id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-semibold text-gray-800">Enquiry #{enquiry.id}</span>
              {LOGIN_ENABLED && (
                <span className="rounded-full bg-orange-50 px-3 py-0.5 text-xs font-medium capitalize text-cracker-orange">{enquiry.status}</span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-gray-400">{new Date(enquiry.created_at).toLocaleString('en-IN')}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
              {enquiry.items.map((item) => (
                <li key={`${enquiry.id}-${item.product_id}`} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate">{item.name} <span className="text-gray-400">x{item.qty}</span></span>
                  <span className="shrink-0">{formatINR(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t pt-3 text-sm font-semibold text-gray-800">
              <span>Estimated value</span><span>{formatINR(enquiry.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
