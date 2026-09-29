import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'

// The QR is a real generated PNG in frontend/public (served at "/owner-upi-qr.png").
// Decoding it (payload must be upi://pay?pa=9791872933@naviaxis&...) is verified
// separately with an image decoder; here we guard that the asset is present and
// is a genuine PNG that the backend config points at.
const png = new URL('../public/owner-upi-qr.png', import.meta.url)

test('owner UPI QR is a real PNG asset in frontend/public', () => {
  const bytes = readFileSync(png)
  assert.deepEqual([...bytes.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  assert.ok(statSync(png).size > 300)
  // width/height live in the IHDR chunk (big-endian, bytes 16..24): a square, scannable-size image.
  const w = bytes.readUInt32BE(16)
  const h = bytes.readUInt32BE(20)
  assert.equal(w, h)
  assert.ok(w >= 300)
})

test('backend env example points the QR image at that asset with the owner UPI ID', () => {
  const env = readFileSync(new URL('../../backend/.env.example', import.meta.url), 'utf8')
  assert.match(env, /^OWNER_UPI_ID=9791872933@naviaxis$/m)
  assert.match(env, /^OWNER_UPI_QR_IMAGE=\/owner-upi-qr\.png$/m)
})
