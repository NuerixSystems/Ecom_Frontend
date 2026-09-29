import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { LOGIN_ENABLED } from '../config/features.js'
import { fetchCurrentCustomer, loginCustomer, loginWithGoogleCode, signupCustomer, updateCustomerProfile, verifyCustomerOtp } from '../api/auth.js'

const AuthContext = createContext(null)
const TOKEN_KEY = 'karpaga-customer-token'

function loadToken() {
  // The saved token is restored whether or not LOGIN_ENABLED is on, so a
  // customer who signed up with email + password stays signed in after a page
  // refresh. (LOGIN_ENABLED still controls the cart/wishlist mode and the
  // header/account links -- see config/features.js.) An expired or invalid
  // token is cleared by the /me check below.
  try {
    return window.localStorage.getItem(TOKEN_KEY) || null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(loadToken)
  const [customer, setCustomer] = useState(null)
  // True until the persisted token (if any) has been checked against /me,
  // so the rest of the app doesn't briefly flash a "logged out" state on
  // every page refresh while that check is in flight.
  const [loading, setLoading] = useState(LOGIN_ENABLED)

  const persistToken = (next) => {
    setToken(next)
    try {
      if (next) window.localStorage.setItem(TOKEN_KEY, next)
      else window.localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* storage unavailable: auth still works for this tab/session */
    }
  }

  // Verify the token against /me whenever it changes (including on first
  // mount, for a token restored from localStorage). An expired, invalid,
  // or wrong-type token gets a 401 from the backend, which is treated as
  // "not logged in" and the bad token is cleared so we don't retry it.
  useEffect(() => {
    let cancelled = false
    if (!token) {
      setCustomer(null)
      setLoading(false)
      return undefined
    }
    setLoading(true)
    fetchCurrentCustomer(token)
      .then((data) => {
        if (!cancelled) setCustomer(data)
      })
      .catch(() => {
        if (!cancelled) {
          persistToken(null)
          setCustomer(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  // Mobile + OTP login (the only customer login method): verifies the OTP and
  // signs the customer in with the returned access_token.
  // The profile is loaded before the token is stored so `isAuthenticated`
  // flips together with the token -- otherwise a protected page we redirect
  // to right after login could see "not authenticated" for one render and
  // bounce back to /login. If that /me call fails we still store the token
  // and let the effect above verify it, and stay signed in.
  const loginWithOtp = useCallback(async ({ mobile, otp }) => {
    if (!LOGIN_ENABLED) throw new Error('Login is currently disabled.')
    const data = await verifyCustomerOtp({ mobile, otp })
    let profile = null
    try {
      profile = await fetchCurrentCustomer(data.access_token)
    } catch {
      /* fall through: the token effect will verify it */
    }
    persistToken(data.access_token)
    if (profile) setCustomer(profile)
    return data
  }, [])

  // Email + password signup: creates the account and signs the new customer
  // in with the access_token the backend returns. The customer fields in the
  // response are used directly (no extra /me round trip), so `isAuthenticated`
  // flips together with the token.
  const signup = useCallback(async ({ email, password }) => {
    const { access_token, token_type, ...customerFields } = await signupCustomer({ email, password })
    persistToken(access_token)
    setCustomer(customerFields)
    return customerFields
  }, [])

  // Email + password login: same session handling as signup. The response
  // carries the customer, so no extra /me round trip is needed and
  // `isAuthenticated` flips together with the token. The token is kept in
  // localStorage, and the effect above re-verifies it via /me after a refresh.
  const login = useCallback(async ({ email, password }) => {
    const { access_token, token_type, ...customerFields } = await loginCustomer({ email, password })
    persistToken(access_token)
    setCustomer(customerFields)
    return customerFields
  }, [])

  // Google login: exchanges the one-time popup `code` for the customer and an
  // access_token (same response and session handling as email login).
  const loginWithGoogle = useCallback(async ({ code }) => {
    const { access_token, token_type, ...customerFields } = await loginWithGoogleCode({ code })
    persistToken(access_token)
    setCustomer(customerFields)
    return customerFields
  }, [])

  const logout = useCallback(() => {
    persistToken(null)
    setCustomer(null)
  }, [])

  // Profile self-update (name/email only -- see api/auth.js). The backend
  // returns a fresh access_token with every update; swapping it in here keeps
  // the customer signed in with no separate re-login step.
  const updateProfile = useCallback(
    async (updates) => {
      const data = await updateCustomerProfile(token, updates)
      const { access_token, token_type, ...customerFields } = data
      persistToken(access_token)
      setCustomer(customerFields)
      return customerFields
    },
    [token]
  )

  return (
    <AuthContext.Provider
      value={{
        customer,
        token,
        isAuthenticated: !!customer,
        // May this visitor use cart / wishlist / enquiry? Everyone can while
        // login is switched off (guest mode); otherwise only signed-in customers.
        canShop: !LOGIN_ENABLED || !!customer,
        loading,
        loginWithOtp,
        signup,
        login,
        loginWithGoogle,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
