// Small reusable client for the FastAPI backend.
// Reads the backend origin from VITE_API_BASE_URL (see .env.example).

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
// Strip any trailing slash so callers can always write `apiFetch('/api/v1/...')`.
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, { status = null, cause } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    if (cause) this.cause = cause
  }
}

// Thin wrapper around fetch(): resolves the path against the API base URL,
// parses JSON responses, and normalizes failures (HTTP errors, network
// errors) into an ApiError so callers can handle everything one way.
export async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`

  let response
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json', ...(options.headers || {}) },
      ...options,
    })
  } catch (err) {
    throw new ApiError('Could not reach the server. Please check your connection and try again.', { cause: err })
  }

  if (!response.ok) {
    let detail = ''
    try {
      const body = await response.json()
      detail = typeof body?.detail === 'string' ? body.detail : ''
    } catch {
      /* response wasn't JSON (or was empty) — fall back to the status text below */
    }
    throw new ApiError(detail || `Request failed (${response.status} ${response.statusText})`, {
      status: response.status,
    })
  }

  if (response.status === 204) return null
  return response.json()
}
