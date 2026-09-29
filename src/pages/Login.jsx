import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LockIcon } from '../components/icons.jsx'
import GoogleButton from '../components/GoogleButton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { ApiError } from '../api/client.js'
import { useGoogleSignIn } from '../hooks/useGoogleSignIn.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-cracker-orange focus:outline-none'

// Turns any failure into a message that is safe to show. The backend's 401 is
// intentionally the same for a wrong password and an unknown email.
function errorMessage(err) {
  if (!(err instanceof ApiError)) return 'Something went wrong. Please try again.'
  if (err.status === 401) return 'Invalid email or password.'
  if (err.status === 403) return 'This account is inactive. Please contact support.'
  if (err.status === 422) return 'Please enter a valid email address and your password.'
  if (err.status === 429) return 'Too many login attempts. Please wait a few minutes and try again.'
  if (err.status >= 500) return 'The server ran into a problem. Please try again in a moment.'
  return err.message
}

// Google sign-in failures. The backend's messages are already customer-safe.
function googleErrorMessage(err) {
  if (!(err instanceof ApiError)) return 'Something went wrong. Please try again.'
  if (err.status === 401) return 'Google sign-in failed. Please try again.'
  if (err.status === 403) return 'This account is inactive. Please contact support.'
  if (err.status === 409) return 'This email is already linked to a different Google account.'
  if (err.status === 429) return 'Too many attempts. Please wait a few minutes and try again.'
  if (err.status === 503) return 'Google sign-in is temporarily unavailable. Please try again later.'
  if (err.status >= 500) return 'The server ran into a problem. Please try again in a moment.'
  return err.message
}

// Email + password login. On success AuthContext.login stores the token (the
// session survives a page refresh) and we go back to where the customer was
// headed (or home). Google sign-in is not connected yet.
export default function Login() {
  const { login, loginWithGoogle, isAuthenticated, loading } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Synchronous in-flight lock so a double-click / Enter + click can't send
  // two login requests (which would also burn rate-limit quota).
  const inFlight = useRef(false)
  const justLoggedIn = useRef(false)

  const redirectTo = location.state?.from || '/'

  // An already signed-in customer (e.g. restored after a refresh) has no
  // business on the login page. Skipped right after a fresh login, which
  // navigates itself and shows the welcome toast.
  useEffect(() => {
    if (!loading && isAuthenticated && !justLoggedIn.current) {
      navigate(redirectTo, { replace: true })
    }
  }, [loading, isAuthenticated, navigate, redirectTo])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (inFlight.current) return

    const cleanEmail = email.trim().toLowerCase()
    if (!EMAIL_PATTERN.test(cleanEmail)) {
      setError('Please enter a valid email address.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }

    inFlight.current = true
    setError('')
    setBusy(true)
    try {
      justLoggedIn.current = true
      await login({ email: cleanEmail, password })
      toast.success({ title: 'Logged in', message: 'Welcome back to Karpaga Crackers!' })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      justLoggedIn.current = false
      setError(errorMessage(err))
      inFlight.current = false
      setBusy(false)
    }
  }

  // Google sign-in: the popup returns a one-time code; the backend exchanges
  // it, creates the account on first use, and returns the same session as
  // email login.
  const handleGoogleCode = async (code) => {
    if (inFlight.current) return
    inFlight.current = true
    setError('')
    setBusy(true)
    try {
      justLoggedIn.current = true
      await loginWithGoogle({ code })
      toast.success({ title: 'Logged in', message: 'Welcome to Karpaga Crackers!' })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      justLoggedIn.current = false
      setError(googleErrorMessage(err))
      inFlight.current = false
      setBusy(false)
    }
  }

  const google = useGoogleSignIn({
    onCode: handleGoogleCode,
    onError: ({ kind, message }) => {
      if (kind !== 'cancelled') setError(message)
    },
  })

  const handleGoogle = () => {
    if (inFlight.current) return
    if (!google.configured) {
      setError('Google sign-in is not available right now.')
      return
    }
    if (google.loadFailed) {
      setError('Could not load Google sign-in. Please check your connection and refresh the page.')
      return
    }
    if (!google.ready) return
    setError('')
    google.start()
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <div className="card p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-cracker-orange">
            <LockIcon className="h-5 w-5" />
          </span>
          <h1 className="font-display text-xl font-bold text-cracker-navy">Welcome Back</h1>
          <p className="mt-1 text-sm text-gray-500">Log in to your account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-sm">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-600">
              Email <span className="text-cracker-red">*</span>
            </span>
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              maxLength={150}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={error ? 'true' : undefined}
              className={inputClass}
              placeholder="Enter your email"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-600">
              Password <span className="text-cracker-red">*</span>
            </span>
            <input
              required
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={error ? 'true' : undefined}
              className={inputClass}
              placeholder="Enter your password"
            />
          </label>

          {error && (
            <p role="alert" className="text-xs text-cracker-red">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-200" />
          OR
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        <GoogleButton onClick={handleGoogle} disabled={busy} />

        <p className="mt-6 text-center text-sm text-gray-500">
          New here?{' '}
          <Link to="/signup" className="font-medium text-cracker-orange hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
