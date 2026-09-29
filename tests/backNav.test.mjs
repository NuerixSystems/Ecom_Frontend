import test from 'node:test'
import assert from 'node:assert/strict'
import { backTarget, shouldShowBack } from '../src/utils/backNav.js'

test('back button hidden only on home', () => {
  assert.equal(shouldShowBack('/'), false)
  for (const p of ['/shop', '/product/3', '/cart', '/wishlist', '/enquiries', '/about', '/contact', '/login', '/signup', '/account', '/orders', '/orders/5', '/nope'])
    assert.equal(shouldShowBack(p), true, p)
})
test('goes back one step when there is in-app history', () => {
  assert.equal(backTarget('abc123', 2), -1)
  assert.equal(backTarget('abc123', 1), -1)
})
test('falls back to home when page was opened directly', () => {
  assert.equal(backTarget('default', 0), '/')
  assert.equal(backTarget('abc123', 0), '/')
  assert.equal(backTarget('abc123', undefined), '/')
})
