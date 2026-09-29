// Feature switches for the storefront.
//
// LOGIN_ENABLED controls the whole customer login area:
//   false (default) -> no Login / My Account icon or link anywhere, /login,
//                      /account and /orders are blocked, and any saved login
//                      token is ignored so nobody can sign in.
//   true            -> everything works exactly as before.
//
// To turn login back on, set   VITE_LOGIN_ENABLED=true   in frontend/.env
// (and in .env.production for a live build), then restart `npm run dev`
// or rebuild with `npm run build`.
export const LOGIN_ENABLED = import.meta.env.VITE_LOGIN_ENABLED === 'true'
