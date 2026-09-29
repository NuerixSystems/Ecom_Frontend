import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAddToCart } from '../hooks/useAddToCart.js'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { HeartIcon } from './icons.jsx'
import StarRating from './StarRating.jsx'
import ProductImage from './ProductImage.jsx'
import PriceDisplay from './PriceDisplay.jsx'
import { useCategories } from '../context/CategoriesContext.jsx'

export default function ProductCard({ product }) {
  const { add: addToCart, adding } = useAddToCart()
  const { isWished, toggleWishlist } = useWishlist()
  const { canShop } = useAuth()
  const { categories } = useCategories()
  const navigate = useNavigate()
  const location = useLocation()
  const wished = isWished(product.id)
  const categoryName = categories.find((c) => c.id === product.category)?.name

  // useAddToCart sends an anonymous visitor to login, adds via the backend,
  // shows the success toast and navigates to the cart page.
  const handleAddToCart = () => {
    if (!product.inStock) return
    addToCart(product)
  }

  // Backend wishlist requires a logged-in customer -- send an anonymous
  // visitor to login instead of calling an API that would just 401.
  const handleToggleWishlist = () => {
    if (!canShop) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    toggleWishlist(product.id).catch(() => {})
  }
  return (
    <div className={`card p-3 sm:p-4 flex flex-col ${product.inStock ? '' : 'bg-gray-50'}`}>
      <div className="relative">
        <Link to={`/product/${product.id}`} className="block group">
          <ProductImage product={product} className={`aspect-[3/2] rounded-lg mb-3 [&_img]:transition-transform [&_img]:duration-300 group-hover:[&_img]:scale-105 ${product.inStock ? '' : '[&_img]:grayscale [&_img]:opacity-60'}`} />
          {!product.inStock && (
            <span className="absolute left-2 top-2 rounded-sm bg-gray-800/85 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">Out of Stock</span>
          )}
        </Link>
        <button
          onClick={handleToggleWishlist}
          className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cracker-orange/60 ${wished ? 'text-cracker-red' : 'text-gray-500 hover:text-cracker-red'}`}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={wished}
        >
          <HeartIcon filled={wished} className="h-4 w-4" />
        </button>
      </div>
      <Link to={`/product/${product.id}`} className="block">
        <h3 className="font-semibold text-gray-800 text-sm hover:text-cracker-orange">{product.name}</h3>
      </Link>
      {categoryName && <p className="text-xs text-gray-500 mt-0.5">{categoryName}</p>}
      <StarRating rating={product.rating} />
      <PriceDisplay mrp={product.mrp} price={product.price} className={`mt-1.5 ${product.inStock ? '' : 'opacity-60'}`} />
      <p className={`mt-1 text-xs font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
        {product.inStock ? 'In Stock' : 'Out of Stock'}
      </p>
      <button
        onClick={handleAddToCart}
        aria-disabled={!product.inStock}
        disabled={!product.inStock || adding}
        className="btn-primary mt-3 w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:grayscale"
      >
        {!product.inStock ? 'Out of Stock' : adding ? 'Adding…' : 'Add to Cart'}
      </button>
    </div>
  )
}
