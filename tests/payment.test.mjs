import test from 'node:test'
import assert from 'node:assert/strict'
import { isValidUtr, normalizeUtrInput } from '../src/utils/payment.js'

test('isValidUtr accepts exactly 12 digits only', () => {
  assert.equal(isValidUtr('412345678901'), true)
  assert.equal(isValidUtr(' 412345678901 '), true)
  for (const bad of ['', '   ', '41234567890', '4123456789012', '41234567890A', '4123 5678 9012', null, undefined]) {
    assert.equal(isValidUtr(bad), false, String(bad))
  }
})

test('normalizeUtrInput strips non-digits and caps at 12', () => {
  assert.equal(normalizeUtrInput('4123-4567 8901xyz99'), '412345678901')
  assert.equal(normalizeUtrInput('abc'), '')
  assert.equal(normalizeUtrInput(null), '')
})
