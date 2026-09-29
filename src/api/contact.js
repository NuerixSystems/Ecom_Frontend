import { apiFetch } from './client.js'

// POST /api/v1/contact/ — matches the backend's ContactMessageCreate schema
// (name, email, message). Used by Contact.jsx's "Send a Message" form.
export function sendContactMessage({ name, email, message }) {
  return apiFetch('/api/v1/contact/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message }),
  })
}
