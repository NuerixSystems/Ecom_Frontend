import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BoxIcon, UserIcon } from '../components/icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { ApiError } from '../api/client.js'

const inputCls =
  'w-full border rounded-lg px-3 py-2.5 bg-white text-base sm:text-sm focus:border-cracker-orange focus:outline-none'

function Field({ label, error, id, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      <input
        id={id}
        className={`${inputCls} ${error ? 'border-cracker-red' : 'border-gray-300'}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${id}-error`} role="alert" className="mt-1 block text-xs text-cracker-red">
          {error}
        </span>
      )}
    </label>
  )
}

// Same validation shape as the enquiry form: required name, a plausible
// email, and a 10-digit mobile number once formatting characters and an
// optional country code are stripped.
function validate({ name, email, mobile }) {
  const errors = {}
  const digitsOnly = mobile.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '')
  if (!name.trim()) errors.name = 'Please enter your name.'
  if (!email.trim()) errors.email = 'Please enter your email.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email address.'
  if (!mobile.trim()) errors.mobile = 'Please enter your mobile number.'
  else if (!/^\d{10}$/.test(digitsOnly)) errors.mobile = 'Enter a valid 10-digit mobile number.'
  return errors
}

export default function Account() {
  const { customer, isAuthenticated, loading, logout, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', mobile: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)

  // Not logged in (and not still checking a persisted token) — bounce to
  // login, remembering where the user was headed.
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true, state: { from: '/account' } })
    }
  }, [loading, isAuthenticated, navigate])

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const startEditing = () => {
    setForm({ name: customer.name, email: customer.email ?? '', mobile: customer.mobile ?? '' })
    setErrors({})
    setApiError('')
    setSuccess(false)
    setEditing(true)
  }

  const cancelEditing = () => {
    setEditing(false)
    setErrors({})
    setApiError('')
  }

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    // Only send fields that actually changed -- the backend rejects an
    // empty payload, and there's nothing to save if nothing changed.
    const updates = {}
    if (form.name.trim() !== customer.name) updates.name = form.name.trim()
    if (form.email.trim() !== (customer.email ?? '')) updates.email = form.email.trim()
    if (form.mobile.trim() !== (customer.mobile ?? '')) updates.mobile = form.mobile.trim()

    if (Object.keys(updates).length === 0) {
      setEditing(false)
      return
    }

    setSaving(true)
    setApiError('')
    try {
      await updateProfile(updates)
      setEditing(false)
      setSuccess(true)
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Something went wrong while saving your profile.')
    } finally {
      setSaving(false)
    }
  }

  // Only block the whole page on the initial load. A profile save also
  // changes the token (the backend issues a fresh one -- see AuthContext's
  // updateProfile), which re-triggers the same "verify token" loading
  // state; once we already have a customer, keep showing the page instead
  // of flashing back to a full-page loader while that re-check runs.
  if (!customer) {
    return <div className="mx-auto max-w-md px-4 py-14 text-center text-sm text-gray-500 sm:px-6">Loading…</div>
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <div className="card p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-cracker-orange">
            <UserIcon className="h-5 w-5" />
          </span>
          <h1 className="font-display text-xl font-bold text-cracker-navy">My Account</h1>
        </div>

        {success && !editing && (
          <div className="mb-4 rounded-lg bg-green-50 px-3 py-2.5 text-center text-sm font-medium text-green-700">
            Your profile has been updated.
          </div>
        )}

        {!editing ? (
          <>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-xs font-medium text-gray-600">Name</dt>
                <dd className="mt-0.5 text-gray-800">{customer.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-600">Email</dt>
                <dd className="mt-0.5 text-gray-800">{customer.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-600">Mobile</dt>
                <dd className="mt-0.5 text-gray-800">{customer.mobile}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={startEditing}
              className="mt-6 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-cracker-navy transition-colors hover:border-cracker-orange hover:text-cracker-orange"
            >
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSave} noValidate>
            <div className="space-y-4">
              <Field
                id="account-name"
                label="Name"
                value={form.name}
                onChange={handleChange('name')}
                error={errors.name}
                disabled={saving}
              />
              <Field
                id="account-email"
                label="Email"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                error={errors.email}
                disabled={saving}
              />
              <Field
                id="account-mobile"
                label="Mobile"
                type="tel"
                value={form.mobile}
                onChange={handleChange('mobile')}
                error={errors.mobile}
                disabled={saving}
              />
            </div>

            {apiError && (
              <div role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-cracker-red">
                {apiError}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex-1 text-sm disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {!editing && (
          <>
            <Link
              to="/orders"
              className="mt-3 flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-cracker-navy transition-colors hover:border-cracker-orange hover:text-cracker-orange"
            >
              <span className="flex items-center gap-2">
                <BoxIcon className="h-4 w-4" />
                My Orders
              </span>
            </Link>

            <button type="button" onClick={handleLogout} className="btn-primary mt-3 w-full">
              Log Out
            </button>
          </>
        )}
      </div>
    </div>
  )
}
