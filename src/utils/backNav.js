// Back-button rules, kept pure so they can be tested.
// No back button on the home page. Elsewhere it goes one step back in the
// browser history; if the page was opened directly (no history inside the app),
// it falls back to the home page so the button never does nothing.
export const shouldShowBack = (pathname) => pathname !== '/'
export const backTarget = (locationKey, historyIdx) =>
  locationKey === 'default' || !(historyIdx > 0) ? '/' : -1
