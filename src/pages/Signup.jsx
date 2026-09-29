import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { UserIcon } from '../components/icons.jsx'
import GoogleButton from '../components/GoogleButton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { ApiError } from '../api/client.js'

// Same rules as the backend (app/schemas/customer.py::CustomerSignupRequest);
// the backend re-validates everything, this just gives fast, friendly messages.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LENGTH = 150
const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_BYTES = 72 // bcrypt only uses the first 72 bytes

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-cracker-orange focus:outline-none'

function validate({ email, password, confirmPassword }) {
  if (!EMAIL_PATTERN.test(email) || email.length > MAX_EMAIL_LENGTH) return 'Please enter a valid email address.'
  if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) return 'Password is too long. Please use a shorter one.'
  if (!/\p{L}/u.test(password) || !/\d/.test(password)) return 'Password must contain at least one letter and one number.'
  if (password !== confirmPassword) return 'Passwords do not match.'
  return ''
}

// Turns any failure into a message that is safe to show. ApiError.message
// already carries the backend's string `detail` (e.g. 409 "An account with
// this email already exists") or a friendly network message; the gaps are
// FastAPI's 422 (array `detail`, which the shared client can't read) and 5xx.
function errorMessage(err) {
  if (!(err instanceof ApiError)) return 'Something went wrong. Please try again.'
  if (err.status === 409) return 'An account with this email already exists. Please use a different email.'
  if (err.status === 422) return 'Please enter a valid email and a password of at least 8 characters with a letter and a number.'
  if (err.status === 429) return 'Too many attempts. Please wait a few minutes and try again.'
  if (err.status >= 500) return 'The server ran into a problem. Please try again in a moment.'
  return err.message
}

// Email + password signup. On success the backend returns the new customer and
// an access token; AuthContext.signup stores the token (the customer is signed
// in) and we go back to where they were headed (or home).
// Google sign-up is not connected yet.
export default function Signup() {
  const { signup } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Synchronous in-flight lock: `busy` (state) only updates on the next render,
  // so a double-click / Enter + click in the same tick could otherwise send two
  // signup requests (the second would just fail with a confusing 409).
  const inFlight = useRef(false)

  const redirectTo = location.state?.from || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (inFlight.current) return

    const cleanEmail = email.trim().toLowerCase()
    const problem = validate({ email: cleanEmail, password, confirmPassword })
    if (problem) {
      setError(problem)
      return
    }

    inFlight.current = true
    setError('')
    setBusy(true)
    try {
      await signup({ email: cleanEmail, password })
      toast.success({ title: 'Account created', message: 'Welcome to Karpaga Crackers!' })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(errorMessage(err))
      inFlight.current = false
      setBusy(false)
    }
  }

  const handleGoogle = () => {
    // TODO: start Google sign-up here.
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <div className="card p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-cracker-orange">
            <UserIcon className="h-5 w-5" />
          </span>
          <h1 className="font-display text-xl font-bold text-cracker-navy">Create Account</h1>
          <p className="mt-1 text-sm text-gray-500">Sign up to get started</p>
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
              maxLength={MAX_EMAIL_LENGTH}
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={error ? 'true' : undefined}
              className={inputClass}
              placeholder="At least 8 characters, with a letter and a number"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-600">
              Confirm Password <span className="text-cracker-red">*</span>
            </span>
            <input
              required
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={error ? 'true' : undefined}
              className={inputClass}
              placeholder="Re-enter your password"
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
            {busy ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-200" />
          OR
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        <GoogleButton label="Sign up with Google" onClick={handleGoogle} />

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-cracker-orange hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
