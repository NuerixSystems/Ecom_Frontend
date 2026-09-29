import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { useProducts } from './ProductsContext.jsx'
import { LOGIN_ENABLED } from '../config/features.js'
import { useToast } from './ToastContext.jsx'
import * as cartApi from '../api/cart.js'
import { ApiError } from '../api/client.js'
import { EMPTY_CART, createLatestGate, describeAdd, normalizeCart } from '../utils/cart.js'
import {
  CART_KEY,
  GuestCartLimitError,
  addLine,
  buildGuestCart,
  countLines,
  readJson,
  removeLine,
  sanitizeLines,
  setLineQty,
  writeJson,
} from '../utils/guestCart.js'

const CartContext = createContext(null)

function errorMessage(err, fallback) {
  return err instanceof ApiError ? err.message : fallback
}

// The cart lives ONLY on the backend (database). Nothing here is persisted to
// localStorage/sessionStorage -- React state is just a mirror of the last
// response the server sent, and every mutation replaces it with the server's
// answer.
function ServerCartProvider({ children }) {
  const { token, isAuthenticated, loading: authLoading } = useAuth()
  const toast = useToast()
  const [cart, setCart] = useState(EMPTY_CART)
  // True until the initial load for the current auth state has settled, so
  // the cart page can show a loading state instead of a false "empty cart".
  const [loading, setLoading] = useState(true)
  // Load errors only (shown as a full-page retry state on the Cart page).
  // Failed add/update/remove actions are reported with a toast instead, so a
  // single failed click can no longer replace the whole cart page with an error.
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(0)

  // Orders every cart request so a slow, older response can never overwrite a
  // newer one (see createLatestGate in utils/cart.js).
  const gateRef = useRef(null)
  if (gateRef.current === null) gateRef.current = createLatestGate()
  const gate = gateRef.current
  const loadTicketRef = useRef(0)

  // `silent` re-syncs with the server without flipping the page into its
  // loading state or surfacing an error (used to reconcile after a failed action).
  const load = useCallback(
    async ({ silent = false } = {}) => {
      const ticket = gate.begin()

      if (!isAuthenticated || !token) {
        if (gate.accept(ticket)) {
          setCart(EMPTY_CART)
          setError(null)
          setLoading(false)
        }
        return
      }

      if (!silent) {
        loadTicketRef.current = ticket
        setLoading(true)
        setError(null)
      }
      try {
        const data = await cartApi.fetchCart(token)
        if (gate.accept(ticket)) {
          setCart(normalizeCart(data))
          setError(null)
        }
      } catch (err) {
        if (!silent && gate.accept(ticket)) {
          setCart(EMPTY_CART)
          setError(errorMessage(err, 'Could not load your cart. Please try again.'))
        }
      } finally {
        if (!silent && loadTicketRef.current === ticket) setLoading(false)
      }
    },
    [gate, isAuthenticated, token],
  )

  // The backend cart is the only source of truth, so it's (re)fetched
  // whenever the auth state settles: on first mount (token restored from
  // localStorage and verified by AuthContext), right after login, and again
  // after logout (which clears it back to empty). Skipped while AuthContext
  // is still verifying a restored token to avoid a request that would 401.
  useEffect(() => {
    if (authLoading) return
    load()
  }, [authLoading, load])

  // Runs one cart mutation and applies the server's CartOut response to state
  // (unless a newer response has already been applied).
  const mutate = useCallback(
    async (request) => {
      const ticket = gate.begin()
      setPending((n) => n + 1)
      try {
        const data = await request()
        if (gate.accept(ticket)) {
          setCart(normalizeCart(data))
          setError(null)
        }
        return data
      } finally {
        setPending((n) => n - 1)
      }
    },
    [gate],
  )

  // After a failed action, pull the server's real cart so the UI can never
  // drift from the database (item removed elsewhere, product no longer
  // available, cart changed in another tab, ...).
  const reconcile = useCallback(
    (err) => {
      if (err instanceof ApiError && err.status === 401) return
      load({ silent: true })
    },
    [load],
  )

  // Adds `qty` of `product`. The backend upserts: a new product gets a new
  // line, a product already in the cart has its quantity increased. Resolves
  // to { quantity, merged } so callers can word their message; rejects with an
  // ApiError on failure (callers decide how to present it).
  const addToCart = useCallback(
    async (product, qty = 1) => {
      if (!isAuthenticated || !token) {
        throw new ApiError('Please log in to add items to your cart.', { status: 401 })
      }
      try {
        const data = await mutate(() => cartApi.addCartItem(token, product.id, qty))
        return describeAdd(data, product.id, qty)
      } catch (err) {
        reconcile(err)
        throw err instanceof ApiError ? err : new ApiError('Could not add this item to your cart.', { cause: err })
      }
    },
    [isAuthenticated, token, mutate, reconcile],
  )

  const removeFromCart = useCallback(
    async (itemId) => {
      if (!isAuthenticated || !token) return
      try {
        await mutate(() => cartApi.removeCartItem(token, itemId))
        toast.success({ title: 'Removed from cart', message: 'Item removed from your cart.' })
      } catch (err) {
        toast.error(errorMessage(err, 'Could not remove this item from your cart.'))
        reconcile(err)
      }
    },
    [isAuthenticated, token, mutate, reconcile, toast],
  )

  const updateQty = useCallback(
    async (itemId, qty) => {
      if (qty <= 0) return removeFromCart(itemId)
      if (!isAuthenticated || !token) return
      try {
        await mutate(() => cartApi.updateCartItemQuantity(token, itemId, qty))
      } catch (err) {
        toast.error(errorMessage(err, 'Could not update your cart.'))
        reconcile(err)
      }
    },
    [isAuthenticated, token, mutate, reconcile, removeFromCart, toast],
  )

  const clearCart = useCallback(async () => {
    if (!isAuthenticated || !token) return
    try {
      await mutate(() => cartApi.clearCart(token))
      toast.success('Your cart is now empty.')
    } catch (err) {
      const message = errorMessage(err, 'Could not clear your cart.')
      toast.error(message)
      reconcile(err)
      throw err instanceof ApiError ? err : new ApiError(message, { cause: err })
    }
  }, [isAuthenticated, token, mutate, reconcile, toast])

  const refetch = useCallback(() => load(), [load])

  const value = useMemo(
    () => ({
      items: cart.items,
      subtotal: cart.subtotal,
      count: cart.count,
      loading,
      error,
      // True while any add/update/remove request is in flight (used to
      // disable the quantity buttons so rapid clicks can't stack up).
      updating: pending > 0,
      refetch,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
    }),
    [cart, loading, error, pending, refetch, addToCart, updateQty, removeFromCart, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// No-login cart (used while LOGIN_ENABLED is false, see config/features.js).
// Same public interface as the server cart, but the lines (product id +
// quantity only) live in this browser's localStorage. Names, photos, stock and
// prices always come from the live product list.
function GuestCartProvider({ children }) {
  const { products, loading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts()
  const toast = useToast()
  const [lines, setLines] = useState(() => sanitizeLines(readJson(CART_KEY, [])))
  const linesRef = useRef(lines)

  const commit = useCallback((next) => {
    linesRef.current = next
    setLines(next)
    writeJson(CART_KEY, next)
  }, [])

  // Keep several open tabs in sync.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== CART_KEY) return
      const next = sanitizeLines(readJson(CART_KEY, []))
      linesRef.current = next
      setLines(next)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Once the product list has loaded, drop lines whose product was deleted.
  useEffect(() => {
    if (productsLoading || productsError || products.length === 0) return
    const known = new Set(products.map((p) => Number(p.id)))
    const kept = linesRef.current.filter((l) => known.has(l.productId))
    if (kept.length !== linesRef.current.length) commit(kept)
  }, [products, productsLoading, productsError, commit])

  const cart = useMemo(() => buildGuestCart(lines, products), [lines, products])

  const addToCart = useCallback(
    async (product, qty = 1) => {
      if (!product?.inStock) throw new ApiError('This product is currently unavailable', { status: 400 })
      try {
        const { lines: next, quantity, merged } = addLine(linesRef.current, product.id, qty)
        commit(next)
        return { quantity, merged }
      } catch (err) {
        if (err instanceof GuestCartLimitError) throw new ApiError(err.message, { status: 400 })
        throw err
      }
    },
    [commit],
  )

  const removeFromCart = useCallback(
    async (itemId) => {
      commit(removeLine(linesRef.current, itemId))
      toast.success({ title: 'Removed from cart', message: 'Item removed from your cart.' })
    },
    [commit, toast],
  )

  const updateQty = useCallback(
    async (itemId, qty) => {
      if (qty <= 0) return removeFromCart(itemId)
      try {
        commit(setLineQty(linesRef.current, itemId, qty))
      } catch (err) {
        toast.error(err instanceof GuestCartLimitError ? err.message : 'Could not update your cart.')
      }
    },
    [commit, removeFromCart, toast],
  )

  const clearCart = useCallback(
    async ({ silent = false } = {}) => {
      commit([])
      if (!silent) toast.success('Your cart is now empty.')
    },
    [commit, toast],
  )

  const value = useMemo(
    () => ({
      items: cart.items,
      subtotal: cart.subtotal,
      // Sum of the stored quantities, so the header badge is right even
      // before the product list has finished loading.
      count: countLines(lines),
      loading: productsLoading && lines.length > 0,
      error: productsError && lines.length > 0 ? 'Could not load your cart. Please try again.' : null,
      updating: false,
      refetch: refetchProducts,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
    }),
    [cart, lines, productsLoading, productsError, refetchProducts, addToCart, updateQty, removeFromCart, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function CartProvider({ children }) {
  return LOGIN_ENABLED ? <ServerCartProvider>{children}</ServerCartProvider> : <GuestCartProvider>{children}</GuestCartProvider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
