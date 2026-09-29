import test from 'node:test'
import assert from 'node:assert/strict'
import {
  MAX_LINES,
  MAX_QTY,
  GuestCartLimitError,
  addLine,
  addSentEnquiry,
  buildGuestCart,
  countLines,
  readJson,
  removeLine,
  sanitizeIds,
  sanitizeLines,
  setLineQty,
  writeJson,
} from '../src/utils/guestCart.js'

const products = [
  { id: 1, slug: 'a', name: 'Alpha', image: null, category: 'c1', inStock: true, price: 100 },
  { id: 2, slug: 'b', name: 'Beta', image: null, category: 'c1', inStock: false, price: '50.5' },
]

test('addLine creates a line, then merges repeat adds', () => {
  const first = addLine([], 1, 2)
  assert.deepEqual(first, { lines: [{ productId: 1, qty: 2 }], quantity: 2, merged: false })
  const again = addLine(first.lines, '1', 3)
  assert.deepEqual(again.lines, [{ productId: 1, qty: 5 }])
  assert.equal(again.quantity, 5)
  assert.equal(again.merged, true)
})

test('addLine enforces the quantity and line limits', () => {
  assert.throws(() => addLine([{ productId: 1, qty: MAX_QTY }], 1, 1), GuestCartLimitError)
  assert.throws(() => addLine([], 1, MAX_QTY + 1), GuestCartLimitError)
  const full = Array.from({ length: MAX_LINES }, (_, i) => ({ productId: i + 1, qty: 1 }))
  assert.throws(() => addLine(full, 9999, 1), GuestCartLimitError)
  assert.throws(() => addLine([], 1, 0), GuestCartLimitError)
})

test('setLineQty / removeLine / countLines', () => {
  const lines = [{ productId: 1, qty: 2 }, { productId: 2, qty: 3 }]
  assert.deepEqual(setLineQty(lines, 2, 7)[1], { productId: 2, qty: 7 })
  assert.throws(() => setLineQty(lines, 2, MAX_QTY + 1), GuestCartLimitError)
  assert.deepEqual(removeLine(lines, 1), [{ productId: 2, qty: 3 }])
  assert.equal(countLines(lines), 5)
})

test('buildGuestCart uses live product data and skips unknown products', () => {
  const cart = buildGuestCart(
    [{ productId: 1, qty: 2 }, { productId: 2, qty: 2 }, { productId: 99, qty: 1 }],
    products,
  )
  assert.equal(cart.items.length, 2)
  assert.deepEqual(cart.items[0], {
    id: 1, productId: 1, slug: 'a', name: 'Alpha', image: null, category: 'c1', inStock: true, price: 100, qty: 2, lineTotal: 200,
  })
  assert.equal(cart.items[1].price, 50.5)
  assert.equal(cart.subtotal, 301)
  assert.equal(cart.count, 4)
})

test('sanitizeLines / sanitizeIds clean corrupted storage', () => {
  assert.deepEqual(sanitizeLines('nope'), [])
  assert.deepEqual(
    sanitizeLines([{ productId: 1, qty: 2 }, { productId: 1, qty: 9 }, { productId: 'x', qty: 1 }, { productId: 3, qty: -1 }, { productId: 4, qty: 999999 }, null]),
    [{ productId: 1, qty: 2 }, { productId: 4, qty: MAX_QTY }],
  )
  assert.deepEqual(sanitizeIds([1, '2', 2, 'x', -3, 0]), [1, 2])
  assert.deepEqual(sanitizeIds(null), [])
})

test('readJson / writeJson survive missing or broken storage', () => {
  const mem = new Map()
  const storage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, v) }
  writeJson('k', [1, 2], storage)
  assert.deepEqual(readJson('k', [], storage), [1, 2])
  mem.set('bad', '{not json')
  assert.deepEqual(readJson('bad', ['fallback'], storage), ['fallback'])
  assert.deepEqual(readJson('k', 'fb', null), 'fb')
  assert.doesNotThrow(() => writeJson('k', 1, { setItem() { throw new Error('full') } }))
})

test('addSentEnquiry keeps newest first, no duplicates, capped', () => {
  let list = []
  for (let i = 1; i <= 25; i += 1) list = addSentEnquiry(list, { id: i })
  assert.equal(list.length, 20)
  assert.equal(list[0].id, 25)
  assert.equal(addSentEnquiry(list, { id: 25 }).length, 20)
  assert.equal(addSentEnquiry(undefined, { id: 1 }).length, 1)
})
