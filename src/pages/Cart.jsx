import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { createOrder, fetchPaymentOptions } from '../api/orders.js'
import { ApiError } from '../api/client.js'
import { LOGIN_ENABLED } from '../config/features.js'
import ProductImage from '../components/ProductImage.jsx'
import { formatINR } from '../utils/pricing.js'
import { UTR_LENGTH, isValidUtr, normalizeUtrInput } from '../utils/payment.js'
import { CartIcon, CloseIcon, MinusIcon, PlusIcon } from '../components/icons.jsx'

export default function Cart() {
  const { items, updateQty, removeFromCart, subtotal, loading, error, refetch, updating } = useCart()
  const { canShop, token, isAuthenticated, loading: authLoading } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  // Cash on Delivery is always available; UPI/QR appears only when the backend
  // reports it enabled (owner UPI details configured). The backend enforces
  // this too -- the UI is just a convenience.
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [paymentOptions, setPaymentOptions] = useState({ enabled_methods: ['cod'], upi_id: null, upi_qr_image: null })
  const [utr, setUtr] = useState('')
  const [utrTouched, setUtrTouched] = useState(false)
  const [placing, setPlacing] = useState(false)
  // Orders are created from the backend cart, which only exists when login is
  // on and the customer is signed in; otherwise the page stays enquiry-only.
  const canPlaceOrder = LOGIN_ENABLED && isAuthenticated && !!token
  // When "Place Order" is shown it is the primary action; enquiry becomes secondary.
  const enquiryClass = canPlaceOrder
    ? 'block w-full rounded-lg border border-gray-300 py-2.5 text-center text-sm font-medium text-gray-600 hover:border-cracker-orange hover:text-cracker-orange'
    : 'btn-primary w-full block text-center'

  const upiEnabled = paymentOptions.enabled_methods.includes('upi_qr')
  const utrValid = isValidUtr(utr)
  const showUtrError = paymentMethod === 'upi_qr' && utrTouched && !utrValid

  useEffect(() => {
    if (!canPlaceOrder) return
    let cancelled = false
    fetchPaymentOptions(token)
      .then((opts) => {
        if (cancelled || !Array.isArray(opts?.enabled_methods)) return
        setPaymentOptions(opts)
        // Never leave an unavailable method selected.
        setPaymentMethod((current) => (opts.enabled_methods.includes(current) ? current : 'cod'))
      })
      .catch(() => {
        /* keep the COD-only default if the options can't be loaded */
      })
    return () => {
      cancelled = true
    }
  }, [canPlaceOrder, token])

  async function handlePlaceOrder() {
    if (placing) return
    if (paymentMethod === 'upi_qr' && !utrValid) {
      setUtrTouched(true)
      return
    }
    setPlacing(true)
    try {
      const order = await createOrder(token, paymentMethod, paymentMethod === 'upi_qr' ? utr.trim() : undefined)
      // The backend cleared the cart when it created the order; re-sync.
      navigate(`/orders/${order.id}`)
      refetch()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not place your order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  // The cart lives on the backend against the logged-in customer, so an
  // anonymous visitor is bounced to login first (same pattern as Account.jsx).
  useEffect(() => {
    if (!authLoading && !canShop) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
    }
  }, [authLoading, canShop, navigate, location.pathname])

  if (authLoading || !canShop) {
    return <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center text-sm text-gray-500">Loading…</div>
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center text-sm text-gray-500">Loading your cart…</div>
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h2 className="font-display text-xl font-bold text-cracker-navy mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">{error}</p>
        <button onClick={refetch} className="btn-primary inline-block mt-5">Try Again</button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <CartIcon className="mx-auto mb-4 h-14 w-14 text-cracker-orange/70" />
        <h2 className="font-display text-xl font-bold text-cracker-navy mb-2">Your cart is empty</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">Add crackers you're interested in and we'll help you get prices and place the order over WhatsApp.</p>
        <Link to="/shop" className="btn-primary inline-block mt-5">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-cracker-navy mb-1">Your Cart</h1>
      <p className="text-sm text-gray-500 mb-6">{items.length} item{items.length > 1 ? 's' : ''}</p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card p-4 flex flex-wrap items-center gap-4">
              <Link to={`/product/${item.productId}`} className="shrink-0">
                <ProductImage product={item} className="h-16 w-24 rounded-lg" />
              </Link>
              <div className="flex-1 min-w-[140px]">
                <Link to={`/product/${item.productId}`} className="font-medium text-sm text-gray-800 hover:text-cracker-orange">{item.name}</Link>
                <p className="text-xs text-gray-500 mt-0.5">{formatINR(item.price)}</p>
              </div>
              <div className="flex items-center rounded-lg border border-gray-300 bg-white">
                <button onClick={() => updateQty(item.id, item.qty - 1)} disabled={updating} className="px-3 py-2.5 text-gray-600 hover:text-cracker-red disabled:opacity-50" aria-label={`Decrease ${item.name} quantity`}><MinusIcon className="h-3.5 w-3.5" /></button>
                <span className="min-w-6 text-center text-sm">{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)} disabled={updating} className="px-3 py-2.5 text-gray-600 hover:text-cracker-red disabled:opacity-50" aria-label={`Increase ${item.name} quantity`}><PlusIcon className="h-3.5 w-3.5" /></button>
              </div>
              <p className="font-semibold text-sm w-20 text-right">{formatINR(item.price * item.qty)}</p>
              <button onClick={() => removeFromCart(item.id)} disabled={updating} className="-m-1 flex h-10 w-10 items-center justify-center text-gray-400 hover:text-cracker-red disabled:opacity-50" aria-label={`Remove ${item.name}`}>
                <CloseIcon className="h-[18px] w-[18px]" />
              </button>
            </div>
          ))}
        </div>

        <div className="card p-6 h-fit">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-gray-600">Estimated value</span>
            <span className="font-display text-2xl font-bold text-cracker-navy">{formatINR(subtotal)}</span>
          </div>
          {canPlaceOrder && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-semibold text-cracker-navy">Payment method</p>
              <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${paymentMethod === 'cod' ? 'border-cracker-orange bg-orange-50/50' : 'border-gray-200'}`}>
                <input
                  type="radio"
                  name="payment_method"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-0.5 accent-cracker-orange"
                />
                <span>
                  <span className="block text-sm font-medium text-gray-800">Cash on Delivery</span>
                  <span className="block text-xs text-gray-500">Pay in cash when your order is delivered.</span>
                </span>
              </label>
              {upiEnabled && (
                <label className={`mt-2 flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${paymentMethod === 'upi_qr' ? 'border-cracker-orange bg-orange-50/50' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="upi_qr"
                    checked={paymentMethod === 'upi_qr'}
                    onChange={() => setPaymentMethod('upi_qr')}
                    className="mt-0.5 accent-cracker-orange"
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-800">UPI / QR</span>
                    <span className="block text-xs text-gray-500">Pay now by UPI, then enter your transaction ID.</span>
                  </span>
                </label>
              )}
              {paymentMethod === 'upi_qr' && upiEnabled && (
                <div className="mt-3 rounded-lg border border-orange-100 bg-white p-3 text-sm">
                  {paymentOptions.upi_qr_image && (
                    <img
                      src={paymentOptions.upi_qr_image}
                      alt="Shop UPI QR code"
                      className="mx-auto mb-2 h-44 w-44 rounded-lg border border-gray-100 object-contain"
                    />
                  )}
                  {paymentOptions.upi_id && (
                    <p className="text-center text-xs text-gray-600">
                      UPI ID: <span className="font-semibold text-gray-800 select-all">{paymentOptions.upi_id}</span>
                    </p>
                  )}
                  <p className="mt-2 text-center text-gray-600">
                    Amount to pay: <span className="font-display font-bold text-cracker-navy">{formatINR(subtotal)}</span>
                  </p>
                  <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-xs text-gray-500">
                    <li>Scan the QR (or use the UPI ID) and pay exactly {formatINR(subtotal)}.</li>
                    <li>Copy the {UTR_LENGTH}-digit UTR / UPI reference number from your payment app.</li>
                    <li>Enter it below and place your order.</li>
                  </ol>
                  <label htmlFor="upi-utr" className="mt-3 block text-xs font-semibold text-gray-700">UTR / Transaction ID</label>
                  <input
                    id="upi-utr"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={UTR_LENGTH}
                    value={utr}
                    onChange={(e) => setUtr(normalizeUtrInput(e.target.value))}
                    onBlur={() => setUtrTouched(true)}
                    placeholder={`${UTR_LENGTH}-digit UTR`}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${showUtrError ? 'border-cracker-red focus:ring-cracker-red' : 'border-gray-300 focus:border-cracker-orange focus:ring-cracker-orange'}`}
                  />
                  {showUtrError && (
                    <p className="mt-1 text-xs text-cracker-red">Enter the {UTR_LENGTH}-digit UTR shown in your payment app.</p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    Your order will be confirmed after the shop verifies your payment.
                  </p>
                </div>
              )}
              <button
                onClick={handlePlaceOrder}
                disabled={placing || updating}
                className="btn-primary mt-3 w-full disabled:opacity-60"
              >
                {placing ? 'Placing order…' : paymentMethod === 'upi_qr' ? 'Submit Payment & Place Order' : 'Place Order'}
              </button>
            </div>
          )}
          <Link to="/contact" className={enquiryClass}>Place Enquiry</Link>
          <Link to="/shop" className="mt-3 block w-full rounded-lg border border-gray-300 py-2.5 text-center text-sm font-medium text-gray-600 hover:border-cracker-orange hover:text-cracker-orange">Continue Shopping</Link>
          <p className="mt-4 text-xs text-gray-400 text-center">Prices shown are estimates. Final pricing is confirmed on WhatsApp.</p>
        </div>
      </div>
    </div>
  )
}
