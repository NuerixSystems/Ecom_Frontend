import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { WHATSAPP_NUMBER, buildWhatsAppMessage, validateEnquiryForm, whatsAppUrl } from '../src/utils/enquiry.js'
import { describeAdd, normalizeCart } from '../src/utils/cart.js'

const form = { name: ' Ravi ', mobile: '9876543210', whatsapp: '', email: '', address: 'Chennai' }
const items = [
  { product_id: 1, name: 'Golden Sparklers', qty: 2, price: 180 },
  { product_id: 2, name: 'Rocket Pack', qty: 1, price: 450 },
]

test('validateEnquiryForm requires name and a 10-digit mobile', () => {
  assert.deepEqual(validateEnquiryForm({ name: 'A', mobile: '9876543210', whatsapp: '', email: '', address: '' }), {})
  const e = validateEnquiryForm({ name: '', mobile: '123', whatsapp: '', email: 'bad', address: '' })
  assert.ok(e.name && e.mobile && e.email)
  assert.deepEqual(validateEnquiryForm({ name: 'A', mobile: '+91 98765-43210', whatsapp: '', email: '', address: '' }), {})
})

test('WhatsApp message contains every product, quantity, total and contact detail', () => {
  const msg = buildWhatsAppMessage(items, 810, form)
  assert.match(msg, /1\. Golden Sparklers x2 - ₹360/)
  assert.match(msg, /2\. Rocket Pack x1 - ₹450/)
  assert.match(msg, /Estimated value: ₹810/)
  assert.match(msg, /Name: Ravi/)
  assert.match(msg, /Mobile: 9876543210/)
  assert.match(msg, /Delivery address: Chennai/)
  assert.doesNotMatch(msg, /WhatsApp:|Email:/) // blank optional fields are omitted
})

test('WhatsApp URL targets the shop number and encodes the message', () => {
  const url = whatsAppUrl('Hi there\nItem & more')
  assert.equal(url, `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20there%0AItem%20%26%20more`)
})

test('re-adding an existing product reports a merged quantity, never a conflict', () => {
  const line = (q) => ({ id: 1, product_id: 1, product_slug: 's', product_name: 'P', unit_price: 10, quantity: q, line_total: 10 * q })
  assert.deepEqual(describeAdd({ items: [line(3)] }, 1, 2), { quantity: 3, merged: true })
  assert.equal(normalizeCart({ items: [line(3)], total_items: 3, subtotal: 30 }).items.length, 1)
})

// Source-level guards for the flow wiring (no DOM available in `node --test`).
const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), 'utf8')

test('Cart page: Place Enquiry goes to /contact, Continue Shopping to /shop, no checkout link', () => {
  const cart = src('pages/Cart.jsx')
  assert.match(cart, /<Link to="\/contact"[^>]*>Place Enquiry<\/Link>/)
  assert.match(cart, /<Link to="\/shop"[^>]*>Continue Shopping<\/Link>/)
  assert.doesNotMatch(cart, /\/checkout/)
})

test('Add to cart shows the success toast and navigates to /cart', () => {
  const hook = src('hooks/useAddToCart.js')
  assert.match(hook, /Added to cart successfully/)
  assert.match(hook, /navigate\('\/cart'\)/)
})

test('Enquiry panel offers both actions and uses the backend, not browser storage', () => {
  const panel = src('components/EnquiryPanel.jsx')
  assert.match(panel, /Send Request on WhatsApp/)
  assert.match(panel, /to="\/enquiries"[^>]*>Your Enquiry List/)
  assert.match(panel, /createEnquiryFromCart/)
  for (const f of ['components/EnquiryPanel.jsx', 'context/CartContext.jsx', 'pages/Enquiries.jsx', 'hooks/useAddToCart.js']) {
    assert.doesNotMatch(src(f).replace(/\/\/.*$/gm, ''), /localStorage|sessionStorage/, f)
  }
})

test('routes: /contact hosts the enquiry panel, /enquiries exists, /checkout redirects', () => {
  assert.match(src('pages/Contact.jsx'), /<EnquiryPanel \/>/)
  const app = src('App.jsx')
  assert.match(app, /path="\/enquiries"/)
  assert.match(app, /path="\/checkout" element=\{<Navigate to="\/contact"/)
})

test('wishlist and cart actions raise success and error toasts', () => {
  const wl = src('context/WishlistContext.jsx')
  assert.match(wl, /Added to wishlist/)
  assert.match(wl, /Removed from wishlist/)
  assert.match(wl, /toast\.error/)
  assert.match(src('context/CartContext.jsx'), /Removed from cart/)
})

test('Your Enquiry List page shows the current cart products and the sent history', () => {
  const page = src('pages/Enquiries.jsx')
  assert.match(page, /useCart\(\)/)
  assert.match(page, /cartItems\.map/)
  assert.match(page, /fetchMyEnquiries/)
  assert.match(page, /to="\/contact"[^>]*>Place Enquiry/)
})

test('ProductImage never renders a broken image: own photo -> bundled photo -> category -> placeholder', () => {
  const img = src('components/ProductImage.jsx')
  assert.match(img, /product-placeholder\.svg/)
  assert.match(img, /onError/)
  assert.match(img, /bundledImage\(product\)/)
  assert.match(img, /categoryImage\(product\?\.category\)/)
  assert.match(img, /placeholderImg\]/)
})

test('cart lines carry the product category so the image fallback works', () => {
  const line = { id: 1, product_id: 1, product_slug: 's', product_name: 'P', product_category: 'sparklers', unit_price: 10, quantity: 1, line_total: 10 }
  assert.equal(normalizeCart({ items: [line], total_items: 1, subtotal: 10 }).items[0].category, 'sparklers')
})

test('About page has the redesigned sections and only uses existing icons', () => {
  const about = src('pages/About.jsx')
  for (const s of ['Our Story', 'What We Stand For', 'How ordering works', 'Make Your Celebrations Extra Special']) assert.match(about, new RegExp(s))
  const icons = src('components/icons.jsx')
  const imported = about.match(/import \{([^}]+)\} from '..\/components\/icons\.jsx'/)[1].split(',').map((x) => x.trim()).filter(Boolean)
  for (const name of imported) assert.match(icons, new RegExp(`export function ${name}\\b`), name)
})
