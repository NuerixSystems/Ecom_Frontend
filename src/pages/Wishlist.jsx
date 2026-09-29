import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useProducts } from '../context/ProductsContext.jsx'
import { useAddToCart } from '../hooks/useAddToCart.js'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import ProductImage from '../components/ProductImage.jsx'
import StarRating from '../components/StarRating.jsx'
import PriceDisplay from '../components/PriceDisplay.jsx'
import { ProductsError, ProductsLoading } from '../components/ProductsStatus.jsx'
import { CloseIcon, HeartIcon } from '../components/icons.jsx'

export default function Wishlist() {
  const {
    ids,
    removeFromWishlist,
    loading: wishlistLoading,
    error: wishlistError,
    refetch: refetchWishlist,
  } = useWishlist()
  const { add: addToCart, adding } = useAddToCart()
  const { canShop, loading: authLoading } = useAuth()
  const { loading: productsLoading, error: productsError, refetch: refetchProducts, getProduct } = useProducts()
  const navigate = useNavigate()
  const location = useLocation()
  const items = ids.map(getProduct).filter(Boolean)

  // The wishlist lives on the backend against the logged-in customer, so an
  // anonymous visitor is bounced to login first (same pattern as Cart.jsx).
  useEffect(() => {
    if (!authLoading && !canShop) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
    }
  }, [authLoading, canShop, navigate, location.pathname])

  // useAddToCart sends an anonymous visitor to login, adds via the backend,
  // shows the success toast and navigates to the cart page.
  const handleAddToCart = (product) => addToCart(product)

  if (authLoading || !canShop) {
    return <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center text-sm text-gray-500">Loading…</div>
  }

  if (wishlistLoading || productsLoading) {
    return <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20"><ProductsLoading label="Loading your wishlist…" /></div>
  }

  if (wishlistError) {
    return <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20"><ProductsError message={wishlistError} onRetry={refetchWishlist} /></div>
  }

  if (productsError) {
    return <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20"><ProductsError message={productsError} onRetry={refetchProducts} /></div>
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-cracker-orange">
          <HeartIcon className="h-9 w-9" />
        </div>
        <h1 className="font-display text-xl font-bold text-cracker-navy mb-2">Your wishlist is empty</h1>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Tap the heart on any product to save it here for later.
        </p>
        <Link to="/shop" className="btn-primary inline-block mt-6">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-cracker-navy mb-1">My Wishlist</h1>
      <p className="text-sm text-gray-500 mb-6">{items.length} item{items.length > 1 ? 's' : ''}</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {items.map((product) => (
          <div key={product.id} className="card p-3 sm:p-4 flex flex-col">
            <div className="relative">
              <Link to={`/product/${product.id}`} className="block group">
                <ProductImage
                  product={product}
                  className="aspect-[3/2] rounded-lg [&_img]:transition-transform [&_img]:duration-300 group-hover:[&_img]:scale-105"
                />
              </Link>
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow transition-colors hover:text-cracker-red focus:outline-none focus-visible:ring-2 focus-visible:ring-cracker-orange/60"
                aria-label={`Remove ${product.name} from wishlist`}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <Link to={`/product/${product.id}`} className="mt-3 block font-semibold text-gray-800 text-sm hover:text-cracker-orange">
              {product.name}
            </Link>
            <StarRating rating={product.rating} />
            <PriceDisplay mrp={product.mrp} price={product.price} className="mt-1.5" />
            <button
              onClick={() => handleAddToCart(product)}
              disabled={!product.inStock || adding}
              className="btn-primary mt-3 w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!product.inStock ? 'Out of Stock' : adding ? 'Adding…' : 'Add to Cart'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
