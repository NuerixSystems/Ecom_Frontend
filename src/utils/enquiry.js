// Pure helpers for the Cart -> Enquiry flow (no React, unit-tested in
// frontend/tests/enquiry.test.mjs).
import { formatINR } from './pricing.js'

// Business WhatsApp number the enquiry request is sent to.
export const WHATSAPP_NUMBER = '919585226667'

export function validateEnquiryForm(f) {
  const errors = {}
  const mobile = f.mobile.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '')
  if (!f.name.trim()) errors.name = 'Please enter your name.'
  if (!f.mobile.trim()) errors.mobile = 'Please enter your mobile number.'
  else if (!/^\d{10}$/.test(mobile)) errors.mobile = 'Enter a valid 10-digit mobile number.'
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) errors.email = 'Enter a valid email address.'
  return errors
}

// `items` use the saved enquiry's shape ({ name, qty, price }) as returned by
// the backend, so the message always matches what was actually stored.
export function buildWhatsAppMessage(items, subtotal, form) {
  const lines = items.map((i, idx) => `${idx + 1}. ${i.name} x${i.qty} - ${formatINR(i.price * i.qty)}`)
  return [
    'Hi Karpaga Crackers! I would like to enquire about:',
    '',
    ...lines,
    '',
    `Estimated value: ${formatINR(subtotal)}`,
    '',
    `Name: ${form.name.trim()}`,
    `Mobile: ${form.mobile.trim()}`,
    form.whatsapp.trim() && `WhatsApp: ${form.whatsapp.trim()}`,
    form.email.trim() && `Email: ${form.email.trim()}`,
    form.address.trim() && `Delivery address: ${form.address.trim()}`,
  ].filter(Boolean).join('\n')
}

export function whatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
