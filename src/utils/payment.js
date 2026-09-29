// Small pure helpers for the manual UPI/QR payment step at checkout. The
// backend re-validates everything (app/crud/order.py validate_utr); this only
// gives the customer instant feedback.

// A UPI transaction reference (UTR / RRN) is exactly 12 digits.
export const UTR_LENGTH = 12

// Keeps digits only, capped at 12 -- used as the UTR input's onChange filter.
export function normalizeUtrInput(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, UTR_LENGTH)
}

export function isValidUtr(value) {
  return /^[0-9]{12}$/.test(String(value ?? '').trim())
}

export const PAYMENT_METHOD_LABELS = {
  cod: 'Cash on Delivery',
  upi_qr: 'UPI / QR',
}
