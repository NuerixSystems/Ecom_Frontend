import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { LOGIN_ENABLED } from '../config/features.js'
import { WISHLIST_KEY, readJson, sanitizeIds, writeJson } from '../utils/guestCart.js'
import { useToast } from './ToastContext.jsx'
import * as wishlistApi from '../api/wishlist.js'
import { ApiError } from '../api/client.js'

const WishlistContext = createContext(null)

const EMPTY_WISHLIST = { items: [], count: 0 }

// Backend WishlistItemOut (see app/schemas/wishlist.py) already carries the
// wishlist item id, the underlying product id, and a snapshot of the
// product's current name/slug/image/price/stock. We only actually need the
// product id list for isWished()/toggling and the item id for removal, but
// keep the full items around too in case a consumer wants them directly.
function normalizeWishlist(wishlist) {
  const items = wishlist?.items || []
  return {
    items,
    count: wishlist?.total_items ?? items.length,
  }
}

function errorMessage(err, fallback) {
  return err instanceof ApiError ? err.message : fallback
}

function ServerWishlistProvider({ children }) {
  const { token, isAuthenticated, loading: authLoading } = useAuth()
  const toast = useToast()
  const [wishlist, setWishlist] = useState(EMPTY_WISHLIST)
  // True until the initial load for the current auth state has settled, so
  // the wishlist page can show a loading state instead of a false "empty
  // wishlist".
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setWishlist(EMPTY_WISHLIST)
      setError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await wishlistApi.fetchWishlist(token)
      setWishlist(normalizeWishlist(data))
    } catch (err) {
      setWishlist(EMPTY_WISHLIST)
      setError(errorMessage(err, 'Could not load your wishlist. Please try again.'))
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, token])

  // The backend wishlist is the only source of truth (nothing is persisted
  // in localStorage/sessionStorage), so it's (re)fetched whenever the auth
  // state settles: on first mount (token restored from localStorage and
  // verified by AuthContext), right after login, and again after logout
  // (which clears it back to empty). Skipped while AuthContext is still
  // verifying a restored token to avoid a request that would 401.
  useEffect(() => {
    if (authLoading) return
    load()
  }, [authLoading, load])

  const ids = useMemo(() => wishlist.items.map((item) => item.product_id), [wishlist.items])

  const isWished = useCallback((productId) => ids.includes(Number(productId)), [ids])

  const addToWishlist = useCallback(
    async (productId) => {
      if (!isAuthenticated || !token) {
        throw new ApiError('Please log in to save items to your wishlist.', { status: 401 })
      }
      try {
        const data = await wishlistApi.addWishlistItem(token, productId)
        setWishlist(normalizeWishlist(data))
        toast.success({ title: 'Added to wishlist', message: 'The item was added to your wishlist.' })
      } catch (err) {
        // Action failures are reported with a toast (not the page-level `error`,
        // which is reserved for a failed wishlist load).
        const message = errorMessage(err, 'Could not add this item to your wishlist.')
        toast.error({ title: 'Could not add to wishlist', message })
        throw err instanceof ApiError ? err : new ApiError(message)
      }
    },
    [isAuthenticated, token, toast],
  )

  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!isAuthenticated || !token) return
      try {
        const data = await wishlistApi.removeWishlistItemByProduct(token, productId)
        setWishlist(normalizeWishlist(data))
        toast.success({ title: 'Removed from wishlist', message: 'The item was removed from your wishlist.' })
      } catch (err) {
        toast.error({
          title: 'Could not remove from wishlist',
          message: errorMessage(err, 'Could not remove this item from your wishlist.'),
        })
      }
    },
    [isAuthenticated, token, toast],
  )

  // Used by the heart toggle on ProductCard/ProductDetails: adds the
  // product if it isn't already wished, removes it if it is. Callers are
  // expected to check isAuthenticated first (see ProductCard.jsx /
  // ProductDetails.jsx) and redirect to /login instead of calling this,
  // same convention as CartContext's addToCart.
  const toggleWishlist = useCallback(
    async (productId) => {
      if (isWished(productId)) {
        await removeFromWishlist(productId)
      } else {
        await addToWishlist(productId)
      }
    },
    [isWished, addToWishlist, removeFromWishlist],
  )

  const value = useMemo(
    () => ({
      ids,
      items: wishlist.items,
      count: wishlist.count,
      loading,
      error,
      refetch: load,
      isWished,
      addToWishlist,
      toggleWishlist,
      removeFromWishlist,
    }),
    [ids, wishlist, loading, error, load, isWished, addToWishlist, toggleWishlist, removeFromWishlist],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

// No-login wishlist (used while LOGIN_ENABLED is false): just the saved product
// ids, kept in this browser's localStorage. Same interface as the server one.
function GuestWishlistProvider({ children }) {
  const toast = useToast()
  const [ids, setIds] = useState(() => sanitizeIds(readJson(WISHLIST_KEY, [])))

  const commit = useCallback((next) => {
    setIds(next)
    writeJson(WISHLIST_KEY, next)
  }, [])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === WISHLIST_KEY) setIds(sanitizeIds(readJson(WISHLIST_KEY, [])))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const items = useMemo(() => ids.map((id) => ({ product_id: id })), [ids])
  const isWished = useCallback((productId) => ids.includes(Number(productId)), [ids])

  const addToWishlist = useCallback(
    async (productId) => {
      const id = Number(productId)
      if (ids.includes(id)) return
      commit([...ids, id])
      toast.success({ title: 'Added to wishlist', message: 'The item was added to your wishlist.' })
    },
    [ids, commit, toast],
  )

  const removeFromWishlist = useCallback(
    async (productId) => {
      const id = Number(productId)
      commit(ids.filter((x) => x !== id))
      toast.success({ title: 'Removed from wishlist', message: 'The item was removed from your wishlist.' })
    },
    [ids, commit, toast],
  )

  const toggleWishlist = useCallback(
    async (productId) => (isWished(productId) ? removeFromWishlist(productId) : addToWishlist(productId)),
    [isWished, addToWishlist, removeFromWishlist],
  )

  const value = useMemo(
    () => ({
      ids,
      items,
      count: ids.length,
      loading: false,
      error: null,
      refetch: () => {},
      isWished,
      addToWishlist,
      toggleWishlist,
      removeFromWishlist,
    }),
    [ids, items, isWished, addToWishlist, toggleWishlist, removeFromWishlist],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function WishlistProvider({ children }) {
  return LOGIN_ENABLED ? (
    <ServerWishlistProvider>{children}</ServerWishlistProvider>
  ) : (
    <GuestWishlistProvider>{children}</GuestWishlistProvider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider')
  return ctx
}
