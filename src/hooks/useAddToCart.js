import { useCallback, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { ApiError } from '../api/client.js'

// The one add-to-cart flow shared by every "Add to Cart" button (product
// cards, product page, wishlist):
//   not logged in -> send to login
//   add via the backend (new line, or quantity added to the existing line)
//   success -> "Added to cart successfully" toast -> go to /cart
//   failure -> error toast; the cart is re-synced with the server
//
// add(product, qty) resolves to true on success, false otherwise, and never throws.
export function useAddToCart() {
  const { addToCart } = useCart()
  const { canShop } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [adding, setAdding] = useState(false)
  const inFlight = useRef(false)

  const add = useCallback(
    async (product, qty = 1) => {
      if (!canShop) {
        navigate('/login', { state: { from: location.pathname } })
        return false
      }
      if (inFlight.current) return false // ignore double clicks
      inFlight.current = true
      setAdding(true)
      try {
        const { quantity, merged } = await addToCart(product, qty)
        toast.success({
          title: 'Added to cart successfully',
          message: merged
            ? `${product.name} was already in your cart \u2014 quantity is now ${quantity}.`
            : `${product.name} has been added to your cart.`,
        })
        navigate('/cart')
        return true
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          toast.error({ title: 'Please log in again', message: 'Your session has expired.' })
          navigate('/login', { state: { from: location.pathname } })
        } else {
          toast.error({
            title: 'Could not add to cart',
            message: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
          })
        }
        return false
      } finally {
        inFlight.current = false
        setAdding(false)
      }
    },
    [addToCart, canShop, location.pathname, navigate, toast],
  )

  return { add, adding }
}
