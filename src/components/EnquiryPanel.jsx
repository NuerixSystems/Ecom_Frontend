import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import ProductImage from './ProductImage.jsx'
import { WhatsAppIcon } from './icons.jsx'
import { formatINR } from '../utils/pricing.js'
import { buildWhatsAppMessage, validateEnquiryForm, whatsAppUrl } from '../utils/enquiry.js'
import { createEnquiry, createEnquiryFromCart } from '../api/enquiries.js'
import { LOGIN_ENABLED } from '../config/features.js'
import { ENQUIRIES_KEY, addSentEnquiry, readJson, writeJson } from '../utils/guestCart.js'
import { ApiError } from '../api/client.js'

const inputCls = 'w-full border rounded-lg px-3 py-2.5 bg-white text-base sm:text-sm focus:border-cracker-orange focus:outline-none'
const emptyForm = { name: '', mobile: '', whatsapp: '', email: '', address: '' }
const secondaryBtn =
  'block w-full rounded-lg border border-gray-300 py-2.5 text-center text-sm font-medium text-gray-600 hover:border-cracker-orange hover:text-cracker-orange'

function Field({ label, required, optional, hint, error, className = '', id, ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-cracker-red"> *</span>}
        {optional && <span className="text-xs font-normal text-gray-400"> (Optional)</span>}
      </span>
      <input
        id={id}
        className={`${inputCls} ${error ? 'border-cracker-red' : 'border-gray-300'}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      />
      {hint && !error && <span id={`${id}-hint`} className="mt-1 block text-xs text-gray-400">{hint}</span>}
      {error && <span id={`${id}-error`} role="alert" className="mt-1 block text-xs text-cracker-red">{error}</span>}
    </label>
  )
}

// The "Place Enquiry" step, shown on the Contact page.
//   Login on  (LOGIN_ENABLED=true): products come from the customer's backend
//     cart; submitting saves the enquiry from that cart on the backend, which
//     also empties it.
//   Login off (default): products come from the browser cart; submitting sends
//     them to the public enquiry endpoint, then the browser cart is emptied.
// Either way WhatsApp is then opened with the saved enquiry's details.
export default function EnquiryPanel() {
  const { items, subtotal, loading, error, refetch, clearCart } = useCart()
  const { token, canShop, loading: authLoading } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [sentUrl, setSentUrl] = useState('')

  if (authLoading || !canShop) return null

  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }))
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (submitting) return // prevent duplicate submissions

    const found = validateEnquiryForm(form)
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      document.getElementById(`enquiry-${first}`)?.focus()
      return
    }

    setSubmitting(true)
    try {
      const details = {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        whatsapp: form.whatsapp.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
      }
      let enquiry
      if (LOGIN_ENABLED) {
        enquiry = await createEnquiryFromCart(token, details)
      } else {
        if (items.some((i) => !i.inStock)) {
          toast.error({
            title: 'Some items are unavailable',
            message: 'Please remove the out-of-stock items from your cart and try again.',
          })
          return
        }
        enquiry = await createEnquiry({
          ...details,
          items: items.map((i) => ({ product_id: i.productId, name: i.name, qty: i.qty, price: i.price })),
          subtotal,
        })
        // Keep a copy in this browser so "Your Enquiry List" can show it.
        writeJson(ENQUIRIES_KEY, addSentEnquiry(readJson(ENQUIRIES_KEY, []), enquiry))
      }
      const url = whatsAppUrl(buildWhatsAppMessage(enquiry.items, enquiry.subtotal, form))
      toast.success({ title: 'Enquiry submitted', message: 'Your enquiry was sent. Opening WhatsApp…' })
      window.open(url, '_blank', 'noopener,noreferrer')
      setSentUrl(url)
      if (LOGIN_ENABLED) refetch() // the backend emptied the cart; resync so nothing stale is shown
      else clearCart({ silent: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error({ title: 'Please log in again', message: 'Your session has expired.' })
        navigate('/login', { replace: true, state: { from: location.pathname } })
        return
      }
      toast.error({
        title: 'Could not send enquiry',
        message: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
      })
      if (LOGIN_ENABLED) refetch() // the cart may have changed elsewhere; show what the server has
    } finally {
      setSubmitting(false)
    }
  }

  if (sentUrl) {
    return (
      <section className="card mb-10 p-6 text-center">
        <WhatsAppIcon className="mx-auto mb-3 h-12 w-12 text-green-600" />
        <h2 className="font-display text-xl font-bold text-cracker-navy">Your enquiry request is ready!</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
          We opened WhatsApp with your enquiry pre-filled — just hit send there and our team will get back to you with confirmed prices.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a href={sentUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-block">Open WhatsApp again</a>
          <Link to="/enquiries" className="inline-block rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-600 hover:border-cracker-orange hover:text-cracker-orange">Your Enquiry List</Link>
        </div>
      </section>
    )
  }

  if (loading) return <p className="mb-10 text-center text-sm text-gray-500">Loading your cart…</p>

  if (error) {
    return (
      <section className="card mb-10 p-6 text-center">
        <p className="text-sm text-gray-500">{error}</p>
        <button onClick={refetch} className="btn-primary mt-4 inline-block">Try Again</button>
      </section>
    )
  }

  if (items.length === 0) return null

  return (
    <section className="mb-10" aria-labelledby="enquiry-heading">
      <h2 id="enquiry-heading" className="font-display text-xl font-bold text-cracker-navy mb-1">Your Enquiry</h2>
      <p className="text-sm text-gray-500 mb-5">So the shop can call you back and confirm.</p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8">
        <form noValidate onSubmit={handleSend} className="card p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field id="enquiry-name" label="Your name" required placeholder="Enter your name" autoComplete="name" value={form.name} onChange={setField('name')} error={errors.name} />
            <Field id="enquiry-mobile" label="Mobile number" required type="tel" inputMode="tel" placeholder="Enter your mobile number" autoComplete="tel" value={form.mobile} onChange={setField('mobile')} error={errors.mobile} />
            <Field id="enquiry-whatsapp" label="WhatsApp number" hint="Only if different from your mobile." type="tel" inputMode="tel" placeholder="WhatsApp number" autoComplete="tel" value={form.whatsapp} onChange={setField('whatsapp')} />
            <Field id="enquiry-email" label="Email" optional type="email" placeholder="Enter your email" autoComplete="email" value={form.email} onChange={setField('email')} error={errors.email} />
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-gray-700">Delivery address <span className="text-xs font-normal text-gray-400">(Optional)</span></span>
              <textarea id="enquiry-address" rows={3} className={`${inputCls} resize-none border-gray-300`} placeholder="Enter your delivery address" autoComplete="street-address" value={form.address} onChange={setField('address')} />
            </label>
          </div>
        </form>

        <div className="card p-6 h-fit">
          <h3 className="font-semibold text-gray-800 mb-4">Enquiry Summary</h3>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-3 min-w-0">
                  <ProductImage product={item} className="h-10 w-14 shrink-0 rounded" />
                  <span className="min-w-0 truncate">{item.name}<span className="block text-xs text-gray-400">x{item.qty}</span></span>
                </span>
                <span className="shrink-0 pl-2">{formatINR(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-semibold text-gray-800 border-t pt-3 mb-5">
            <span>Estimated value</span><span>{formatINR(subtotal)}</span>
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-semibold text-white shadow-md transition-colors hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <WhatsAppIcon className="h-[18px] w-[18px]" /> {submitting ? 'Sending…' : 'Send Request on WhatsApp'}
          </button>
          <Link to="/enquiries" className={`mt-3 ${secondaryBtn}`}>Your Enquiry List</Link>
        </div>
      </div>
    </section>
  )
}
