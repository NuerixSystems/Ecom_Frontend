import test from 'node:test'
import assert from 'node:assert/strict'
import { PRICE_MAX, PRICE_MIN, isFullPriceRange, matchesPrice, matchesStock, normalizeRange } from '../src/utils/shopFilters.js'

const products = [
  { id: 1, price: 85, inStock: true },
  { id: 2, price: 499, inStock: false },
  { id: 3, price: 1250, inStock: true },
  { id: 4, price: 1999, inStock: false },
  { id: 5, price: 2500, inStock: true },
]
const run = ([min, max], inS, outS) =>
  products.filter((p) => matchesPrice(p.price, min, max) && matchesStock(p.inStock, inS, outS)).map((p) => p.id)

test('range bounds are 0 to 1999', () => { assert.equal(PRICE_MIN, 0); assert.equal(PRICE_MAX, 1999) })
test('default range shows everything', () => {
  assert.equal(isFullPriceRange(0, 1999), true)
  assert.deepEqual(run([0, 1999], true, true), [1, 2, 3, 4, 5])
})
test('dual handles bound both ends inclusively', () => {
  assert.deepEqual(run([100, 1250], true, true), [2, 3])
  assert.deepEqual(run([499, 499], true, true), [2])
  assert.deepEqual(run([0, 500], true, true), [1, 2])
})
test('max handle at 1999 means no upper cap', () => assert.deepEqual(run([1000, 1999], true, true), [3, 4, 5]))
test('In Stock only / Out of Stock only', () => {
  assert.deepEqual(run([0, 1999], true, false), [1, 3, 5])
  assert.deepEqual(run([0, 1999], false, true), [2, 4])
})
test('both unchecked or both checked = no availability filter', () => {
  assert.deepEqual(run([0, 1999], false, false), [1, 2, 3, 4, 5])
  assert.deepEqual(run([0, 1999], true, true), [1, 2, 3, 4, 5])
})
test('price and stock combine', () => assert.deepEqual(run([0, 1000], false, true), [2]))

test('Max below Min swaps the values instead of matching nothing', () => {
  assert.deepEqual(normalizeRange(400, 100), [100, 400])
  assert.deepEqual(normalizeRange(100, 400), [100, 400])
  assert.deepEqual(normalizeRange(500, 500), [500, 500])
  const [lo, hi] = normalizeRange(1250, 100)
  assert.deepEqual(run([lo, hi], true, true), [2, 3])
})
