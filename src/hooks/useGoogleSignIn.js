import { useCallback, useEffect, useRef, useState } from 'react'

// Google sign-in (OAuth authorization-code flow, popup mode).
//
// Clicking the button opens Google's consent popup and returns a one-time
// `code`, which the caller sends to the backend (POST /customers/google). The
// backend exchanges it using the client secret, which never reaches the
// browser -- the only Google setting the frontend needs is the public client
// ID below (the same value as the backend's GOOGLE_CLIENT_ID).

export const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim()

const GIS_SRC = 'https://accounts.google.com/gsi/client'

let scriptPromise = null

// Loads Google's client library once. It is loaded up front (not on click)
// because browsers only allow the popup to open from a direct click handler.
function loadGoogleLibrary() {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      script.remove()
      scriptPromise = null // allow a later retry
      reject(new Error('Could not load Google sign-in'))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

// Errors reported by Google's library, as { kind, message } where `kind` is
// 'cancelled' (the customer closed the popup -- show nothing), or 'error'.
export function describeGoogleError(err) {
  const type = err?.type || err?.error
  if (type === 'popup_closed') return { kind: 'cancelled', message: '' }
  if (type === 'access_denied') return { kind: 'error', message: 'Google sign-in was cancelled.' }
  if (type === 'popup_failed_to_open') {
    return { kind: 'error', message: 'Your browser blocked the Google sign-in window. Please allow pop-ups and try again.' }
  }
  return { kind: 'error', message: 'Google sign-in could not be completed. Please try again.' }
}

// onCode(code) is called with the authorization code; onError({ kind, message })
// when the popup fails or is dismissed. Callbacks may change between renders.
export function useGoogleSignIn({ onCode, onError }) {
  const configured = !!GOOGLE_CLIENT_ID
  const [ready, setReady] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const clientRef = useRef(null)
  const handlers = useRef({ onCode, onError })
  handlers.current = { onCode, onError }

  useEffect(() => {
    if (!configured) return undefined
    let cancelled = false
    loadGoogleLibrary()
      .then(() => {
        if (cancelled) return
        clientRef.current = window.google.accounts.oauth2.initCodeClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          ux_mode: 'popup',
          callback: (response) => {
            if (response?.error || !response?.code) handlers.current.onError(describeGoogleError(response))
            else handlers.current.onCode(response.code)
          },
          error_callback: (err) => handlers.current.onError(describeGoogleError(err)),
        })
        setReady(true)
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [configured])

  // Must be called directly from a click handler so the popup isn't blocked.
  const start = useCallback(() => {
    clientRef.current?.requestCode()
  }, [])

  return { configured, ready, loadFailed, start }
}
