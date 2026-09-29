import test from 'node:test'
import assert from 'node:assert/strict'
import { EMPTY_CART, createLatestGate, describeAdd, normalizeCart } from '../src/utils/cart.js'

const item = (over = {}) => ({
  id: 7, product_id: 3, product_slug: 'rocket-pack', product_name: 'Rocket Pack',
  product_image: '/img/r.jpg', product_category: 'rockets', product_in_stock: true, unit_price: 450, quantity: 2, line_total: 900, ...over,
})
const cartOut = (items) => ({
  id: 1, customer_id: 9, items,
  total_items: items.reduce((n, i) => n + i.quantity, 0),
  subtotal: items.reduce((n, i) => n + i.line_total, 0),
})

test('normalizeCart maps backend CartOut to the UI shape', () => {
  const c = normalizeCart(cartOut([item()]))
  assert.equal(c.count, 2)
  assert.equal(c.subtotal, 900)
  assert.deepEqual(c.items[0], {
    id: 7, productId: 3, slug: 'rocket-pack', name: 'Rocket Pack', image: '/img/r.jpg', category: 'rockets',
    inStock: true, price: 450, qty: 2, lineTotal: 900,
  })
})

test('empty / missing cart normalizes to an empty cart (no crash)', () => {
  for (const input of [null, undefined, {}, { items: [] }]) {
    const c = normalizeCart(input)
    assert.deepEqual(c, { items: [], subtotal: 0, count: 0 })
  }
  assert.deepEqual(EMPTY_CART, { items: [], subtotal: 0, count: 0 })
})

test('describeAdd: new line is not "merged"', () => {
  const r = describeAdd(cartOut([item({ quantity: 1, line_total: 450 })]), 3, 1)
  assert.deepEqual(r, { quantity: 1, merged: false })
})

test('describeAdd: existing line whose quantity grew is "merged"', () => {
  const r = describeAdd(cartOut([item({ quantity: 4, line_total: 1800 })]), 3, 1)
  assert.deepEqual(r, { quantity: 4, merged: true })
})

test('describeAdd: falls back to requested qty if the line is absent', () => {
  assert.deepEqual(describeAdd(cartOut([]), 3, 2), { quantity: 2, merged: false })
})

test('gate: a stale GET that resolves AFTER a newer add is rejected (the empty-cart bug)', () => {
  const gate = createLatestGate()
  const loadTicket = gate.begin() // GET /cart starts first
  const addTicket = gate.begin() // POST /cart/items starts second
  assert.equal(gate.accept(addTicket), true) // add response arrives first -> applied
  assert.equal(gate.accept(loadTicket), false) // stale (empty) GET arrives late -> dropped
})

test('gate: results arriving in order are all applied', () => {
  const gate = createLatestGate()
  const a = gate.begin()
  assert.equal(gate.accept(a), true)
  const b = gate.begin()
  assert.equal(gate.accept(b), true)
})

test('gate: logout/reset ticket invalidates in-flight requests from the previous session', () => {
  const gate = createLatestGate()
  const inFlight = gate.begin() // request for the old user
  const reset = gate.begin() // logout -> reset to empty
  assert.equal(gate.accept(reset), true)
  assert.equal(gate.accept(inFlight), false)
})

test('gate: interleaved requests keep only the newest applied result', () => {
  const gate = createLatestGate()
  const t1 = gate.begin(); const t2 = gate.begin(); const t3 = gate.begin()
  assert.equal(gate.accept(t2), true)
  assert.equal(gate.accept(t3), true)
  assert.equal(gate.accept(t1), false)
})
