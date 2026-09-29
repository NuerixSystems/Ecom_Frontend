import { apiFetch } from './client.js'

// Customer authentication is mobile number + OTP only. (Admin email/password
// login is a separate backend flow and is not used by this storefront.)

// POST /api/v1/customers/send-otp — CustomerOtpSendRequest { mobile } ->
// CustomerOtpSendOut { detail, expires_in_seconds, dev_otp }. Works for both
// existing and brand-new customers. `dev_otp` is only populated outside
// production (no SMS provider is wired up yet); the UI never displays it.
// Each call issues a NEW OTP and invalidates any earlier unused one.
export function sendCustomerOtp({ mobile }) {
  return apiFetch('/api/v1/customers/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile }),
  })
}

// POST /api/v1/customers/verify-otp — CustomerOtpVerifyRequest { mobile, otp } ->
// Token { access_token, token_type }. `otp` must stay a STRING: a code such as
// "004213" would lose its leading zeros as a number. A wrong, expired,
// already-used or attempt-exhausted OTP all surface as the same generic 400
// ("Invalid or expired OTP"); the account is created on first successful
// verification.
export function verifyCustomerOtp({ mobile, otp }) {
  return apiFetch('/api/v1/customers/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, otp: String(otp) }),
  })
}

// POST /api/v1/customers/signup — CustomerSignupRequest { email, password } ->
// 201 CustomerSignupOut: the new customer's fields (id, name, email, mobile,
// ...) plus { access_token, token_type }, so the customer is signed in
// straight away. Errors: 409 "An account with this email already exists",
// 422 (invalid email / weak password; FastAPI array `detail`), 429 (rate
// limited). The password is never returned.
export function signupCustomer({ email, password }) {
  return apiFetch('/api/v1/customers/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

// POST /api/v1/customers/login — CustomerLoginRequest { email, password } ->
// 200 CustomerLoginOut: the customer's fields plus { access_token, token_type }
// (same shape as signup). Errors: 401 "Invalid email or password" (wrong
// password, unknown email or no password set -- deliberately indistinguishable),
// 403 "This account is inactive", 429 (rate limited). The password is never
// returned.
export function loginCustomer({ email, password }) {
  return apiFetch('/api/v1/customers/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

// POST /api/v1/customers/google — CustomerGoogleLoginRequest { code } ->
// 200 CustomerLoginOut (same shape as email login: the customer's fields plus
// { access_token, token_type }). `code` is the one-time authorization code
// from Google's sign-in popup; the backend exchanges it with Google. A new
// Google user gets an account automatically. Errors: 401 (Google rejected the
// code), 403 "This account is inactive", 409 (email tied to another Google
// account), 429 (rate limited), 503 (Google login not configured / Google
// unreachable).
export function loginWithGoogleCode({ code }) {
  return apiFetch('/api/v1/customers/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
}

// GET /api/v1/customers/me — requires a valid customer access token.
// Used both to load the profile and to verify a token restored from
// localStorage is still valid (backend returns 401 for missing/expired/
// invalid/wrong-type tokens, which AuthContext treats as "not logged in").
export function fetchCurrentCustomer(token) {
  return apiFetch('/api/v1/customers/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

// PATCH /api/v1/customers/me — name/email only (the mobile number is the
// OTP-verified login identity and cannot be changed here). Send only the
// fields that actually changed; the backend rejects an empty payload. The JWT
// subject is the customer id, so the current token stays valid; a fresh
// access_token is still returned and callers swap it in.
export function updateCustomerProfile(token, updates) {
  return apiFetch('/api/v1/customers/me', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
}
